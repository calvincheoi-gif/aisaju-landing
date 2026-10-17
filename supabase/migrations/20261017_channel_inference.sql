-- 유입 채널 유추 체계 (2026-10-17) — ② 인앱 판별 · ④ 출처 칩 · ③ 게시 기록 + 게시 후 유입 집계
-- 다시 실행해도 안전하다 (if not exists / or replace).

-- ② events.app — 어느 앱 안에서 열렸는지 (instagram·facebook·threads·kakao·naver·daangn·line·pwa·webview·browser)
alter table public.events add column if not exists app text;

-- events_clean 뷰에 app 열을 덧붙인다 (봇·내부 기기 제외 규칙은 그대로)
create or replace view public.events_clean as
  select id, created_at, session_id, visitor_id, name, step, props,
         utm, utm_source, utm_medium, utm_campaign, referrer, path, device, lang, app
  from public.events e
  where not exists (select 1 from public.bot_sessions b where b.session_id = e.session_id)
    and not exists (select 1 from public.internal_visitors i where i.visitor_id = e.visitor_id);

-- ④ free_questions.source(본인이 고른 출처) · app(인앱 판별값)
alter table public.free_questions add column if not exists source text;
alter table public.free_questions add column if not exists app text;

-- 접수 함수에 두 인자를 추가 (예전 10개 인자 버전은 지운다 — 같은 이름에 인자 수만 다른 함수가 둘이면 호출이 모호해진다)
drop function if exists public.free_ask_submit(text,text,text,text,text,boolean,boolean,text,text,text);
create or replace function public.free_ask_submit(
  p_name text, p_gender text, p_birth_info text, p_contact text, p_question text,
  p_kakao_agree boolean, p_review_agree boolean, p_utm text, p_referrer text, p_device_code text,
  p_source text default null, p_app text default null)
returns json language plpgsql security definer set search_path = public as $$
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
  insert into public.free_questions(ref_no, name, gender, birth_info, contact, question, kakao_agree, review_agree, utm, referrer, device_code, source, app)
  values (ref, trim(p_name), p_gender, trim(p_birth_info), trim(p_contact), trim(p_question), coalesce(p_kakao_agree,false), coalesce(p_review_agree,false), p_utm, p_referrer, p_device_code, p_source, p_app)
  returning id into new_id;
  return json_build_object('ok', true, 'id', new_id, 'ref_no', ref, 'remaining', cap - used - 1);
end $$;

-- ③ 게시 기록 — 관리자 /admin/posts 의 버튼 한 번이 한 줄
create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  posted_at timestamptz not null default now(),
  channel text not null,          -- insta_card · insta_reel · youtube · daangn · kakao · blog · threads · facebook
  title text,                     -- 회차·주제 (선택)
  slug text,                      -- 연결한 고민 랜딩 (선택)
  note text,
  created_at timestamptz not null default now()
);
create index if not exists content_posts_posted_idx on public.content_posts(posted_at desc);
alter table public.content_posts enable row level security;   -- 쓰기·읽기는 서비스 키(관리자 API)만

-- 게시 후 n시간 안에 들어온 외부 방문(기기 기준) — "이 게시물이 사람을 움직였나"
-- 같은 시간대에 여러 게시물이 겹치면 각 게시물에 모두 세어진다(겹침 주의). 완벽한 귀속이 아니라 비교용이다.
create or replace function public.post_effect(p_hours int default 3, p_days int default 30)
returns table (
  post_id uuid, posted_at timestamptz, channel text, title text, slug text,
  visitors int, by_source text, landing_views int, asks int
) language sql security definer set search_path = public as $$
  with p as (
    select * from public.content_posts where posted_at >= now() - make_interval(days => p_days)
  ), fh as (  -- 창 안의 방문자별 첫 기록
    select p.id as post_id, e.visitor_id,
           min(e.created_at) as first_at
    from p join public.events_clean e
      on e.created_at >= p.posted_at and e.created_at < p.posted_at + make_interval(hours => p_hours)
    group by p.id, e.visitor_id
  ), src as (
    select fh.post_id, fh.visitor_id,
      coalesce(
        (select 'utm:'||coalesce(nullif(e.utm,''), nullif(e.utm_source,'')) from public.events_clean e where e.visitor_id=fh.visitor_id and e.created_at=fh.first_at and coalesce(nullif(e.utm,''), nullif(e.utm_source,'')) is not null limit 1),
        (select 'app:'||e.app from public.events_clean e where e.visitor_id=fh.visitor_id and e.created_at=fh.first_at and e.app is not null and e.app not in ('browser') limit 1),
        (select 'ref:'||regexp_replace(e.referrer,'^https?://([^/]+).*$','\1') from public.events_clean e where e.visitor_id=fh.visitor_id and e.created_at=fh.first_at and coalesce(e.referrer,'')<>'' limit 1),
        'direct') as source
    from fh
  )
  select p.id, p.posted_at, p.channel, p.title, p.slug,
    (select count(*) from fh where fh.post_id=p.id)::int as visitors,
    (select string_agg(s.source||' '||s.n, ' · ' order by s.n desc) from (select source, count(*) n from src where src.post_id=p.id group by source) s) as by_source,
    (select count(distinct e.visitor_id) from public.events_clean e join fh on fh.post_id=p.id and fh.visitor_id=e.visitor_id
       where e.name='q_view' and e.created_at >= p.posted_at and e.created_at < p.posted_at + make_interval(hours => p_hours))::int as landing_views,
    (select count(*) from public.free_questions f where f.created_at >= p.posted_at and f.created_at < p.posted_at + make_interval(hours => p_hours))::int as asks
  from p order by p.posted_at desc;
$$;
revoke all on function public.post_effect(int,int) from public, anon;
grant execute on function public.post_effect(int,int) to service_role;   -- 관리자 API(서비스 키)만 호출
