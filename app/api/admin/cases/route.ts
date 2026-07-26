import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

const BUCKET = "case-studies";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // 비밀번호 미설정 시 항상 거부(안전 기본값)
  return provided === expected;
}

/** 관리자용: 모든 상담 사례 목록 (비공개 포함) */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 관리자 설정이 완료되지 않았습니다 (SUPABASE_SERVICE_ROLE_KEY 확인 필요)." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cases: data });
}

/** 관리자용: 새 상담 사례 업로드 (PDF 필수, 썸네일 이미지 선택) */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const password = form.get("password");
  if (!checkPassword(typeof password === "string" ? password : null)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const title = form.get("title");
  const subtitle = form.get("subtitle");
  const description = form.get("description");
  const displayOrder = form.get("displayOrder");
  const pdfFile = form.get("pdf");
  const thumbFile = form.get("thumbnail");

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (!(pdfFile instanceof File) || pdfFile.size === 0) {
    return NextResponse.json({ error: "PDF 파일을 첨부해 주세요." }, { status: 400 });
  }
  if (pdfFile.type && pdfFile.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 관리자 설정이 완료되지 않았습니다 (SUPABASE_SERVICE_ROLE_KEY 확인 필요)." },
      { status: 503 }
    );
  }

  const id = crypto.randomUUID();
  const pdfPath = `pdfs/${id}.pdf`;

  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  const { error: pdfUploadError } = await supabase.storage
    .from(BUCKET)
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: false });

  if (pdfUploadError) {
    return NextResponse.json(
      { error: `PDF 업로드 실패: ${pdfUploadError.message}` },
      { status: 500 }
    );
  }

  let thumbnailPath: string | null = null;
  if (thumbFile instanceof File && thumbFile.size > 0) {
    const ext = thumbFile.type === "image/png" ? "png" : "jpg";
    thumbnailPath = `thumbs/${id}.${ext}`;
    const thumbBuffer = Buffer.from(await thumbFile.arrayBuffer());
    const { error: thumbUploadError } = await supabase.storage
      .from(BUCKET)
      .upload(thumbnailPath, thumbBuffer, {
        contentType: thumbFile.type || "image/jpeg",
        upsert: false,
      });
    if (thumbUploadError) {
      // 썸네일 실패는 치명적이지 않으므로 무시하고 계속 진행합니다.
      thumbnailPath = null;
    }
  }

  const { data, error: insertError } = await supabase
    .from("case_studies")
    .insert({
      id,
      title: title.trim(),
      subtitle: typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : null,
      description:
        typeof description === "string" && description.trim() ? description.trim() : null,
      pdf_path: pdfPath,
      thumbnail_path: thumbnailPath,
      display_order:
        typeof displayOrder === "string" && displayOrder.trim() ? Number(displayOrder) : 0,
      published: true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: `저장 중 오류가 발생했습니다: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ case: data });
}

