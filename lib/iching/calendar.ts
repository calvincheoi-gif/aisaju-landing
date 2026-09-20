/**
 * 달력 모듈 — 날짜 → 일진·월령·절입일.
 * 간지 계산은 사이트가 이미 쓰는 manseryeok(KASI 만세력 데이터)에 맡긴다.
 *  · 일진: 그날 12:00 기준(자시 경계 영향 배제)
 *  · 월령: 그날 23:59 기준 — 절입일에는 새 달로 본다
 *  · 절입일: 00:00과 23:59의 월주가 다르면 절입일
 */
import { calculateFourPillars } from "manseryeok";

export interface DayContext {
  date: string;
  dayGanji: string;
  monthGanji: string;
  isJeolip: boolean;
}

function pillarsAt(y: number, m: number, d: number, hour: number, minute: number) {
  return calculateFourPillars({ year: y, month: m, day: d, hour, minute, gender: "male" });
}

export function parseISODate(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`날짜 형식은 YYYY-MM-DD: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function getDayContext(date: string): DayContext {
  const [y, m, d] = parseISODate(date);
  const noon = pillarsAt(y, m, d, 12, 0);
  const start = pillarsAt(y, m, d, 0, 0);
  const end = pillarsAt(y, m, d, 23, 59);
  return {
    date,
    dayGanji: noon.dayHanja,
    monthGanji: end.monthHanja,
    isJeolip: start.monthHanja !== end.monthHanja,
  };
}

/** 한국 시간 기준 오늘/내일 날짜 문자열 */
export function kstDate(offsetDays = 0): string {
  const t = new Date(Date.now() + 9 * 3600_000 + offsetDays * 86400_000);
  return t.toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
