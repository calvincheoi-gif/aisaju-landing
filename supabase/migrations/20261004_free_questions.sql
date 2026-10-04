-- 선착순 Daily 3명 무료 1문 1답 (홈 첫 화면 전환 장치, 2026-10-04)
-- 홈의 「질문 보내고 무료 답 받기」 → /ask → /api/ask → free_ask_submit()
-- 정원은 함수 안의 cap(=3)으로 관리한다. 바꾸려면 두 함수의 cap 만 고치면 된다.

create table if not exists public.free_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day_kst date not null default ((now() at time zone 'Asia/Seoul')::date),
  ref_no text not null,
  name text not null,
  gender text,
  birth_info text not null,
  contact text not null,
  question text not null,
  kakao_agree boolean not null default false,
  review_agree boolean not null default false,
  status text not null default 'received',   -- received / answered / converted / cancelled
  answered_at timestamptz,
  note text,
  utm text,
  referrer text,
  device_code text
);
create index if not exists free_questions_day_idx on public.free_questions(day_kst);

alter table public.free_questions enable row level security;

drop policy if exists "Admin can view free_questions" on public.free_questions;
create policy "Admin can view free_questions" on public.free_questions
  for select using ((auth.jwt() ->> 'email') = 'calvincheoi@gmail.com');
drop policy if exists "Admin can update free_questions" on public.free_questions;
create policy "Admin can update free_questions" on public.free_questions
  for update using ((auth.jwt() ->> 'email') = 'calvincheoi@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'calvincheoi@gmail.com');

-- 오늘 남은 자리 (익명 호출 가능, 행은 노출하지 않음)
create or replace function public.free_ask_status()
returns json language plpgsql security definer set search_path = public as $$
declare cap int := 3; used int; d date := (now() at time zone 'Asia/Seoul')::date;
begin
  select count(*) into used from public.free_questions where day_kst = d and status <> 'cancelled';
  return json_build_object('cap', cap, 'used', used, 'remaining', greatest(cap - used, 0), 'day', d);
end $$;

-- 접수 (정원 확인과 삽입을 한 트랜잭션에서, 동시 신청 경합은 advisory lock으로 직렬화)
create or replace function public.free_ask_submit(
  p_name text, p_gender text, p_birth_info text, p_contact text, p_question text,
  p_kakao_agree boolean, p_review_agree boolean, p_utm text, p_referrer text, p_device_code text
) returns json language plpgsql security definer set search_path = public as $$
declare cap int := 3; used int; d date := (now() at time zone 'Asia/Seoul')::date;
        new_id uuid; ref text;
begin
  if coalesce(trim(p_name),'') = '' or coalesce(trim(p_birth_info),'') = '' or coalesce(trim(p_contact),'') = '' or coalesce(trim(p_question),'') = '' then
    return json_build_object('ok', false, 'reason', 'missing');
  end if;
  if length(p_question) > 300 then
    return json_build_object('ok', false, 'reason', 'too_long');
  end if;
  perform pg_advisory_xact_lock(hashtext('free_ask_' || d::text));
  select count(*) into used from public.free_questions where day_kst = d and status <> 'cancelled';
  if used >= cap then
    return json_build_object('ok', false, 'reason', 'full', 'remaining', 0);
  end if;
  ref := 'FQ-' || to_char(now() at time zone 'Asia/Seoul', 'YYMMDD') || '-' || lpad((used + 1)::text, 2, '0');
  insert into public.free_questions(ref_no, name, gender, birth_info, contact, question, kakao_agree, review_agree, utm, referrer, device_code)
  values (ref, trim(p_name), p_gender, trim(p_birth_info), trim(p_contact), trim(p_question), coalesce(p_kakao_agree,false), coalesce(p_review_agree,false), p_utm, p_referrer, p_device_code)
  returning id into new_id;
  return json_build_object('ok', true, 'id', new_id, 'ref_no', ref, 'remaining', cap - used - 1);
end $$;

revoke all on function public.free_ask_status() from public;
revoke all on function public.free_ask_submit(text,text,text,text,text,boolean,boolean,text,text,text) from public;
grant execute on function public.free_ask_status() to anon, authenticated;
grant execute on function public.free_ask_submit(text,text,text,text,text,boolean,boolean,text,text,text) to anon, authenticated;
