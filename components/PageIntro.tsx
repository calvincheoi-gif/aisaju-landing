"use client";

import { useT } from "./LanguageProvider";

type Section = "casesPage" | "consultPage" | "reportPage" | "qnaPage";

/** 하위 페이지 상단 안내 블록(eyebrow/제목/설명) - 선택된 언어로 번역되어 표시됩니다. */
export default function PageIntro({ section }: { section: Section }) {
  const { t } = useT();
  const s = t[section];

  return (
    <div className="mb-10 text-center">
      <span className="eyebrow">{s.eyebrow}</span>
      <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">{s.title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-[15px] text-body">{s.desc}</p>
    </div>
  );
}
