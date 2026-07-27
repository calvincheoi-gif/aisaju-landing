import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import ReportForm from "@/components/ReportForm";

export const metadata = {
  title: "AI 명리 리포트 | AI사주 Lab",
  description: "생년월일시를 입력하면 AI가 사주 데이터를 분석해 리포트를 만들어 드립니다.",
};

export default function ReportPage() {
  return (
    <>
      <Header />
      <main className="section">
        <PageIntro section="reportPage" />
        <ReportForm />
      </main>
      <Footer />
    </>
  );
}
