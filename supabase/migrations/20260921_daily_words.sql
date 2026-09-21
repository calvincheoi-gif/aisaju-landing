-- ============================================================
-- Today's 촌철활인 한마디 — daily_words (v1)
--  · 행 = 월/일 × 오행(木火土金水) = 366 × 5 = 1,830행, 연도와 무관하게 매년 재사용
--  · 승인 절차 없음: 이 표의 내용이 그대로 홈에 나간다(수정 = 이 표를 고치는 것)
--  · quote_id 는 같은 문구의 반복 사용을 추적하기 위한 값(K-木-01 등)
-- ============================================================
create table if not exists public.daily_words (
  month      smallint not null check (month between 1 and 12),
  day        smallint not null check (day between 1 and 31),
  element    text     not null check (element in ('木','火','土','金','水')),
  type       text     not null check (type in ('한국 속담','미국 속담','탈무드·성경','사자성어','불경·기타')),
  quote_id   text     not null,
  text       text     not null,
  meaning    text,                 -- 미국 속담·사자성어의 한국어 뜻
  source     text,                 -- 탈무드·성경·불경·고전의 출처
  updated_at timestamptz not null default now(),
  primary key (month, day, element)
);

create index if not exists daily_words_quote_idx on public.daily_words (quote_id);

create or replace function public.daily_words_touch_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists daily_words_touch on public.daily_words;
create trigger daily_words_touch
  before update on public.daily_words
  for each row execute function public.daily_words_touch_updated_at();

-- 누구나 읽기만 가능. 쓰기는 대시보드(소유자)·service_role 만
alter table public.daily_words enable row level security;
drop policy if exists daily_words_public_read on public.daily_words;
create policy daily_words_public_read on public.daily_words
  for select to anon, authenticated using (true);
