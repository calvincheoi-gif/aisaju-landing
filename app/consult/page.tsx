import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
        <div className="mb-10 text-center">
          <span className="eyebrow">상담 신청</span>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">
            나에게 맞는 상담을 선택하세요
          </h1>
          <p className="mt-3 text-[15px] text-body">
            고객 유형(일반/단골)과 신청 방식(간편/디테일)을 선택하면 맞춤 신청서가 열립니다.
          </p>
        </div>
        <ConsultWizard />
      </main>
      <Footer />
    </>
  );
}
