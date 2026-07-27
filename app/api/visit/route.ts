import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

/** 현재 누적 방문 수 조회 (증가 없음) */
export async function GET() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ total: 0 });

  const { data } = await supabase.from("site_stats").select("total_visits").eq("id", 1).single();
  return NextResponse.json({ total: data?.total_visits ?? 0 });
}

/** 방문 1회 증가 후 최신 누적 수 반환 */
export async function POST() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ total: 0 });

  const { data: current } = await supabase
    .from("site_stats")
    .select("total_visits")
    .eq("id", 1)
    .single();

  const next = (current?.total_visits ?? 0) + 1;

  const { data, error } = await supabase
    .from("site_stats")
    .update({ total_visits: next })
    .eq("id", 1)
    .select("total_visits")
    .single();

  if (error) return NextResponse.json({ total: current?.total_visits ?? 0 });
  return NextResponse.json({ total: data?.total_visits ?? next });
}
