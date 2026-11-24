/**
 * 2027 새해운 — 양식 사양(템플릿) 타입과 불러오기.
 *
 * 사양(JSON)은 scripts/newyear/extract_spec.py 가 확정 PDF 5종에서 좌표(pt) 그대로 뽑아 만든다.
 * 디자인이 바뀌면 PDF 를 다시 추출해 specs/*.json 만 교체하면 되고, 이 폴더의 그리기 코드는 건드리지 않는다.
 * 좌표 단위는 PDF pt. 화면에서는 1pt = 1 CSS px 로 그린 뒤 통째로 비율을 키운다.
 */
import ichingCard from "./specs/iching-card.json";
import tojeongCard from "./specs/tojeong-card.json";
import sajuCard from "./specs/saju-card.json";
import tojeongDetail from "./specs/tojeong-detail.json";
import sajuPremium from "./specs/saju-premium.json";

export interface TextStyle { s: number; b: number; c: string }
export interface SpecImage { src: string; x: number; y: number; w: number; h: number; full?: number }
export type SpecShape =
  | { k: "r"; x: number; y: number; w: number; h: number; r?: number; fill?: string; stroke?: string; sw?: number }
  | { k: "l"; x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number };
export interface SpecText extends TextStyle { x: number; y: number; t: string; al?: "r" }
/** cell = 가운데 맞춤 칸(x·y 는 칸 중심) / free = 첫 줄 고정 칸(x·y 는 왼쪽 위, al r 이면 x 가 오른쪽 끝) */
export interface SpecSlot extends TextStyle { k: "cell" | "free"; x: number; y: number; w: number; h: number; al?: "l" | "r"; tpl: string; f: string[]; toneBox?: number }
export interface SpecStackItem extends TextStyle { gap: number; t?: string; tpl?: string; f?: string[] }
export interface SpecStack { x: number; y: number; w: number; h: number; items: SpecStackItem[] }
export interface SpecPage { images: SpecImage[]; shapes: SpecShape[]; texts: SpecText[]; slots: SpecSlot[]; stacks: SpecStack[]; hex?: { x: number; y: number; w: number; h: number; f: string } }
/** src: in=고객 입력 / eng=산출 엔진 / sys=발행 정보 / ai=AI 초안·감수 */
export interface SpecField { key: string; page: number; src: "in" | "eng" | "sys" | "ai"; label: string; hint: string; max: number }
export interface TemplateSpec { key: string; w: number; h: number; pages: SpecPage[]; fields: SpecField[] }

export type TemplateKey = "iching-card" | "tojeong-card" | "saju-card" | "tojeong-detail" | "saju-premium";

const SPECS: Record<TemplateKey, TemplateSpec> = {
  "iching-card": ichingCard as unknown as TemplateSpec,
  "tojeong-card": tojeongCard as unknown as TemplateSpec,
  "saju-card": sajuCard as unknown as TemplateSpec,
  "tojeong-detail": tojeongDetail as unknown as TemplateSpec,
  "saju-premium": sajuPremium as unknown as TemplateSpec,
};

/** 양식 버전 — 사양(JSON)을 다시 추출해 좌표·칸이 달라지면 올린다. 주문에 함께 저장한다. */
export const TEMPLATE_VERSION = "2027.v4-r1";

export function getSpec(key: TemplateKey): TemplateSpec {
  return SPECS[key];
}

/** 칸 값 모음 — 열쇠(in.* / eng.* / sys.* / p쪽.번호) → 글 */
export type FieldValues = Record<string, string>;

export function fieldsOf(key: TemplateKey, src?: SpecField["src"]): SpecField[] {
  const all = SPECS[key].fields;
  return src ? all.filter((f) => f.src === src) : all;
}
