import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { LIVE_WORRIES } from "@/lib/worries/data";
import { TOPIC_SELECT, normalizeTopic, type HomeTopic } from "@/lib/home-topics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 홈 고민 주제 롤링 관리 API (2026-10-11, v3 2026-11-05)
 *   GET  /api/admin/topics          전체 목록(게시 안 한 것 포함) + 연결 가능한 고민 랜딩 목록
 *   PUT  /api/admin/topics          전체를 받은 순서대로 덮어쓴다 (추가·수정·삭제·순서 한 번에)
 * v3 컬럼: grp·link_type·ask_prefill·weight·time_slot·tone (lib/home-topics/types.ts). v3 SQL 전이면 v2 컬럼만 저장하고 안내한다.
 * 비밀번호는 다른 관리자 화면과 같은 ADMIN_PASSWORD (x-admin-password 헤더). 저장하면 홈 캐시를 바로 갈아 끼운다.
 */

function authed(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && req.headers.get("x-admin-password") === expected;
}

type Text = { category: string; title: string };
type I18n = Partial<Record<"en" | "ja" | "zh" | "fr", Text>>;
const LANGS = ["en", "ja", "zh", "fr"] as const;
const V2_SELECT = "id, sort, category, title, slug, i18n, live";
const V3_WARN = "v3 컬럼(grp·link_type 등)이 아직 없습니다. supabase/migrations/20261105_home_topics_v3.sql 을 실행하면 축·연결 방식·시간대 설정이 저장됩니다.";

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

const landings = () => LIVE_WORRIES.map((w) => ({ slug: w.slug, category: w.category, title: w.title, askPrefill: w.askPrefill }));

/** 목록 읽기 — v3 컬럼이 없으면 v2 로 읽고 v3: false */
async function readAll(sb: NonNullable<ReturnType<typeof getSupabaseAdminClient>>) {
  const r3 = await sb.from("home_topics").select(TOPIC_SELECT).order("sort");
  if (!r3.error) return { v3: true, rows: (r3.data ?? []).map((r) => normalizeTopic(r as HomeTopic)), error: null };
  const r2 = await sb.from("home_topics").select(V2_SELECT).order("sort");
  if (!r2.error) return { v3: false, rows: (r2.data ?? []).map((r) => normalizeTopic(r as HomeTopic)), error: null };
  return { v3: false, rows: [] as HomeTopic[], error: r2.error };
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });
  const { v3, rows, error } = await readAll(sb);
  if (error) {
    /* 테이블이 아직 없으면(마이그레이션 전) 빈 목록 + 안내 */
    return NextResponse.json({ topics: [], landings: landings(), v3: false, warn: "home_topics 테이블이 없습니다. supabase/migrations/20261011_home_topics.sql → 20261105_home_topics_v3.sql 순서로 실행해 주세요." });
  }
  return NextResponse.json({ topics: rows, landings: landings(), v3, warn: v3 ? null : V3_WARN });
}

export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const sb = getSupabaseAdminClient();
  if (!sb) return NextResponse.json({ error: "Supabase 관리자 설정이 없습니다." }, { status: 503 });

  let body: { topics?: Partial<HomeTopic>[] } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  const rows = (body.topics ?? [])
    .map((r, i) => normalizeTopic({
      id: r.id || undefined,
      sort: i + 1,
      category: String(r.category ?? "").trim().slice(0, 12),
      title: String(r.title ?? "").trim().slice(0, 60),
      slug: String(r.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60),
      i18n: cleanI18n(r.i18n),
      live: !!r.live,
      grp: String(r.grp ?? "").trim().slice(0, 8),
      link_type: r.link_type,
      ask_prefill: r.link_type === "ask" ? String(r.ask_prefill ?? "").trim().slice(0, 300) || null : null,
      weight: r.weight,
      time_slot: r.time_slot,
      tone: r.tone,
    }))
    .filter((r) => r.category && r.title && r.slug);

  const { v3, error: readErr } = await readAll(sb);
  if (readErr) return NextResponse.json({ error: "home_topics 테이블이 없습니다. SQL 을 먼저 실행해 주세요." }, { status: 503 });

  /* 받은 목록이 전부 — 없는 id 는 지우고, 있는 건 고치고, 새 건 넣는다 */
  const { data: cur } = await sb.from("home_topics").select("id");
  const keep = new Set(rows.map((r) => r.id).filter(Boolean) as string[]);
  const del = (cur ?? []).map((c) => c.id as string).filter((id) => !keep.has(id));
  if (del.length) await sb.from("home_topics").delete().in("id", del);

  const now = new Date().toISOString();
  for (const r of rows) {
    const base = { sort: r.sort, category: r.category, title: r.title, slug: r.slug, i18n: r.i18n, live: !!r.live };
    const v3cols = v3 ? { grp: r.grp, link_type: r.link_type, ask_prefill: r.ask_prefill, weight: r.weight, time_slot: r.time_slot, tone: r.tone } : {};
    if (r.id) {
      const { error } = await sb.from("home_topics").update({ ...base, ...v3cols, updated_at: now }).eq("id", r.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await sb.from("home_topics").insert({ ...base, ...v3cols });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  try { revalidatePath("/"); } catch { /* 늦어도 5분 뒤 반영 */ }
  const after = await readAll(sb);
  return NextResponse.json({ ok: true, topics: after.rows, v3, warn: v3 ? null : V3_WARN });
}
