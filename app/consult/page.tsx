import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import ConsultWizard from "@/components/ConsultWizard";

/**
 * 정규 주소(canonical) — 2026-10-16
 *
 * 홍보용 추적 링크(?utm=daangn, ?utm=kakao …)는 내용이 같은데 주소만 다르다.
 * 표시가 없으면 구글이 "중복 페이지, 어느 게 원본인지 모름"으로 보고 색인을 보류한다
 * (Search Console 경고: 사용자가 선택한 표준이 없는 중복 페이지).
 * 아래 한 줄이 "원본은 이 주소"라고 알려 준다. utm 추적 자체에는 영향이 없다.
 */
export const metadata = {
  title: "상담 신청 | AI사주 Lab",
  alternates: { canonical: "/consult" },
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
