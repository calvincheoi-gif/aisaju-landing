/**
 * 2027 새해운 — 결과물 검사 (내보내기 전 최소 확인).
 *
 *  · empty   비어 있는 칸
 *  · bracket 대괄호가 남은 칸 (양식의 [안내 문구]가 치환되지 않은 것)
 *  · long    권장 글자 수를 크게 넘긴 칸 (실제 넘침은 화면의 fit 검사가 최종 판단)
 * 고객에게 자동으로 나가는 한 장 상품은 empty·bracket 이 하나라도 있으면 내보내지 않는다.
 */
import { getSpec, type FieldValues, type SpecField, type TemplateKey } from "../render/spec";

export interface ContentCheck { empty: string[]; bracket: string[]; long: string[]; ok: boolean }

export function checkContent(key: TemplateKey, values: FieldValues): ContentCheck {
  const empty: string[] = [], bracket: string[] = [], long: string[] = [];
  for (const f of getSpec(key).fields) {
    const v = (values[f.key] ?? "").trim();
    if (!v) { empty.push(f.key); continue; }
    if (/[\[\]]/.test(v)) bracket.push(f.key);
    if (f.src === "ai" && v.length > Math.ceil(f.max * 1.6) + 4) long.push(f.key);
  }
  return { empty, bracket, long, ok: empty.length === 0 && bracket.length === 0 };
}

/** AI·사람이 쓴 글을 칸에 넣기 전에 다듬는다 — 대괄호·따옴표 껍데기·줄바꿈 제거 */
export function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\[\]]/g, "").replace(/\s*\n+\s*/g, " ").replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
}

export function fieldLabel(f: SpecField): string {
  const parts = f.label.split(" › ").map((x) => x.trim()).filter(Boolean);
  if (f.hint && !f.label.endsWith(f.hint)) parts.push(f.hint);
  /* 같은 말이 잇따라 나오면 한 번만, 아주 긴 조각(주석 문장 등)은 줄여서 보여 준다 */
  const out: string[] = [];
  for (const x of parts) if (out[out.length - 1] !== x) out.push(x.length > 30 ? `${x.slice(0, 29)}…` : x);
  return out.join(" › ");
}
