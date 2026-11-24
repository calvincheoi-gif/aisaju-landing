/**
 * 2027 새해운 — 토정비결 작괘 엔진.
 *
 * 통용 작괘식(공유마당 「원본토정비결」 해제·위키백과와 같은 식):
 *   상괘 = (세는나이 + 태세수) ÷ 8 의 나머지 (0 → 8)
 *   중괘 = (그해 생월의 날수 30/29 + 월건수) ÷ 6 의 나머지 (0 → 6)
 *   하괘 = (음력 생일 + 일진수) ÷ 3 의 나머지 (0 → 3)
 * 태세수·월건수·일진수는 조견표 값이며, 조견표는 두 수표(선천수·중천수)에서 나온다:
 *   태세수 = 중천수(천간) + 중천수(지지) / 월건수 = 선천수(천간) + 선천수(지지) / 일진수 = 선천수(천간) + 중천수(지지)
 * 공개 조견표 60갑자 값과 대조해 확인했다(검산은 scripts/newyear/check-engines.ts).
 *
 * ⚠ 확정 전(소장님 확인 필요): 풀이의 근거 판본, 윤달 출생 처리, 작은달 30일생 처리. 지금 값은 TOJEONG_BASIS 에 모아 두었다.
 * 음력 변환·일진은 manseryeok(KASI)에 맡긴다.
 */
import { calculateFourPillars, lunarToSolar, solarToLunar } from "manseryeok";
import { allHexagrams } from "@/lib/iching";
import { BRANCHES, STEMS, yearPillar } from "./ganji";
import { tojeong144Brief } from "../content/tojeong-144";

export const TOJEONG_ENGINE_VERSION = "tojeong-2027.1";
export const TOJEONG_YEAR = 2027;

export const TOJEONG_BASIS = {
  /** 윤달에 태어난 사람은 같은 번호의 평달로 본다 */
  leapAsRegular: true,
  /** 그해 생월이 29일뿐인데 30일생이면 그달 말일(29일)의 일진을 쓴다 */
  day30Fallback: "last-day" as const,
  /** 나이는 음력 생년 기준 세는나이 */
  age: "lunar-counting" as const,
  edition: "통용 작괘식(상·중·하괘) · 풀이는 괘상 기준",
  rule: "2027 丁未년 · 음력 생일 · 윤달은 평달로 봄",
};

/** 선천수 */
const SEON_S: Record<string, number> = { 甲: 9, 己: 9, 乙: 8, 庚: 8, 丙: 7, 辛: 7, 丁: 6, 壬: 6, 戊: 5, 癸: 5 };
const SEON_B: Record<string, number> = { 子: 9, 午: 9, 丑: 8, 未: 8, 寅: 7, 申: 7, 卯: 6, 酉: 6, 辰: 5, 戌: 5, 巳: 4, 亥: 4 };
/** 중천수 (土 11 · 金 10 · 水 9 · 木 8 · 火 7 — 천간은 합화 오행, 지지는 본래 오행) */
const JUNG_S: Record<string, number> = { 甲: 11, 己: 11, 乙: 10, 庚: 10, 丙: 9, 辛: 9, 丁: 8, 壬: 8, 戊: 7, 癸: 7 };
const JUNG_B: Record<string, number> = { 子: 9, 亥: 9, 寅: 8, 卯: 8, 巳: 7, 午: 7, 申: 10, 酉: 10, 辰: 11, 戌: 11, 丑: 11, 未: 11 };

export const taeseNum = (g: string) => JUNG_S[g[0]] + JUNG_B[g[1]];
export const wolgeonNum = (g: string) => SEON_S[g[0]] + SEON_B[g[1]];
export const iljinNum = (g: string) => SEON_S[g[0]] + JUNG_B[g[1]];

const TRIGRAMS = ["乾", "兌", "離", "震", "巽", "坎", "艮", "坤"] as const;   // 일건천 이태택 삼리화 사진뢰 오손풍 육감수 칠간산 팔곤지
const rem = (v: number, m: number) => (v % m === 0 ? m : v % m);
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

/** 그해 음력 m월의 월건(예: 丁未년 1월 = 壬寅) */
export function monthGanji(year: number, lunarMonth: number): string {
  const ys = STEMS.indexOf(yearPillar(year)[0] as (typeof STEMS)[number]);
  return STEMS[(ys * 2 + 2 + (lunarMonth - 1)) % 10] + BRANCHES[(2 + lunarMonth - 1) % 12];
}
/** 그해 음력 m월(평달)의 날수 — 다음 달 초하루와의 날짜 차 */
export function lunarMonthDays(year: number, m: number): number {
  const a = lunarToSolar(year, m, 1, false);
  let b;
  try { b = lunarToSolar(year, m, 30, false); } catch { b = null; }
  if (b) {
    /* 30일이 있는 달인지: 30일을 양력으로 바꾼 뒤 다시 음력으로 돌려 같은 달·30일이면 큰달 */
    const back = solarToLunar(b.year, b.month, b.day);
    if (back.month === m && back.day === 30 && !back.isLeapMonth) return 30;
  }
  void a;
  return 29;
}
function dayGanji(sol: { year: number; month: number; day: number }): string {
  return calculateFourPillars({ year: sol.year, month: sol.month, day: sol.day, hour: 12, minute: 0 }).dayHanja;
}

