import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import CasesGrid from "@/components/CasesGrid";
import { getPublishedCaseStudies } from "@/lib/case-studies";

/**
 * 정규 주소(canonical) — 2026-10-16
 *
 * 홍보용 추적 링크(?utm=daangn, ?utm=kakao …)는 내용이 같은데 주소만 다르다.
 * 표시가 없으면 구글이 "중복 페이지, 어느 게 원본인지 모름"으로 보고 색인을 보류한다
 * (Search Console 경고: 사용자가 선택한 표준이 없는 중복 페이지).
 * 아래 한 줄이 "원본은 이 주소"라고 알려 준다. utm 추적 자체에는 영향이 없다.
 */
export const metadata = {
  title: "상담 사례 | AI사주 Lab",
  alternates: { canonical: "/cases" },
  description: "최형철 사주명리 연구소가 실제로 작성한 AI 명리 리포트 상담 사례를 확인해 보세요.",
};

export const revalidate = 0;

export default async function CasesPage() {
  const cases = await getPublishedCaseStudies();

  return (
    <>
      <Header />
      <main id="cases" className="section">
        <PageIntro section="casesPage" />
        <CasesGrid cases={cases} />
      </main>
      <Footer />
    </>
  );
}
