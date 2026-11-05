-- 홈 고민 주제 v3 (2026-11-05): 7개 → 24개 키워드, 4줄 창, 방문마다 다른 순서.
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
update public.home_topics set grp = '연애', link_type = 'q', weight = 1, time_slot = 'night', tone = 'light' where slug = 'love-pattern' and grp = '';
update public.home_topics set grp = '연애', link_type = 'q', weight = 1, time_slot = 'night', tone = 'light', ask_prefill = coalesce(ask_prefill, '요즘 자주 연락하는 사람이 있어요. 썸인지, 저 혼자 착각인지 모르겠어요.') where slug = 'crush' and grp = '';
update public.home_topics set grp = '연애', link_type = 'q', weight = 1, time_slot = 'night', tone = 'light' where slug = 'contact' and grp = '';
update public.home_topics set grp = '연애', link_type = 'q', weight = 1, time_slot = 'any', tone = 'heavy', ask_prefill = coalesce(ask_prefill, '헤어져야 할지, 조금 더 노력해 봐야 할지 고민이에요.') where slug = 'breakup' and grp = '';
update public.home_topics set grp = '연애', link_type = 'q', weight = 2, time_slot = 'night', tone = 'light' where slug = 'reunion' and grp = '';
update public.home_topics set grp = '결혼', link_type = 'q', weight = 1, time_slot = 'any', tone = 'light' where slug = 'marriage' and grp = '';
update public.home_topics set grp = '결혼', link_type = 'q', weight = 1, time_slot = 'night', tone = 'light' where slug = 'marriage-talk' and grp = '';
update public.home_topics set grp = '결혼', link_type = 'q', weight = 1, time_slot = 'any', tone = 'heavy', ask_prefill = coalesce(ask_prefill, '이혼을 생각하고 있어요. 지금 결정하는 게 맞을지, 별거로 시간을 둬야 할지 모르겠어요.') where slug = 'divorce' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'job-99' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'last-chance-83' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 2, time_slot = 'am', tone = 'light' where slug = 'quit' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'promotion' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 1, time_slot = 'any', tone = 'light' where slug = 'second-prime' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'severance-startup' and grp = '';
update public.home_topics set grp = '일', link_type = 'q', weight = 2, time_slot = 'am', tone = 'heavy' where slug = 'boss-conflict' and grp = '';
update public.home_topics set grp = '돈', link_type = 'q', weight = 1, time_slot = 'any', tone = 'light' where slug = 'no-savings' and grp = '';
update public.home_topics set grp = '돈', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'invest-anxiety' and grp = '';
update public.home_topics set grp = '돈', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'buy-home' and grp = '';
update public.home_topics set grp = '돈', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light' where slug = 'close-or-hold' and grp = '';
update public.home_topics set grp = '삶', link_type = 'q', weight = 1, time_slot = 'any', tone = 'light', ask_prefill = coalesce(ask_prefill, '요즘 몸이 자꾸 아픈데, 올해 건강 면에서 조심해야 할 시기인지 궁금해요.') where slug = 'health' and grp = '';
update public.home_topics set grp = '삶', link_type = 'q', weight = 1, time_slot = 'night', tone = 'heavy', ask_prefill = coalesce(ask_prefill, '가족과 자꾸 부딪히고 말이 안 통해요. 어떻게 풀어 가면 좋을지 궁금해요.') where slug = 'family-conflict' and grp = '';
update public.home_topics set grp = '삶', link_type = 'q', weight = 1, time_slot = 'night', tone = 'heavy', ask_prefill = coalesce(ask_prefill, '부모님 부양 문제로 고민이 많아요. 형제 간 역할이나 제가 감당해야 할 몫이 궁금해요.') where slug = 'parent-care' and grp = '';
update public.home_topics set grp = '삶', link_type = 'q', weight = 1, time_slot = 'any', tone = 'light', ask_prefill = coalesce(ask_prefill, '올해 이사를 생각하고 있어요. 시기나 방향이 괜찮을지 봐 주세요.') where slug = 'moving' and grp = '';
update public.home_topics set grp = '삶', link_type = 'q', weight = 1, time_slot = 'am', tone = 'light', ask_prefill = coalesce(ask_prefill, '자격증·공무원 시험을 준비 중이에요. 올해 승부를 보는 게 좋을지 궁금해요.') where slug = 'exam' and grp = '';

