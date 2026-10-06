/**
 * 무료 1문 1답 · 1~3매 Key 리포트의 데이터 모델 (2026-10-04, 2026-10-06 보강)
 *
 * 리포트 한 장은 「공통 골격 + 교체 모듈 1개」로 되어 있다.
 *   공통 골격: 질문 → 결론부터(한 줄 + 칩 3) → 근거1 명식 → [모듈] → 판단(답 3줄) → 시기 → 실행 → 서명
 *   모듈: none | swot | whys | timeline  — 질문 유형에 따라 하나만 고른다.
 *
 * 이 파일은 타입과 빈 값·검증만 둔다. 그리기는 components/AskReport.tsx,
 * 저장은 free_questions.answer(jsonb) + free_questions.module.
 */

export type AskModule = "none" | "swot" | "whys" | "timeline";

export const MODULE_LABEL: Record<AskModule, string> = {
  none: "기본형 (모듈 없음)",
  swot: "SWOT — 해도 될까 (창업·사업·이직)",
  whys: "3 Whys — 왜 반복될까 (관계·이직 반복)",
  timeline: "타임라인+PDCA — 언제 (집·투자·시기)",
};

export interface AskAnswer {
  /* ② 결론부터 */
  one: string;                       // 한 줄 결론
  chips: [string, string, string];   // 판단 / 시기 / 첫 행동
  /* ③ 근거 1 · 명식 */
  m_action: string;                  // 행동 제목
  ilgan: string; ilgan_sub: string; ilgan_desc: string;
  seun: string;  seun_sub: string;  seun_desc: string;
  read: string;                      // "이 질문에 명식이 말하는 것"
  /* ④ 근거 2 · 모듈 */
  mod_action: string;                // 모듈 행동 제목
  swot: { s: string; w: string; o: string; t: string; strategy: string };
  whys: { w1: string; w2: string; w3: string; root: string };
  timeline: {
    t1: string; t1s: string;         // 지점 1 제목 / 부제
    t2: string; t2s: string;
    t3: string; t3s: string;
    stage: "P" | "D" | "C" | "A";
    stage_note: string;
  };
  /* ⑤ 판단 */
  ans: [string, string, string];
  /* ⑥ 시기 */
  t_action: string; good: string; avoid: string;
  t_why: string;                     // 왜 이 시기인가 — 세운·월운 근거 한 줄 (2026-10-06 추가, 공백 메우기)
  /* ⑦ 실행 */
  a_action: string; today: string; week: string; month: string; stop: string;
  a_check: string;                   // 이렇게 확인하세요 — 점검 방법 한 줄 (2026-10-06 추가, 공백 메우기)
}

export function emptyAnswer(): AskAnswer {
  return {
    one: "", chips: ["", "", ""],
    m_action: "", ilgan: "", ilgan_sub: "", ilgan_desc: "", seun: "", seun_sub: "", seun_desc: "", read: "",
    mod_action: "",
    swot: { s: "", w: "", o: "", t: "", strategy: "" },
    whys: { w1: "", w2: "", w3: "", root: "" },
    timeline: { t1: "지금", t1s: "", t2: "", t2s: "", t3: "", t3s: "", stage: "P", stage_note: "" },
    ans: ["", "", ""],
    t_action: "", good: "", avoid: "", t_why: "",
    a_action: "", today: "", week: "", month: "", stop: "", a_check: "",
  };
}

/** DB에서 읽은 부분 저장값을 빈 틀 위에 덮어 완전한 객체로 만든다 (옛 저장본에 새 필드가 없어도 안전) */
export function mergeAnswer(partial: Partial<AskAnswer> | null | undefined): AskAnswer {
  const base = emptyAnswer();
  if (!partial) return base;
  return {
    ...base, ...partial,
    chips: (partial.chips?.length === 3 ? partial.chips : base.chips) as AskAnswer["chips"],
    ans: (partial.ans?.length === 3 ? partial.ans : base.ans) as AskAnswer["ans"],
    swot: { ...base.swot, ...(partial.swot || {}) },
    whys: { ...base.whys, ...(partial.whys || {}) },
    timeline: { ...base.timeline, ...(partial.timeline || {}) },
  };
}

/** 보내기 전 최소 확인 — 비어 있으면 안 되는 칸 */
export function missingFields(a: AskAnswer, module: AskModule): string[] {
  const miss: string[] = [];
  if (!a.one.trim()) miss.push("결론 한 줄");
  if (a.chips.some((c) => !c.trim())) miss.push("칩 3개");
  if (!a.ilgan.trim()) miss.push("일간");
  if (!a.read.trim()) miss.push("명식이 말하는 것");
  if (a.ans.some((c) => !c.trim())) miss.push("답 3줄");
  if (!a.good.trim() || !a.avoid.trim()) miss.push("시기");
  /* 공백 없는 리포트를 위해 아래 칸도 필수로 본다 (2026-10-06) */
  if (!a.t_why.trim()) miss.push("시기 근거");
  if (!a.today.trim() || !a.week.trim() || !a.month.trim()) miss.push("실행 3단(오늘·주·달)");
  if (!a.a_check.trim()) miss.push("확인 방법");
  if (!a.stop.trim()) miss.push("멈출 신호");
  if (module === "swot" && Object.values(a.swot).some((v) => !v.trim())) miss.push("SWOT 칸");
  if (module === "whys" && Object.values(a.whys).some((v) => !v.trim())) miss.push("3 Whys 칸");
  if (module === "timeline" && (!a.timeline.t2.trim() || !a.timeline.t3.trim())) miss.push("타임라인 시점");
  return miss;
}

export interface AskRow {
  id: string;
  created_at: string;
  day_kst: string;
  ref_no: string;
  name: string;
  gender: string | null;
  birth_info: string;
  contact: string;
  question: string;
  kakao_agree: boolean;
  review_agree: boolean;
  status: "received" | "answered" | "converted" | "cancelled";
  answered_at: string | null;
  note: string | null;
  utm: string | null;
  answer: Partial<AskAnswer> | null;
  module: AskModule | null;
  saju: SajuBrief | null;
  share_token?: string | null;
  viewed_at?: string | null;
  view_count?: number | null;
}

/** 생년월일시로 자동 계산해 저장하는 명식 요약 */
export interface SajuBrief {
  pillars: { year: string; month: string; day: string; hour: string | null };
  dayStem: string;           // 일간 한자 (예: 丙)
  dayStemKo: string;         // 丙火
  dayStemElement: string;    // 火
  thisYear: string;          // 올해 간지 (예: 丙午)
  nextYear: string;          // 내년 간지 (예: 丁未)
  timeUnknown: boolean;
}
