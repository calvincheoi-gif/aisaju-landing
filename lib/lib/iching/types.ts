/**
 * 「오늘의 주역 한 줄」 공용 타입 — 모든 iching 모듈이 이 파일만 공유한다.
 */
export type Trigram = "乾" | "兌" | "離" | "震" | "巽" | "坎" | "艮" | "坤";
export type Element = "木" | "火" | "土" | "金" | "水";
export type EnergyState = "旺" | "相" | "休" | "囚" | "死";

export interface IchingLine {
  pos: number;            // 1(初)~6(上)
  name: string;           // 初九, 六二 …
  yang: boolean;
  dangwi: boolean;        // 當位
  jung: boolean;          // 得中
  eung: boolean;          // 應
  text_classic: string;   // 효사 원문(정본주역, 사용자 제공)
  text_modern: string;
}

export interface Hexagram {
  no: number;
  hanja: string;          // 艮
  ko: string;             // 간
  alias: string;
  full_ko: string;        // 간위산
  full_hanja: string;     // 艮爲山
  upper: Trigram;
  lower: Trigram;
  upper_el: Element;
  lower_el: Element;
  symbol: string;
  bits: string;           // 아래→위, 1=양
  meaning: string;
  action_kw: string;
  judgment_classic: string;
  verified: boolean;
  lines: IchingLine[];
}

/** 선정 엔진의 결과 — DB(daily_iching)에 그대로 저장되는 뼈대 */
export interface DailySelection {
  date: string;           // YYYY-MM-DD (KST)
  dayGanji: string;       // 戊戌
  monthGanji: string;     // 丁酉 (그날 끝 기준)
  monthBranch: string;    // 酉
  isJeolip: boolean;      // 절입일 여부
  hexagram: Hexagram;
  line: IchingLine;
  energyState: EnergyState;
  tone: string;           // 행동 지침 어조
  reason: string;         // 관리자용 선정 근거 한 줄
  engineVersion: string;
}
