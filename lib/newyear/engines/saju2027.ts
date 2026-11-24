/**
 * 2027 새해운 — 사주 엔진.
 *
 * 한 장 요약(③)과 프리미엄(⑤)이 **같은 산출값**을 쓰도록 계산을 한곳에 모았다.
 * 간지·절기·음력·대운은 사이트가 이미 쓰는 manseryeok(KASI 만세력 데이터)에 맡기고, 여기서는
 *   ① 산출 기준(시각 보정·날짜 경계)을 한 군데에 못 박고  ② 2027년 월운표를 만들고
 *   ③ 양식의 칸(eng.*)에 들어갈 글자를 만든다.
 * 해석(격국·용신·강약 판단)은 하지 않는다 — AI 초안과 소장님 감수의 몫이다.
 */
import { calculateFourPillars, getSolarTermsOfYear, lunarToSolar, solarToLunar } from "manseryeok";
import { BRANCH_EL, ELEMENTS, ELEMENT_KO, HIDDEN_STEMS, SEASON_OF, STEM_EL, STEM_IMAGE, tenGodOfBranch, tenGodOfStem, yearPillar, type Element } from "./ganji";

export const SAJU_ENGINE_VERSION = "saju-2027.1";
export const TARGET_YEAR = 2027;

/**
 * 산출 기준 — 바꾸려면 여기만 고친다. (확정 전: 소장님 확인 필요 항목)
 *  · 시각 보정: 출생지를 모르면 표준시에서 30분을 뺀 경계표(동경 127.5°), 출생지를 알면 그 경도로 보정. 균시차는 적용하지 않는다.
 *  · 날짜 경계: 자정(00:00)에 날이 바뀐다 — 사이트의 기존 계산(lib/saju.ts)과 같다.
 *  · 연 경계는 입춘, 월 경계는 절입 시각.
 */
export const SAJU_BASIS = {
  /**
   * 시각 보정 — "longitude": 경도 보정(연구소 리포트 표준. 출생지를 모르면 127.5° = 표준시 −30분 경계표)
   *             "none": 표준시 그대로(사이트의 기존 간이 계산 lib/saju.ts 와 같음 — 시 경계 30분 안쪽 출생자는 두 방식의 시주가 다르다)
   */
  timeCorrection: "longitude" as "longitude" | "none",
  defaultLongitude: 127.5,
  applyEquationOfTime: false,
  /** 자시(23:00~23:59) 처리 — midnight: 일주 당일·시간(時干) 당일 일간 기준 / jasi: 23시에 일주 교체 / splitJasi: 일주 당일·시간은 다음 날 일간 기준(야자시) */
  dayBoundary: "midnight" as "midnight" | "jasi" | "splitJasi",
  manse: "KASI 만세력 데이터 · manseryeok v2.0",
};
const BOUNDARY_LABEL: Record<typeof SAJU_BASIS.dayBoundary, string> = { midnight: "자정 경계", jasi: "자시(23시) 경계", splitJasi: "야자시·조자시 구분" };

export interface SajuBirth {
  year: number; month: number; day: number;
  hour?: number | null; minute?: number | null;
  timeUnknown?: boolean;
  isLunar?: boolean; isLeapMonth?: boolean;
  gender: "male" | "female";
  /** 출생지 이름과 경도(동경). 없으면 기준 경도(127.5°)로 본다 */
  place?: string | null; longitude?: number | null;
}

export interface MonthRow { n: number; pillar: string; from: string; to: string; stemGod: string; branchGod: string }
export interface LuckRow { pillar: string; fromYear: number; toYear: number; age: number }
export interface SajuComputed {
  engine: string;
  solar: { year: number; month: number; day: number };
  lunar: { year: number; month: number; day: number; isLeapMonth: boolean };
  pillars: { year: string; month: string; day: string; hour: string | null };
  dayStem: string; dayElement: Element; monthBranch: string; season: string;
  gods: { ys: string; yb: string; ms: string; mb: string; db: string; hs: string | null; hb: string | null };
  elements: Record<Element, { stems: number; branches: number }>;
  luck: { forward: boolean; startAge: number; shift: string; rows: LuckRow[]; current: number } | null;
  years: { year: number; pillar: string; stemGod: string; branchGod: string }[];
  months: MonthRow[];
  notes: string[];
  timeUnknown: boolean;
}

const pad2 = (v: number) => String(v).padStart(2, "0");
const kst = (d: Date) => new Date(d.getTime() + 9 * 3600_000);
const md = (d: Date) => `${kst(d).getUTCMonth() + 1}/${kst(d).getUTCDate()}`;

