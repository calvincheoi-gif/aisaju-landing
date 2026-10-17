import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 게시 기록 API (2026-10-17) — /admin/posts
 *   GET    ?hours=3&days=30   게시 목록 + 게시 후 n시간 유입(post_effect)
 *   POST   { channel, title?, slug?, posted_at? }   버튼 한 번 = 한 줄
 *   DELETE { id }
 * 비밀번호는 다른 관리자 화면과 같은 ADMIN_PASSWORD (x-admin-password 헤더)
 */
function authed(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && req.headers.get("x-admin-password") === expected;
}
const CHANNELS = ["insta_card", "insta_reel", "youtube", "daangn", "kakao", "blog", "threads", "facebook", "cafe"];

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  const u = new URL(req.url);
  const hours = Math.min(24, Math.max(1, parseInt(u.searchParams.get("hours") || "3", 10) || 3));
  const days = Math.min(90, Math.max(1, parseInt(u.searchParams.get("days") || "30", 10) || 30));
  const { data, error } = await sb.rpc("post_effect", { p_hours: hours, p_days: days });
  if (error) return NextResponse.json({ error: error.message, hint: "supabase/migrations/20261017_channel_inference.sql 을 먼저 실행해 주세요." }, { status: 500 });
  return NextResponse.json({ posts: data ?? [], hours, days, channels: CHANNELS });
}

export async function POST(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  let b: { channel?: string; title?: string; slug?: string; posted_at?: string } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  const channel = String(b.channel || "").trim();
  if (!CHANNELS.includes(channel)) return NextResponse.json({ error: "채널 값이 올바르지 않습니다." }, { status: 400 });
  const row = {
    channel,
    title: b.title ? String(b.title).trim().slice(0, 120) : null,
    slug: b.slug ? String(b.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) || null : null,
    posted_at: b.posted_at && !Number.isNaN(Date.parse(b.posted_at)) ? new Date(b.posted_at).toISOString() : new Date().toISOString(),
  };
  const { data, error } = await sb.from("content_posts").insert(row).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}

export async function DELETE(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  let b: { id?: string } = {};
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (!b.id) return NextResponse.json({ error: "id 없음" }, { status: 400 });
  const { error } = await sb.from("content_posts").delete().eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
