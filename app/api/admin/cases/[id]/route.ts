import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const BUCKET = "case-studies";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 관리자용: 상담 사례 삭제 (PDF/썸네일 파일도 함께 삭제) */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 관리자 설정이 완료되지 않았습니다." },
      { status: 503 }
    );
  }

  const { data: existing } = await supabase
    .from("case_studies")
    .select("pdf_path, thumbnail_path")
    .eq("id", params.id)
    .single();

  const { error: deleteError } = await supabase
    .from("case_studies")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (existing) {
    const paths = [existing.pdf_path, existing.thumbnail_path].filter(
      (p): p is string => !!p
    );
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }

  return NextResponse.json({ ok: true });
}

/** 관리자용: 공개/비공개 전환, 순서 변경 등 부분 수정 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  let body: { published?: boolean; display_order?: number; title?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 관리자 설정이 완료되지 않았습니다." },
      { status: 503 }
    );
  }

  const update: Record<string, unknown> = {};
  if (typeof body.published === "boolean") update.published = body.published;
  if (typeof body.display_order === "number") update.display_order = body.display_order;
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string") update.description = body.description;

  const { data, error } = await supabase
    .from("case_studies")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ case: data });
}

