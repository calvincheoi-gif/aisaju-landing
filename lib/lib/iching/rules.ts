/**
 * 규칙 모듈 — 간지 → 8괘, 월령 → 효 자리, 월령 대비 일간 → 기운 상태.
 * 규칙 값(표)은 data/mapping-rules.json 에 있고, 여기는 해석만 한다.
 */
import { RULES } from "./data-store";
import type { Element, EnergyState, Trigram } from "./types";

const STEM_EL: Record<string, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const BRANCH_EL: Record<string, Element> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火", 午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};
const GENERATES: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };

export const TONE: Record<EnergyState, string> = {
  旺: "추진 — 스스로 밀고 나가기 좋은 날",
  相: "확장 — 도움을 받아 넓혀 가기 좋은 날",
  休: "정비 — 힘을 내주었으니 다듬고 쉬어 가는 날",
  囚: "인내 — 애쓰는 만큼 소모되니 지키며 버티는 날",
  死: "절제 — 눌리는 기운이니 무리하지 않고 줄이는 날",
};

export function stemTrigram(stem: string): Trigram {
  const t = RULES.stem_to_trigram[stem];
  if (!t) throw new Error(`천간 매핑 없음: ${stem}`);
  return t;
}

export function branchTrigram(branch: string): Trigram {
  const t = RULES.branch_to_trigram[branch];
  if (!t) throw new Error(`지지 매핑 없음: ${branch}`);
  return t;
}

export function lineByMonth(monthBranch: string): number {
  const n = RULES.month_branch_to_line[monthBranch];
  if (!n) throw new Error(`월령 효 매핑 없음: ${monthBranch}`);
  return n;
}

export function sovereignByMonth(monthBranch: string): number {
  const n = RULES.jeolip_sovereign[monthBranch];
  if (!n) throw new Error(`소식괘 매핑 없음: ${monthBranch}`);
  return n;
}

/** 월령 대비 일간의 왕상휴수사 */
export function energyState(dayStem: string, monthBranch: string): EnergyState {
  const me = STEM_EL[dayStem];
  const season = BRANCH_EL[monthBranch];
  if (!me || !season) throw new Error(`오행 판정 불가: ${dayStem}/${monthBranch}`);
  if (me === season) return "旺";
  if (GENERATES[season] === me) return "相";
  if (GENERATES[me] === season) return "休";
  if (GENERATES[GENERATES[me]] === season) return "囚";
  return "死";
}
