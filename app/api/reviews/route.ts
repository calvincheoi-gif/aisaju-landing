import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface ReviewBody {
  name: string;
  content: string;
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
