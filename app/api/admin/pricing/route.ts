import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 관리자용: 현재 가격 설정 조회 */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const { data, error } = await supabase.from("pricing_config").select("*").eq("id", 1).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}

/** 관리자용: 가격 설정 수정 (패키지/목적/옵션/할인율 전체 교체) */
export async function PATCH(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  let body: {
    memberDiscountRate?: number;
    simplePackages?: unknown;
    detailPurposes?: unknown;
    detailAddons?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.memberDiscountRate === "number") update.member_discount_rate = body.memberDiscountRate;
  if (body.simplePackages) update.simple_packages = body.simplePackages;
  if (body.detailPurposes) update.detail_purposes = body.detailPurposes;
  if (body.detailAddons) update.detail_addons = body.detailAddons;

  const { data, error } = await supabase
    .from("pricing_config")
    .update(update)
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
