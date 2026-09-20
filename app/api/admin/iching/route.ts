import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { addDays, kstDate, selectDailyIching, SELECTION_NOTICE } from "@/lib/iching";

/**
 * 「오늘의 주역 한 줄」 관리 API — 관리자 화면 /admin/iching 이 부른다.
 *   GET   ?from=YYYY-MM-DD&days=7   엔진 선정 결과 + DB 행을 날짜별로 합쳐 반환
 *   POST  { action:"skeleton", from, days }   엔진 값으로 뼈대 행(draft) 생성 — 이미 있는 날은 건드리지 않음
 *   PATCH { date, ...문장, status, review_note }   문장 수정·승인·숨김
 * 모두 헤더 x-admin-password 필요. 쓰기는 service_role 로만 가능(RLS).
 */
export const dynamic = "force-dynamic";

const TEXT_FIELDS = ["energy_text", "hexagram_text", "line_text", "action_text", "question_text", "review_note"] as const;
const OHAENG_KEYS = ["木", "火", "土", "金", "水"] as const;
const STATUSES = ["draft", "approved", "hidden"] as const;

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

function isISODate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function clampDays(n: unknown, def: number) {
  const v = Number(n ?? def);
  return Math.min(Math.max(Number.isFinite(v) ? v : def, 1), 62);
}

function guard(req: Request) {
  if (!checkPassword(req.headers.get("x-admin-password"))) {
    return { error: NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 }) };
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "서버에 Supabase 관리자 키가 없습니다." }, { status: 500 }) };
  }
  return { supabase };
}

function engineRow(date: string) {
  const s = selectDailyIching(date);
  return {
    date: s.date,
    day_ganji: s.dayGanji,
    month_ganji: s.monthGanji,
    is_jeolip: s.isJeolip,
    hexagram_no: s.hexagram.no,
    line_pos: s.line.pos,
    energy_state: s.energyState,
    engine_version: s.engineVersion,
  };
}

export async function GET(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? kstDate(0);
  if (!isISODate(from)) return NextResponse.json({ error: "from 은 YYYY-MM-DD" }, { status: 400 });
  const days = clampDays(url.searchParams.get("days"), 7);
  const to = addDays(from, days - 1);

  const { data, error } = await g.supabase
    .from("daily_iching")
    .select("*")
    .gte("date", from)
    .lte("date", to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const byDate = new Map((data ?? []).map((r: { date: string }) => [r.date, r]));

  try {
    const items = Array.from({ length: days }, (_, i) => {
      const date = addDays(from, i);
      const s = selectDailyIching(date);
      const row = (byDate.get(date) ?? null) as Record<string, unknown> | null;
      return {
        date,
        selection: {
          dayGanji: s.dayGanji,
          monthGanji: s.monthGanji,
          isJeolip: s.isJeolip,
          energyState: s.energyState,
          tone: s.tone,
          reason: s.reason,
          engineVersion: s.engineVersion,
          hexagram: {
            no: s.hexagram.no,
            hanja: s.hexagram.hanja,
            ko: s.hexagram.ko,
            full_ko: s.hexagram.full_ko,
            full_hanja: s.hexagram.full_hanja,
            upper: s.hexagram.upper,
            lower: s.hexagram.lower,
            bits: s.hexagram.bits,
            meaning: s.hexagram.meaning,
            action_kw: s.hexagram.action_kw,
            judgment_classic: s.hexagram.judgment_classic,
          },
          line: s.line,
        },
        row,
        /* DB에 저장된 괘·효가 지금 엔진 결과와 다르면 경고(규칙 개정 후 확인용) */
        mismatch: row ? row.hexagram_no !== s.hexagram.no || row.line_pos !== s.line.pos : false,
      };
    });
    return NextResponse.json({ notice: SELECTION_NOTICE, items });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const body = (await req.json().catch(() => ({}))) as { action?: string; from?: string; days?: number };
  if (body.action !== "skeleton") return NextResponse.json({ error: "알 수 없는 요청" }, { status: 400 });
  const from = body.from ?? kstDate(0);
  if (!isISODate(from)) return NextResponse.json({ error: "from 은 YYYY-MM-DD" }, { status: 400 });
  const days = clampDays(body.days, 30);

  let rows;
  try {
    rows = Array.from({ length: days }, (_, i) => engineRow(addDays(from, i)));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  /* 이미 있는 날짜(문장·승인 상태 포함)는 그대로 둔다 */
  const { data, error } = await g.supabase
    .from("daily_iching")
    .upsert(rows, { onConflict: "date", ignoreDuplicates: true })
    .select("date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ created: data?.length ?? 0, requested: days });
}

export async function PATCH(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const date = body.date;
  if (!isISODate(date)) return NextResponse.json({ error: "date 는 YYYY-MM-DD" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  for (const k of TEXT_FIELDS) {
    if (k in body) {
      const v = body[k];
      patch[k] = typeof v === "string" && v.trim() ? v.trim() : null;
    }
  }
  if ("ohaeng_tips" in body) {
    const src = (body.ohaeng_tips ?? {}) as Record<string, unknown>;
    const tips: Record<string, string> = {};
    for (const k of OHAENG_KEYS) {
      const v = src[k];
      if (typeof v === "string" && v.trim()) tips[k] = v.trim();
    }
    patch.ohaeng_tips = Object.keys(tips).length ? tips : null;
  }
  if ("status" in body) {
    const st = body.status;
    if (!STATUSES.includes(st as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: "status 값 오류" }, { status: 400 });
    }
    patch.status = st;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "바꿀 내용이 없습니다." }, { status: 400 });

  /* 승인 전 최소 요건: 행동 지침(⑤)이 비어 있으면 승인하지 않는다 */
  if (patch.status === "approved") {
    const { data: cur } = await g.supabase.from("daily_iching").select("action_text").eq("date", date).maybeSingle();
    const action = "action_text" in patch ? patch.action_text : cur?.action_text;
    if (!action) return NextResponse.json({ error: "행동 지침(⑤)을 채운 뒤 승인할 수 있습니다." }, { status: 400 });
  }

  const { data, error } = await g.supabase.from("daily_iching").update(patch).eq("date", date).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "그 날짜의 행이 없습니다. 먼저 뼈대를 만드세요." }, { status: 404 });
  revalidatePath("/");
  return NextResponse.json({ row: data });
}
