import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

interface ConsultBody {
  name: string;
  gender?: string;
  birthInfo: string;
  contact: string;
  customerType: "general" | "member";
  applicationMode: "simple" | "detail";
  packageKey?: string;
  purposes?: string[];
  addons?: string[];
  concern: string;
  estimatedPrice: number;
}

export async function POST(req: Request) {
  let body: ConsultBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.name || !body.birthInfo || !body.contact || !body.concern) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Supabase 연동 전(환경변수 미설정)에는 저장 없이 접수 확인만 반환합니다.
  if (!supabase) {
    return NextResponse.json({
      saved: false,
      message:
        "현재 DB 연동이 준비 중이라 자동 저장되지 않았습니다. 이메일로 전달된 내용을 참고해 수동으로 연락드리겠습니다.",
    });
  }

  const { data, error } = await supabase
    .from("consultations")
    .insert({
      name: body.name,
      gender: body.gender ?? null,
      birth_info: body.birthInfo,
      contact: body.contact,
      customer_type: body.customerType,
      application_mode: body.applicationMode,
      package_key: body.packageKey ?? null,
      purposes: body.purposes ?? null,
      addons: body.addons ?? null,
      concern: body.concern,
      estimated_price: body.estimatedPrice,
      status: "received",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { saved: false, error: `DB 저장 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ saved: true, id: data.id });
}
