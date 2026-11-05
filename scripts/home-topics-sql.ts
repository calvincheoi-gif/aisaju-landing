/**
 * lib/home-topics/catalog.ts → supabase/migrations/20261105_home_topics_v3.sql 을 만든다.
 *   npx tsx scripts/home-topics-sql.ts
 * 목록을 고친 뒤 이 스크립트를 다시 돌리면 SQL 이 같이 바뀐다(손으로 SQL 을 고치지 않는다).
 */
import { writeFileSync } from "node:fs";
import { TOPIC_CATALOG } from "../lib/home-topics/catalog";

const q = (s: string | null | undefined) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const j = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

const values = TOPIC_CATALOG.map((t) =>
  `  (${t.sort}, ${q(t.category)}, ${q(t.title)}, ${q(t.slug)}, ${j(t.i18n)}, ${q(t.grp)}, ${q(t.link_type)}, ${q(t.ask_prefill ?? null)}, ${t.weight}, ${q(t.time_slot)}, ${q(t.tone)})`
).join(",\n");

/* 이미 있던 v2 행(slug 가 같은 것)에는 새 컬럼 값만 채운다 — 관리자에서 고친 제목·번역은 그대로 둔다 */
const updates = TOPIC_CATALOG.map((t) =>
  `update public.home_topics set grp = ${q(t.grp)}, link_type = ${q(t.link_type)}, weight = ${t.weight}, time_slot = ${q(t.time_slot)}, tone = ${q(t.tone)}${t.ask_prefill ? `, ask_prefill = coalesce(ask_prefill, ${q(t.ask_prefill)})` : ""} where slug = ${q(t.slug)} and grp = '';`
).join("\n");

const sql = `-- 홈 고민 주제 v3 (2026-11-05): 7개 → 24개 키워드, 4줄 창, 방문마다 다른 순서.
-- 이 파일은 scripts/home-topics-sql.ts 가 lib/home-topics/catalog.ts 에서 만든다. 손으로 고치지 말 것.
--
-- 새 컬럼
--   grp         축(연애·결혼·일·돈·삶) — 같은 축이 연달아 보이지 않게
--   link_type   'q' = /q/<slug> 고민 랜딩, 'ask' = /ask 에 질문을 미리 채워 바로 연결
--   ask_prefill link_type='ask' 일 때 1문 1답 질문 칸에 미리 채울 문장
--   weight      1~3 노출 가중
--   time_slot   any / am(06~12) / pm(12~18) / night(18~06) — 맞는 시간대에 더 자주
--   tone        light / heavy — heavy 는 한 창(4줄)에 최대 1줄
-- 다시 실행해도 안전하다(있는 컬럼·행은 건너뛴다).

alter table public.home_topics add column if not exists grp         text not null default '';
alter table public.home_topics add column if not exists link_type   text not null default 'q';
alter table public.home_topics add column if not exists ask_prefill text;
alter table public.home_topics add column if not exists weight      int  not null default 1;
alter table public.home_topics add column if not exists time_slot   text not null default 'any';
alter table public.home_topics add column if not exists tone        text not null default 'light';

alter table public.home_topics drop constraint if exists home_topics_link_type_chk;
alter table public.home_topics add constraint home_topics_link_type_chk check (link_type in ('q','ask'));
alter table public.home_topics drop constraint if exists home_topics_time_slot_chk;
alter table public.home_topics add constraint home_topics_time_slot_chk check (time_slot in ('any','am','pm','night'));
alter table public.home_topics drop constraint if exists home_topics_tone_chk;
alter table public.home_topics add constraint home_topics_tone_chk check (tone in ('light','heavy'));
alter table public.home_topics drop constraint if exists home_topics_weight_chk;
alter table public.home_topics add constraint home_topics_weight_chk check (weight between 1 and 3);

-- (1) v2 때 들어간 행: 새 컬럼만 채운다. 단, 'quit' 행은 분야 라벨을 '이직' → '퇴사' 로 바꾼다(이직은 last-chance-83 이 맡는다).
update public.home_topics set category = '퇴사',
  i18n = jsonb_set(jsonb_set(jsonb_set(jsonb_set(i18n,
    '{en,category}', '"Quitting"', true), '{ja,category}', '"退職"', true), '{zh,category}', '"辞职"', true), '{fr,category}', '"Démission"', true)
  where slug = 'quit' and category = '이직';
${updates}

-- (2) 아직 없는 slug 만 넣는다 (관리자에서 지운 것은 다시 들어온다 — 원치 않으면 「홈에 게시」를 끄는 쪽을 권장)
insert into public.home_topics (sort, category, title, slug, i18n, grp, link_type, ask_prefill, weight, time_slot, tone)
select v.* from (values
${values}
) as v(sort, category, title, slug, i18n, grp, link_type, ask_prefill, weight, time_slot, tone)
where not exists (select 1 from public.home_topics t where t.slug = v.slug);

-- (3) 관리자 목록 순서를 축별로 다시 매긴다 (홈 순서는 브라우저가 섞는다)
with o as (select id, row_number() over (order by case grp when '연애' then 1 when '결혼' then 2 when '일' then 3 when '돈' then 4 when '삶' then 5 else 9 end, sort, created_at) rn from public.home_topics)
update public.home_topics h set sort = o.rn from o where o.id = h.id;
`;

writeFileSync(new URL("../supabase/migrations/20261105_home_topics_v3.sql", import.meta.url), sql);
console.log(`wrote 20261105_home_topics_v3.sql — ${TOPIC_CATALOG.length} topics`);
