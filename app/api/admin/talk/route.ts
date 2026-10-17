import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase";

/**
 * 「오늘 한 줄」 관리 API (2026-10-17) — 비밀번호는 다른 관리자 화면과 같은 ADMIN_PASSWORD (x-admin-password)
 *   GET    /api/admin/talk?status=held|ok|hidden|all&limit=100   → { posts, counts:{held,ok,hidden}, filters }
 *   PATCH  /api/admin/talk  { id, status:'ok'|'hidden', note? }   승인 / 숨김 (어느 상태에서든)
 *   DELETE /api/admin/talk  { id }                                완전 삭제
 *   PUT    /api/admin/talk  { filter:{kind,pattern,note} }        필터 추가   (kind = abuse·ad·pii)
 *   DELETE /api/admin/talk  { filterId }                          필터 삭제
 * 승인·숨김·삭제 뒤에는 홈 캐시를 바로 갈아 끼운다.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && req.headers.get("x-admin-password") === expected;
}
const KINDS = ["abuse", "ad", "pii"] as const;

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  const u = new URL(req.url);
  const status = u.searchParams.get("status") || "held";
  const limit = Math.min(300, Math.max(1, parseInt(u.searchParams.get("limit") || "100", 10) || 100));

  let q = sb.from("talk_posts").select("id, created_at, text, nick, status, reason, device_code, utm, app, admin_note").order("created_at", { ascending: false }).limit(limit);
  if (status !== "all") q = q.eq("status", status);
  const { data: posts, error } = await q;
  if (error) return NextResponse.json({ error: error.message, hint: "talk_posts 테이블이 없으면 supabase/migrations/20261017c_talk.sql 을 먼저 실행해 주세요." }, { status: 500 });

  const counts: Record<string, number> = { held: 0, ok: 0, hidden: 0 };
  for (const s of Object.keys(counts)) {
    const { count } = await sb.from("talk_posts").select("id", { count: "exact", head: true }).eq("status", s);
    counts[s] = count ?? 0;
  }
  const { data: filters } = await sb.from("talk_filters").select("id, kind, pattern, note, created_at").order("kind").order("created_at");
  return NextResponse.json({ posts: posts ?? [], counts, filters: filters ?? [] });
}

export async function PATCH(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  let b: { id?: string; status?: string; note?: string | null } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (!b.id || !["ok", "hidden"].includes(String(b.status))) return NextResponse.json({ error: "id 와 status(ok|hidden)가 필요합니다." }, { status: 400 });
  const patch: Record<string, unknown> = { status: b.status };
  if (b.note !== undefined) patch.admin_note = b.note ? String(b.note).slice(0, 200) : null;
  const { error } = await sb.from("talk_posts").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/"); revalidatePath("/talk");
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  let b: { filter?: { kind?: string; pattern?: string; note?: string } } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  const kind = String(b.filter?.kind || "");
  const pattern = String(b.filter?.pattern || "").trim().slice(0, 200);
  if (!(KINDS as readonly string[]).includes(kind) || !pattern) return NextResponse.json({ error: "종류(abuse·ad·pii)와 패턴이 필요합니다." }, { status: 400 });
  try { new RegExp(pattern, "i"); } catch { return NextResponse.json({ error: "정규식이 올바르지 않습니다. 단어 하나면 그냥 단어만 넣어도 됩니다." }, { status: 400 }); }
  const { data, error } = await sb.from("talk_filters").insert({ kind, pattern, note: b.filter?.note ? String(b.filter.note).slice(0, 80) : null }).select("id, kind, pattern, note, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, filter: data });
}

export async function DELETE(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  let b: { id?: string; filterId?: string } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (b.filterId) {
    const { error } = await sb.from("talk_filters").delete().eq("id", b.filterId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (!b.id) return NextResponse.json({ error: "id 가 필요합니다." }, { status: 400 });
  const { error } = await sb.from("talk_posts").delete().eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/"); revalidatePath("/talk");
  return NextResponse.json({ ok: true });
}
