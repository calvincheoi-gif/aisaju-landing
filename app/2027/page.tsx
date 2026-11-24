import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NyCatalog from "@/components/newyear/NyCatalog";

/**
 * 2027 새해운 — 상품 목록 (주역 무료 카드 · 토정비결/사주명리 한 장 990원 · 상세본 2종)
 * 추적 링크(?utm=…)가 붙어도 원본 주소는 /2027 하나로 본다.
 */
export const metadata = {
  title: "2027 정미년 새해운 | AI사주랩.com",
  description: "주역 새해 방향 카드는 무료, 토정비결·사주명리 한 장 요약은 990원. 폰 배경화면으로 쓰는 2027 丁未年 새해운 — 상세 리포트는 소장 감수 후 전달합니다.",
  alternates: { canonical: "/2027" },
};

export default function NewYearPage() {
  return (
    <>
      <Header />
      <main className="bg-[#EEF3FB]"><NyCatalog /></main>
      <Footer />
    </>
  );
}
