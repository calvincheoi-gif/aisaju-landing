import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import ConsultWizard from "@/components/ConsultWizard";

export const metadata = {
  title: "상담 신청 | AI사주 Lab",
  description: "고객 유형과 신청 방식을 선택해 나에게 맞는 상담을 신청하세요.",
};

export default function ConsultPage() {
  return (
    <>
      <Header />
      <main className="section">
        <PageIntro section="consultPage" />
        <ConsultWizard />
      </main>
      <Footer />
    </>
  );
}
