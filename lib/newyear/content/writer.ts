/**
 * 2027 새해운 — 해석 문구 초안 작성기 (AI).
 *
 * 엔진이 확정한 산출값(brief)과 「채울 칸 목록」을 주고, 칸 열쇠 → 글의 JSON 을 받는다.
 * AI 호출은 사이트가 이미 쓰는 lib/ai-client.ts(Anthropic API)를 그대로 쓴다 — 호출마다 토큰 비용이 든다.
 * Netlify 함수는 26초 안에 끝나야 하므로 한 번에 한 묶음씩 부른다 — 묶음 나누기는 ./parts.ts (양식에서 저절로 계산).
 * 호출마다 22초 제한을 걸어, 늦으면 함수가 죽기 전에 「다시 시도」 오류로 돌려준다.
 *
 * 원칙(인수인계 6-2): AI는 확정된 값만 근거로 쓴다. 모르는 간지·괘·수치를 지어내지 않는다.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { getAiClient } from "@/lib/ai-client";
import type { ProductKey } from "../catalog";
import type { FieldValues, SpecField } from "../render/spec";
import { draftParts } from "./parts";
import { cleanText, fieldLabel } from "./validate";

/** AI 호출 한 번의 제한 시간 — Netlify 함수 제한(26초)보다 짧게 잡는다 */
const CALL_TIMEOUT_MS = 22_000;
/** 함수 한 번(초안 + 줄여 쓰기)에 쓸 수 있는 전체 시간 */
const TOTAL_BUDGET_MS = 23_500;

const COMMON = `당신은 「최형철 사주명리 연구소 · AI사주랩」의 2027년(丁未年) 새해운 리포트 초안 작성자입니다.
정해진 양식의 칸을 채웁니다. 반드시 지킬 것:
1. [산출값]에 적힌 간지·십성·괘·날짜만 근거로 씁니다. 적히지 않은 간지·괘·신살·수치를 지어내지 않습니다.
2. 확정형 예언을 쓰지 않습니다("반드시", "틀림없이" 금지). "~로 읽힙니다", "~가 유리해 보입니다"처럼 경향으로 씁니다.
3. 건강·투자·법률은 단정하지 않고 생활 관리와 점검 수준으로만 씁니다.
4. 생활 언어로 씁니다. 실천 항목은 당장 할 수 있는 작은 행동으로 구체적으로 씁니다("노력하세요" 같은 추상어 금지).
5. 각 칸은 적힌 글자 수(공백 포함) 이내로 씁니다. 칸 크기가 정해진 양식이라 넘치면 글이 칸 밖으로 삐져나옵니다 — 글자 수는 꼭 지킵니다. 칸의 성격에 맞는 한 덩어리 글로, 칸의 성격에 맞는 한 덩어리 글로 씁니다. 대괄호·따옴표·이모지·줄바꿈을 쓰지 않습니다.
6. 「단어 · 단어」 칸은 뜻이 서로 다른 두 낱말을 가운뎃점으로 잇습니다(예: 목표 · 분석). 한 구절을 둘로 쪼갠 것(목표 설정)은 안 됩니다. 달마다 낱말이 겹치지 않게 합니다. 「단어」 칸은 낱말 하나만 씁니다.
7. 존댓말(~합니다, ~하세요)로 씁니다. 같은 문장을 여러 칸에 되풀이하지 않습니다.
8. 설명·머리말 없이 JSON 객체 하나만 출력합니다: {"칸 열쇠": "글", …}. 요청한 열쇠를 하나도 빠뜨리지 않습니다.`;

