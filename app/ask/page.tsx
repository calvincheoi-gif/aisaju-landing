import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AskForm from "@/components/AskForm";

export const metadata = {
  title: "무료 1문 1답 | AI사주랩.com",
  description: "질문 하나, 답은 핵심만. 최형철 소장이 24시간 안에 1~3매 Key 리포트로 답합니다 — 선착순 Daily 3명 무료.",
};

/* 홈 첫 화면 「질문 보내고 무료 답 받기」의 도착지 (2026-10-04) */
export default function AskPage() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="mb-6 text-center">
          <span className="eyebrow">FREE · 1 QUESTION</span>
          <h1 className="mt-3 text-[26px] font-black leading-snug tracking-[-0.03em] text-[#12224A]">
            질문 하나, 답은 핵심만.<br />최형철 소장이 직접 봅니다
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#64748B]">
            이직·창업·궁합·집, 뭐든 한 줄로 보내 주세요.<br />
            24시간 안에 폰으로 보는 1~3매 Key 리포트로 답합니다.
          </p>
        </div>
        <AskForm />
      </main>
      <Footer />
    </>
  );
}
