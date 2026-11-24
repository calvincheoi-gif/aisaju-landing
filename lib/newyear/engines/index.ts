/**
 * 2027 새해운 — 상품 → 산출 엔진 연결.
 *
 * 산출(구조화된 값)과 해석(문장)을 나눈다. 여기서는 산출만 한다:
 *   compute(상품, 입력) → { computed: 원자료, fields: 양식의 칸(in.* · eng.* · sys.*), brief: AI 초안에 줄 산출 요약 }
 * 같은 사람의 한 장 요약과 상세본은 같은 엔진·같은 기준을 쓰므로 산출값이 서로 다를 수 없다.
 */
import type { ProductKey } from "../catalog";
import type { OrderInput } from "../types";
import { computeIching, ichingFields, validLines } from "./iching";
import { computeSaju, sajuBrief, sajuFields, type SajuBirth } from "./saju2027";
import { computeTojeong, tojeongBrief, tojeongFields } from "./tojeong";

export interface EngineResult {
  computed: Record<string, unknown>;
  fields: Record<string, string>;
  brief: string;
  /** 문장까지 엔진이 다 채웠는가 (주역 카드: 문구 은행으로 완성) */
  complete: boolean;
}

export class InputError extends Error {}

function needBirth(input: OrderInput) {
  const b = input.birth;
  if (!b || !b.year || !b.month || !b.day) throw new InputError("생년월일을 입력해 주세요.");
  if (b.year < 1920 || b.year > 2026 || b.month < 1 || b.month > 12 || b.day < 1 || b.day > 31) throw new InputError("생년월일을 다시 확인해 주세요.");
  return b;
}

/** 태어난 시각 — null·없음은 「모름」. 값이 왔는데 모양이 틀리면 조용히 「모름」으로 넘기지 않고 돌려보낸다(시주가 통째로 빠지기 때문). */
function needTime(input: OrderInput): { hour: number; minute: number } | null {
  const t = input.time as { hour?: unknown; minute?: unknown } | null | undefined;
  if (t === null || t === undefined) return null;
  const h = t.hour, m = t.minute;
  if (typeof h !== "number" || typeof m !== "number" || !Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) throw new InputError("태어난 시각을 다시 확인해 주세요.");
  return { hour: h, minute: m };
}

export function compute(product: ProductKey, input: OrderInput): EngineResult {
  try {
    if (product === "iching-card") {
      const question = (input.question ?? "").trim();
      if (!question) throw new InputError("질문을 골라 주시거나 직접 적어 주세요.");
      if (question.length > 40) throw new InputError("질문은 40자 이내로 적어 주세요.");
      if (!validLines(input.lines)) throw new InputError("괘를 먼저 뽑아 주세요.");
      const ii = { category: input.category ?? "year", question, lines: input.lines };
      const c = computeIching(ii);
      return { computed: c as unknown as Record<string, unknown>, fields: ichingFields(c, ii), brief: "", complete: true };
    }
    if (product === "tojeong-card" || product === "tojeong-detail") {
      const b = needBirth(input);
      const c = computeTojeong(b);
      const fields: Record<string, string> = product === "tojeong-detail" ? { ...tojeongFields(c), "in.name": (input.name ?? "").trim() } : {};
      return { computed: c as unknown as Record<string, unknown>, fields, brief: tojeongBrief(c), complete: false };
    }
    const b = needBirth(input);
    if (input.gender !== "female" && input.gender !== "male") throw new InputError("성별을 골라 주세요.");
    const time = needTime(input);
    /* 경도는 한반도 범위(124~132°)일 때만 받는다 — 그 밖의 값은 버리고 기본 경도를 쓴다 */
    const lon = typeof input.longitude === "number" && Number.isFinite(input.longitude) && input.longitude >= 124 && input.longitude <= 132 ? input.longitude : null;
    const birth: SajuBirth = {
      ...b, gender: input.gender, timeUnknown: !time, hour: time?.hour ?? null, minute: time?.minute ?? null,
      place: input.place || null, longitude: lon,
    };
    const c = computeSaju(birth);
    const all = sajuFields(c, birth);
    const fields: Record<string, string> = product === "saju-card" ? { "eng.ilgan": all["eng.ilgan"], "eng.season": all["eng.season"] } : { ...all, "in.name": (input.name ?? "").trim() };
    return { computed: c as unknown as Record<string, unknown>, fields, brief: sajuBrief(c), complete: false };
  } catch (e) {
    if (e instanceof InputError) throw e;
    throw new InputError(`날짜를 계산하지 못했습니다. 생년월일(양력·음력·윤달)을 다시 확인해 주세요. (${e instanceof Error ? e.message : "오류"})`);
  }
}
