/**
 * 2027 새해운 — 주문 흐름(서버). API 라우트는 이 파일의 함수만 부른다.
 *
 *   createOrder   신청 → 산출(엔진) → 주문 저장. 무료 카드는 여기서 바로 완성한다.
 *   claimPayment  고객의 「입금 완료」 신고. 한 장 상품은 생성 대기로, 상세본은 입금 확인 대기로.
 *   generateCard  한 장 상품 자동 생성(AI 초안 1회). 한 주문에 한 번만 돈다.
 *   admin*        입금 확인·초안·저장·승인·전달 — 상세본의 감수 흐름.
 */
import { randomUUID } from "crypto";
import { getProduct, PRODUCTS, type Product } from "./catalog";
import { seasonState, startLabel } from "./season";
import { checkContent } from "./content/validate";
import { draftPartCount, priorDigest } from "./content/parts";
import { DraftError, runDraft, type DraftContext } from "./content/writer";
import { compute, InputError } from "./engines";
import { TEMPLATE_VERSION, type FieldValues } from "./render/spec";
import { beginGeneration, countByDevice, countUnconfirmedClaims, getById, getByToken, insertOrder, updateById } from "./store/server";
import type { OrderInput, OrderRow } from "./types";

export class FlowError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export { InputError };

export const REVIEWER = "최형철";
/** 「입금 완료」만으로 바로 만드는 상품(990원 한 장) */
const CLAIM_PRODUCTS = PRODUCTS.filter((x) => x.pay === "claim").map((x) => x.key as string);
/** 입금 확인 전 자동 생성 한도(최근 24시간, 미확인 건수). 넘으면 입금 확인 뒤에 만든다. 환경변수 NY_MAX_UNCONFIRMED 로 조정 */
const MAX_UNCONFIRMED_AUTO = Math.max(0, Number(process.env.NY_MAX_UNCONFIRMED ?? 60) || 0);
const kstDate = (d = new Date()) => new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10).replace(/-/g, ".");
const refNo = () => {
  const d = new Date(Date.now() + 9 * 3600_000).toISOString();
  return `NY-${d.slice(2, 4)}${d.slice(5, 7)}${d.slice(8, 10)}-${Math.floor(1000 + Math.random() * 9000)}`;
};
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** 발행 정보 칸(sys.*) — 초안 때 임시로 넣고, 승인할 때 승인일로 다시 쓴다 */
function sysFields(o: Pick<OrderRow, "ref_no">, reviewed: boolean): FieldValues {
  const today = kstDate();
  return {
    "sys.issued": today,
    "sys.reviewer": reviewed ? REVIEWER : `${REVIEWER}(감수 전)`,
    "sys.pubWho": reviewed ? `AI 초안 · 감수 ${REVIEWER} · ${today}` : `AI 초안 · 감수 전`,
    "sys.pubNo": `${o.ref_no} · ${today}`,
  };
}

function draftCtx(p: Product, o: OrderRow, brief: string, part = 0): DraftContext {
  return { product: p.key, family: p.family, brief, name: o.name ?? undefined, concern: o.input.concern, prior: priorDigest(p.key, part, o.content) };
}

export interface CreateMeta { utm?: string | null; referrer?: string | null; deviceCode?: string | null; /** 미리보기 주소(운영 도메인이 아닌 곳)에서 온 요청 — 시즌 전 시험을 허용 */ preview?: boolean }