/** 2027년 열두 달 — 「N월 = N월에 절입하는 절기월」. 1월은 소한(丑월), 2월은 입춘(寅월) … 12월은 대설(子월). */
export function months2027(dayStem: string): MonthRow[] {
  const terms = getSolarTermsOfYear(TARGET_YEAR);
  const next = getSolarTermsOfYear(TARGET_YEAR + 1);
  const rows: MonthRow[] = [];
  for (let n = 1; n <= 12; n++) {
    const start = terms[(n - 1) * 2].date;
    const end = n < 12 ? terms[n * 2].date : next[0].date;
    const mid = kst(new Date(start.getTime() + 5 * 86400_000));
    const p = calculateFourPillars({ year: mid.getUTCFullYear(), month: mid.getUTCMonth() + 1, day: mid.getUTCDate(), hour: 12, minute: 0 });
    const pillar = p.monthHanja;
    const last = new Date(end.getTime() - 86400_000);
    rows.push({ n, pillar, from: md(start), to: md(last), stemGod: tenGodOfStem(dayStem, pillar[0]), branchGod: tenGodOfBranch(dayStem, pillar[1]) });
  }
  return rows;
}

export function computeSaju(b: SajuBirth): SajuComputed {
  const timeUnknown = !!b.timeUnknown || b.hour === null || b.hour === undefined;
  const hour = timeUnknown ? 12 : Number(b.hour), minute = timeUnknown ? 0 : Number(b.minute ?? 0);
  const longitude = b.longitude ?? SAJU_BASIS.defaultLongitude;
  const correct = !timeUnknown && SAJU_BASIS.timeCorrection === "longitude";
  const r = calculateFourPillars({
    year: b.year, month: b.month, day: b.day, hour, minute,
    isLunar: !!b.isLunar, isLeapMonth: !!b.isLeapMonth, gender: b.gender,
    dayBoundary: SAJU_BASIS.dayBoundary,
    /* 시각을 모르면 정오로 두고 보정하지 않는다 — 일주가 보정 때문에 흔들리지 않게 */
    ...(correct ? { trueSolarTime: { longitude, applyEquationOfTime: SAJU_BASIS.applyEquationOfTime } } : {}),
  });
  const solar = b.isLunar ? lunarToSolar(b.year, b.month, b.day, !!b.isLeapMonth) : { year: b.year, month: b.month, day: b.day };
  const lunar = b.isLunar ? { year: b.year, month: b.month, day: b.day, isLeapMonth: !!b.isLeapMonth } : solarToLunar(b.year, b.month, b.day);
  const P = { year: r.yearHanja, month: r.monthHanja, day: r.dayHanja, hour: timeUnknown ? null : r.hourHanja };
  const dayStem = P.day[0], monthBranch = P.month[1];

  const elements = Object.fromEntries(ELEMENTS.map((e) => [e, { stems: 0, branches: 0 }])) as SajuComputed["elements"];
  for (const p of [P.year, P.month, P.day, P.hour]) {
    if (!p) continue;
    elements[STEM_EL[p[0]]].stems++;
    elements[BRANCH_EL[p[1]]].branches++;
  }

  const notes: string[] = [];
  if (timeUnknown) notes.push("출생 시각 미상 — 시주를 빼고 여섯 글자로 해석");
  else {
    /* 시주 경계 근접: 보정한 시각이 시(時)가 바뀌는 홀수 시 정각에서 30분 이내인지 */
    const shifted = hour * 60 + minute + (correct ? Math.round((longitude - 135) * 4) : 0);
    const m = ((shifted % 120) + 120) % 120;       // 홀수 시 정각 기준 0~119 → 60 이 경계
    const dist = Math.abs(m - 60);
    if (dist <= 30) notes.push(`시주 경계 근접(경계까지 ${dist}분) — 시주 확인 필요`);
  }

  /* 대운 — 첫 대운의 시작 시점(출생 + 연·월·일)에서 10년씩 */
  let luck: SajuComputed["luck"] = null;
  if (r.luckPillars) {
    const lp = r.luckPillars;
    const first = new Date(Date.UTC(solar.year + lp.startYears, solar.month - 1 + lp.startMonths, solar.day + lp.startDays));
    const fy = first.getUTCFullYear();
    const rows: LuckRow[] = lp.pillars.map((p, i) => ({ pillar: hanjaOf(p.korean), fromYear: fy + i * 10, toYear: fy + i * 10 + 9, age: lp.startAge + i * 10 }));
    let current = -1;
    rows.forEach((row, i) => { if (TARGET_YEAR >= row.fromYear) current = i; });
    if (rows.some((row) => row.fromYear === TARGET_YEAR)) notes.push(`2027년에 대운이 바뀜(${first.getUTCMonth() + 1}월경) — 교체 전후 해석 확인 필요`);
    luck = { forward: lp.forward, startAge: lp.startAge, shift: `${first.getUTCMonth() + 1}월`, rows, current };
  }

  const years = [TARGET_YEAR - 1, TARGET_YEAR, TARGET_YEAR + 1].map((y) => {
    const pillar = yearPillar(y);
    return { year: y, pillar, stemGod: tenGodOfStem(dayStem, pillar[0]), branchGod: tenGodOfBranch(dayStem, pillar[1]) };
  });

  return {
    engine: SAJU_ENGINE_VERSION, solar, lunar, pillars: P, dayStem, dayElement: STEM_EL[dayStem], monthBranch, season: SEASON_OF[monthBranch],
    gods: {
      ys: tenGodOfStem(dayStem, P.year[0]), yb: tenGodOfBranch(dayStem, P.year[1]),
      ms: tenGodOfStem(dayStem, P.month[0]), mb: tenGodOfBranch(dayStem, P.month[1]),
      db: tenGodOfBranch(dayStem, P.day[1]),
      hs: P.hour ? tenGodOfStem(dayStem, P.hour[0]) : null, hb: P.hour ? tenGodOfBranch(dayStem, P.hour[1]) : null,
    },
    elements, luck, years, months: months2027(dayStem), notes, timeUnknown,
  };
}

