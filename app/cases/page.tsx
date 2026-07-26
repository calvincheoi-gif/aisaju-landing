import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedCaseStudies, caseStudyFileUrl } from "@/lib/case-studies";
import { siteConfig } from "@/lib/site-config";

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
        <div className="mb-10 text-center">
          <span className="eyebrow">상담 사례</span>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">
            실제 상담 리포트로 미리 만나보세요
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-body">
            {siteConfig.org}가 실제로 작성한 AI 명리 리포트 사례입니다. 리포트를 열어보고
            마음에 드는 방식으로 상담을 신청해 보세요.
          </p>
        </div>

        {cases.length === 0 ? (
          <div className="card mx-auto max-w-lg text-center text-[14px] text-body">
            아직 등록된 상담 사례가 없습니다. 곧 좋은 사례로 찾아뵙겠습니다.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => {
              const pdfUrl = caseStudyFileUrl(c.pdf_path);
              const thumbUrl = caseStudyFileUrl(c.thumbnail_path);
              return (
                <a
                  key={c.id}
                  href={pdfUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex flex-col overflow-hidden !p-0"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-600">
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/90">
                        <span className="text-[13px] font-semibold tracking-[0.08em]">
                          AI사주 Lab
                        </span>
                        <span className="text-[12px] text-white/70">PDF 리포트</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="text-[16px] font-bold leading-snug text-ink-900">
                      {c.title}
                    </h2>
                    {c.subtitle && (
                      <p className="text-[13px] font-medium text-indigo-600">{c.subtitle}</p>
                    )}
                    {c.description && (
                      <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-body">
                        {c.description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-[13px] font-semibold text-indigo-600">
                      리포트 전체보기 →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <a href="/consult" className="btn-primary">
            상담 신청
          </a>
          <a href="/report" className="btn-secondary">
            AI 리포트 보기
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

