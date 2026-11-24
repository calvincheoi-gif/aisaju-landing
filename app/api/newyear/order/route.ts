import { isProdHost } from "@/lib/newyear/season";
import { NextResponse } from "next/server";
import { createOrder, FlowError, InputError } from "@/lib/newyear/service";
import { StoreError } from "@/lib/newyear/store/server";
import { toPublic } from "@/lib/newyear/types";

/**
 * 2027 새해운 — 신청 접수
 *   POST /api/newyear/order  { product, input, utm?, referrer?, deviceCode? }
 *     → { ok:true, token, refNo, order } | { ok:false, error }
 * 산출(엔진)은 서버에서 한다 — 브라우저가 보낸 값은 입력뿐이고, 간지·괘는 여기서 계산해 저장한다.
 * 무료 주역 카드는 이 한 번의 호출로 완성된다(AI 호출 없음).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { product?: string; input?: Record<string, unknown>; utm?: string | null; referrer?: string | null; deviceCode?: string | null };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
  try {
    /* 운영 도메인(aisajulab.com)이 아니면 미리보기로 보고 시즌 전 시험 신청을 허용한다 */
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
    const preview = !isProdHost(host);
    const o = await createOrder(String(body.product || ""), (body.input ?? {}) as never, { utm: body.utm, referrer: body.referrer, deviceCode: body.deviceCode, preview });
    return NextResponse.json({ ok: true, token: o.share_token, refNo: o.ref_no, order: toPublic(o) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof InputError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    if (e instanceof FlowError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    if (e instanceof StoreError) return NextResponse.json({ ok: false, error: "지금은 신청을 저장할 수 없습니다. 잠시 뒤 다시 시도해 주세요." }, { status: 503 });
    return NextResponse.json({ ok: false, error: "신청을 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요." }, { status: 500 });
  }
}
