import type { HomeTopic } from "./types";

/**
 * 홈 고민 주제 44개 — 기본 목록 (v3 24개 2026-11-05 → v4 44개 2026-11-08, 목표 108)
 *
 * 역할 두 가지
 *   1) DB(home_topics)가 없거나 비어 있을 때 홈이 그대로 쓰는 예비 목록
 *   2) supabase/migrations/20261108_home_topics_v4.sql 의 씨앗 — `npx tsx scripts/home-topics-sql.ts` 로 다시 만든다
 * 운영 중 수정은 관리자 /admin/topics 에서 한다(여기를 고쳐도 이미 들어간 DB 행은 바뀌지 않는다).
 *
 * 선정 기준(2026-11-04~05 벤치마킹): 사주·타로 상담 시장에서 가장 많이 찾는 키워드 2~4자.
 *   연애 5 · 결혼 3 · 일 7 · 돈 4 · 삶 5 = 24 (24절기)
 *   "할까 말까"(이직·창업·투자·재회) 뿐 아니라 "이미 벌어진 갈등"(이혼·직장갈등·가족갈등·부모부양)을 넣었다 — 상담 신청 비중이 큰 축.
 * 제목은 18자 안팎 한 줄. v3.0(2026-11-05) 8개 랜딩을 더해 24개 모두 /q 랜딩(q)으로 연결 — ask_prefill 은 관리자에서 「1문 1답 바로」로 바꿀 때를 위해 남겨 둔다.
 */
