/**
 * 데이터 접근 모듈 — JSON 원본(data/)을 읽는 유일한 통로.
 * 괘 데이터를 바꿀 때는 data/hexagrams.json 만 교체하면 된다.
 */
import hexData from "./data/hexagrams.json";
import rules from "./data/mapping-rules.json";
import type { Hexagram, Trigram } from "./types";

const HEXAGRAMS = (hexData as { hexagrams: Hexagram[] }).hexagrams;
const BY_NO = new Map<number, Hexagram>(HEXAGRAMS.map((h) => [h.no, h]));
const BY_PAIR = new Map<string, Hexagram>(HEXAGRAMS.map((h) => [h.upper + h.lower, h]));

export const RULES = rules as {
  version: string;
  stem_to_trigram: Record<string, Trigram>;
  branch_to_trigram: Record<string, Trigram>;
  month_branch_to_line: Record<string, number>;
  jeolip_sovereign: Record<string, number>;
  note: string;
};

export function hexagramByNo(no: number): Hexagram {
  const h = BY_NO.get(no);
  if (!h) throw new Error(`괘 번호 없음: ${no}`);
  return h;
}

export function hexagramByTrigrams(upper: Trigram, lower: Trigram): Hexagram {
  const h = BY_PAIR.get(upper + lower);
  if (!h) throw new Error(`괘 조합 없음: ${upper}/${lower}`);
  return h;
}

export function allHexagrams(): Hexagram[] {
  return HEXAGRAMS;
}
