import { calculateFourPillars } from "manseryeok";
import type { TenGodChart } from "manseryeok";

export interface SajuInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  isLunar?: boolean;
  isLeapMonth?: boolean;
  gender: "male" | "female";
  /** 출생시간을 모르는 경우 true — 시주 정보는 결과에서 제외됩니다. */
  timeUnknown?: boolean;
}

export interface SajuResult {
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string | null;
  };
  dayElement: { stem: string; branch: string };
  dayYinYang: { stem: string; branch: string };
  tenGods: Pick<TenGodChart, "year" | "month" | "day"> & Partial<Pick<TenGodChart, "hour">>;
  voidBranches: string[];
  luckPillars: {
    forward: boolean;
    startAge: number;
    pillars: { age: number; pillar: string }[];
  } | null;
  timeUnknown: boolean;
}

/**
 * 생년월일시를 입력받아 사주팔자(사주 원국)를 계산합니다.
 * 계산 자체는 manseryeok(KASI 만세력 데이터 기반) 라이브러리에 위임합니다.
 * 출생 시간을 모르는 경우 정오(12:00)로 계산하되, 시주·시간 기반 십신 정보는
 * 결과에서 제외해 잘못된 확신을 주지 않도록 합니다.
 */
export function calculateSaju(input: SajuInput): SajuResult {
  const timeUnknown = Boolean(input.timeUnknown);
  const hour = timeUnknown ? 12 : (input.hour ?? 12);
  const minute = timeUnknown ? 0 : (input.minute ?? 0);

  const result = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour,
    minute,
    isLunar: input.isLunar,
    isLeapMonth: input.isLeapMonth,
    gender: input.gender,
  });

  const obj = result.toObject();
  const tenGods = result.tenGods;

  return {
    pillars: {
      year: obj.year,
      month: obj.month,
      day: obj.day,
      hour: timeUnknown ? null : obj.hour,
    },
    dayElement: result.dayElement,
    dayYinYang: result.dayYinYang,
    tenGods: timeUnknown
      ? { year: tenGods.year, month: tenGods.month, day: tenGods.day }
      : tenGods,
    voidBranches: result.voidBranches,
    luckPillars: result.luckPillars
      ? {
          forward: result.luckPillars.forward,
          startAge: result.luckPillars.startAge,
          pillars: result.luckPillars.pillars.map((p) => ({
            age: p.age,
            pillar: p.korean,
          })),
        }
      : null,
    timeUnknown,
  };
}
