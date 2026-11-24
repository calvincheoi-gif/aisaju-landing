import { NextResponse } from "next/server";
import { adminApprove, adminDraftPart, adminSave, adminSetPayment, adminSetStatus, draftPartCount, FlowError } from "@/lib/newyear/service";
import { DraftError } from "@/lib/newyear/content/writer";
import { listRecent, StoreError, storeMode } from "@/lib/newyear/store/server";

/**
 * 2027 새해운 — 관리자 API (다른 관리자 API와 같은 x-admin-password 인증)
 *   GET   /api/admin/newyear?days=30                      주문 목록
 *   POST  /api/admin/newyear {id, action:"draft", part}   AI 초안 한 묶음 (Anthropic API 비용 발생)
 *   PATCH /api/admin/newyear {id, action:"save", values, note?}
 *                            {id, action:"approve"}                       감수 승인 → 고객 열람 가능
 *                            {id, action:"payment", to:"confirmed"|"rejected"|"refunded"}
 *                            {id, action:"status", to:"reopen"|"delivered"|"cancel"|"requeue"}
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 26;

const authed = (req: Request) => !!process.env.ADMIN_PASSWORD && req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
const deny = () => NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
const fail = (e: unknown) => {
  if (e instanceof FlowError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof DraftError) return NextResponse.json({ error: e.message }, { status: 502 });
  if (e instanceof StoreError) return NextResponse.json({ error: e.message }, { status: 500 });
  return NextResponse.json({ error: e instanceof Error ? e.message : "오류" }, { status: 500 });
};

export async function GET(req: Request) {
  if (!authed(req)) return deny();
  try {
    const days = Math.min(120, Math.max(1, Number(new URL(req.url).searchParams.get("days") || 30)));
    return NextResponse.json({ rows: await listRecent(days), store: storeMode() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  if (!authed(req)) return deny();
  let b: { id?: string; action?: string; part?: number };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (b.action !== "draft" || !b.id) return NextResponse.json({ error: "지원하지 않는 요청" }, { status: 400 });
  try {
    const r = await adminDraftPart(b.id, Number(b.part || 0));
    return NextResponse.json({ order: r.order, missing: r.missing, usage: r.usage, parts: draftPartCount(r.order.product_key) });
  } catch (e) { return fail(e); }
}

export async function PATCH(req: Request) {
  if (!authed(req)) return deny();
  let b: { id?: string; action?: string; values?: Record<string, string>; note?: string; to?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (!b.id) return NextResponse.json({ error: "id 가 없습니다." }, { status: 400 });
  try {
    if (b.action === "save") return NextResponse.json({ order: await adminSave(b.id, b.values ?? {}, b.note) });
    if (b.action === "approve") return NextResponse.json({ order: await adminApprove(b.id) });
    if (b.action === "payment" && (b.to === "confirmed" || b.to === "rejected" || b.to === "refunded")) return NextResponse.json({ order: await adminSetPayment(b.id, b.to) });
    if (b.action === "status" && (b.to === "reopen" || b.to === "delivered" || b.to === "cancel" || b.to === "requeue")) return NextResponse.json({ order: await adminSetStatus(b.id, b.to) });
    return NextResponse.json({ error: "지원하지 않는 요청" }, { status: 400 });
  } catch (e) { return fail(e); }
}
