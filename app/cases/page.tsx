import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import CasesGrid from "@/components/CasesGrid";
import { getPublishedCaseStudies } from "@/lib/case-studies";

export const metadata = {
  title: "상담 사례 | AI사주 Lab",
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
