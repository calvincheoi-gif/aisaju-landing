import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 관리자용: 전체 질문 목록 */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("qna_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}
