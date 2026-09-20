/**
 * 선정 엔진 — 날짜 하나를 받아 오늘의 괘·핵심 효·기운 상태를 돌려준다.
 * 외부 호출·DB 접근이 없는 순수 계산이라 같은 날짜는 항상 같은 결과가 나온다.
 *
 *  하괘 = 일간(오늘 나의 기운) / 상괘 = 일지(오늘 주어진 환경)
 *  핵심 효 = 월령의 음양 소장 자리(12소식괘)
 *  절입일 = 그달의 소식괘를 오늘의 괘로 사용
 */
import { getDayContext } from "./calendar";
import { hexagramByNo, hexagramByTrigrams, RULES } from "./data-store";
import { branchTrigram, energyState, lineByMonth, sovereignByMonth, stemTrigram, TONE } from "./rules";
import type { DailySelection } from "./types";

export const SELECTION_NOTICE =
  "오늘의 괘는 고전에 날짜별로 정해진 것이 아니라, AIsajuLab이 오늘의 간지를 8괘에 대응시켜 선정한 것입니다. " +
  "하괘는 일간, 상괘는 일지, 핵심 효는 절기의 흐름으로 정했습니다.";

export function selectDailyIching(date: string): DailySelection {
  const ctx = getDayContext(date);
  const [dayStem, dayBranch] = [...ctx.dayGanji];
  const monthBranch = [...ctx.monthGanji][1];

  const lower = stemTrigram(dayStem);
  const upper = branchTrigram(dayBranch);
  const hexagram = ctx.isJeolip
    ? hexagramByNo(sovereignByMonth(monthBranch))
    : hexagramByTrigrams(upper, lower);

  const linePos = lineByMonth(monthBranch);
  const line = hexagram.lines[linePos - 1];
  const state = energyState(dayStem, monthBranch);

  const reason = ctx.isJeolip
    ? `절입일(${monthBranch}월 시작) → 소식괘 ${hexagram.full_hanja} · ${monthBranch}월 → ${linePos}효`
    : `하괘 ${lower}(${dayStem}) · 상괘 ${upper}(${dayBranch}) → ${hexagram.full_hanja} · ${monthBranch}월 → ${linePos}효`;

  return {
    date,
    dayGanji: ctx.dayGanji,
    monthGanji: ctx.monthGanji,
    monthBranch,
    isJeolip: ctx.isJeolip,
    hexagram,
    line,
    energyState: state,
    tone: TONE[state],
    reason,
    engineVersion: RULES.version,
  };
}
