import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { LIVE_WORRIES } from "@/lib/worries/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 홈 고민 주제 롤링 관리 API (2026-10-11)
 *   GET  /api/admin/topics          전체 목록(게시 안 한 것 포함) + 연결 가능한 고민 랜딩 목록
 *   PUT  /api/admin/topics          전체를 받은 순서대로 덮어쓴다 (추가·수정·삭제·순서 한 번에)
 * 비밀번호는 다른 관리자 화면과 같은 ADMIN_PASSWORD (x-admin-password 헤더).
 * 저장하면 홈 캐시를 바로 갈아 끼운다.
 */

function authed(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && req.headers.get("x-admin-password") === expected;
}

type Text = { category: string; title: string };
type I18n = Partial<Record<"en" | "ja" | "zh" | "fr", Text>>;
type Row = { id?: string; sort: number; category: string; title: string; slug: string; i18n?: I18n; live: boolean };
const LANGS = ["en", "ja", "zh", "fr"] as const;

/** 번역 칸 정리 — 빈 것은 버리고 길이만 자른다 */
function cleanI18n(raw: unknown): I18n {
  const out: I18n = {};
  if (!raw || typeof raw !== "object") return out;
  for (const l of LANGS) {
    const v = (raw as Record<string, Partial<Text> | undefined>)[l];
    const category = String(v?.category ?? "").trim().slice(0, 16);
    const title = String(v?.title ?? "").trim().slice(0, 80);
    if (category || title) out[l] = { category, title };
  }
  return out;
}

const landings = () => LIVE_WORRIES.map((w) => ({ slug: w.slug, category: w.category, title: w.title }));

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  const { data, error } = await sb.from("home_topics").select("id, sort, category, title, slug, i18n, live").order("sort");
  if (error) {
    /* 테이블이 아직 없으면(마이그레이션 전) 빈 목록 + 안내 */
    return NextResponse.json({ topics: [], landings: landings(), warn: "home_topics 테이블이 없습니다. supabase/migrations/20261011_home_topics.sql 을 먼저 실행해 주세요." });
  }
  return NextResponse.json({ topics: data ?? [], landings: landings() });
}

export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });

  let body: { topics?: Row[] } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  const rows = (body.topics ?? [])
    .map((r, i) => ({
      id: r.id || undefined,
      sort: i + 1,
      category: String(r.category ?? "").trim().slice(0, 12),
      title: String(r.title ?? "").trim().slice(0, 60),
      slug: String(r.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60),
      i18n: cleanI18n(r.i18n),
      live: !!r.live,
    }))
    .filter((r) => r.category && r.title && r.slug);

  /* 받은 목록이 전부 — 없는 id 는 지우고, 있는 건 고치고, 새 건 넣는다 */
  const { data: cur } = await sb.from("home_topics").select("id");
  const keep = new Set(rows.map((r) => r.id).filter(Boolean) as string[]);
  const del = (cur ?? []).map((c) => c.id as string).filter((id) => !keep.has(id));
  if (del.length) await sb.from("home_topics").delete().in("id", del);

  const now = new Date().toISOString();
  for (const r of rows) {
    if (r.id) {
      const { error } = await sb.from("home_topics").update({ sort: r.sort, category: r.category, title: r.title, slug: r.slug, i18n: r.i18n, live: r.live, updated_at: now }).eq("id", r.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await sb.from("home_topics").insert({ sort: r.sort, category: r.category, title: r.title, slug: r.slug, i18n: r.i18n, live: r.live });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  try { revalidatePath("/"); } catch { /* 늦어도 5분 뒤 반영 */ }
  const { data } = await sb.from("home_topics").select("id, sort, category, title, slug, i18n, live").order("sort");
  return NextResponse.json({ ok: true, topics: data ?? [] });
}
