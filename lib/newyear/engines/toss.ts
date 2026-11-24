/**
 * 2027 새해운 — 괘 뽑기(척전법). 브라우저와 서버가 함께 쓰는 순수 함수만 둔다(다른 모듈을 끌어오지 않는다).
 *   동전 세 닢을 한 번 던져 앞면 3·뒷면 2로 세면 합이 6(노음)·7(소양)·8(소음)·9(노양). 아래 효부터 여섯 번.
 */
export function tossLine(rand: () => number = Math.random): number {
  let sum = 0;
  for (let i = 0; i < 3; i++) sum += rand() < 0.5 ? 3 : 2;
  return sum;
}
export function tossSix(rand?: () => number): number[] {
  return Array.from({ length: 6 }, () => tossLine(rand));
}
export const validLines = (lines: unknown): lines is number[] =>
  Array.isArray(lines) && lines.length === 6 && lines.every((v) => v === 6 || v === 7 || v === 8 || v === 9);
