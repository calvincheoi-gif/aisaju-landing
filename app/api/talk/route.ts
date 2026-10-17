import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getTalkList } from "@/lib/talk/server";
import { TALK_MAX_LEN, TALK_NICK_MAX } from "@/lib/talk/types";

/**
 * 「오늘 한 줄」 공개 API (2026-10-17)
 *   GET  /api/talk?offset=0&limit=30   → { items, total }         게시된 글만, 최신순 (/talk 의 「더 보기」)
 *   POST /api/talk { text, nick?, deviceCode?, utm?, app? }
 *        → { saved:true, status:'ok'|'held', reason }             ok = 바로 게시, held = 검사에 걸려 승인 대기
 *        → { saved:false, reason:'missing'|'too_long'|'limit'|'no_db'|'db' }
 * 필터 검사·하루 3개 제한·저장은 DB 함수(talk_submit)가 한 번에 처리한다 — 규칙은 SQL 한 곳에만 있다.
 * 바로 게시된 글은 홈 캐시를 즉시 갈아 끼운다(홈 롤링에 바로 보이도록).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NOSTORE = { headers: { "Cache-Control": "no-store" } };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const offset = Math.max(0, parseInt(u.searchParams.get("offset") || "0", 10) || 0);
  const limit = Math.min(50, Math.max(1, parseInt(u.searchParams.get("limit") || "30", 10) || 30));
  const r = await getTalkList(offset, limit);
  return NextResponse.json(r, NOSTORE);
}

interface Body { text?: string; nick?: string | null; deviceCode?: string | null; utm?: string | null; app?: string | null }

export async function POST(req: Request) {
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ saved: false, reason: "bad_request" }, { status: 400 }); }
  const text = String(body.text || "").replace(/\s+/g, " ").trim();
  if (!text) return NextResponse.json({ saved: false, reason: "missing" }, { status: 400 });
  if (text.length > TALK_MAX_LEN) return NextResponse.json({ saved: false, reason: "too_long" }, { status: 400 });
  const nick = String(body.nick || "").trim().slice(0, TALK_NICK_MAX) || null;
  const clean = (v: unknown, n: number) => (v ? String(v).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, n) || null : null);

  const sb = getSupabaseServerClient();
  if (!sb) return NextResponse.json({ saved: false, reason: "no_db" }, { status: 503 });
  const { data, error } = await sb.rpc("talk_submit", {
    p_text: text, p_nick: nick,
    p_device_code: clean(body.deviceCode, 40), p_utm: clean(body.utm, 40), p_app: clean(body.app, 20),
  });
  if (error) return NextResponse.json({ saved: false, reason: "db", detail: error.message }, { status: 500 });
  const r = data as { ok: boolean; reason?: string | null; id?: string; status?: string };
  if (!r.ok) return NextResponse.json({ saved: false, reason: r.reason || "rejected" }, { status: 409 });
  if (r.status === "ok") { revalidatePath("/"); revalidatePath("/talk"); }
  return NextResponse.json({ saved: true, id: r.id, status: r.status, reason: r.reason ?? null }, NOSTORE);
}
