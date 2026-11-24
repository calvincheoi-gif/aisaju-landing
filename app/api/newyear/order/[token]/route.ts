import { NextResponse } from "next/server";
import { claimPayment, FlowError, generateCard, InputError } from "@/lib/newyear/service";
import { bumpView, getByToken, StoreError } from "@/lib/newyear/store/server";
import { toPublic } from "@/lib/newyear/types";

/**
 * 2027 새해운 — 주문 한 건 (고객용, 추측할 수 없는 토큰으로만 접근)
 *   GET  /api/newyear/order/<token>                     상태 + (열람 가능할 때만) 결과
 *   POST /api/newyear/order/<token> { action:"claim", payerName }   「입금 완료」 신고
 *   POST /api/newyear/order/<token> { action:"generate" }           한 장 상품 생성 (한 주문에 한 번만 돈다)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 26;

const fail = (e: unknown) => {
  if (e instanceof InputError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  if (e instanceof FlowError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
  if (e instanceof StoreError) return NextResponse.json({ ok: false, error: "지금은 확인할 수 없습니다. 잠시 뒤 다시 시도해 주세요." }, { status: 503 });
  return NextResponse.json({ ok: false, error: "처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요." }, { status: 500 });
};

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const o = await getByToken(params.token);
    if (!o) return NextResponse.json({ ok: false, error: "신청 내역을 찾지 못했습니다." }, { status: 404 });
    if (o.status === "ready" && new URL(req.url).searchParams.get("count") === "1") void bumpView(o.id, o.view_count);
    return NextResponse.json({ ok: true, order: toPublic(o) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  let body: { action?: string; payerName?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
  try {
    if (body.action === "claim") return NextResponse.json({ ok: true, order: toPublic(await claimPayment(params.token, String(body.payerName || ""))) });
    if (body.action === "generate") return NextResponse.json({ ok: true, order: toPublic(await generateCard(params.token)) });
    return NextResponse.json({ ok: false, error: "지원하지 않는 요청입니다." }, { status: 400 });
  } catch (e) { return fail(e); }
}
