-- 홈 첫 화면 「고민 주제 롤링」 (2026-10-11)
-- 히어로의 설명 2줄 자리에 2줄씩 돌아가며 보이는 고민 제목. 누르면 /q/<slug> 고민 랜딩으로.
-- 관리자 /admin/topics 에서 추가·수정·삭제·순서 변경 + 4개 국어 번역. 홈은 live=true 만 sort 순으로 읽는다.

create table if not exists public.home_topics (
  id uuid primary key default gen_random_uuid(),
  sort int not null default 0,
  category text not null,          -- 분야 라벨 (연애·취업·이직·궁합 …) — 한국어
  title text not null,             -- 홈용 짧은 제목 (한 줄, 18자 안팎 권장) — 한국어
  slug text not null,              -- 연결할 고민 랜딩 주소 꼬리 (/q/<slug>)
  i18n jsonb not null default '{}'::jsonb,  -- {"en":{"category":"Love","title":"…"},"ja":{…},"zh":{…},"fr":{…}} 비면 한국어가 보인다
  live boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists home_topics_sort_idx on public.home_topics(live, sort);
-- 이미 표가 있던 경우를 위해 (없으면 그냥 지나간다)
alter table public.home_topics add column if not exists i18n jsonb not null default '{}'::jsonb;

alter table public.home_topics enable row level security;

-- 누구나(홈) 게시 중인 행만 읽을 수 있다. 쓰기는 서비스 키(관리자 API)만.
drop policy if exists "Anyone can read live home_topics" on public.home_topics;
create policy "Anyone can read live home_topics" on public.home_topics
  for select using (live = true);

-- 시범 4개 + 번역 (비어 있을 때만 넣는다 — 다시 실행해도 중복되지 않음)
insert into public.home_topics (sort, category, title, slug, i18n)
select * from (values
  (1, '연애', '왜 나는 사랑에 상처 받을까?', 'love-pattern',
   '{"en":{"category":"Love","title":"Why do I keep getting hurt in love?"},"ja":{"category":"恋愛","title":"なぜ私はいつも恋で傷つくの？"},"zh":{"category":"恋爱","title":"为什么我总在爱情里受伤？"},"fr":{"category":"Amour","title":"Pourquoi je souffre en amour ?"}}'::jsonb),
  (2, '취업', '99년생, 올해 안에 취업할 수 있을까?', 'job-99',
   '{"en":{"category":"Job","title":"Born in ’99 — a job this year?"},"ja":{"category":"就職","title":"99年生まれ、今年中に就職できる？"},"zh":{"category":"求职","title":"99年生，今年能找到工作吗？"},"fr":{"category":"Emploi","title":"Né en 99 : un job cette année ?"}}'::jsonb),
  (3, '이직', '퇴사하고 싶다… 지금 나가도 될까?', 'quit',
   '{"en":{"category":"Career","title":"I want to quit… is now the time?"},"ja":{"category":"転職","title":"辞めたい…今辞めても大丈夫？"},"zh":{"category":"跳槽","title":"想辞职……现在走合适吗？"},"fr":{"category":"Carrière","title":"Démissionner… est-ce le moment ?"}}'::jsonb),
  (4, '궁합', '결혼해도 될까? 사랑 말고 봐야 할 3가지', 'marriage',
   '{"en":{"category":"Match","title":"Marry? 3 things beyond love"},"ja":{"category":"相性","title":"結婚していい？愛以外に見る3つ"},"zh":{"category":"合婚","title":"该结婚吗？爱情之外要看的3件事"},"fr":{"category":"Couple","title":"Se marier ? 3 points à vérifier"}}'::jsonb)
) as v(sort, category, title, slug, i18n)
where not exists (select 1 from public.home_topics);