export async function createOrder(productKey: string, raw: OrderInput, meta: CreateMeta): Promise<OrderRow> {
  const p = getProduct(productKey);
  if (!p) throw new FlowError("상품을 찾지 못했습니다.", 404);
  /* 시즌 기간에만 접수한다(lib/newyear/season.ts). 기간 밖 시험은 NY_SEASON_FORCE=1 */
  const st = seasonState();
  if (st !== "open" && process.env.NY_SEASON_FORCE !== "1" && !meta.preview)
    throw new FlowError(st === "before" ? `2027 새해운은 ${startLabel()}에 열립니다.` : "2027 새해운 시즌이 끝났습니다. 이미 받으신 결과는 그 주소에서 계속 보실 수 있습니다.", 403);
  const input: OrderInput = {
    name: clip(raw.name, 20) || undefined, contact: clip(raw.contact, 40) || undefined, gender: raw.gender === "male" || raw.gender === "female" ? raw.gender : undefined,
    birth: raw.birth ? { year: Number(raw.birth.year), month: Number(raw.birth.month), day: Number(raw.birth.day), isLunar: !!raw.birth.isLunar, isLeapMonth: !!raw.birth.isLunar && !!raw.birth.isLeapMonth } : undefined,
    /* 시각: 없음·null = 모름. 값이 왔으면 숫자로만 바꿔 두고, 범위·모양 검사는 엔진(needTime)이 한다 — 틀린 값을 「모름」으로 삼키지 않는다 */
    time: raw.time == null ? null : { hour: Number((raw.time as { hour?: unknown }).hour), minute: Number((raw.time as { minute?: unknown }).minute ?? 0) },
    place: clip(raw.place, 20) || undefined, longitude: Number.isFinite(Number(raw.longitude)) && raw.longitude ? Number(raw.longitude) : null,
    category: clip(raw.category, 12) || undefined, question: clip(raw.question, 60) || undefined, lines: raw.lines, concern: clip(raw.concern, 300) || undefined,
  };
  if (p.needs.includes("name") && !input.name) throw new InputError("이름을 적어 주세요.");
  if (p.needs.includes("contact") && !input.contact) throw new InputError("결과를 전해 드릴 연락처를 적어 주세요.");
  const device = clip(meta.deviceCode, 60) || null;
  if (p.pay === "free" && (await countByDevice(device, 24, p.key)) >= 10) throw new FlowError("오늘은 충분히 뽑으셨어요. 내일 다시 뽑아 보세요.", 429);

  const eng = compute(p.key, input);                       // 입력이 틀리면 여기서 InputError
  const id = randomUUID(), now = new Date().toISOString();
  const base: OrderRow = {
    id, created_at: now, updated_at: now, ref_no: refNo(), share_token: randomUUID(), product_key: p.key, target_year: 2027, price: p.price,
    name: input.name ?? null, contact: input.contact ?? null, payer_name: null, input, computed: { ...eng.computed, brief: eng.brief },
    content: eng.fields, content_source: eng.complete ? "bank" : null, template_version: TEMPLATE_VERSION,
    status: p.pay === "free" ? "ready" : "awaiting_payment", payment_status: p.pay === "free" ? "none" : "pending",
    paid_claimed_at: null, paid_confirmed_at: null, gen_started_at: null, gen_attempts: 0, gen_error: null,
    reviewer: null, reviewed_at: null, review_note: null, delivered_at: p.pay === "free" ? now : null, viewed_at: null, view_count: 0,
    utm: clip(meta.utm, 60) || null, referrer: clip(meta.referrer, 200) || null, device_code: device,
  };
  if (p.pay === "free" && !checkContent(p.key, eng.fields).ok) throw new FlowError("카드를 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.", 500);
  if (p.review) base.content = { ...eng.fields, ...sysFields(base, false) };
  return insertOrder(base);
}

export async function claimPayment(token: string, payerName: string): Promise<OrderRow> {
  const o = await getByToken(token);
  if (!o) throw new FlowError("신청 내역을 찾지 못했습니다.", 404);
  const p = getProduct(o.product_key)!;
  if (o.payment_status !== "pending") return o;            // 이미 신고·확인된 건은 그대로 돌려준다(두 번 눌러도 안전)
  const payer = clip(payerName, 20);
  if (!payer) throw new InputError("입금하신 분의 이름을 적어 주세요.");
  if (p.pay === "claim" && (await countByDevice(o.device_code, 24)) > 12) throw new FlowError("오늘 신청이 많아 잠시 확인이 필요합니다. 카카오톡 채널로 접수번호를 보내 주세요.", 429);
  /* 안전장치: 한 장 상품은 「입금 완료」만으로 바로 만들지만(AI 비용 발생), 입금 확인이 안 된 건이 하루 한도를 넘게 쌓이면
     자동 생성을 멈추고 「입금 확인 뒤 생성」으로 돌린다 — 입금 없이 버튼만 누르는 일이 몰려도 AI 비용이 한도 안에 머문다. */
  const auto = p.pay === "claim" && (await countUnconfirmedClaims(24, CLAIM_PRODUCTS)) < MAX_UNCONFIRMED_AUTO;
  return updateById(o.id, { payment_status: "claimed", payer_name: payer, paid_claimed_at: new Date().toISOString(), status: auto ? "queued" : "awaiting_payment" });
}

/** 한 장 상품 자동 생성. 누가 몇 번을 부르든 한 주문에 한 번만 돈다. */
export async function generateCard(token: string): Promise<OrderRow> {
  const cur = await getByToken(token);
  if (!cur) throw new FlowError("신청 내역을 찾지 못했습니다.", 404);
  const p = getProduct(cur.product_key)!;
  if (p.review || p.pay === "free") return cur;
  if (!(cur.payment_status === "claimed" || cur.payment_status === "confirmed")) throw new FlowError("입금 완료를 먼저 눌러 주세요.", 402);
  const o = await beginGeneration(token);
  if (!o) return (await getByToken(token)) ?? cur;          // 이미 만들었거나 만드는 중
  try {
    const brief = String((o.computed as { brief?: string } | null)?.brief ?? "");
    const r = await runDraft(draftCtx(p, o, brief), 0);
    const content = { ...(o.content ?? {}), ...r.values };
    const check = checkContent(p.key, content);
    if (!check.ok) throw new DraftError(`빈 칸 ${check.empty.length} · 미치환 ${check.bracket.length}`);
    return await updateById(o.id, { content, content_source: `ai:${r.via}`, status: "ready", gen_error: null, delivered_at: new Date().toISOString() });
  } catch (e) {
    return updateById(o.id, { status: "failed", gen_error: e instanceof Error ? e.message.slice(0, 300) : "오류" });
  }
}