export const TOPIC_CATALOG: HomeTopic[] = [
  /* ── 연애 ── */
  { sort: 1, grp: "연애", category: "연애", title: "왜 나는 사랑에 상처 받을까?", slug: "love-pattern", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Love", title: "Why do I keep getting hurt in love?" }, ja: { category: "恋愛", title: "なぜ私はいつも恋で傷つくの？" }, zh: { category: "恋爱", title: "为什么我总在爱情里受伤？" }, fr: { category: "Amour", title: "Pourquoi je souffre en amour ?" } } },
  { sort: 2, grp: "연애", category: "썸", title: "이게 썸일까, 나만의 착각일까?", slug: "crush", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "요즘 자주 연락하는 사람이 있어요. 썸인지, 저 혼자 착각인지 모르겠어요.",
    i18n: { en: { category: "Crush", title: "Is this a thing, or just me?" }, ja: { category: "片思い", title: "これは脈あり？私の勘違い？" }, zh: { category: "暧昧", title: "这是暧昧，还是我的错觉？" }, fr: { category: "Flirt", title: "Un début d’histoire… ou moi seule ?" } } },
  { sort: 3, grp: "연애", category: "속마음", title: "연락이 뜸한 그 사람, 속마음은?", slug: "contact", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Feelings", title: "Fewer texts — what’s on their mind?" }, ja: { category: "本音", title: "連絡が減ったあの人の本音は？" }, zh: { category: "心思", title: "联系变少的那个人，在想什么？" }, fr: { category: "Pensées", title: "Moins de messages : que pense-t-il ?" } } },
  { sort: 4, grp: "연애", category: "이별", title: "헤어지는 게 맞을까, 더 버틸까?", slug: "breakup", link_type: "q", weight: 1, time_slot: "any", tone: "heavy",
    ask_prefill: "헤어져야 할지, 조금 더 노력해 봐야 할지 고민이에요.",
    i18n: { en: { category: "Breakup", title: "Should I leave, or hold on?" }, ja: { category: "別れ", title: "別れるべき？もう少し耐える？" }, zh: { category: "分手", title: "该分手，还是再撑一下？" }, fr: { category: "Rupture", title: "Partir, ou tenir encore ?" } } },
  { sort: 5, grp: "연애", category: "재회", title: "헤어진 그 사람, 먼저 연락할까?", slug: "reunion", link_type: "q", weight: 2, time_slot: "night", tone: "light",
    i18n: { en: { category: "Reunion", title: "My ex — should I reach out first?" }, ja: { category: "復縁", title: "別れた人に、先に連絡する？" }, zh: { category: "复合", title: "分手的那个人，我先联系吗？" }, fr: { category: "Retour", title: "Mon ex : faire le premier pas ?" } } },

  /* ── 결혼 ── */
  { sort: 6, grp: "결혼", category: "궁합", title: "결혼해도 될까? 사랑 말고 볼 3가지", slug: "marriage", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Match", title: "Marry? 3 things beyond love" }, ja: { category: "相性", title: "結婚していい？愛以外に見る3つ" }, zh: { category: "合婚", title: "该结婚吗？爱情之外要看的3件事" }, fr: { category: "Couple", title: "Se marier ? 3 points à vérifier" } } },
  { sort: 7, grp: "결혼", category: "결혼시기", title: "몇 년을 만났는데, 결혼은 언제쯤?", slug: "marriage-talk", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Timing", title: "Years together — when do we marry?" }, ja: { category: "結婚時期", title: "何年も付き合って、結婚はいつ？" }, zh: { category: "婚期", title: "交往多年，什么时候结婚？" }, fr: { category: "Mariage", title: "Des années ensemble : se marier quand ?" } } },
  { sort: 8, grp: "결혼", category: "이혼", title: "이혼이 답일까, 시간을 더 둘까?", slug: "divorce", link_type: "q", weight: 1, time_slot: "any", tone: "heavy",
    ask_prefill: "이혼을 생각하고 있어요. 지금 결정하는 게 맞을지, 별거로 시간을 둬야 할지 모르겠어요.",
    i18n: { en: { category: "Divorce", title: "Divorce — or give it more time?" }, ja: { category: "離婚", title: "離婚が答え？もう少し時間を置く？" }, zh: { category: "离婚", title: "离婚是答案，还是再给些时间？" }, fr: { category: "Divorce", title: "Divorcer, ou laisser du temps ?" } } },

  /* ── 일 ── */
  { sort: 9, grp: "일", category: "취업", title: "99년생, 올해 안에 취업할 수 있을까?", slug: "job-99", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Job", title: "Born in ’99 — a job this year?" }, ja: { category: "就職", title: "99年生まれ、今年中に就職できる？" }, zh: { category: "求职", title: "99年生，今年能找到工作吗？" }, fr: { category: "Emploi", title: "Né en 99 : un job cette année ?" } } },
  { sort: 10, grp: "일", category: "이직", title: "이번 이직이 마지막 기회일까?", slug: "last-chance-83", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Career", title: "Is this job change my last shot?" }, ja: { category: "転職", title: "今回の転職が最後のチャンス？" }, zh: { category: "跳槽", title: "这次跳槽是最后的机会吗？" }, fr: { category: "Carrière", title: "Ce poste : ma dernière chance ?" } } },
  { sort: 11, grp: "일", category: "퇴사", title: "퇴사하고 싶다… 지금 나가도 될까?", slug: "quit", link_type: "q", weight: 2, time_slot: "am", tone: "light",
    i18n: { en: { category: "Quitting", title: "I want to quit… is now the time?" }, ja: { category: "退職", title: "辞めたい…今辞めても大丈夫？" }, zh: { category: "辞职", title: "想辞职……现在走合适吗？" }, fr: { category: "Démission", title: "Démissionner… est-ce le moment ?" } } },
  { sort: 12, grp: "일", category: "승진", title: "일은 내가 하는데 승진은 남이?", slug: "promotion", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Promotion", title: "I do the work — they get promoted?" }, ja: { category: "昇進", title: "仕事は私、昇進は他人？" }, zh: { category: "升职", title: "活是我干的，升的却是别人？" }, fr: { category: "Promotion", title: "Je bosse, eux sont promus ?" } } },
  { sort: 13, grp: "일", category: "적성", title: "지금 새로 시작하면 늦을까?", slug: "second-prime", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Path", title: "Is it too late to start over?" }, ja: { category: "適性", title: "今から始めるのは遅い？" }, zh: { category: "方向", title: "现在重新开始，晚吗？" }, fr: { category: "Voie", title: "Trop tard pour recommencer ?" } } },
  { sort: 14, grp: "일", category: "창업", title: "퇴직금으로 가게 차려도 될까?", slug: "severance-startup", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Startup", title: "Open a shop with my severance?" }, ja: { category: "起業", title: "退職金で店を始めてもいい？" }, zh: { category: "创业", title: "用退休金开店可以吗？" }, fr: { category: "Création", title: "Ouvrir avec mes indemnités ?" } } },
  { sort: 15, grp: "일", category: "직장갈등", title: "상사와 자꾸 부딪히는 나, 왜일까?", slug: "boss-conflict", link_type: "q", weight: 2, time_slot: "am", tone: "heavy",
    i18n: { en: { category: "Work clash", title: "Always clashing with my boss — why?" }, ja: { category: "職場の衝突", title: "上司とぶつかってばかり、なぜ？" }, zh: { category: "职场冲突", title: "总和上司起冲突，为什么？" }, fr: { category: "Conflit pro", title: "Toujours en conflit avec mon chef ?" } } },

  /* ── 돈 ── */
  { sort: 16, grp: "돈", category: "재물", title: "월급은 들어오는데 왜 늘 돈이 없을까?", slug: "no-savings", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Money", title: "Paid monthly — why always broke?" }, ja: { category: "お金", title: "給料はあるのに、なぜお金がない？" }, zh: { category: "财运", title: "有工资，为什么总是没钱？" }, fr: { category: "Argent", title: "Un salaire, mais jamais d’argent ?" } } },
  { sort: 17, grp: "돈", category: "투자", title: "주식만 사면 불안한 나, 왜 그럴까?", slug: "invest-anxiety", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Investing", title: "Stocks make me anxious — why?" }, ja: { category: "投資", title: "株を買うと不安な私、なぜ？" }, zh: { category: "投资", title: "一买股票就焦虑，为什么？" }, fr: { category: "Bourse", title: "La Bourse m’angoisse : pourquoi ?" } } },
  { sort: 18, grp: "돈", category: "내집", title: "지금 집을 사야 할까, 기다릴까?", slug: "buy-home", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Home", title: "Buy a home now, or wait?" }, ja: { category: "マイホーム", title: "今、家を買う？それとも待つ？" }, zh: { category: "买房", title: "现在买房，还是再等等？" }, fr: { category: "Logement", title: "Acheter maintenant, ou attendre ?" } } },
  { sort: 19, grp: "돈", category: "사업", title: "손님 없는 가게, 버틸까 접을까?", slug: "close-or-hold", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Business", title: "Empty shop — hold on or close?" }, ja: { category: "事業", title: "客の来ない店、続ける？畳む？" }, zh: { category: "生意", title: "没客人的店，撑还是关？" }, fr: { category: "Business", title: "Boutique vide : tenir ou fermer ?" } } },

  /* ── 삶 ── */
  { sort: 20, grp: "삶", category: "건강", title: "자꾸 아픈 요즘, 몸조심할 시기일까?", slug: "health", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "요즘 몸이 자꾸 아픈데, 올해 건강 면에서 조심해야 할 시기인지 궁금해요.",
    i18n: { en: { category: "Health", title: "Often unwell — a time to be careful?" }, ja: { category: "健康", title: "最近よく体調を崩す、用心の時期？" }, zh: { category: "健康", title: "最近老生病，是该小心的时期吗？" }, fr: { category: "Santé", title: "Souvent malade : période à risque ?" } } },
  { sort: 21, grp: "삶", category: "가족갈등", title: "가족과 자꾸 부딪힌다, 어떻게 풀까?", slug: "family-conflict", link_type: "q", weight: 1, time_slot: "night", tone: "heavy",
    ask_prefill: "가족과 자꾸 부딪히고 말이 안 통해요. 어떻게 풀어 가면 좋을지 궁금해요.",
    i18n: { en: { category: "Family", title: "Clashing with family — how to mend?" }, ja: { category: "家族の衝突", title: "家族とぶつかる、どう解く？" }, zh: { category: "家庭矛盾", title: "总和家人起冲突，怎么化解？" }, fr: { category: "Famille", title: "Conflits en famille : comment apaiser ?" } } },
  { sort: 22, grp: "삶", category: "부모부양", title: "부모님 부양, 나 혼자 짊어져야 할까?", slug: "parent-care", link_type: "q", weight: 1, time_slot: "night", tone: "heavy",
    ask_prefill: "부모님 부양 문제로 고민이 많아요. 형제 간 역할이나 제가 감당해야 할 몫이 궁금해요.",
    i18n: { en: { category: "Parents", title: "Caring for parents — all on me?" }, ja: { category: "親の介護", title: "親の扶養、私ひとりで背負う？" }, zh: { category: "赡养", title: "赡养父母，要我一个人扛吗？" }, fr: { category: "Parents", title: "Mes parents : tout porter seul ?" } } },
  { sort: 23, grp: "삶", category: "이사", title: "올해 이사해도 될까, 방향은?", slug: "moving", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "올해 이사를 생각하고 있어요. 시기나 방향이 괜찮을지 봐 주세요.",
    i18n: { en: { category: "Moving", title: "Move this year? Which direction?" }, ja: { category: "引っ越し", title: "今年引っ越していい？方角は？" }, zh: { category: "搬家", title: "今年能搬家吗？往哪个方向？" }, fr: { category: "Déménager", title: "Déménager cette année ? Où ?" } } },
  { sort: 24, grp: "삶", category: "시험", title: "이번 시험, 올해 승부를 봐도 될까?", slug: "exam", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    ask_prefill: "자격증·공무원 시험을 준비 중이에요. 올해 승부를 보는 게 좋을지 궁금해요.",
    i18n: { en: { category: "Exam", title: "This exam — go all in this year?" }, ja: { category: "試験", title: "この試験、今年勝負していい？" }, zh: { category: "考试", title: "这次考试，今年全力一搏吗？" }, fr: { category: "Examen", title: "Cet examen : tout donner cette année ?" } } },

  /* ════════ v4 (2026-11-08) 20개 추가 → 44개 ════════
   * 근거: 온기우편함 1.2만 통(연애·관계 33.5%), 신통 설문(속마음·연락 시기), 사주 질문 TOP10(내년 운·적성·대운·택일),
   *       중장년 사회조사(고용 불안 55.8%·노후), Astrotalk(AI發 일자리 불안 +50%). 상세: 프로젝트 문서 「홈롤링_키워드_확장후보_v1.0」
   * 영어는 직역이 아니라 현지에서 실제 쓰는 말(Situationship·Ghosting·Layoff·Burnout …)로 둔다.
   * 면접 → interview-fail, 자녀 → child-aptitude 는 기존 랜딩에 연결. 나머지 18개는 lib/worries/data/v4/ 에 새 랜딩.
   */
  /* ── 연애 (+3) ── */
  { sort: 25, grp: "연애", category: "짝사랑", title: "짝사랑, 고백할까 이쯤에서 접을까?", slug: "unrequited", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "혼자 좋아하는 사람이 있어요. 고백해도 될지, 마음을 접는 게 나을지 모르겠어요.",
    i18n: { en: { category: "One-sided", title: "Unrequited love — confess or let go?" }, ja: { category: "片想い", title: "片想い、告白する？諦める？" }, zh: { category: "单恋", title: "单恋，告白还是放下？" }, fr: { category: "Amour secret", title: "Amour à sens unique : avouer ou lâcher ?" } } },
  { sort: 26, grp: "연애", category: "연락", title: "먼저 연락해도 될까, 기다릴까?", slug: "first-text", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "연락이 끊긴 지 좀 됐어요. 제가 먼저 연락해도 될지, 기다리는 게 맞을지 궁금해요.",
    i18n: { en: { category: "Ghosting", title: "Text first, or wait it out?" }, ja: { category: "連絡", title: "先に連絡する？待つ？" }, zh: { category: "联系", title: "先联系，还是等？" }, fr: { category: "Message", title: "Écrire en premier, ou attendre ?" } } },
  { sort: 27, grp: "연애", category: "인연시기", title: "내 인연, 언제쯤 나타날까?", slug: "when-love", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "연애를 안 한 지 오래됐어요. 제 사주에서 인연이 들어오는 시기와 통로가 궁금해요.",
    i18n: { en: { category: "Soulmate", title: "When will I meet someone?" }, ja: { category: "出会い", title: "私の縁は、いつ現れる？" }, zh: { category: "姻缘", title: "我的缘分，什么时候出现？" }, fr: { category: "Rencontre", title: "Quand vais-je rencontrer quelqu’un ?" } } },

  /* ── 결혼 (+2) ── */
  { sort: 28, grp: "결혼", category: "부부", title: "말만 꺼내면 싸우는 우리, 궁합 탓일까?", slug: "couple-fight", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "배우자와 대화만 하면 싸워요. 궁합이 안 맞는 건지, 어떻게 풀어야 할지 궁금해요.",
    i18n: { en: { category: "Marriage", title: "Every talk turns into a fight — why?" }, ja: { category: "夫婦", title: "話せば喧嘩になる、相性のせい？" }, zh: { category: "夫妻", title: "一开口就吵，是八字不合吗？" }, fr: { category: "Couple", title: "Chaque discussion finit en dispute ?" } } },
  { sort: 29, grp: "결혼", category: "바람", title: "바람일까… 의심이 멈추지 않는다", slug: "affair", link_type: "q", weight: 1, time_slot: "night", tone: "heavy",
    ask_prefill: "배우자(연인)의 바람이 의심돼요. 지금 제가 무엇을 먼저 살피고 어떻게 결정해야 할지 막막해요.",
    i18n: { en: { category: "Red flags", title: "Is it an affair? I can’t stop doubting" }, ja: { category: "浮気", title: "浮気？疑いが止まらない" }, zh: { category: "出轨", title: "是出轨吗……怀疑停不下来" }, fr: { category: "Infidélité", title: "Une liaison ? Le doute ne me lâche pas" } } },

  /* ── 일 (+4) ── */
  { sort: 30, grp: "일", category: "번아웃", title: "의욕이 없다… 쉬어야 할까, 그만둘까?", slug: "burnout", link_type: "q", weight: 1, time_slot: "pm", tone: "light",
    ask_prefill: "일에 아무 의욕이 없어요. 잠시 쉬어야 할지, 그만둬야 할지 제 사주의 흐름이 궁금해요.",
    i18n: { en: { category: "Burnout", title: "No drive left — rest, or quit?" }, ja: { category: "燃え尽き", title: "やる気がない…休む？辞める？" }, zh: { category: "倦怠", title: "没干劲了……该休息还是辞职？" }, fr: { category: "Burn-out", title: "Plus d’élan : souffler, ou partir ?" } } },
  { sort: 31, grp: "일", category: "면접", title: "서류는 붙는데 면접만 떨어진다", slug: "interview-fail", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    ask_prefill: "서류는 통과하는데 면접에서 자꾸 떨어져요. 제 사주에서 면접에 드러나는 강점과 보완점이 궁금해요.",
    i18n: { en: { category: "Interview", title: "Résumé passes, interviews don’t" }, ja: { category: "面接", title: "書類は通るのに面接で落ちる" }, zh: { category: "面试", title: "简历能过，面试总挂" }, fr: { category: "Entretien", title: "CV accepté, entretiens ratés" } } },
  { sort: 32, grp: "일", category: "합격", title: "이번엔 붙을까? 떨어지면 또 할까?", slug: "pass", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    ask_prefill: "시험 결과를 기다리고 있어요. 이번에 안 되면 다시 도전해도 될지, 제 사주의 시기가 궁금해요.",
    i18n: { en: { category: "Pass/fail", title: "Will I pass? If not — try again?" }, ja: { category: "合格", title: "今度こそ受かる？落ちたらまた？" }, zh: { category: "上岸", title: "这次能过吗？不过还考吗？" }, fr: { category: "Réussite", title: "Je réussis ? Sinon, je retente ?" } } },
  { sort: 33, grp: "일", category: "AI시대", title: "내 일, AI가 대신하게 될까?", slug: "ai-job", link_type: "q", weight: 2, time_slot: "am", tone: "light",
    ask_prefill: "AI 때문에 제 일이 사라질까 불안해요. 제 사주에서 변화에 맞는 방향과 배워 둘 것이 궁금해요.",
    i18n: { en: { category: "AI & my job", title: "Will AI replace what I do?" }, ja: { category: "AI時代", title: "私の仕事、AIに代わられる？" }, zh: { category: "AI时代", title: "我的工作，会被AI取代吗？" }, fr: { category: "IA & emploi", title: "L’IA va-t-elle prendre mon travail ?" } } },

  /* ── 돈 (+2) ── */
  { sort: 34, grp: "돈", category: "노후", title: "50대, 앞으로 10년은 뭘로 먹고살까?", slug: "retirement", link_type: "q", weight: 2, time_slot: "am", tone: "light",
    ask_prefill: "노후가 불안해요. 제 사주에서 늦게까지 이어지는 수입의 방향과 준비할 시기가 궁금해요.",
    i18n: { en: { category: "Retirement", title: "50s — what pays the next 10 years?" }, ja: { category: "老後", title: "50代、この先10年どう食べていく？" }, zh: { category: "养老", title: "50岁，未来十年靠什么？" }, fr: { category: "Retraite", title: "50 ans : de quoi vivre 10 ans encore ?" } } },
  { sort: 35, grp: "돈", category: "대출", title: "이 대출, 갚을 수 있을까? 더 받아도 될까?", slug: "loan", link_type: "q", weight: 1, time_slot: "am", tone: "heavy",
    ask_prefill: "대출 상환이 생활을 누르고 있어요. 제 사주에서 돈이 새는 기질과 무리하지 말아야 할 시기가 궁금해요.",
    i18n: { en: { category: "Debt", title: "Can I repay this — or borrow more?" }, ja: { category: "ローン", title: "この借金、返せる？もっと借りる？" }, zh: { category: "贷款", title: "这笔贷款还得起吗？还能再借吗？" }, fr: { category: "Crédit", title: "Rembourser… ou emprunter encore ?" } } },

  /* ── 삶 (+2) ── */
  { sort: 36, grp: "삶", category: "자녀", title: "우리 아이, 잘하는 건 뭘까?", slug: "child-aptitude", link_type: "q", weight: 1, time_slot: "pm", tone: "light",
    ask_prefill: "아이의 적성과 성향이 궁금해요. 사주로 아이에게 맞는 공부·진로 방향을 봐 주세요.",
    i18n: { en: { category: "My child", title: "What is my child really good at?" }, ja: { category: "子ども", title: "うちの子、得意なことは？" }, zh: { category: "孩子", title: "我家孩子，擅长什么？" }, fr: { category: "Mon enfant", title: "Mon enfant : quel est son talent ?" } } },
  { sort: 37, grp: "삶", category: "인생방향", title: "이렇게 사는 게 맞나… 방향을 잃었다", slug: "life-direction", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "요즘 이렇게 사는 게 맞는지 모르겠어요. 제 사주에서 타고난 방향과 지금 시기의 의미가 궁금해요.",
    i18n: { en: { category: "Life purpose", title: "Is this the life I’m meant for?" }, ja: { category: "生き方", title: "この生き方でいい？道を見失った" }, zh: { category: "人生方向", title: "这样活着对吗……迷失方向了" }, fr: { category: "Sens", title: "Est-ce vraiment ma vie ?" } } },

  /* ── 나·시기 (+7, 신설 축) ── */
  { sort: 38, grp: "나·시기", category: "나의강점", title: "내 강점, 사주로는 뭐라고 할까?", slug: "my-strength", link_type: "q", weight: 2, time_slot: "any", tone: "light",
    ask_prefill: "제 타고난 강점과 약점이 궁금해요. 사주에서 보는 제 기질과 잘 맞는 방향을 알려 주세요.",
    i18n: { en: { category: "My strengths", title: "What are my strengths, by Saju?" }, ja: { category: "私の強み", title: "私の強み、四柱推命では？" }, zh: { category: "我的优势", title: "我的优势，八字怎么说？" }, fr: { category: "Mes forces", title: "Mes forces, selon le Saju ?" } } },
  { sort: 39, grp: "나·시기", category: "대운", title: "요즘 흐름이 바뀐 느낌, 대운일까?", slug: "daewoon", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "최근 1~2년 사이 흐름이 바뀐 느낌이에요. 제 대운이 바뀌는 시기와 그 의미가 궁금해요.",
    i18n: { en: { category: "Life cycle", title: "A shift in the air — a new 10-year cycle?" }, ja: { category: "大運", title: "流れが変わった気がする、大運？" }, zh: { category: "大运", title: "感觉流年变了，是换大运了吗？" }, fr: { category: "Cycle", title: "Le vent tourne : nouveau cycle ?" } } },
  { sort: 40, grp: "나·시기", category: "주의시기", title: "올해 내가 조심할 건 뭘까?", slug: "caution-time", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "올해 제가 특히 조심해야 할 시기와 일이 궁금해요. 무리하기 쉬운 달이 있는지 봐 주세요.",
    i18n: { en: { category: "Watch out", title: "What should I be careful of this year?" }, ja: { category: "注意時期", title: "今年、私が気をつけることは？" }, zh: { category: "注意时期", title: "今年我要注意什么？" }, fr: { category: "Vigilance", title: "À quoi faire attention cette année ?" } } },
  { sort: 41, grp: "나·시기", category: "택일", title: "이사·결혼·개업, 날짜는 언제가 좋을까?", slug: "good-day", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    ask_prefill: "이사(결혼·개업) 날짜를 정해야 해요. 제 사주 기준으로 좋은 시기와 피할 날이 궁금해요.",
    i18n: { en: { category: "Lucky timing", title: "Moving, wedding, opening — which date?" }, ja: { category: "日取り", title: "引っ越し・結婚・開業、いつがいい？" }, zh: { category: "择日", title: "搬家、结婚、开业，哪天好？" }, fr: { category: "Bonne date", title: "Déménager, se marier, ouvrir : quand ?" } } },
  { sort: 42, grp: "나·시기", category: "개명", title: "이름을 바꾸면 정말 풀릴까?", slug: "rename", link_type: "q", weight: 1, time_slot: "pm", tone: "light",
    ask_prefill: "개명(또는 아이 작명)을 생각 중이에요. 제 사주에 맞는 이름의 방향과 개명이 필요한지 궁금해요.",
    i18n: { en: { category: "New name", title: "Would a new name change my luck?" }, ja: { category: "改名", title: "名前を変えれば本当に開ける？" }, zh: { category: "改名", title: "改个名字，真的会转运吗？" }, fr: { category: "Prénom", title: "Changer de nom changerait-il ma chance ?" } } },
  { sort: 43, grp: "나·시기", category: "올해운", title: "올해 나한테 좋은 흐름은 뭘까?", slug: "this-year", link_type: "q", weight: 2, time_slot: "any", tone: "light",
    ask_prefill: "올해 제 운의 흐름이 궁금해요. 좋은 시기와 힘을 빼야 할 시기를 봐 주세요.",
    i18n: { en: { category: "This year", title: "What’s flowing my way this year?" }, ja: { category: "今年の運", title: "今年、私にいい流れは？" }, zh: { category: "今年运势", title: "今年我的好势头在哪？" }, fr: { category: "Cette année", title: "Quel courant pour moi cette année ?" } } },
  { sort: 44, grp: "나·시기", category: "둘중하나", title: "A냐 B냐, 결정을 못 하겠다", slug: "choose-one", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "두 가지 선택지 사이에서 결정을 못 하고 있어요. 제 사주에서 올해가 벌리는 해인지 지키는 해인지, 결정 기준이 궁금해요.",
    i18n: { en: { category: "Decision", title: "A or B — I just can’t decide" }, ja: { category: "二択", title: "AかBか、決められない" }, zh: { category: "二选一", title: "A还是B，就是定不下来" }, fr: { category: "Choix", title: "A ou B : impossible de trancher" } } },
];
