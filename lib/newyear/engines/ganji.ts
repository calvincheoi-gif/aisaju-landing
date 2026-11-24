/**
 * 2027 새해운 — 간지 기본 표와 도우미 (한자 표기 기준).
 * 엔진(사주·토정·주역)이 함께 쓰는 순수 계산만 둔다. 달력·절기 계산은 manseryeok 에 맡긴다.
 */
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export type Element = "木" | "火" | "土" | "金" | "水";
export const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];
export const ELEMENT_KO: Record<Element, string> = { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" };

export const STEM_KO: Record<string, string> = { 甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계" };
export const BRANCH_KO: Record<string, string> = { 子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해" };

export const STEM_EL: Record<string, Element> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };
export const BRANCH_EL: Record<string, Element> = { 子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水" };
/** 지지의 정기(본기) — 지지 십성을 볼 때 기준 */
export const BRANCH_MAIN: Record<string, string> = { 子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙", 午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬" };
/** 지장간(월률분야: 여기·중기·정기 순) */
export const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["壬", "癸"], 丑: ["癸", "辛", "己"], 寅: ["戊", "丙", "甲"], 卯: ["甲", "乙"], 辰: ["乙", "癸", "戊"], 巳: ["戊", "庚", "丙"],
  午: ["丙", "己", "丁"], 未: ["丁", "乙", "己"], 申: ["戊", "壬", "庚"], 酉: ["庚", "辛"], 戌: ["辛", "丁", "戊"], 亥: ["戊", "甲", "壬"],
};
/** 월지 → 태어난 계절 */
export const SEASON_OF: Record<string, string> = {
  寅: "봄", 卯: "봄", 辰: "봄", 巳: "여름", 午: "여름", 未: "여름", 申: "가을", 酉: "가을", 戌: "가을", 亥: "겨울", 子: "겨울", 丑: "겨울",
};
/** 일간의 자연 이미지 (리포트 표준의 일간 은유) */
export const STEM_IMAGE: Record<string, string> = {
  甲: "큰 나무", 乙: "풀과 덩굴", 丙: "태양", 丁: "촛불·등불", 戊: "큰 산", 己: "논밭의 흙", 庚: "원석·쇠", 辛: "보석", 壬: "큰 강·바다", 癸: "비·이슬",
};

const GEN: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const isYang = (stem: string) => STEMS.indexOf(stem as (typeof STEMS)[number]) % 2 === 0;

export type TenGod = "비견" | "겁재" | "식신" | "상관" | "편재" | "정재" | "편관" | "정관" | "편인" | "정인";

/** 일간 기준 다른 천간의 십성 */
export function tenGodOfStem(dayStem: string, other: string): TenGod {
  const me = STEM_EL[dayStem], you = STEM_EL[other];
  const same = isYang(dayStem) === isYang(other);
  if (me === you) return same ? "비견" : "겁재";
  if (GEN[me] === you) return same ? "식신" : "상관";
  if (GEN[GEN[me]] === you) return same ? "편재" : "정재";
  if (GEN[you] === me) return same ? "편인" : "정인";
  return same ? "편관" : "정관";
}
/** 일간 기준 지지의 십성 (지지의 정기로 본다) */
export function tenGodOfBranch(dayStem: string, branch: string): TenGod {
  return tenGodOfStem(dayStem, BRANCH_MAIN[branch]);
}

export function pillarKo(p: string): string {
  return (STEM_KO[p[0]] ?? p[0]) + (BRANCH_KO[p[1]] ?? p[1]);
}

/** 60갑자에서 n 번째(0=甲子) */
export function ganjiAt(index: number): string {
  const i = ((index % 60) + 60) % 60;
  return STEMS[i % 10] + BRANCHES[i % 12];
}
export function ganjiIndex(p: string): number {
  const s = STEMS.indexOf(p[0] as (typeof STEMS)[number]), b = BRANCHES.indexOf(p[1] as (typeof BRANCHES)[number]);
  for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i;
  return -1;
}
/** 양력 연도의 세운 간지 (입춘 이후 기준 — 1984 = 甲子) */
export function yearPillar(year: number): string {
  return ganjiAt(year - 1984);
}