-- (2) 아직 없는 slug 만 넣는다 (관리자에서 지운 것은 다시 들어온다 — 원치 않으면 「홈에 게시」를 끄는 쪽을 권장)
insert into public.home_topics (sort, category, title, slug, i18n, grp, link_type, ask_prefill, weight, time_slot, tone)
select v.* from (values
  (1, '연애', '왜 나는 사랑에 상처 받을까?', 'love-pattern', '{"en":{"category":"Love","title":"Why do I keep getting hurt in love?"},"ja":{"category":"恋愛","title":"なぜ私はいつも恋で傷つくの？"},"zh":{"category":"恋爱","title":"为什么我总在爱情里受伤？"},"fr":{"category":"Amour","title":"Pourquoi je souffre en amour ?"}}'::jsonb, '연애', 'q', null, 1, 'night', 'light'),
  (2, '썸', '이게 썸일까, 나만의 착각일까?', 'crush', '{"en":{"category":"Crush","title":"Is this a thing, or just me?"},"ja":{"category":"片思い","title":"これは脈あり？私の勘違い？"},"zh":{"category":"暧昧","title":"这是暧昧，还是我的错觉？"},"fr":{"category":"Flirt","title":"Un début d’histoire… ou moi seule ?"}}'::jsonb, '연애', 'q', '요즘 자주 연락하는 사람이 있어요. 썸인지, 저 혼자 착각인지 모르겠어요.', 1, 'night', 'light'),
  (3, '속마음', '연락이 뜸한 그 사람, 속마음은?', 'contact', '{"en":{"category":"Feelings","title":"Fewer texts — what’s on their mind?"},"ja":{"category":"本音","title":"連絡が減ったあの人の本音は？"},"zh":{"category":"心思","title":"联系变少的那个人，在想什么？"},"fr":{"category":"Pensées","title":"Moins de messages : que pense-t-il ?"}}'::jsonb, '연애', 'q', null, 1, 'night', 'light'),
  (4, '이별', '헤어지는 게 맞을까, 더 버틸까?', 'breakup', '{"en":{"category":"Breakup","title":"Should I leave, or hold on?"},"ja":{"category":"別れ","title":"別れるべき？もう少し耐える？"},"zh":{"category":"分手","title":"该分手，还是再撑一下？"},"fr":{"category":"Rupture","title":"Partir, ou tenir encore ?"}}'::jsonb, '연애', 'q', '헤어져야 할지, 조금 더 노력해 봐야 할지 고민이에요.', 1, 'any', 'heavy'),
  (5, '재회', '헤어진 그 사람, 먼저 연락할까?', 'reunion', '{"en":{"category":"Reunion","title":"My ex — should I reach out first?"},"ja":{"category":"復縁","title":"別れた人に、先に連絡する？"},"zh":{"category":"复合","title":"分手的那个人，我先联系吗？"},"fr":{"category":"Retour","title":"Mon ex : faire le premier pas ?"}}'::jsonb, '연애', 'q', null, 2, 'night', 'light'),
  (6, '궁합', '결혼해도 될까? 사랑 말고 볼 3가지', 'marriage', '{"en":{"category":"Match","title":"Marry? 3 things beyond love"},"ja":{"category":"相性","title":"結婚していい？愛以外に見る3つ"},"zh":{"category":"合婚","title":"该结婚吗？爱情之外要看的3件事"},"fr":{"category":"Couple","title":"Se marier ? 3 points à vérifier"}}'::jsonb, '결혼', 'q', null, 1, 'any', 'light'),
  (7, '결혼시기', '몇 년을 만났는데, 결혼은 언제쯤?', 'marriage-talk', '{"en":{"category":"Timing","title":"Years together — when do we marry?"},"ja":{"category":"結婚時期","title":"何年も付き合って、結婚はいつ？"},"zh":{"category":"婚期","title":"交往多年，什么时候结婚？"},"fr":{"category":"Mariage","title":"Des années ensemble : se marier quand ?"}}'::jsonb, '결혼', 'q', null, 1, 'night', 'light'),
  (8, '이혼', '이혼이 답일까, 시간을 더 둘까?', 'divorce', '{"en":{"category":"Divorce","title":"Divorce — or give it more time?"},"ja":{"category":"離婚","title":"離婚が答え？もう少し時間を置く？"},"zh":{"category":"离婚","title":"离婚是答案，还是再给些时间？"},"fr":{"category":"Divorce","title":"Divorcer, ou laisser du temps ?"}}'::jsonb, '결혼', 'q', '이혼을 생각하고 있어요. 지금 결정하는 게 맞을지, 별거로 시간을 둬야 할지 모르겠어요.', 1, 'any', 'heavy'),
  (9, '취업', '99년생, 올해 안에 취업할 수 있을까?', 'job-99', '{"en":{"category":"Job","title":"Born in ’99 — a job this year?"},"ja":{"category":"就職","title":"99年生まれ、今年中に就職できる？"},"zh":{"category":"求职","title":"99年生，今年能找到工作吗？"},"fr":{"category":"Emploi","title":"Né en 99 : un job cette année ?"}}'::jsonb, '일', 'q', null, 1, 'am', 'light'),
  (10, '이직', '이번 이직이 마지막 기회일까?', 'last-chance-83', '{"en":{"category":"Career","title":"Is this job change my last shot?"},"ja":{"category":"転職","title":"今回の転職が最後のチャンス？"},"zh":{"category":"跳槽","title":"这次跳槽是最后的机会吗？"},"fr":{"category":"Carrière","title":"Ce poste : ma dernière chance ?"}}'::jsonb, '일', 'q', null, 1, 'am', 'light'),
  (11, '퇴사', '퇴사하고 싶다… 지금 나가도 될까?', 'quit', '{"en":{"category":"Quitting","title":"I want to quit… is now the time?"},"ja":{"category":"退職","title":"辞めたい…今辞めても大丈夫？"},"zh":{"category":"辞职","title":"想辞职……现在走合适吗？"},"fr":{"category":"Démission","title":"Démissionner… est-ce le moment ?"}}'::jsonb, '일', 'q', null, 2, 'am', 'light'),
  (12, '승진', '일은 내가 하는데 승진은 남이?', 'promotion', '{"en":{"category":"Promotion","title":"I do the work — they get promoted?"},"ja":{"category":"昇進","title":"仕事は私、昇進は他人？"},"zh":{"category":"升职","title":"活是我干的，升的却是别人？"},"fr":{"category":"Promotion","title":"Je bosse, eux sont promus ?"}}'::jsonb, '일', 'q', null, 1, 'am', 'light'),
  (13, '적성', '지금 새로 시작하면 늦을까?', 'second-prime', '{"en":{"category":"Path","title":"Is it too late to start over?"},"ja":{"category":"適性","title":"今から始めるのは遅い？"},"zh":{"category":"方向","title":"现在重新开始，晚吗？"},"fr":{"category":"Voie","title":"Trop tard pour recommencer ?"}}'::jsonb, '일', 'q', null, 1, 'any', 'light'),
  (14, '창업', '퇴직금으로 가게 차려도 될까?', 'severance-startup', '{"en":{"category":"Startup","title":"Open a shop with my severance?"},"ja":{"category":"起業","title":"退職金で店を始めてもいい？"},"zh":{"category":"创业","title":"用退休金开店可以吗？"},"fr":{"category":"Création","title":"Ouvrir avec mes indemnités ?"}}'::jsonb, '일', 'q', null, 1, 'am', 'light'),
  (15, '직장갈등', '상사와 자꾸 부딪히는 나, 왜일까?', 'boss-conflict', '{"en":{"category":"Work clash","title":"Always clashing with my boss — why?"},"ja":{"category":"職場の衝突","title":"上司とぶつかってばかり、なぜ？"},"zh":{"category":"职场冲突","title":"总和上司起冲突，为什么？"},"fr":{"category":"Conflit pro","title":"Toujours en conflit avec mon chef ?"}}'::jsonb, '일', 'q', null, 2, 'am', 'heavy'),
  (16, '재물', '월급은 들어오는데 왜 늘 돈이 없을까?', 'no-savings', '{"en":{"category":"Money","title":"Paid monthly — why always broke?"},"ja":{"category":"お金","title":"給料はあるのに、なぜお金がない？"},"zh":{"category":"财运","title":"有工资，为什么总是没钱？"},"fr":{"category":"Argent","title":"Un salaire, mais jamais d’argent ?"}}'::jsonb, '돈', 'q', null, 1, 'any', 'light'),
  (17, '투자', '주식만 사면 불안한 나, 왜 그럴까?', 'invest-anxiety', '{"en":{"category":"Investing","title":"Stocks make me anxious — why?"},"ja":{"category":"投資","title":"株を買うと不安な私、なぜ？"},"zh":{"category":"投资","title":"一买股票就焦虑，为什么？"},"fr":{"category":"Bourse","title":"La Bourse m’angoisse : pourquoi ?"}}'::jsonb, '돈', 'q', null, 1, 'am', 'light'),
  (18, '내집', '지금 집을 사야 할까, 기다릴까?', 'buy-home', '{"en":{"category":"Home","title":"Buy a home now, or wait?"},"ja":{"category":"マイホーム","title":"今、家を買う？それとも待つ？"},"zh":{"category":"买房","title":"现在买房，还是再等等？"},"fr":{"category":"Logement","title":"Acheter maintenant, ou attendre ?"}}'::jsonb, '돈', 'q', null, 1, 'am', 'light'),
  (19, '사업', '손님 없는 가게, 버틸까 접을까?', 'close-or-hold', '{"en":{"category":"Business","title":"Empty shop — hold on or close?"},"ja":{"category":"事業","title":"客の来ない店、続ける？畳む？"},"zh":{"category":"生意","title":"没客人的店，撑还是关？"},"fr":{"category":"Business","title":"Boutique vide : tenir ou fermer ?"}}'::jsonb, '돈', 'q', null, 1, 'am', 'light'),
  (20, '건강', '자꾸 아픈 요즘, 몸조심할 시기일까?', 'health', '{"en":{"category":"Health","title":"Often unwell — a time to be careful?"},"ja":{"category":"健康","title":"最近よく体調を崩す、用心の時期？"},"zh":{"category":"健康","title":"最近老生病，是该小心的时期吗？"},"fr":{"category":"Santé","title":"Souvent malade : période à risque ?"}}'::jsonb, '삶', 'q', '요즘 몸이 자꾸 아픈데, 올해 건강 면에서 조심해야 할 시기인지 궁금해요.', 1, 'any', 'light'),
  (21, '가족갈등', '가족과 자꾸 부딪힌다, 어떻게 풀까?', 'family-conflict', '{"en":{"category":"Family","title":"Clashing with family — how to mend?"},"ja":{"category":"家族の衝突","title":"家族とぶつかる、どう解く？"},"zh":{"category":"家庭矛盾","title":"总和家人起冲突，怎么化解？"},"fr":{"category":"Famille","title":"Conflits en famille : comment apaiser ?"}}'::jsonb, '삶', 'q', '가족과 자꾸 부딪히고 말이 안 통해요. 어떻게 풀어 가면 좋을지 궁금해요.', 1, 'night', 'heavy'),
  (22, '부모부양', '부모님 부양, 나 혼자 짊어져야 할까?', 'parent-care', '{"en":{"category":"Parents","title":"Caring for parents — all on me?"},"ja":{"category":"親の介護","title":"親の扶養、私ひとりで背負う？"},"zh":{"category":"赡养","title":"赡养父母，要我一个人扛吗？"},"fr":{"category":"Parents","title":"Mes parents : tout porter seul ?"}}'::jsonb, '삶', 'q', '부모님 부양 문제로 고민이 많아요. 형제 간 역할이나 제가 감당해야 할 몫이 궁금해요.', 1, 'night', 'heavy'),
  (23, '이사', '올해 이사해도 될까, 방향은?', 'moving', '{"en":{"category":"Moving","title":"Move this year? Which direction?"},"ja":{"category":"引っ越し","title":"今年引っ越していい？方角は？"},"zh":{"category":"搬家","title":"今年能搬家吗？往哪个方向？"},"fr":{"category":"Déménager","title":"Déménager cette année ? Où ?"}}'::jsonb, '삶', 'q', '올해 이사를 생각하고 있어요. 시기나 방향이 괜찮을지 봐 주세요.', 1, 'any', 'light'),
  (24, '시험', '이번 시험, 올해 승부를 봐도 될까?', 'exam', '{"en":{"category":"Exam","title":"This exam — go all in this year?"},"ja":{"category":"試験","title":"この試験、今年勝負していい？"},"zh":{"category":"考试","title":"这次考试，今年全力一搏吗？"},"fr":{"category":"Examen","title":"Cet examen : tout donner cette année ?"}}'::jsonb, '삶', 'q', '자격증·공무원 시험을 준비 중이에요. 올해 승부를 보는 게 좋을지 궁금해요.', 1, 'am', 'light')
) as v(sort, category, title, slug, i18n, grp, link_type, ask_prefill, weight, time_slot, tone)
where not exists (select 1 from public.home_topics t where t.slug = v.slug);

-- (3) 관리자 목록 순서를 축별로 다시 매긴다 (홈 순서는 브라우저가 섞는다)
with o as (select id, row_number() over (order by case grp when '연애' then 1 when '결혼' then 2 when '일' then 3 when '돈' then 4 when '삶' then 5 else 9 end, sort, created_at) rn from public.home_topics)
update public.home_topics h set sort = o.rn from o where o.id = h.id;
