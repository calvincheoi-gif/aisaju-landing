/**
 * 2027 새해운 — 시즌(기간 한정 이벤트) 설정. 기간을 바꾸려면 여기만 고친다.
 *
 * SEASON 2 · 2027 새해운 팝업: 2026-12-01 ~ 2027-02-09(설 연휴 마지막 날), 한국 시간 기준.
 *  · 홈 팝업은 이 기간에만 뜬다(미리보기: 주소 끝에 ?nypop=1).
 *  · 신청 접수도 이 기간에만 받는다. 기간 밖 시험은 환경변수 NY_SEASON_FORCE=1.
 *  · 이미 받은 결과(/2027/o/…)는 기간이 끝나도 계속 열린다.
 */
export const SEASON = {
  key: "ny2027-s2",
  label: "SEASON 2",
  start: "2026-12-01",
  end: "2027-02-09",
  endLabel: "설 연휴(2/9)",
  endShort: "~2/9 설 연휴",
} as const;

/** 한국 날짜(YYYY-MM-DD) */
export function kstDay(d = new Date()): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export type SeasonState = "before" | "open" | "closed";

export function seasonState(d = new Date()): SeasonState {
  const t = kstDay(d);
  return t < SEASON.start ? "before" : t > SEASON.end ? "closed" : "open";
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
