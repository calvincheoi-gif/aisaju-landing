-- ============================================================
-- 「오늘의 주역 한 줄」 daily_iching 테이블 (v1)
--  · 하루 한 행(date가 기본키)
--  · 선정 결과(괘·효·기운)는 엔진이 계산한 값을 그대로 저장
--  · 문장(①⑤⑥⑦ 등)은 예약 작업이 초안(draft) → 관리자 승인(approved) 후 공개
--  · 공개 화면은 approved + 오늘 이전 날짜만 읽을 수 있음(RLS)
-- ============================================================
create table if not exists public.daily_iching (
  date            date primary key,
  day_ganji       text        not null,                  -- 戊戌
  month_ganji     text        not null,                  -- 丁酉
  is_jeolip       boolean     not null default false,    -- 절입일
  hexagram_no     smallint    not null check (hexagram_no between 1 and 64),
  line_pos        smallint    not null check (line_pos between 1 and 6),
  energy_state    text        not null check (energy_state in ('旺','相','休','囚','死')),
  engine_version  text        not null,

  -- 콘텐츠 (③ 괘 구조는 괘 데이터에서 그리므로 저장하지 않음)
  energy_text     text,       -- ① 오늘의 간지와 기운
  hexagram_text   text,       -- ② 오늘의 괘 풀이(현대어)
  line_text       text,       -- ④ 오늘의 핵심 효 풀이(현대어)
  action_text     text,       -- ⑤ 행동 지침 한 문장
  ohaeng_tips     jsonb check (ohaeng_tips is null or jsonb_typeof(ohaeng_tips) = 'object'),
                              -- ⑥ {"木":"…","火":"…","土":"…","金":"…","水":"…"}
  question_text   text,       -- ⑦ 성찰 질문

  status          text        not null default 'draft'
                  check (status in ('draft','approved','hidden')),
  drafted_by      text        not null default 'claude',
  review_note     text,
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists daily_iching_status_date_idx
  on public.daily_iching (status, date desc);

-- updated_at 자동 갱신 (함수명은 이 테이블 전용으로 고유하게)
create or replace function public.daily_iching_touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.approved_at := now();
  end if;
  return new;
end $$;

drop trigger if exists daily_iching_touch on public.daily_iching;
create trigger daily_iching_touch
  before update on public.daily_iching
  for each row execute function public.daily_iching_touch_updated_at();

-- RLS: 공개(anon)는 승인된 오늘 이전 글만 읽기. 쓰기 정책은 두지 않음 → service_role(관리자 API)만 쓰기 가능
alter table public.daily_iching enable row level security;

drop policy if exists daily_iching_public_read on public.daily_iching;
create policy daily_iching_public_read on public.daily_iching
  for select to anon, authenticated
  using (status = 'approved' and date <= (now() at time zone 'Asia/Seoul')::date);
