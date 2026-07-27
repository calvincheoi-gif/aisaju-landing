import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  DEFAULT_SIMPLE_PACKAGES,
  DEFAULT_DETAIL_PURPOSES,
  DEFAULT_DETAIL_ADDONS,
  DEFAULT_MEMBER_DISCOUNT_RATE,
} from "@/lib/pricing";

export const runtime = "nodejs";

/**
 * 공개 가격 조회. Supabase에 관리자가 설정한 값이 있으면 그 값을,
 * 없거나 연동 전이면 코드에 내장된 기본값을 반환합니다.
 */
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.from("pricing_config").select("*").eq("id", 1).single();
    if (data) {
      return NextResponse.json({
        memberDiscountRate: data.member_discount_rate,
        simplePackages: data.simple_packages,
        detailPurposes: data.detail_purposes,
        detailAddons: data.detail_addons,
      });
    }
  }

  return NextResponse.json({
    memberDiscountRate: DEFAULT_MEMBER_DISCOUNT_RATE,
    simplePackages: DEFAULT_SIMPLE_PACKAGES,
    detailPurposes: DEFAULT_DETAIL_PURPOSES,
    detailAddons: DEFAULT_DETAIL_ADDONS,
  });
}
