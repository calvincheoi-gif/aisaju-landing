import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { handlePayNotice } from "@/lib/newyear/service";

/**
 * 송금 알림 받기 — 소장님 폰의 알림 전달 앱(MacroDroid 등)이 부른다.
 *   POST /api/newyear/pay-notice   헤더 x-pay-secret: <NY_PAY_WEBHOOK_SECRET>
 *   본문(JSON) { "text": "<알림 제목 + 내용>", "at": "<알림 시각(선택)>" }  — 또는 text/plain 본문
 * 비밀값이 서버에 설정되지 않았으면 아무 것도 하지 않는다(503).
 */
export const dynamic = "force-dynamic";

function okSecret(got: string | null): boolean {
  const want = process.env.NY_PAY_WEBHOOK_SECRET ?? "";
  if (!want || !got) return false;
  const a = Buffer.from(got), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!process.env.NY_PAY_WEBHOOK_SECRET) return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  const url = new URL(req.url);
  if (!okSecret(req.headers.get("x-pay-secret") ?? url.searchParams.get("k"))) return NextResponse.json({ ok: false }, { status: 401 });
  let text = "", at: string | undefined;
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("json")) { const j = await req.json(); text = [j.title, j.text].filter(Boolean).join(" "); at = j.at ? String(j.at) : undefined; }
    else text = await req.text();
  } catch { return NextResponse.json({ ok: false, error: "bad body" }, { status: 400 }); }
  try {
    const r = await handlePayNotice(text, at);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
