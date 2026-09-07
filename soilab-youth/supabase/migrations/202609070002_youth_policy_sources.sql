-- Automatic imports stay private until a reviewer approves an explicit revision.
create table if not exists public.youth_policy_sources (
  id text primary key check (id ~ '^(nkis|law)-[a-f0-9]{24}$'),
  provider text not null check (provider in ('nkis', 'law')),
  external_id text not null,
  title text not null,
  publisher text not null,
  url text not null check (url ~ '^https://'),
  publication_year integer,
  published_at date,
  effective_at date,
  scope text not null check (scope in ('youth', 'all_ages')),
  raw_excerpt text not null default '',
  authors text not null default '',
  keywords text[] not null default '{}',
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  imported_at timestamptz not null default now(),
  checked_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'excluded')),
  summary text not null default '',
  application text not null default '',
  limitation text not null default '',
  review_scope text not null default '',
  topics text[] not null default '{}',
  reviewed_at timestamptz,
  unique (provider, external_id),
  constraint youth_source_approval_complete check (
    review_status <> 'approved' or (
      length(trim(summary)) > 0 and length(trim(application)) > 0 and length(trim(limitation)) > 0
      and length(trim(review_scope)) > 0 and cardinality(topics) > 0 and reviewed_at is not null
    )
  )
);
create index if not exists youth_policy_sources_review_idx on public.youth_policy_sources (review_status, imported_at desc, id);

create or replace function public.youth_source_recheck_revision()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.content_hash is distinct from new.content_hash then
    -- Keep notes for comparison, but withdraw publication until re-reviewed.
    new.review_status := 'pending';
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;
drop trigger if exists youth_source_revision_changed on public.youth_policy_sources;
create trigger youth_source_revision_changed before update on public.youth_policy_sources
for each row execute function public.youth_source_recheck_revision();

create table if not exists public.youth_source_sync_runs (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('nkis', 'law')),
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  status text not null check (status in ('success', 'partial', 'failed')),
  record_count integer not null default 0,
  details jsonb not null default '{}'
);

alter table public.youth_policy_sources enable row level security;
alter table public.youth_source_sync_runs enable row level security;
revoke all on public.youth_policy_sources, public.youth_source_sync_runs from anon, authenticated;
grant all on public.youth_policy_sources, public.youth_source_sync_runs to service_role;
grant usage, select on sequence public.youth_source_sync_runs_id_seq to service_role;
-- Only server routes project approved editorial fields for public readers.
notify pgrst, 'reload schema';
