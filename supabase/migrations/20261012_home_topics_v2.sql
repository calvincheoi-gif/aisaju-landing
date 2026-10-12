-- 홈 고민 주제 v2 (2026-10-12): 3줄 롤링, 7개 분야에서 1개씩. 이미 있는 slug 는 건너뛰고 새 3개만 넣는다.
-- (관리자 /admin/topics 에서 바꾼 내용은 덮어쓰지 않는다)
insert into public.home_topics (sort, category, title, slug, i18n)
select v.* from (values
  (5, '사업', '손님 없는 가게, 버틸까 접을까?', 'close-or-hold',
   '{"en":{"category":"Business","title":"Empty shop — hold on or close?"},"ja":{"category":"事業","title":"客の来ない店、続ける？畳む？"},"zh":{"category":"生意","title":"没客人的店，撑还是关？"},"fr":{"category":"Business","title":"Boutique vide : tenir ou fermer ?"}}'::jsonb),
  (6, '적성', '지금 새로 시작하면 늦을까?', 'second-prime',
   '{"en":{"category":"Path","title":"Is it too late to start over?"},"ja":{"category":"適性","title":"今から始めるのは遅い？"},"zh":{"category":"方向","title":"现在重新开始，晚吗？"},"fr":{"category":"Voie","title":"Trop tard pour recommencer ?"}}'::jsonb),
  (7, '재물', '월급은 들어오는데 왜 늘 돈이 없을까?', 'no-savings',
   '{"en":{"category":"Money","title":"Paid monthly — why always broke?"},"ja":{"category":"お金","title":"給料はあるのに、なぜお金がない？"},"zh":{"category":"财运","title":"有工资，为什么总是没钱？"},"fr":{"category":"Argent","title":"Un salaire, mais jamais d’argent ?"}}'::jsonb)
) as v(sort, category, title, slug, i18n)
where not exists (select 1 from public.home_topics t where t.slug = v.slug);
