-- Private delivery queue only. Existing public briefing/source tables are unchanged.
begin;
create table if not exists public.youth_ledger_outbox (
  sheet_row bigint generated always as identity (start with 2) primary key,
  target text not null check (target in ('items', 'source_runs')),
  dedupe_key text not null check (dedupe_key ~ '^[a-f0-9]{40}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'synced')),
  created_at timestamptz not null default now(),
  synced_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 0,
  last_error_code text not null default '',
  unique (target, dedupe_key)
);
create index if not exists youth_ledger_pending_idx on public.youth_ledger_outbox (status, sheet_row);
alter table public.youth_ledger_outbox enable row level security;
revoke all on public.youth_ledger_outbox from public, anon, authenticated;
grant all on public.youth_ledger_outbox to service_role;
grant usage, select on sequence public.youth_ledger_outbox_sheet_row_seq to service_role;

create or replace function public.youth_ledger_enqueue(_batch jsonb)
returns integer language plpgsql security invoker set search_path = public, pg_temp as $$
declare entry jsonb; p jsonb; cleaned jsonb; added integer; total_added integer := 0;
begin
  if jsonb_typeof(_batch) is distinct from 'array' or jsonb_array_length(_batch) > 250 then
    raise exception 'ledger_invalid_batch';
  end if;
  for entry in select value from jsonb_array_elements(_batch) loop
    p := entry->'payload';
    if p->>'source_type' is null or p->>'source_type' not in ('news','nkis','prism','g2b','law','press','manual') then
      raise exception 'ledger_invalid_source';
    end if;
    if entry->>'target' = 'items' then
      if length(coalesce(p->>'title','')) not between 1 and 240
        or length(coalesce(p->>'url','')) not between 1 and 1600
        or p->>'url' !~ '^https?://' then raise exception 'ledger_invalid_item'; end if;
      cleaned := jsonb_build_object(
        'collected_at', (p->>'collected_at')::timestamptz,
        'source_type', p->>'source_type', 'source_name', left(coalesce(p->>'source_name',''),150),
        'title', p->>'title', 'url', p->>'url'
      );
      if cleaned->>'collected_at' is null then raise exception 'ledger_invalid_timestamp'; end if;
    elsif entry->>'target' = 'source_runs' then
      if length(coalesce(p->>'run_id','')) not between 1 and 120
        or p->>'status' is null or p->>'status' not in ('success','failed')
        or coalesce((p->>'item_count')::integer,-1) < 0 then raise exception 'ledger_invalid_run'; end if;
      cleaned := jsonb_build_object(
        'run_id', p->>'run_id', 'source_type', p->>'source_type',
        'started_at', (p->>'started_at')::timestamptz, 'finished_at', (p->>'finished_at')::timestamptz,
        'status', p->>'status', 'item_count', (p->>'item_count')::integer,
        'last_success_at', case when p->>'status' = 'success' then (p->>'finished_at')::timestamptz else null end,
        'error_code', case when p->>'status' = 'failed' then 'source_fetch_failed' else '' end
      );
      if cleaned->>'started_at' is null or cleaned->>'finished_at' is null then raise exception 'ledger_invalid_timestamp'; end if;
    else raise exception 'ledger_invalid_target';
    end if;
    -- Repeated collection never overwrites the first receipt or human edits.
    insert into public.youth_ledger_outbox (target,dedupe_key,payload)
      values (entry->>'target',entry->>'dedupe_key',cleaned) on conflict (target,dedupe_key) do nothing;
    get diagnostics added = row_count;
    total_added := total_added + added;
  end loop;
  return total_added;
end; $$;

create or replace function public.youth_ledger_claim(_token uuid, _limit integer default 30)
returns setof public.youth_ledger_outbox language sql security invoker set search_path = public, pg_temp as $$
  update public.youth_ledger_outbox q
  set lease_token = _token, lease_until = now() + interval '2 minutes', attempts = attempts + 1
  where q.sheet_row in (
    select sheet_row from public.youth_ledger_outbox
    where status = 'pending' and (lease_until is null or lease_until < now())
    order by sheet_row limit least(greatest(_limit,1),100) for update skip locked
  ) returning q.*;
$$;
create or replace function public.youth_ledger_ack(_token uuid, _rows bigint[])
returns integer language plpgsql security invoker set search_path = public, pg_temp as $$
declare changed integer;
begin
  update public.youth_ledger_outbox set status = 'synced', synced_at = now(),
    lease_token = null, lease_until = null, last_error_code = ''
  where lease_token = _token and sheet_row = any(_rows) and status = 'pending';
  get diagnostics changed = row_count;
  return changed;
end; $$;
create or replace function public.youth_ledger_release(_token uuid, _code text)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if _code !~ '^ledger_[a-z0-9_]{1,70}$' then raise exception 'ledger_invalid_error_code'; end if;
  update public.youth_ledger_outbox set lease_token = null, lease_until = null, last_error_code = _code
  where lease_token = _token and status = 'pending';
end; $$;
create or replace function public.youth_ledger_status()
returns jsonb language sql security invoker set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'pending', count(*) filter (where status = 'pending'),
    'synced', count(*) filter (where status = 'synced'),
    'items', count(*) filter (where target = 'items'),
    'source_runs', count(*) filter (where target = 'source_runs'),
    'failed', count(*) filter (where status = 'pending' and last_error_code <> '')
  ) from public.youth_ledger_outbox;
$$;
revoke all on function public.youth_ledger_enqueue(jsonb), public.youth_ledger_claim(uuid,integer),
  public.youth_ledger_ack(uuid,bigint[]), public.youth_ledger_release(uuid,text), public.youth_ledger_status()
  from public, anon, authenticated;
grant execute on function public.youth_ledger_enqueue(jsonb), public.youth_ledger_claim(uuid,integer),
  public.youth_ledger_ack(uuid,bigint[]), public.youth_ledger_release(uuid,text), public.youth_ledger_status()
  to service_role;
commit;
notify pgrst, 'reload schema';