const BY_FAMILY: Record<string, string> = {
  tojeong: `토정비결 풀이입니다. 달은 모두 음력 월입니다. 풀이의 근거는 [산출값]의 본괘·움직이는 효·변괘의 상징과 각 달 월건의 흐름입니다.
[산출값]에 괘 제목·원문이 있으면 그 뜻을 풀이의 중심으로 삼되, 원문이나 어떤 책·사이트의 문장도 옮기거나 흉내 내지 말고 현대어로 새로 씁니다.
여러 풀이에 공통된 뜻(길흉의 방향·조심할 점)만 반영합니다. 괘 이름과 숫자는 본문에 되풀이해 쓰지 않습니다.`,
  saju: `사주명리 풀이입니다. 일간과 태어난 계절을 중심으로, 2027년(丁未) 세운과 월운의 십성 관계를 생활 언어로 옮깁니다.
월 번호는 「그달에 절입하는 절기월」입니다. 한 장 요약에서는 십성·육친 용어를 드러내지 않습니다.
프리미엄에서는 전문 용어를 쓰면 바로 쉬운 말로 풀어 주고, 격국·용신·강약은 단정하지 말고 "~로 보입니다(감수 확인)" 수준으로 씁니다.`,
};

export interface DraftContext {
  product: ProductKey; family: "tojeong" | "saju" | "iching"; brief: string; name?: string; concern?: string;
  /** 앞 묶음에서 이미 쓴 내용의 간추림 (parts.ts priorDigest) */
  prior?: string;
}

export function draftFields(product: ProductKey, part: number): SpecField[] {
  return product === "iching-card" ? [] : draftParts(product)[part] ?? [];
}

/** 칸의 분량 안내 — 낱말 칸은 글자 수보다 「낱말 몇 개·각 몇 자」로 적어 주는 편이 정확하다 */
function sizeNote(f: SpecField): string {
  if (/단어.*·.*단어/.test(f.hint)) return "낱말 2개를 가운뎃점으로(각 2~3자, 예: 정리 · 준비)";
  if (/^단어/.test(f.hint)) return "낱말 하나(2~4자)";
  const lines = /한 줄/.test(f.hint) ? " · 꼭 한 줄" : /두 줄/.test(f.hint) ? " · 두 줄 이내" : "";
  return `${Math.max(4, f.max)}자 이내${lines}`;
}

export function buildPrompt(ctx: DraftContext, fields: SpecField[]): { system: string; user: string } {
  const list = fields.map((f) => `${f.key} | ${fieldLabel(f)} | ${sizeNote(f)}`).join("\n");
  const user = `[고객] ${ctx.name ? `${ctx.name}님` : "이름 없음"}${ctx.concern ? `\n[고객이 적은 고민] ${ctx.concern}` : ""}

[산출값]
${ctx.brief}
${ctx.prior ? `\n[같은 리포트의 앞쪽에서 이미 쓴 내용] 흐름과 말투를 잇되, 같은 문장과 같은 키워드를 되풀이하지 않습니다.\n${ctx.prior}\n` : ""}
[채울 칸] (열쇠 | 무엇을 쓰는 칸인지 | 글자 수)
${list}

위 칸을 모두 채운 JSON 객체 하나만 출력하세요.`;
  return { system: `${COMMON}\n\n${BY_FAMILY[ctx.family] ?? ""}`, user };
}

function pickJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as Record<string, unknown>; } catch { return null; }
}

export class DraftError extends Error {}

