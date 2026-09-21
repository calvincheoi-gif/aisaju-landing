/** Today's 촌철활인 한마디 — 공용 타입 */
export type WordElement = "木" | "火" | "土" | "金" | "水";

export interface DailyWord {
  element: WordElement;
  type: string;            // 한국 속담 · 미국 속담 · 탈무드·성경 · 사자성어 · 불경·기타
  text: string;
  meaning: string | null;  // 미국 속담·사자성어의 뜻
  source: string | null;   // 원전 출처
}

export const WORD_ELEMENTS: WordElement[] = ["木", "火", "土", "金", "水"];