export interface TojeongBirth { year: number; month: number; day: number; isLunar?: boolean; isLeapMonth?: boolean }
export interface TojeongComputed {
  engine: string;
  lunar: { year: number; month: number; day: number; isLeapMonth: boolean };
  age: number;
  taese: { ganji: string; num: number };
  wolgeon: { ganji: string; num: number; days: number };
  iljin: { ganji: string; num: number; dayUsed: number };
  sang: number; jung: number; ha: number; gwae: string;
  base: { no: number; name: string; hanja: string; upper: string; lower: string; meaning: string; action: string };
  changed: { no: number; name: string; hanja: string; meaning: string; action: string };
  months: { n: number; ganji: string; days: number }[];
  notes: string[];
}

export function computeTojeong(b: TojeongBirth, year = TOJEONG_YEAR): TojeongComputed {
  /* 음력으로 받은 날짜는 실제로 있는 날인지 먼저 확인한다(없는 윤달·없는 30일은 여기서 오류 → 입력을 다시 받는다) */
  if (b.isLunar) lunarToSolar(b.year, b.month, b.day, !!b.isLeapMonth);
  const lunar = b.isLunar ? { year: b.year, month: b.month, day: b.day, isLeapMonth: !!b.isLeapMonth } : solarToLunar(b.year, b.month, b.day);
  const notes: string[] = [];
  if (lunar.isLeapMonth) notes.push(`윤${lunar.month}월 출생 — ${lunar.month}월(평달)로 봄`);
  const age = year - lunar.year + 1;
  const tg = yearPillar(year);
  const days = lunarMonthDays(year, lunar.month);
  const mg = monthGanji(year, lunar.month);
  let dayUsed = lunar.day;
  if (lunar.day > days) { dayUsed = days; notes.push(`${year}년 음력 ${lunar.month}월은 ${days}일까지 — 말일의 일진을 씀`); }
  const dg = dayGanji(lunarToSolar(year, lunar.month, dayUsed, false));
  const sang = rem(age + taeseNum(tg), 8), jung = rem(days + wolgeonNum(mg), 6), ha = rem(lunar.day + iljinNum(dg), 3);

  /* 괘상: 상괘수 = 위 소성괘(8괘), 중괘수 = 아래 소성괘(건·태·리·진·손·감), 하괘수 = 움직이는 효(초·이·삼효) */
  const upper = TRIGRAMS[sang - 1], lower = TRIGRAMS[jung - 1];
  const hexes = allHexagrams();
  const baseHex = hexes.find((h) => h.upper === upper && h.lower === lower)!;
  const bits = baseHex.bits.split("");
  bits[ha - 1] = bits[ha - 1] === "1" ? "0" : "1";
  const changedHex = hexes.find((h) => h.bits === bits.join(""))!;

  const months = Array.from({ length: 12 }, (_, i) => ({ n: i + 1, ganji: monthGanji(year, i + 1), days: lunarMonthDays(year, i + 1) }));
  return {
    engine: TOJEONG_ENGINE_VERSION, lunar, age,
    taese: { ganji: tg, num: taeseNum(tg) }, wolgeon: { ganji: mg, num: wolgeonNum(mg), days }, iljin: { ganji: dg, num: iljinNum(dg), dayUsed },
    sang, jung, ha, gwae: `${sang}${jung}${ha}`,
    base: { no: baseHex.no, name: baseHex.full_ko, hanja: baseHex.full_hanja, upper, lower, meaning: baseHex.meaning, action: baseHex.action_kw },
    changed: { no: changedHex.no, name: changedHex.full_ko, hanja: changedHex.full_hanja, meaning: changedHex.meaning, action: changedHex.action_kw },
    months, notes,
  };
}

/** 양식의 칸(eng.* / sys.*) */
export function tojeongFields(c: TojeongComputed): Record<string, string> {
  return {
    "eng.lunarBirth": `${c.lunar.year}년 ${c.lunar.isLeapMonth ? "윤" : ""}${c.lunar.month}월 ${c.lunar.day}일`,
    "eng.sang": String(c.sang), "eng.jung": String(c.jung), "eng.ha": String(c.ha), "eng.gwae": c.gwae,
    "sys.edition": TOJEONG_BASIS.edition,
    "sys.basis": TOJEONG_BASIS.rule,
  };
}

/** AI 초안에 넘길 산출 요약 */
export function tojeongBrief(c: TojeongComputed): string {
  const moving = ["초효", "이효", "삼효"][c.ha - 1];
  return [
    `대상: 2027 丁未년 토정비결 · 음력 생일 ${c.lunar.year}.${c.lunar.month}.${c.lunar.day} · 세는나이 ${c.age}`,
    `작괘: 상괘 ${c.sang}(나이 ${c.age} + 태세수 ${c.taese.num}) · 중괘 ${c.jung}(생월 날수 ${c.wolgeon.days} + 월건수 ${c.wolgeon.num}, ${c.wolgeon.ganji}월) · 하괘 ${c.ha}(생일 ${c.lunar.day} + 일진수 ${c.iljin.num}, ${c.iljin.ganji}일) → 괘 번호 ${c.gwae}`,
    `괘상: 본괘 ${c.base.name}(${c.base.hanja}) — ${c.base.meaning} / 움직이는 효 ${moving} / 변괘 ${c.changed.name}(${c.changed.hanja}) — ${c.changed.meaning}`,
    `행동 열쇠말: 본괘 「${c.base.action}」 → 변괘 「${c.changed.action}」`,
    tojeong144Brief(Number(c.gwae)),
    `2027 음력 월건: ${c.months.map((m) => `${m.n}월 ${m.ganji}(${m.days}일)`).join(" / ")}`,
    c.notes.length ? `유의: ${c.notes.join(" / ")}` : "",
  ].filter(Boolean).join("\n");
}
