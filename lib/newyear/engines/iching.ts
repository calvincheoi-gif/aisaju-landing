/**
 * 2027 새해운 — 주역 새해 방향 카드 엔진.
 *
 * 괘를 얻는 방식: 동전 세 닢을 여섯 번 던지는 척전법(擲錢法)을 화면에서 재현한다.
 *   한 번 던질 때 앞면 3·뒷면 2로 세어 합이 6(노음)·7(소양)·8(소음)·9(노양). 아래 효부터 여섯 번.
 * 1차 버전은 **본괘만** 쓴다 — 노음·노양(변효)은 기록만 해 두고 변괘 해석은 하지 않는다. (확정 전: 소장님 확인 필요)
 * 괘 이름·상징은 「오늘의 주역 한 줄」과 같은 64괘 데이터(lib/iching)를 쓴다.
 */
import { allHexagrams } from "@/lib/iching";
import type { Hexagram } from "@/lib/iching";
import { IC_CATEGORIES, ichingBank } from "../content/iching-bank";

export const ICHING_ENGINE_VERSION = "iching-card-2027.1";

const TRIGRAM_IMG: Record<string, string> = { 乾: "하늘", 兌: "못", 離: "불", 震: "우레", 巽: "바람", 坎: "물", 艮: "산", 坤: "땅" };

export { tossLine, tossSix, validLines } from "./toss";

export interface IchingInput { category: string; question: string; lines: number[] }
export interface IchingComputed { engine: string; lines: number[]; bits: string; no: number; name: string; hanja: string; upper: string; lower: string; meaning: string; action: string; movingLines: number[] }

export function computeIching(input: IchingInput): IchingComputed {
  const bits = input.lines.map((v) => (v === 7 || v === 9 ? "1" : "0")).join("");     // 아래 → 위, 1 = 양
  const hex = allHexagrams().find((h: Hexagram) => h.bits === bits);
  if (!hex) throw new Error("괘를 찾지 못했습니다.");
  return {
    engine: ICHING_ENGINE_VERSION, lines: input.lines, bits, no: hex.no, name: hex.full_ko, hanja: hex.full_hanja,
    upper: hex.upper, lower: hex.lower, meaning: hex.meaning, action: hex.action_kw,
    movingLines: input.lines.map((v, i) => (v === 6 || v === 9 ? i + 1 : 0)).filter(Boolean),
  };
}

/**
 * 카드의 모든 칸을 채운다 — 산출 칸(eng.*)과 문구 칸(p1.*) 모두. AI를 부르지 않는다.
 * 칸 열쇠는 사양(specs/iching-card.json)의 것과 같아야 한다.
 */
export function ichingFields(c: IchingComputed, input: IchingInput): Record<string, string> {
  const bank = ichingBank(c.no);
  const cat = IC_CATEGORIES.find((x) => x.key === input.category) ?? IC_CATEGORIES[0];
  return {
    "in.question": input.question.trim(),
    "eng.hex": c.bits,
    "eng.hexName": `${c.name} ${c.hanja}`,
    "p1.3": `위 ${TRIGRAM_IMG[c.upper]} · 아래 ${TRIGRAM_IMG[c.lower]} — ${c.meaning}`,
    /* 짧은 구절(9자 이하)은 낫표 안에서 줄이 끊기지 않게 붙여 둔다 — 「열린 / 협력」처럼 갈라지지 않도록 */
    "p1.4": `${cat.lead} 「${c.action.length <= 9 ? c.action.replace(/ /g, "\u00A0") : c.action}」 쪽으로 읽힙니다.`,
    "p1.8": bank.head,
    "p1.9": bank.sum,
    /* 힘을 실을 것·잠시 멈출 것은 세 줄 목록, 첫 행동은 A/B 중 하나를 고르게 두 줄 */
    "p1.5": bank.push.map((x) => `· ${x}`).join("\n"),
    "p1.6": bank.pause.map((x) => `· ${x}`).join("\n"),
    "p1.10": `A  ${bank.acts[0]}\nB  ${bank.acts[1]}`,
  };
}