const KO2HAN: Record<string, string> = { 갑: "甲", 을: "乙", 병: "丙", 정: "丁", 무: "戊", 기: "己", 경: "庚", 신: "辛", 임: "壬", 계: "癸" };
const KO2HAN_B: Record<string, string> = { 자: "子", 축: "丑", 인: "寅", 묘: "卯", 진: "辰", 사: "巳", 오: "午", 미: "未", 신: "申", 유: "酉", 술: "戌", 해: "亥" };
function hanjaOf(ko: string): string {
  return (KO2HAN[ko[0]] ?? ko[0]) + (KO2HAN_B[ko[1]] ?? ko[1]);
}

/** 양식의 칸(eng.*)에 넣을 글자. 한 장(③)은 일부만, 프리미엄(⑤)은 전부 쓴다. */
export function sajuFields(c: SajuComputed, b: SajuBirth): Record<string, string> {
  const f: Record<string, string> = {};
  const P = c.pillars;
  f["eng.ilgan"] = `${c.dayStem}${c.dayElement}`;
  f["eng.season"] = `${c.season}(${c.monthBranch}월)`;
  /* 명식 타일 */
  f["eng.t.ys"] = P.year[0]; f["eng.t.yb"] = P.year[1];
  f["eng.t.ms"] = P.month[0]; f["eng.t.mb"] = P.month[1];
  f["eng.t.ds"] = P.day[0]; f["eng.t.db"] = P.day[1];
  f["eng.t.hs"] = P.hour ? P.hour[0] : "—"; f["eng.t.hb"] = P.hour ? P.hour[1] : "—";
  f["eng.g.ys"] = c.gods.ys; f["eng.g.yb"] = c.gods.yb; f["eng.g.ms"] = c.gods.ms; f["eng.g.mb"] = c.gods.mb; f["eng.g.db"] = c.gods.db;
  f["eng.g.hs"] = c.gods.hs ?? "시각 미상"; f["eng.g.hb"] = c.gods.hb ?? "—";
  f["eng.h.yb"] = HIDDEN_STEMS[P.year[1]].join("·"); f["eng.h.mb"] = HIDDEN_STEMS[P.month[1]].join("·"); f["eng.h.db"] = HIDDEN_STEMS[P.day[1]].join("·");
  f["eng.h.hb"] = P.hour ? HIDDEN_STEMS[P.hour[1]].join("·") : "—";
  /* 출생 정보·산출 기준 */
  const cal = b.isLunar ? `음력(${b.isLeapMonth ? "윤달" : "평달"})` : "양력";
  f["eng.birthLine"] = `${c.solar.year}년 ${c.solar.month}월 ${c.solar.day}일 (양력)`;
  f["eng.calType"] = b.isLunar ? `${cal} ${b.month}.${b.day} 입력` : `양력 입력 · 음력 ${c.lunar.month}.${c.lunar.day}${c.lunar.isLeapMonth ? "(윤)" : ""}`;
  f["eng.timePlace"] = c.timeUnknown ? "시각 미상" : `${pad2(Number(b.hour))}:${pad2(Number(b.minute ?? 0))}${b.place ? ` · ${b.place}` : ""}`;
  const bd = BOUNDARY_LABEL[SAJU_BASIS.dayBoundary];
  f["eng.timeAdj"] = c.timeUnknown ? "보정 없음(정오 기준)" : SAJU_BASIS.timeCorrection === "none" ? `표준시 그대로 · ${bd}` : b.longitude ? `경도 ${b.longitude}° 보정 · ${bd}` : `표준시 −30분 · ${bd}`;
  f["eng.boundary"] = "연 입춘 · 월 절입 시각";
  f["eng.scope"] = c.notes.length ? c.notes.join(" / ") : "출생 시각 포함 — 여덟 글자 기준으로 해석";
  f["in.birthDate"] = `${b.year}.${pad2(b.month)}.${pad2(b.day)} (${cal})`;
  f["in.birthTime"] = c.timeUnknown ? "미상" : `${pad2(Number(b.hour))}:${pad2(Number(b.minute ?? 0))}`;
  /* 오행 분포(글자 수) */
  const elKey: Record<Element, string> = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };
  for (const e of ELEMENTS) {
    const v = c.elements[e], sum = v.stems + v.branches;
    f[`eng.el.${elKey[e]}`] = sum ? `${sum}자 (천간 ${v.stems}·지지 ${v.branches})` : "0자";
  }
  /* 대운 */
  if (c.luck) {
    const L = c.luck, cur = L.rows[L.current];
    f["eng.luckDir"] = L.forward ? "순행" : "역행";
    f["eng.luckNum"] = `대운수 ${L.startAge}`;
    f["eng.luckShift"] = `10년마다 ${L.shift}경 교체(만 나이 기준)`;
    f["eng.curLuck"] = cur ? `${cur.pillar} 대운(${cur.fromYear}~${cur.toYear})` : "첫 대운 전";
    f["eng.luckPos"] = cur ? `${cur.pillar} 대운 · 丁未 세운` : "대운 전 · 丁未 세운";
    for (let i = 0; i < 5; i++) {
      const row = L.rows[L.current - 1 + i];
      f[`eng.luck${i}`] = row && L.current - 1 + i >= 0 ? `${row.pillar} · ${row.fromYear}~${row.toYear}` : "—";
    }
  }
  for (const m of c.months) f[`eng.m${pad2(m.n)}`] = `${m.pillar}월 · ${m.from}~${m.to}`;
  f["sys.manse"] = SAJU_BASIS.manse;
  f["sys.manseLine"] = `${SAJU_BASIS.manse} / 입춘·절입 시각 / ${f["eng.timeAdj"]}`;
  return f;
}

