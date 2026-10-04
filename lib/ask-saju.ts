import { calculateSaju } from "@/lib/saju";
import type { SajuBrief } from "@/lib/ask-report";

/**
 * 무료 1문 1답 — 신청서의 birth_info 문자열로 명식 요약을 자동 계산한다 (2026-10-04)
 *
 * birth_info 형식(AskForm 이 만든다): "1990-05-15 15시 (양력, 여)" / "1990-05-15 시간 모름 (음력, 남)"
 * 계산은 lib/saju.ts(manseryeok)에 맡기고, 여기서는 리포트에 바로 쓸 한자 표기만 만든다.
 * 해석(일간 성격·세운 의미)은 사람이 쓴다 — 이 파일은 계산만 한다.
 */

const KO2HAN: Record<string, string> = {
  갑: "甲", 을: "乙", 병: "丙", 정: "丁", 무: "戊", 기: "己", 경: "庚", 신: "辛", 임: "壬", 계: "癸",
  자: "子", 축: "丑", 인: "寅", 묘: "卯", 진: "辰", 사: "巳", 오: "午", 미: "未", 신2: "申", 유: "酉", 술: "戌", 해: "亥",
};
/* 지지의 '신'(申)은 천간의 '신'(辛)과 한글이 같아 자리로 구분한다 */
function han(pillarKo: string): string {
  if (!pillarKo || pillarKo.length < 2) return pillarKo;
  const s = KO2HAN[pillarKo[0]] ?? pillarKo[0];
  const bKo = pillarKo[1];
  const b = bKo === "신" ? "申" : (KO2HAN[bKo] ?? bKo);
  return s + b;
}
const STEM_EL: Record<string, string> = { 甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水" };

export function parseBirthInfo(birthInfo: string): { year: number; month: number; day: number; hour?: number; timeUnknown: boolean; isLunar: boolean; gender: "male" | "female" } | null {
  const m = birthInfo.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  const hm = birthInfo.match(/(\d{1,2})\s*시/);
  const timeUnknown = /모름/.test(birthInfo) || !hm;
  return {
    year: +m[1], month: +m[2], day: +m[3],
    hour: timeUnknown ? undefined : +hm![1],
    timeUnknown,
    isLunar: /음력/.test(birthInfo),
    gender: /남/.test(birthInfo) ? "male" : "female",
  };
}

export function sajuBriefFromBirth(birthInfo: string, now = new Date()): SajuBrief | null {
  const p = parseBirthInfo(birthInfo);
  if (!p) return null;
  try {
    const r = calculateSaju({ year: p.year, month: p.month, day: p.day, hour: p.hour, minute: 0, isLunar: p.isLunar, gender: p.gender, timeUnknown: p.timeUnknown });
    const day = han(r.pillars.day);
    const stem = day[0];
    /* 올해·내년 간지: 입춘(2/4 근사) 이후 기준으로 해당 연도 3/1 정오로 계산 */
    const yearPillar = (y: number) => han(calculateSaju({ year: y, month: 3, day: 1, hour: 12, minute: 0, gender: "male" }).pillars.year);
    const ky = now.getFullYear() + ((now.getMonth() + 1) * 100 + now.getDate() < 204 ? -1 : 0);
    return {
      pillars: { year: han(r.pillars.year), month: han(r.pillars.month), day, hour: r.pillars.hour ? han(r.pillars.hour) : null },
      dayStem: stem,
      dayStemKo: stem + (STEM_EL[stem] ?? ""),
      dayStemElement: STEM_EL[stem] ?? "",
      thisYear: yearPillar(ky),
      nextYear: yearPillar(ky + 1),
      timeUnknown: p.timeUnknown,
    };
  } catch {
    return null;
  }
}
