create extension if not exists pgcrypto;

create table if not exists public.morning_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.morning_settings (key, value)
values
  ('program_timezone', '"Asia/Seoul"'::jsonb),
  ('checkin_window', '{"start":"05:00","end":"12:00","lateUntil":"15:00"}'::jsonb),
  ('content_retention_days', '90'::jsonb),
  ('minimum_impact_group_size', '5'::jsonb)
on conflict (key) do nothing;

create table if not exists public.morning_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text not null,
  cohort_label text,
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0 and used_count <= max_uses),
  expires_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  disabled_at timestamptz
);

create index if not exists morning_invite_codes_active_idx
  on public.morning_invite_codes (active, expires_at);

create table if not exists public.morning_participants (
  id uuid primary key default gen_random_uuid(),
  invite_code_id uuid references public.morning_invite_codes(id),
  nickname text not null check (char_length(nickname) between 2 and 20),
  retain_promises boolean not null default false,
  consent_version text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'withdrawn')),
  created_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

alter table public.morning_participants
  add column if not exists invite_code_id uuid references public.morning_invite_codes(id);

create index if not exists morning_participants_invite_idx
  on public.morning_participants (invite_code_id);

create table if not exists public.morning_consents (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  consent_type text not null check (consent_type in ('service_required', 'privacy_required', 'ai_optional', 'content_retention_optional')),
  consent_version text not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  unique (participant_id, consent_type, consent_version)
);

create index if not exists morning_consents_participant_idx
  on public.morning_consents (participant_id);

create table if not exists public.morning_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists morning_sessions_participant_idx
  on public.morning_sessions (participant_id);
create index if not exists morning_sessions_expiry_idx
  on public.morning_sessions (expires_at);

create table if not exists public.morning_checkins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  checked_on date not null,
  checkin_status text not null default 'valid' check (checkin_status in ('valid', 'late')),
  promise_kind text not null check (promise_kind in ('preset', 'custom', 'withheld_safety_signal')),
  promise_text text check (promise_text is null or char_length(promise_text) <= 60),
  encouragement text check (encouragement is null or char_length(encouragement) <= 240),
  encouragement_source text not null check (encouragement_source in ('ai', 'approved-fallback', 'safety-guide')),
  safety_signal boolean not null default false,
  content_delete_after timestamptz,
  created_at timestamptz not null default now(),
  unique (participant_id, checked_on)
);

create index if not exists morning_checkins_participant_date_idx
  on public.morning_checkins (participant_id, checked_on desc);
create index if not exists morning_checkins_content_expiry_idx
  on public.morning_checkins (content_delete_after)
  where content_delete_after is not null;

create table if not exists public.morning_quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('생활기초', '건강·신체', '마음', '일상나눔', '지역연결', '휴식')),
  title text not null,
  description text not null,
  estimated_minutes integer not null default 1 check (estimated_minutes between 0 and 180),
  reward_points integer not null default 0 check (reward_points between 0 and 100000),
  repeat_rule text not null default 'daily' check (repeat_rule in ('once', 'daily', 'weekly')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.morning_quests
  (slug, category, title, description, estimated_minutes, reward_points, repeat_rule, sort_order)
values
  ('open-curtain', '생활기초', '커튼을 열고 30초 머물기', '방 안에서 햇빛이나 바깥 공기를 잠깐 느껴봅니다.', 1, 100, 'daily', 10),
  ('drink-water', '생활기초', '물 한 잔 천천히 마시기', '가능한 만큼 천천히 물을 마셔봅니다.', 2, 100, 'daily', 20),
  ('chair-stretch', '건강·신체', '의자에서 어깨 세 번 돌리기', '앉은 자리에서 어깨를 가볍게 움직여봅니다.', 2, 100, 'daily', 30),
  ('front-door', '건강·신체', '현관 앞까지 다녀오기', '문밖으로 나가기 어렵다면 현관 앞에 잠깐 서 있어도 됩니다.', 3, 150, 'daily', 40),
  ('emotion-word', '마음', '지금 감정을 한 단어로 골라보기', '진단이 아니라 지금의 마음을 알아차리는 활동입니다.', 2, 100, 'daily', 50),
  ('rest-today', '휴식', '오늘은 쉬어가기', '쉬어가는 선택도 나의 리듬을 지키는 중요한 활동입니다.', 0, 0, 'daily', 90)
on conflict (slug) do update set
  category = excluded.category,
  title = excluded.title,
  description = excluded.description,
  estimated_minutes = excluded.estimated_minutes,
  reward_points = excluded.reward_points,
  repeat_rule = excluded.repeat_rule,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists public.morning_quest_completions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  quest_id uuid not null references public.morning_quests(id),
  completed_on date not null,
  verification_method text not null default 'self_check' check (verification_method in ('self_check', 'operator')),
  created_at timestamptz not null default now(),
  unique (participant_id, quest_id, completed_on)
);

