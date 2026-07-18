import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
        <div className="mb-10 text-center">
          <span className="eyebrow">AI 명리 리포트</span>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">
            정보를 입력하면 AI가 사주를 분석합니다
          </h1>
          <p className="mt-3 text-[15px] text-body">
            KASI 만세력 기준으로 정밀하게 계산한 사주 데이터를 바탕으로 AI가 리포트를 작성합니다.
          </p>
        </div>
        <ReportForm />
      </main>
      <Footer />
    </>
  );
}
