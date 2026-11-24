/**
 * 2027 새해운 — AI 초안 묶음 나누기 (서버와 관리자 화면이 함께 쓴다. AI 호출 코드는 여기에 없다).
 *
 * 한 번의 AI 호출에 칸을 너무 많이 맡기면 답이 길어져 Netlify 함수 제한(26초)을 넘긴다.
 * 그래서 「칸 최대 글자 수의 합」이 DRAFT_BUDGET 을 넘지 않게 쪽 순서대로 묶는다.
 * 양식(칸 수·글자 수)이 바뀌면 묶음도 저절로 바뀐다 — 묶음을 손으로 적어 두지 않는다.
 */
import type { ProductKey } from "../catalog";
import { getSpec, type FieldValues, type SpecField } from "../render/spec";
import { fieldLabel } from "./validate";

/**
 * 한 묶음의 분량 — 칸 최대 글자 수 + 칸마다 열쇠 몫 8.
 *   DRAFT_BUDGET  묶음을 채워 갈 때의 목표(응답 15초 안팎 — 제한 26초의 절반 남짓).
 *   DRAFT_HARD    쪽 하나가 이 값 이하면 쪼개지 않고 한 묶음으로 둔다(쪽 안의 흐름을 지키려고 조금 넘는 것은 허용).
 */
export const DRAFT_BUDGET = 760;
export const DRAFT_HARD = 920;
export const draftCost = (f: SpecField) => Math.max(4, f.max) + 8;
const total = (fs: SpecField[]) => fs.reduce((n, f) => n + draftCost(f), 0);

/** 상한을 넘는 쪽을 비슷한 크기의 조각으로 나눈다 — 되도록 소제목(label)이 바뀌는 자리에서 끊는다. */
function splitPage(group: SpecField[]): SpecField[][] {
  const n = Math.ceil(total(group) / DRAFT_BUDGET);
  const target = total(group) / n;
  const out: SpecField[][] = [];
  let cur: SpecField[] = [], sum = 0;
  for (const f of group) {
    const boundary = cur.length > 0 && cur[cur.length - 1].label !== f.label;
    const reached = sum >= target * 0.86 && boundary;       // 목표에 거의 찼고 소제목이 바뀌면 끊는다
    const forced = sum + draftCost(f) > target * 1.3;       // 소제목이 안 바뀌어도 너무 커지면 끊는다
    if (cur.length && out.length < n - 1 && (reached || forced)) { out.push(cur); cur = []; sum = 0; }
    cur.push(f); sum += draftCost(f);
  }
  if (cur.length) out.push(cur);
  return out;
}

const cache = new Map<string, SpecField[][]>();

/** 상품의 문구(AI) 칸을 묶음으로 나눈다. 모든 문구 칸은 정확히 한 묶음에 들어간다. */
export function draftParts(product: ProductKey): SpecField[][] {
  const hit = cache.get(product);
  if (hit) return hit;
  const ai = getSpec(product).fields.filter((f) => f.src === "ai");
  const pages = Array.from(new Set(ai.map((f) => f.page))).sort((a, b) => a - b);
  /* ① 쪽 단위 조각을 만든다(큰 쪽만 나눈다) → ② 순서대로 목표 분량까지 이어 붙인다 */
  const units = pages.flatMap((pg) => {
    const group = ai.filter((f) => f.page === pg);
    return total(group) <= DRAFT_HARD ? [group] : splitPage(group);
  });
  const parts: SpecField[][] = [];
  let cur: SpecField[] = [];
  for (const u of units) {
    /* 작은 조각(300 미만)은 호출을 따로 쓰지 않게 앞 묶음에 얹는다(DRAFT_HARD 까지) */
    const room = total(u) < 300 ? DRAFT_HARD : DRAFT_BUDGET;
    if (cur.length && total(cur) + total(u) > room) { parts.push(cur); cur = []; }
    cur = cur.concat(u);
  }
  if (cur.length) parts.push(cur);
  cache.set(product, parts);
  return parts;
}

export const draftPartCount = (product: string): number => (product === "iching-card" ? 0 : draftParts(product as ProductKey).length);

/**
 * 앞 묶음에서 이미 쓴 내용의 간추림 — 뒤 묶음이 흐름을 잇고, 같은 문장·같은 키워드를 되풀이하지 않게 한다.
 * (묶음마다 따로 부르기 때문에, 이것이 없으면 달마다 키워드가 겹치거나 앞뒤 말이 어긋날 수 있다.)
 */
export function priorDigest(product: ProductKey, part: number, content: FieldValues | null | undefined): string {
  if (!content || part <= 0) return "";
  const heads: string[] = [], words: string[] = [];
  for (const f of draftParts(product).slice(0, part).flat()) {
    const v = (content[f.key] ?? "").trim();
    if (!v || /[\[\]]/.test(v)) continue;
    if (/^단어/.test(f.hint)) { if (words.length < 90 && !words.includes(v)) words.push(v); }   // 키워드 칸(「단어」「단어 · 단어」)
    else if (f.max >= 20 && heads.length < 10) heads.push(`- ${fieldLabel(f)}: ${v}`);
  }
  return [heads.length ? `핵심 문장\n${heads.join("\n")}` : "", words.length ? `이미 쓴 키워드: ${words.join(", ")}` : ""].filter(Boolean).join("\n");
}
