/**
 * 2027 새해운 — 시즌(기간 한정 이벤트) 설정. 기간을 바꾸려면 여기만 고친다.
 *
 * SEASON 2 · 2027 새해운 팝업: 2026-12-01 ~ 2027-02-09(설 연휴 마지막 날), 한국 시간 기준.
 *  · 홈 팝업은 이 기간에만 뜬다(미리보기: 주소 끝에 ?nypop=1).
 *  · 신청 접수도 이 기간에만 받는다. 기간 밖 시험은 환경변수 NY_SEASON_FORCE=1.
 *  · 이미 받은 결과(/2027/o/…)는 기간이 끝나도 계속 열린다.
 *
 * 사전 오픈(2026-11-24 소장님 결정): preStart ~ start 전날 —
 *  · 홈 팝업은 이때부터 뜬다.
 *  · 한 장 상품 3종(주역 무료 · 토정 990원 · 사주 990원)은 이때부터 신청받는다.
 *  · 감수가 필요한 상세본 2종은 start(12/1)에 열린다 — 그 전에는 「12/1 오픈」으로 보이고 신청 단추가 잠긴다.
 */
export const SEASON = {
  key: "ny2027-s2",
  label: "SEASON 2",
  preStart: "2026-11-24",
  start: "2026-12-01",
  end: "2027-02-09",
  endLabel: "설 연휴(2/9)",
  endShort: "~2/9 설 연휴",
} as const;

/** 한국 날짜(YYYY-MM-DD) */
export function kstDay(d = new Date()): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export type SeasonState = "before" | "pre" | "open" | "closed";

export function seasonState(d = new Date()): SeasonState {
  const t = kstDay(d);
  return t < SEASON.preStart ? "before" : t < SEASON.start ? "pre" : t > SEASON.end ? "closed" : "open";
}

/** 팝업·홍보를 보여 줄 때인가(사전 오픈 포함) */
export const seasonVisible = (d = new Date()) => { const s = seasonState(d); return s === "pre" || s === "open"; };

/** 이 상품을 지금 신청받는가 — 한 장 상품은 사전 오픈부터, 상세본(감수)은 정식 오픈부터 */
export function productOpen(review: boolean, d = new Date()): boolean {
  const s = seasonState(d);
  return s === "open" || (s === "pre" && !review);
}

/** 종료일까지 남은 날 수(종료일 당일 = 0) */
export function daysLeft(d = new Date()): number {
  const t = Date.parse(`${kstDay(d)}T00:00:00Z`), e = Date.parse(`${SEASON.end}T00:00:00Z`);
  return Math.max(0, Math.round((e - t) / 86400_000));
}

/** 시작일 표기 — "12월 1일" / "12/1" */
export const startLabel = (slash = false) => {
  const m = Number(SEASON.start.slice(5, 7)), d = Number(SEASON.start.slice(8, 10));
  return slash ? `${m}/${d}` : `${m}월 ${d}일`;
};

/** 운영 주소인가 — 그 밖(미리보기·로컬)에서는 기간과 상관없이 시험 신청을 받는다 */
export const isProdHost = (host: string) => /(^|\.)aisajulab\.com(:\d+)?$/.test(host) || /^aisaju-landing\.netlify\.app$/.test(host);
