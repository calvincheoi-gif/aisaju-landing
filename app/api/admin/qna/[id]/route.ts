import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 관리자용: 질문에 답변 등록/수정 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  let body: { reply?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (typeof body.reply !== "string" || !body.reply.trim()) {
    return NextResponse.json({ error: "답변 내용을 입력해 주세요." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("qna_posts")
    .update({ reply: body.reply.trim(), replied_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

/** 관리자용: 질문 삭제 (스팸/부적절한 글 정리) */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { error } = await supabase.from("qna_posts").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
