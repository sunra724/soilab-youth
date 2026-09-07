begin;

create table if not exists public.youth_policy_briefings (
  briefing_date date primary key,
  title text not null check (char_length(title) between 1 and 160),
  summary text not null check (char_length(summary) between 1 and 600),
  body_text text not null check (char_length(body_text) between 1 and 3500),
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  generator_model text,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sending', 'delivered', 'failed', 'uncertain')),
  message_id bigint,
  visibility text not null default 'public' check (visibility in ('public', 'internal')),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.youth_policy_briefings enable row level security;
revoke all on public.youth_policy_briefings from anon, authenticated;
grant select on public.youth_policy_briefings to anon, authenticated;
grant all on public.youth_policy_briefings to service_role;

drop policy if exists youth_policy_briefings_public_read on public.youth_policy_briefings;
create policy youth_policy_briefings_public_read on public.youth_policy_briefings
  for select to anon, authenticated using (visibility = 'public');

comment on table public.youth_policy_briefings is '청년 정책 브리핑. 원문 전문과 개인정보를 저장하지 않으며 날짜별 최초 발행본을 보존한다.';
commit;