/** 한 묶음의 초안을 받아 온다. 요청한 칸만 골라 다듬어 돌려준다. */
export async function runDraft(ctx: DraftContext, part: number): Promise<{ values: FieldValues; missing: string[]; via: string; usage?: { input: number; output: number } }> {
  const fields = draftFields(ctx.product, part);
  if (fields.length === 0) return { values: {}, missing: [], via: "none" };
  const ai = getAiClient();
  if (!ai && process.env.NY_SAMPLE_WRITER === "1") {
    /* 개발·검증 전용: AI 키 없이 흐름을 끝까지 돌려 보기 위한 표본 문구 */
    const { sampleValues } = await import("./sample");
    const s = sampleValues(ctx.product, fields);
    return { values: s.values, missing: s.missing, via: "sample" };
  }
  if (!ai) throw new DraftError("AI 설정(ANTHROPIC_API_KEY)이 없어 초안을 만들 수 없습니다.");
  const { system, user } = buildPrompt(ctx, fields);
  const client = ai.client as Anthropic;
  const t0 = Date.now();
  let res: Anthropic.Message;
  try {
    /* 다시 시도(maxRetries)는 끈다 — SDK 가 조용히 한 번 더 부르면 함수 제한 시간을 넘긴다. 다시 부르기는 화면이 맡는다. */
    res = await client.messages.create({ model: ai.model, max_tokens: 1900, system, messages: [{ role: "user", content: user }] }, { timeout: CALL_TIMEOUT_MS, maxRetries: 0 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/timed? ?out|timeout|aborted/i.test(msg)) throw new DraftError("AI 응답이 늦어 중단했습니다. 다시 시도해 주세요.");
    throw new DraftError(`AI 호출에 실패했습니다${msg ? ` — ${msg.slice(0, 120)}` : ""}`);
  }
  const text = res.content.map((c) => ("text" in c ? c.text : "")).join("");
  if (res.stop_reason === "max_tokens") throw new DraftError("답이 길어 중간에 끊겼습니다. 다시 시도해 주세요.");
  const json = pickJson(text);
  if (!json) throw new DraftError("AI 응답을 읽지 못했습니다. 다시 시도해 주세요.");
  const values: FieldValues = {};
  const missing: string[] = [];
  for (const f of fields) {
    const v = cleanText(json[f.key]);
    if (v) values[f.key] = v; else missing.push(f.key);
  }
  const usage = res.usage ? { input: res.usage.input_tokens, output: res.usage.output_tokens } : undefined;
  /* 글자 수를 크게 넘긴 칸만 골라 한 번 더 줄여 쓰게 한다(짧은 호출). 시간이 모자라면 건너뛰고 화면의 글자 줄이기에 맡긴다 */
  const over = fields.filter((f) => values[f.key] && values[f.key].length > hardMax(f));
  const left = TOTAL_BUDGET_MS - (Date.now() - t0);
  if (over.length > 0 && left > 6_000) {
    try {
      const fixed = await tighten(client, ai.model, over, values, Math.min(9_000, left - 2_000));
      for (const f of over) { const v = fixed.values[f.key]; if (v && v.length < values[f.key].length) values[f.key] = v; }
      if (usage && fixed.usage) { usage.input += fixed.usage.input; usage.output += fixed.usage.output; }
    } catch { /* 줄이기 실패 — 원래 글을 두고 화면 맞춤(fit)에 맡긴다 */ }
  }
  return { values, missing, via: ai.via, usage };
}

/** 이 길이를 넘기면 칸에 들어가지 않는다고 본다 — 화면 맞춤(글자 72%까지 줄이기)으로 버틸 수 있는 여유를 조금 둔다 */
function hardMax(f: SpecField): number {
  return Math.ceil(f.max * 1.15) + 1;
}

/** 넘친 칸만 「뜻은 그대로, 글자 수 안으로」 다시 쓰게 하는 짧은 호출 */
async function tighten(client: Anthropic, model: string, fields: SpecField[], cur: FieldValues, timeout: number): Promise<{ values: FieldValues; usage?: { input: number; output: number } }> {
  const list = fields.map((f) => `${f.key} | ${f.max}자 이내${/한 줄/.test(f.hint) ? "(한 줄)" : ""} | 지금 ${cur[f.key].length}자: ${cur[f.key]}`).join("\n");
  const res = await client.messages.create({
    model, max_tokens: 500,
    system: "양식의 칸에 들어갈 문장을 줄입니다. 뜻과 말투(존댓말)는 그대로 두고, 적힌 글자 수(공백 포함) 이내로 다시 씁니다. 설명 없이 JSON 객체 하나만 출력합니다: {\"칸 열쇠\": \"글\"}.",
    messages: [{ role: "user", content: `[줄일 칸] (열쇠 | 글자 수 | 지금 글)\n${list}` }],
  }, { timeout, maxRetries: 0 });
  const json = pickJson(res.content.map((c) => ("text" in c ? c.text : "")).join("")) ?? {};
  const values: FieldValues = {};
  for (const f of fields) { const v = cleanText(json[f.key]); if (v) values[f.key] = v; }
  return { values, usage: res.usage ? { input: res.usage.input_tokens, output: res.usage.output_tokens } : undefined };
}
