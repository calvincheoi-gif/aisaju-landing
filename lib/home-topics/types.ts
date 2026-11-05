/**
 * 홈 첫 화면 「고민 주제 롤링」 — 데이터 형식 (v3, 2026-11-05)
 *
 * v1~2: 7개 주제를 DB 순서대로 3줄씩 돌렸다.
 * v3  : 24개 키워드(2~4자)로 늘리고, 방문마다 다른 조합이 보이도록 아래 규칙으로 순서를 섞는다.
 *        · grp       축(연애·결혼·일·돈·삶) — 같은 축이 연달아 나오지 않게
 *        · tone      heavy(이별·이혼·갈등…)는 한 창(4줄)에 최대 1줄
 *        · time_slot 시간대 가중 — am(06~12) pm(12~18) night(18~06) any
 *        · weight    1~3 노출 가중
 *        · link_type q   → /q/<slug> 고민 랜딩
 *                    ask → /ask?q=<ask_prefill> 1문 1답에 질문을 미리 채워 바로 연결 (랜딩이 없어도 운영 가능)
 * 순서 규칙 자체는 roll.ts 에 한 벌만 있다(브라우저에서 돈다).
 */
export const TOPIC_LANGS = ["en", "ja", "zh", "fr"] as const;
export type TopicLang = (typeof TOPIC_LANGS)[number];
export type TopicText = { category: string; title: string };

export const TOPIC_GROUPS = ["연애", "결혼", "일", "돈", "삶"] as const;
export type TopicGroup = (typeof TOPIC_GROUPS)[number] | string;

export const LINK_TYPES = ["q", "ask"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const TIME_SLOTS = ["any", "am", "pm", "night"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];
export const TIME_SLOT_LABEL: Record<TimeSlot, string> = { any: "언제나", am: "오전(06~12)", pm: "오후(12~18)", night: "저녁·밤(18~06)" };

export const TONES = ["light", "heavy"] as const;
export type Tone = (typeof TONES)[number];

export type HomeTopic = {
  id?: string;
  sort: number;
  /** 2~4자 키워드 — 홈의 남색 칩에 보인다 (연애·재회·직장갈등 …) */
  category: string;
  /** 홈용 한 줄 제목 — 18자 안팎 */
  title: string;
  /** link_type=q 면 /q/<slug>, ask 면 계측·utm 용 영문 키 */
  slug: string;
  i18n: Partial<Record<TopicLang, TopicText>>;
  live?: boolean;
  grp: TopicGroup;
  link_type: LinkType;
  /** link_type=ask 일 때 1문 1답 질문 칸에 미리 채울 문장 */
  ask_prefill?: string | null;
  weight: number;
  time_slot: TimeSlot;
  tone: Tone;
};

/** 홈이 한 번에 보여 주는 줄 수 (v3: 4줄) */
export const TOPIC_WINDOW = 4;
/** 한 줄 높이(px) — CSS 와 롤링 JS 가 같이 쓴다 */
export const TOPIC_LINE_PX = 28;
/** 한 줄 넘어가는 간격(ms) */
export const TOPIC_TICK_MS = 2800;

/** 주제 하나가 가리키는 주소 (홈 롤링·관리자 미리보기 공용) */
export function topicHref(t: Pick<HomeTopic, "slug" | "link_type" | "ask_prefill">, utm = "home_q"): string {
  if (t.link_type === "ask") {
    const p = new URLSearchParams({ utm, topic: t.slug, q: (t.ask_prefill || "").slice(0, 300) });
    return `/ask?${p.toString()}`;
  }
  return `/q/${t.slug}?utm=${utm}`;
}
