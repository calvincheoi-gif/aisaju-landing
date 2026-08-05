import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface ReviewBody {
  name: string;
  content: string;
}

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 후기 목록 조회 (관리자 전용, 삭제 대상 id 확인용) */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 완료되지 않았습니다." }, { status: 500 });
  }
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews: data });
}

/** 후기 삭제 (관리자 전용) */
export async function DELETE(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "삭제할 후기 id가 필요합니다." }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 설정이 완료되지 않았습니다." }, { status: 500 });
  }
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** 후기 등록 (누구나 작성 가능, anon insert 정책) */
export async function POST(req: Request) {
  let body: ReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "이름과 후기 내용을 입력해 주세요." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "현재 후기 기능이 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("reviews").insert({
    name: body.name.trim(),
    content: body.content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: `등록 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