/* ───────────── 관리자(감수) ───────────── */

async function need(id: string): Promise<{ o: OrderRow; p: Product }> {
  const o = await getById(id);
  if (!o) throw new FlowError("주문을 찾지 못했습니다.", 404);
  return { o, p: getProduct(o.product_key)! };
}

export async function adminSetPayment(id: string, to: "confirmed" | "rejected" | "refunded"): Promise<OrderRow> {
  const { o } = await need(id);
  if (to === "confirmed") {
    const status = o.status === "awaiting_payment" ? "queued" : o.status === "cancelled" ? "queued" : o.status;
    return updateById(id, { payment_status: "confirmed", paid_confirmed_at: new Date().toISOString(), status });
  }
  return updateById(id, { payment_status: to, status: "cancelled" });
}

export { draftPartCount };

/** 상세본 초안 — 한 번에 한 묶음. 관리자 화면이 묶음 수만큼 차례로 부른다(함수 26초 제한 때문). */
export async function adminDraftPart(id: string, part: number): Promise<{ order: OrderRow; missing: string[]; usage?: { input: number; output: number } }> {
  const { o, p } = await need(id);
  /* 승인해서 고객에게 열린 상세본은 AI 가 다시 쓰지 못하게 막는다 — 감수하지 않은 글이 그대로 고객에게 보이지 않도록 */
  if (p.review && o.status === "ready") throw new FlowError("이미 승인해 전달한 주문입니다. 「다시 감수로」 돌린 뒤 초안을 만드세요.", 409);
  const brief = String((o.computed as { brief?: string } | null)?.brief ?? "");
  const r = await runDraft(draftCtx(p, o, brief, part), part);
  const content = { ...(o.content ?? {}), ...r.values };
  const done = part >= draftPartCount(p.key) - 1;
  let status = o.status;
  if (p.review) status = done || o.status === "review" ? "review" : "generating";              // 상세본: 마지막 묶음까지 차면 감수 대기
  else if (done && o.status !== "ready" && checkContent(p.key, content).ok) status = "ready";   // 한 장: 관리자가 대신 만들어 준 경우 바로 전달 가능
  const order = await updateById(id, { content, content_source: `ai:${r.via}`, status, gen_error: null, ...(status === "ready" && !o.delivered_at ? { delivered_at: new Date().toISOString() } : {}) });
  return { order, missing: r.missing, usage: r.usage };
}

export async function adminSave(id: string, values: FieldValues, note?: string): Promise<OrderRow> {
  const { o } = await need(id);
  const content = { ...(o.content ?? {}) };
  for (const [k, v] of Object.entries(values)) if (typeof v === "string") content[k] = v.slice(0, 600);
  return updateById(id, { content, ...(note !== undefined ? { review_note: note.slice(0, 500) } : {}), ...(o.status === "queued" || o.status === "failed" || o.status === "generating" ? { status: "review" as const } : {}) });
}

export async function adminApprove(id: string): Promise<OrderRow> {
  const { o, p } = await need(id);
  const content = { ...(o.content ?? {}), ...(p.review ? sysFields(o, true) : {}) };
  const check = checkContent(p.key, content);
  if (!check.ok) throw new FlowError(`아직 승인할 수 없습니다 — 빈 칸 ${check.empty.length}개, 대괄호가 남은 칸 ${check.bracket.length}개`, 409);
  if (!(o.payment_status === "confirmed" || o.payment_status === "none")) throw new FlowError("입금 확인 전입니다. 먼저 입금을 확인해 주세요.", 409);
  return updateById(id, { content, status: "ready", reviewer: REVIEWER, reviewed_at: new Date().toISOString() });
}

export async function adminSetStatus(id: string, action: "reopen" | "delivered" | "cancel" | "requeue"): Promise<OrderRow> {
  await need(id);
  if (action === "reopen") return updateById(id, { status: "review" });
  if (action === "delivered") return updateById(id, { delivered_at: new Date().toISOString() });
  if (action === "requeue") return updateById(id, { status: "queued", gen_error: null, gen_attempts: 0 });   // 시도 횟수도 되돌려야 다시 만들 수 있다
  return updateById(id, { status: "cancelled" });
}
