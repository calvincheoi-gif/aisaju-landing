-- 홈 고민 주제 v3.0 후속 (2026-11-05): 1문 1답 직행(ask)이던 8개 키워드에 고민 랜딩(/q)이 생겨 연결을 q 로 바꾼다.
-- (v3 SQL 을 이미 실행한 DB 용. 새 DB 는 20261105_home_topics_v3.sql 만으로 충분)
update public.home_topics set link_type = 'q', updated_at = now()
 where slug in ('crush','breakup','divorce','health','family-conflict','parent-care','moving','exam') and link_type = 'ask';
