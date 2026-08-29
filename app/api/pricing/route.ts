import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  DEFAULT_SIMPLE_PACKAGES,
  DEFAULT_DETAIL_PURPOSES,
  DEFAULT_DETAIL_ADDONS,
  DEFAULT_MEMBER_DISCOUNT_RATE,
} from "@/lib/pricing";

export const runtime = "nodejs";

/* 이 선언이 없으면 Next.js 가 빌드 시점의 응답을 정적으로 구워 버린다.
   그러면 관리자가 /admin/pricing 에서 값을 바꿔도 재배포 전까지
   옛 가격이 계속 나간다 — 홈과 신청서의 금액이 어긋나는 원인이 된다.
   가격은 언제든 바뀔 수 있으므로 매 요청마다 DB 를 읽는다. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 공개 가격 조회. Supabase에 관리자가 설정한 값이 있으면 그 값을,
 * 없거나 연동 전이면 코드에 내장된 기본값을 반환합니다.
 */
export async function GET() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.from("pricing_config").select("*").eq("id", 1).single();
    if (data) {
      return NextResponse.json(
        {
          memberDiscountRate: data.member_discount_rate,
          simplePackages: data.simple_packages,
          detailPurposes: data.detail_purposes,
          detailAddons: data.detail_addons,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.json(
    {
      memberDiscountRate: DEFAULT_MEMBER_DISCOUNT_RATE,
      simplePackages: DEFAULT_SIMPLE_PACKAGES,
      detailPurposes: DEFAULT_DETAIL_PURPOSES,
      detailAddons: DEFAULT_DETAIL_ADDONS,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
