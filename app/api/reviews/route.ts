import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface ReviewBody {
  name: string;
  content: string;
  rating?: number | null;
}

const NAME_MAX = 20;
const CONTENT_MIN = 10;
const CONTENT_MAX = 400;

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 후기 목록 조회 (관리자 전용 — 미승인 글 포함) */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 500 });
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

/** 후기 게시/숨김 전환 (관리자 전용) — 승인된 것만 홈에 노출된다 */
export async function PATCH(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  let body: { id?: string; is_published?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.id || typeof body.is_published !== "boolean") {
    return NextResponse.json({ error: "id 와 is_published 값이 필요합니다." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 500 });
  }
  const { error } = await supabase
    .from("reviews")
    .update({ is_published: body.is_published })
    .eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
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
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 500 });
  }
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/**
 * 후기 등록 (누구나 작성 가능).
 *
 * ⚠️ 여기서 저장되는 글은 항상 `is_published: false` 로 들어간다.
 * 소장님이 /admin/reviews 에서 확인하고 「게시」로 바꾼 것만 홈에 나온다.
 * (광고·비방 글이 홈에 바로 뜨는 것을 막기 위한 장치이므로 임의로 풀지 말 것)
 */
export async function POST(req: Request) {
  let body: ReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const content = (body.content ?? "").trim();

  if (!name || !content) {
    return NextResponse.json({ error: "이름과 후기 내용을 입력해 주세요." }, { status: 400 });
  }
  if (name.length > NAME_MAX) {
    return NextResponse.json({ error: `이름은 ${NAME_MAX}자 이내로 입력해 주세요.` }, { status: 400 });
  }
  if (content.length < CONTENT_MIN) {
    return NextResponse.json({ error: `후기는 ${CONTENT_MIN}자 이상 남겨 주세요.` }, { status: 400 });
  }
  if (content.length > CONTENT_MAX) {
    return NextResponse.json({ error: `후기는 ${CONTENT_MAX}자 이내로 입력해 주세요.` }, { status: 400 });
  }
  /* 링크가 들어간 글은 대부분 광고다. 승인 대기로 받아 두기보다 입력 단계에서 막는다. */
  if (/https?:\/\/|www\.|\.com|\.net|\.kr\b/i.test(content)) {
    return NextResponse.json({ error: "후기에는 링크를 넣을 수 없습니다." }, { status: 400 });
  }

  let rating: number | null = null;
  if (typeof body.rating === "number" && Number.isInteger(body.rating)) {
    if (body.rating >= 1 && body.rating <= 5) rating = body.rating;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "현재 후기 기능이 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("reviews").insert({
    name,
    content,
    rating,
    is_published: false,
  });

  if (error) {
    return NextResponse.json({ error: `등록 중 오류가 발생했습니다: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