create index if not exists morning_quest_completions_participant_idx
  on public.morning_quest_completions (participant_id, completed_on desc);

create table if not exists public.morning_point_ledger (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null,
  reference_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists morning_point_ledger_participant_idx
  on public.morning_point_ledger (participant_id, created_at desc);

create table if not exists public.morning_support_requests (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.morning_participants(id) on delete cascade,
  request_type text not null check (request_type in ('participant_requested', 'operator_followup')),
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'connected', 'closed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  closed_at timestamptz
);

create index if not exists morning_support_requests_open_idx
  on public.morning_support_requests (status, created_at)
  where status in ('requested', 'reviewing');
create index if not exists morning_support_requests_participant_idx
  on public.morning_support_requests (participant_id, created_at desc);

create table if not exists public.morning_rate_limits (
  key_hash text not null,
  action text not null,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0),
  primary key (key_hash, action)
);

create table if not exists public.morning_audit_logs (
  id bigint generated always as identity primary key,
  event_type text not null,
  entity_id uuid,
  participant_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists morning_audit_logs_created_idx
  on public.morning_audit_logs (created_at desc);

create or replace function public.morning_enroll_participant(
  p_code_hash text,
  p_nickname text,
  p_consent_version text,
  p_ai_consent boolean,
  p_retain_promises boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invite public.morning_invite_codes%rowtype;
  v_participant_id uuid;
begin
  select *
    into v_invite
    from public.morning_invite_codes
   where code_hash = p_code_hash
   for update;

  if not found or not v_invite.active then
    raise exception 'INVALID_INVITE';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'EXPIRED_INVITE';
  end if;
  if v_invite.used_count >= v_invite.max_uses then
    raise exception 'EXHAUSTED_INVITE';
  end if;
  if char_length(trim(p_nickname)) not between 2 and 20 then
    raise exception 'INVALID_NICKNAME';
  end if;

  insert into public.morning_participants
    (invite_code_id, nickname, retain_promises, consent_version)
  values
    (v_invite.id, trim(p_nickname), p_retain_promises, p_consent_version)
  returning id into v_participant_id;

  insert into public.morning_consents
    (participant_id, consent_type, consent_version, granted)
  values
    (v_participant_id, 'service_required', p_consent_version, true),
    (v_participant_id, 'privacy_required', p_consent_version, true),
    (v_participant_id, 'ai_optional', p_consent_version, p_ai_consent),
    (v_participant_id, 'content_retention_optional', p_consent_version, p_retain_promises);

  update public.morning_invite_codes
     set used_count = used_count + 1
   where id = v_invite.id;

  return v_participant_id;
end;
$$;

create or replace function public.morning_complete_quest(
  p_participant_id uuid,
  p_quest_id uuid,
  p_completed_on date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quest public.morning_quests%rowtype;
  v_completion_id uuid;
  v_balance integer;
begin
  select *
    into v_quest
    from public.morning_quests
   where id = p_quest_id
     and active = true;

  if not found then
    raise exception 'INVALID_QUEST';
  end if;

  begin
    insert into public.morning_quest_completions
      (participant_id, quest_id, completed_on)
    values
      (p_participant_id, p_quest_id, p_completed_on)
    returning id into v_completion_id;
  exception
    when unique_violation then
      raise exception 'ALREADY_COMPLETED';
  end;

  if v_quest.reward_points > 0 then
    insert into public.morning_point_ledger
      (participant_id, amount, reason, reference_key)
    values
      (
        p_participant_id,
        v_quest.reward_points,
        'quest_completion',
        'quest:' || p_participant_id::text || ':' || p_quest_id::text || ':' || p_completed_on::text
      );
  end if;

  select coalesce(sum(amount), 0)::integer
    into v_balance
    from public.morning_point_ledger
   where participant_id = p_participant_id;

  return jsonb_build_object(
    'completion_id', v_completion_id,
    'reward_points', v_quest.reward_points,
    'balance', v_balance
  );
end;
$$;

create or replace function public.morning_consume_rate_limit(
  p_key_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if p_limit < 1 or p_limit > 1000 or p_window_seconds < 1 or p_window_seconds > 604800 then
    return false;
  end if;

  insert into public.morning_rate_limits
    (key_hash, action, window_started_at, attempt_count)
  values
    (p_key_hash, p_action, now(), 1)
  on conflict (key_hash, action) do update set
    window_started_at = case
      when public.morning_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now()
        then now()
      else public.morning_rate_limits.window_started_at
    end,
    attempt_count = case
      when public.morning_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= now()
        then 1
      else public.morning_rate_limits.attempt_count + 1
    end
  returning attempt_count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.morning_purge_expired_content()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  update public.morning_checkins
     set promise_text = null,
         encouragement = null
   where content_delete_after is not null
     and content_delete_after <= now()
     and (promise_text is not null or encouragement is not null);

  get diagnostics v_count = row_count;
  delete from public.morning_sessions where expires_at <= now();
  delete from public.morning_rate_limits
   where window_started_at < now() - interval '8 days';
  return v_count;
end;
$$;

create or replace function public.morning_set_content_expiry()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_days integer;
begin
  if new.promise_text is null and new.encouragement is null then
    new.content_delete_after := null;
    return new;
  end if;

  select coalesce((value #>> '{}')::integer, 90)
    into v_days
    from public.morning_settings
   where key = 'content_retention_days';

  new.content_delete_after := now() + make_interval(days => coalesce(v_days, 90));
  return new;
end;
$$;

drop trigger if exists morning_checkin_content_expiry on public.morning_checkins;
create trigger morning_checkin_content_expiry
before insert or update of promise_text, encouragement on public.morning_checkins
for each row execute function public.morning_set_content_expiry();

create or replace function public.morning_write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_participant_id uuid;
begin
  v_participant_id := case
    when tg_table_name = 'morning_participants' then new.id
    else new.participant_id
  end;

  insert into public.morning_audit_logs (event_type, entity_id, participant_id)
  values (tg_table_name || '.' || lower(tg_op), new.id, v_participant_id);
  return new;
end;
$$;

drop trigger if exists morning_participant_audit on public.morning_participants;
create trigger morning_participant_audit
after insert or update on public.morning_participants
for each row execute function public.morning_write_audit_log();

drop trigger if exists morning_consent_audit on public.morning_consents;
create trigger morning_consent_audit
after insert or update on public.morning_consents
for each row execute function public.morning_write_audit_log();

drop trigger if exists morning_checkin_audit on public.morning_checkins;
create trigger morning_checkin_audit
after insert on public.morning_checkins
for each row execute function public.morning_write_audit_log();

drop trigger if exists morning_quest_completion_audit on public.morning_quest_completions;
create trigger morning_quest_completion_audit
after insert on public.morning_quest_completions
for each row execute function public.morning_write_audit_log();

drop trigger if exists morning_support_request_audit on public.morning_support_requests;
create trigger morning_support_request_audit
after insert or update on public.morning_support_requests
for each row execute function public.morning_write_audit_log();

alter table public.morning_settings enable row level security;
alter table public.morning_invite_codes enable row level security;
alter table public.morning_participants enable row level security;
alter table public.morning_consents enable row level security;
alter table public.morning_sessions enable row level security;
alter table public.morning_checkins enable row level security;
alter table public.morning_quests enable row level security;
alter table public.morning_quest_completions enable row level security;
alter table public.morning_point_ledger enable row level security;
alter table public.morning_support_requests enable row level security;
alter table public.morning_rate_limits enable row level security;
alter table public.morning_audit_logs enable row level security;

revoke all on table
  public.morning_settings,
  public.morning_invite_codes,
  public.morning_participants,
  public.morning_consents,
  public.morning_sessions,
  public.morning_checkins,
  public.morning_quests,
  public.morning_quest_completions,
  public.morning_point_ledger,
  public.morning_support_requests,
  public.morning_rate_limits,
  public.morning_audit_logs
from anon, authenticated;

grant select, insert, update, delete on table
  public.morning_settings,
  public.morning_invite_codes,
  public.morning_participants,
  public.morning_consents,
  public.morning_sessions,
  public.morning_checkins,
  public.morning_quests,
  public.morning_quest_completions,
  public.morning_point_ledger,
  public.morning_support_requests,
  public.morning_rate_limits,
  public.morning_audit_logs
to service_role;

grant usage, select on sequence public.morning_audit_logs_id_seq to service_role;

revoke all on function public.morning_enroll_participant(text, text, text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.morning_complete_quest(uuid, uuid, date) from public, anon, authenticated;
revoke all on function public.morning_consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.morning_purge_expired_content() from public, anon, authenticated;

grant execute on function public.morning_enroll_participant(text, text, text, boolean, boolean) to service_role;
grant execute on function public.morning_complete_quest(uuid, uuid, date) to service_role;
grant execute on function public.morning_consume_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.morning_purge_expired_content() to service_role;
