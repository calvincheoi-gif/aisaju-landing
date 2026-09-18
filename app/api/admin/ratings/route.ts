import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

/**
 * 오행 결과 평가 집계 — 관리자 「오행 결과 평가」 화면이 부른다.
 *
 * 오행 앱 결과 화면의 별점(ohaeng_rating)과 한마디(ohaeng_rating_note)는
 * 다른 계측과 같은 events 테이블에 쌓인다. 여기서 유형별로 묶어
 *   · 유형 이름 / 응답 수 / 평균 별점 / 별점 분포 / 최근 한마디
 * 를 돌려준다. 평균이 낮은 유형부터 문구를 손질하는 데 쓴다.
 */
export const dynamic = "force-dynamic";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

interface EventRow {
  name: string;
  props: Record<string, unknown> | null;
  created_at: string;
  lang: string | null;
}

export interface TypeStat {
  type: string;
  count: number;
  avg: number;
  dist: [number, number, number, number, number];
  notes: { score: number; note: string; at: string }[];
}

export async function GET(req: Request) {
  if (!checkPassword(req.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "서버에 Supabase 관리자 키가 없습니다." }, { status: 500 });
  }

  /* 최근 것부터 최대 5,000건 — 초기에는 충분하고, 늘어나면 기간 필터를 붙인다 */
  const { data, error } = await supabase
    .from("events")
    .select("name,props,created_at,lang")
    .in("name", ["ohaeng_rating", "ohaeng_rating_note"])
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as EventRow[];
  const byType = new Map<string, TypeStat>();
  const get = (t: string) => {
    let s = byType.get(t);
    if (!s) {
      s = { type: t, count: 0, avg: 0, dist: [0, 0, 0, 0, 0], notes: [] };
      byType.set(t, s);
    }
    return s;
  };

  let total = 0;
  let sum = 0;
  const allNotes: { type: string; score: number; note: string; at: string }[] = [];

  for (const r of rows) {
    const p = r.props ?? {};
    const type = String(p.type ?? "(유형 없음)");
    const score = Number(p.score ?? 0);
    if (r.name === "ohaeng_rating") {
      if (score < 1 || score > 5) continue;
      const s = get(type);
      s.count += 1;
      s.dist[score - 1] += 1;
      total += 1;
      sum += score;
    } else if (r.name === "ohaeng_rating_note") {
      const note = String(p.note ?? "").trim();
      if (!note) continue;
      const item = { score, note, at: r.created_at };
      get(type).notes.push(item);
      allNotes.push({ type, ...item });
    }
  }

  const types = [...byType.values()]
    .map((s) => {
      const weighted = s.dist.reduce((acc, n, i) => acc + n * (i + 1), 0);
      return { ...s, avg: s.count ? Math.round((weighted / s.count) * 100) / 100 : 0, notes: s.notes.slice(0, 5) };
    })
    /* 응답이 있는 것 중 평균이 낮은 순 — 손질할 순서 그대로 */
    .sort((a, b) => (a.count && b.count ? a.avg - b.avg : b.count - a.count));

  return NextResponse.json({
    total,
    avg: total ? Math.round((sum / total) * 100) / 100 : 0,
    types,
    recentNotes: allNotes.slice(0, 30),
  });
}
