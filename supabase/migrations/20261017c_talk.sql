-- 「오늘 한 줄」 — 홈 1줄 소통 (2026-10-17)
--   · 누구나 40자 한 줄을 남긴다 (로그인·연락처 없음, 기기당 하루 3개)
--   · 욕설·광고·개인정보 패턴에 걸리면 숨김(held) → 관리자 승인 후 게시. 안 걸리면 즉시 게시(ok)
--   · 홈은 최신 10개만 롤링, /talk 에는 전부 누적
-- 다시 실행해도 안전하다 (if not exists / or replace).

-- ── 1. 글 ─────────────────────────────────────────────
create table if not exists public.talk_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  day_kst date not null default ((now() at time zone 'Asia/Seoul')::date),
  text text not null,                       -- 한 줄 (최대 40자)
  nick text,                                -- 닉네임 (선택, 최대 10자) — 없으면 화면에 "익명"
  status text not null default 'ok',        -- ok(게시) · held(검사에 걸려 승인 대기) · hidden(관리자 숨김·삭제)
  reason text,                              -- held 일 때 걸린 이유: ad · pii · abuse (쉼표로 여러 개)
  device_code text,                         -- 기기 식별(aisaju_vid) — 하루 3개 제한·도배 추적용
  utm text,                                 -- 어느 채널에서 온 사람인지
  app text,                                 -- 인앱 브라우저 판별값
  admin_note text
);
create index if not exists talk_posts_status_created_idx on public.talk_posts(status, created_at desc);
create index if not exists talk_posts_device_day_idx on public.talk_posts(device_code, day_kst);
alter table public.talk_posts enable row level security;

-- 읽기: 게시(ok)된 것만 누구나. 쓰기는 아래 함수(security definer)로만 — 직접 insert 는 막는다.
drop policy if exists "Anyone can read ok talk_posts" on public.talk_posts;
create policy "Anyone can read ok talk_posts" on public.talk_posts
  for select using (status = 'ok');

-- ── 2. 필터 (관리자 화면 /admin/talk 에서 추가·삭제) ─────────────────────
create table if not exists public.talk_filters (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('abuse','ad','pii')),   -- 욕설 · 광고 · 개인정보
  pattern text not null,                                      -- 정규식 (대소문자 무시). 단어 하나면 그냥 단어
  note text,
  created_at timestamptz not null default now()
);
alter table public.talk_filters enable row level security;    -- 서비스 키(관리자 API)만 읽고 쓴다

-- 기본 필터 — 이미 같은 패턴이 있으면 넣지 않는다
insert into public.talk_filters(kind, pattern, note)
select v.kind, v.pattern, v.note from (values
  ('pii',   '01[016789][ -]?\d{3,4}[ -]?\d{4}',                        '휴대전화 번호'),
  ('pii',   '\d{6}[ -]?[1-4]\d{6}',                                     '주민등록번호 형식'),
  ('pii',   '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',            '이메일'),
  ('ad',    'https?://|www\.|\.com\b|\.kr\b|\.net\b',                   '링크·주소'),
  ('ad',    '카톡\s*(아이디|id)|카카오\s*(아이디|id)|텔레그램|텔레\s*그램|라인\s*(아이디|id)', '메신저 아이디 유도'),
  ('ad',    '대출|수익\s*보장|고수익|부업|투자\s*(문의|상담)|코인|바카라|카지노|토토|홀덤|슬롯', '금융·도박 광고'),
  ('ad',    '무료\s*체험|이벤트\s*참여|선착순\s*모집|문의\s*주세요|DM\s*주세요|디엠', '모집·유도 문구'),
  ('abuse', '시발|씨발|씨팔|ㅅㅂ|ㅆㅂ|병신|ㅂㅅ|개새끼|새끼|지랄|ㅈㄹ|좆|염병|미친놈|미친년|꺼져|닥쳐', '욕설')
) as v(kind, pattern, note)
where not exists (select 1 from public.talk_filters f where f.pattern = v.pattern);

-- ── 3. 등록 함수 — 필터 검사 + 하루 3개 제한 + 저장을 한 번에 ─────────────
--   돌려주는 값: {ok:true, id, status:'ok'|'held', reason}  |  {ok:false, reason:'missing'|'too_long'|'limit'}
create or replace function public.talk_submit(
  p_text text, p_nick text default null, p_device_code text default null, p_utm text default null, p_app text default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  t text := regexp_replace(coalesce(p_text,''), '\s+', ' ', 'g');
  n text := nullif(left(trim(coalesce(p_nick,'')), 10), '');
  d date := (now() at time zone 'Asia/Seoul')::date;
  cnt int; hits text := ''; f record; st text := 'ok'; new_id uuid;
begin
  t := trim(t);
  if t = '' then return json_build_object('ok', false, 'reason', 'missing'); end if;
  if char_length(t) > 40 then return json_build_object('ok', false, 'reason', 'too_long'); end if;

  -- 같은 기기 하루 3개 (숨김 처리된 글도 센다 — 도배 방지)
  if p_device_code is not null then
    select count(*) into cnt from public.talk_posts where device_code = p_device_code and day_kst = d;
    if cnt >= 3 then return json_build_object('ok', false, 'reason', 'limit'); end if;
  end if;

  -- 필터 검사: 글과 닉네임 모두. 걸린 종류를 모아 둔다 (잘못된 정규식 하나가 전체를 막지 않도록 예외는 건너뜀)
  for f in select kind, pattern from public.talk_filters loop
    begin
      if (t || ' ' || coalesce(n,'')) ~* f.pattern then
        if position(f.kind in hits) = 0 then hits := hits || case when hits = '' then '' else ',' end || f.kind; end if;
      end if;
    exception when others then null;
    end;
  end loop;
  if hits <> '' then st := 'held'; end if;

  insert into public.talk_posts(text, nick, status, reason, device_code, utm, app)
  values (t, n, st, nullif(hits,''), p_device_code, left(p_utm, 40), left(p_app, 20))
  returning id into new_id;

  return json_build_object('ok', true, 'id', new_id, 'status', st, 'reason', nullif(hits,''));
end $$;
-- 누구나(익명 키) 부를 수 있어야 한다 — 글을 직접 넣는 길은 없고 이 함수가 유일한 입구
grant execute on function public.talk_submit(text,text,text,text,text) to anon, authenticated, service_role;

-- ── 4. 읽기 뷰 — 게시된 글만, 기기·utm 같은 내부 값은 빼고 ─────────────
create or replace view public.talk_public as
  select id, created_at, text, coalesce(nick, '익명') as nick
  from public.talk_posts where status = 'ok';
grant select on public.talk_public to anon, authenticated, service_role;
