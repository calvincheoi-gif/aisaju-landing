/**
 * 홈 「바로가기 6칸」과 「전체 메뉴(≡)」에 올리는 항목 (v7, 2026-11-20)
 *
 * ▸ 이름·순서·아이콘을 바꾸거나 항목을 더하고 빼려면 이 파일만 고치면 된다.
 *   화면(HTML·CSS)은 view.ts, 누를 때의 이동·기록은 client.ts, 외국어 문구는 i18n.ts 가 맡는다.
 * ▸ 문구 안의 {n} 은 지금 게시 중인 고민 주제 수(관리자 /admin/topics)로 바뀐다.
 * ▸ key 는 5개 국어 사전의 이름이다. 새 항목을 만들면 i18n.ts 에 같은 key 로 번역을 넣는다
 *   (번역이 없으면 그 언어에서도 한국어가 그대로 보인다).
 */

/** 누르면 가는 곳 — 실제 주소·이동 방식은 client.ts 의 OUT · IN 표에 있다 */
export type NavTo =
  | "today" | "ohaeng" | "q" | "match" | "learn" | "ask" | "me"        /* 다른 화면으로 */
  | "price" | "samples" | "gunghap" | "naming" | "reviews"              /* 홈 안에서 그 구간으로 */
  | "kakao" | "chadd";                                                  /* 카카오톡 새 창 */

export interface QuickItem {
  to: NavTo; icon: string;
  key: string; ko: string;                     /* 이름 */
  tag: "free" | "day" | "week" | "pay";        /* 꼬리표 색: 무료(초록) · 매일(노랑) · 매주(보라) · 유료(파랑) */
  tagKey: string; tagKo: string;               /* 꼬리표 문구 */
}
export interface QuickLink { to: NavTo; key: string; ko: string }
export interface MenuItem { to: NavTo; icon: string; key: string; ko: string; noteKey?: string; noteKo?: string }
export interface MenuGroup { key: string; ko: string; items: MenuItem[] }

/**
 * 바로가기 6칸 — 첫 화면 바로 아래. 3칸 × 2줄.
 * 순서의 뜻: 매일 다시 올 이유(오늘의 기운) → 나를 아는 것(오행) → 내 고민 → 관계(궁합) → 읽을거리 → 유료
 */
export const QUICK: QuickItem[] = [
  { to: "today",  icon: "🌤️", key: "qkToday",  ko: "오늘의 기운",    tag: "day",  tagKey: "qtToday",  tagKo: "매일 · 무료" },
  { to: "ohaeng", icon: "🌲", key: "qkOhaeng", ko: "오행 성격 진단", tag: "free", tagKey: "qtOhaeng", tagKo: "1분 · 무료" },
  { to: "q",      icon: "🧭", key: "qkWorry",  ko: "내 고민 찾기",   tag: "free", tagKey: "qtWorry",  tagKo: "{n}가지 · 30초" },
  { to: "match",  icon: "🤝", key: "qkMatch",  ko: "친구·연인 궁합", tag: "free", tagKey: "tagFree",  tagKo: "무료" },
  { to: "learn",  icon: "📖", key: "qkLearn",  ko: "읽을거리",       tag: "week", tagKey: "qtLearn",  tagKo: "매주 새 글" },
  { to: "price",  icon: "📄", key: "qkPrice",  ko: "리포트·상담",    tag: "pay",  tagKey: "qtPrice",  tagKo: "9,900원부터" },
];

/** 6칸 아래 글자 링크 — 유료 상품 상세로 바로 가는 길 */
export const QUICK_LINKS: QuickLink[] = [
  { to: "samples", key: "qlSample",  ko: "리포트 샘플 ›" },
  { to: "gunghap", key: "qlGunghap", ko: "궁합 리포트 ›" },
  { to: "naming",  key: "qlNaming",  ko: "작명 3종 세트 ›" },
];

/** 전체 메뉴(≡) — 아래에서 올라오는 판. 묶음 3개 */
export const MENU: MenuGroup[] = [
  { key: "nsG1", ko: "무료로 해 보기", items: [
    { to: "ask",    icon: "✉️", key: "nsAsk",    ko: "무료 1문 1답",   noteKey: "bdgFree",  noteKo: "선착순 Daily 3명" },
    { to: "today",  icon: "🌤️", key: "qkToday",  ko: "오늘의 기운",    noteKey: "nsTodayN", noteKo: "매일" },
    { to: "ohaeng", icon: "🌲", key: "qkOhaeng", ko: "오행 성격 진단", noteKey: "ohMeta",   noteKo: "질문 14개 · 1분" },
    { to: "q",      icon: "🧭", key: "qkWorry",  ko: "내 고민 찾기",   noteKey: "qtWorry",  noteKo: "{n}가지 · 30초" },
    { to: "match",  icon: "🤝", key: "qkMatch",  ko: "친구·연인 궁합", noteKey: "nsMatchN", noteKo: "링크로 함께" },
    { to: "learn",  icon: "📖", key: "qkLearn",  ko: "읽을거리",       noteKey: "qtLearn",  noteKo: "매주 새 글" },
  ] },
  { key: "nsG2", ko: "리포트 · 상담", items: [
    { to: "price",   icon: "📄", key: "nsPrice",  ko: "개인 종합 리포트",   noteKey: "qtPrice",   noteKo: "9,900원부터" },
    { to: "samples", icon: "🔎", key: "nsSample", ko: "리포트 샘플",        noteKey: "nsSampleN", noteKo: "한 장도 빼지 않고" },
    { to: "gunghap", icon: "💞", key: "sv6n",     ko: "궁합 리포트",        noteKey: "fgP",       noteKo: "100,000원" },
    { to: "naming",  icon: "✍️", key: "nsNaming", ko: "작명 3종 세트",      noteKey: "tagNm",     noteKo: "20만원부터" },
    { to: "reviews", icon: "⭐", key: "nsRev",    ko: "먼저 만난 분들",     noteKey: "nsRevN",    noteKo: "후기 보기" },
    { to: "kakao",   icon: "💬", key: "nsKakao",  ko: "카톡으로 물어보기",  noteKo: "1:1" },
  ] },
  { key: "nsG3", ko: "나 · 소식", items: [
    { to: "me",    icon: "👤", key: "nsMe", ko: "마이페이지",     noteKey: "nsMeN", noteKo: "내 오행 결과" },
    { to: "chadd", icon: "🔔", key: "nsCh", ko: "카톡 채널 추가", noteKey: "nsChN", noteKo: "주 2회 읽을거리" },
  ] },
];
