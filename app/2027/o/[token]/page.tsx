import type { Metadata } from "next";
import Header from "@/components/Header";
import NyOrderView from "@/components/newyear/NyOrderView";
import { OG_IMAGES } from "@/lib/og";

/**
 * 2027 새해운 — 주문 한 건 (진행 상황 · 결제 안내 · 결과 저장)
 * 주소의 토큰은 추측할 수 없는 값이며, 이 주소가 곧 본인 확인이다. 검색엔진에는 노출하지 않는다.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "나의 2027 새해운 | AI사주랩.com",
  robots: { index: false, follow: false },
  openGraph: { title: "2027 정미년, 내 새해운 1장 | AI사주랩.com", description: "주역 새해 방향 카드는 무료 · 설 연휴(2/9)까지", type: "website", images: OG_IMAGES },
};

export default function NewYearOrderPage({ params }: { params: { token: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#EEF3FB]"><NyOrderView token={params.token} /></main>
    </>
  );
}
