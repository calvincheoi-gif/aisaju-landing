"use client";

import { useT } from "./LanguageProvider";
import { caseStudyFileUrl, type CaseStudy } from "@/lib/case-studies";

export default function CasesGrid({ cases }: { cases: CaseStudy[] }) {
  const { t } = useT();

  if (cases.length === 0) {
    return (
      <>
        <div className="card mx-auto max-w-lg text-center text-[14px] text-body">
          {t.casesPage.empty}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <a href="/consult" className="btn-primary">
            {t.hero.cta1}
          </a>
          <a href="/report" className="btn-secondary">
            {t.hero.cta2}
          </a>
        </div>
      </>
    );
  }

  return (
    <>
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
                  <span className="text-[13px] font-semibold tracking-[0.08em]">AI사주 Lab</span>
                  <span className="text-[12px] text-white/70">PDF 리포트</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h2 className="text-[16px] font-bold leading-snug text-ink-900">{c.title}</h2>
              {c.subtitle && <p className="text-[13px] font-medium text-indigo-600">{c.subtitle}</p>}
              {c.description && (
                <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-body">{c.description}</p>
              )}
              <span className="mt-auto pt-3 text-[13px] font-semibold text-indigo-600">
                {t.casesPage.viewBtn}
              </span>
            </div>
          </a>
        );
      })}
    </div>
    <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
      <a href="/consult" className="btn-primary">
        {t.hero.cta1}
      </a>
      <a href="/report" className="btn-secondary">
        {t.hero.cta2}
      </a>
    </div>
    </>
  );
}