/** AI 초안에 넘길 산출 요약(글) — 여기 적힌 값만 근거로 쓰게 한다 */
export function sajuBrief(c: SajuComputed): string {
  const P = c.pillars, L = c.luck;
  const el = ELEMENTS.map((e) => `${ELEMENT_KO[e]}(${e}) ${c.elements[e].stems + c.elements[e].branches}`).join(", ");
  const lines = [
    `명식: 년 ${P.year} / 월 ${P.month} / 일 ${P.day} / 시 ${P.hour ?? "미상"}`,
    `일간: ${c.dayStem}${c.dayElement}(${STEM_IMAGE[c.dayStem]}) · 태어난 계절: ${c.season}(월지 ${c.monthBranch})`,
    `십성: 년간 ${c.gods.ys}·년지 ${c.gods.yb} / 월간 ${c.gods.ms}·월지 ${c.gods.mb} / 일지 ${c.gods.db}${c.gods.hs ? ` / 시간 ${c.gods.hs}·시지 ${c.gods.hb}` : ""}`,
    `오행 글자 수: ${el}`,
    L ? `대운: ${L.forward ? "순행" : "역행"}, 대운수 ${L.startAge}, 지금 ${L.rows[L.current]?.pillar ?? "대운 전"}(${L.rows[L.current]?.fromYear ?? ""}~${L.rows[L.current]?.toYear ?? ""}), 다음 ${L.rows[L.current + 1]?.pillar ?? "-"}` : "",
    `세운: ${c.years.map((y) => `${y.year} ${y.pillar}(천간 ${y.stemGod}·지지 ${y.branchGod})`).join(" / ")}`,
    `2027 월운(월 번호 = 그달에 절입하는 절기월): ${c.months.map((m) => `${m.n}월 ${m.pillar} ${m.from}~${m.to} (${m.stemGod}·${m.branchGod})`).join(" / ")}`,
    c.notes.length ? `유의: ${c.notes.join(" / ")}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}
