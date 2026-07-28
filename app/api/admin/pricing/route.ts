import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import {
  DEFAULT_SIMPLE_PACKAGES,
  DEFAULT_DETAIL_PURPOSES,
  DEFAULT_DETAIL_ADDONS,
  DEFAULT_MEMBER_DISCOUNT_RATE,
} from "@/lib/pricing";

export const runtime = "nodejs";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

/** 관리자용: 현재 가격 설정 조회. 저장된 값이 없으면 기본값을 반환합니다. */
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  const { data } = await supabase.from("pricing_config").select("*").eq("id", 1).maybeSingle();

  if (data) {
    return NextResponse.json({
      config: {
        member_discount_rate: data.member_discount_rate ?? DEFAULT_MEMBER_DISCOUNT_RATE,
        simple_packages: data.simple_packages ?? DEFAULT_SIMPLE_PACKAGES,
        detail_purposes: data.detail_purposes ?? DEFAULT_DETAIL_PURPOSES,
        detail_addons: data.detail_addons ?? DEFAULT_DETAIL_ADDONS,
      },
    });
  }

  return NextResponse.json({
    config: {
      member_discount_rate: DEFAULT_MEMBER_DISCOUNT_RATE,
      simple_packages: DEFAULT_SIMPLE_PACKAGES,
      detail_purposes: DEFAULT_DETAIL_PURPOSES,
      detail_addons: DEFAULT_DETAIL_ADDONS,
    },
  });
}

/** 관리자용: 가격 설정 저장. pricing_config에 id=1 행이 없으면 새로 만들고, 있으면 갱신합니다. */
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
    return NextResponse.json({ error: "Supabase 관리자 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  const update: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
  if (typeof body.memberDiscountRate === "number") update.member_discount_rate = body.memberDiscountRate;
  if (body.simplePackages) update.simple_packages = body.simplePackages;
  if (body.detailPurposes) update.detail_purposes = body.detailPurposes;
  if (body.detailAddons) update.detail_addons = body.detailAddons;

  // pricing_config 테이블에 id=1 행이 아직 없을 수 있으므로(최초 저장 시)
  // update 대신 upsert를 사용해 없으면 생성하고 있으면 갱신합니다.
  const { data, error } = await supabase
    .from("pricing_config")
    .upsert(update, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
