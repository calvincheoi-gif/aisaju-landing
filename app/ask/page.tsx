import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AskForm from "@/components/AskForm";

/**
 * 정규 주소(canonical) — 2026-10-16
 *
 * 홍보용 추적 링크(?utm=daangn, ?utm=kakao …)는 내용이 같은데 주소만 다르다.
 * 표시가 없으면 구글이 "중복 페이지, 어느 게 원본인지 모름"으로 보고 색인을 보류한다
 * (Search Console 경고: 사용자가 선택한 표준이 없는 중복 페이지).
 * 아래 한 줄이 "원본은 이 주소"라고 알려 준다. utm 추적 자체에는 영향이 없다.
 */
export const metadata = {
  title: "무료 1문 1답 | AI사주랩.com",
  alternates: { canonical: "/ask" },
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
