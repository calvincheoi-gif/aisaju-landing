"use client";

import { useState } from "react";
import { siteConfig, type LanguageCode } from "@/lib/site-config";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Hero 카피 다국어 사전.
 * 한국어/영어는 실제 번역을 제공하고, 그 외 언어(중/일/프/독/스)는
 * 전용 번역이 준비되기 전까지 영어 카피를 보여줍니다.
 * (전체 페이지 다국어화는 추후 i18n 도입 시 확장)
 */
const HERO_COPY: Record<"ko" | "en", { eyebrow: string; subtitle: string; cta1: string; cta2: string; cta3: string }> = {
  ko: {
    eyebrow: "AI × 명리학",
    subtitle: "AI와 명리학으로 인생과 비즈니스의\n중요한 의사결정을 돕습니다.",
    cta1: "상담 신청",
    cta2: "AI 리포트 보기",
    cta3: "상담 사례",
  },
  en: {
    eyebrow: "AI × Myeongri (Korean BaZi)",
    subtitle: "AI and traditional myeongri come together\nto support your biggest life and business decisions.",
    cta1: "Book a consult",
    cta2: "View AI report",
    cta3: "Case studies",
  },
};

function copyFor(lang: LanguageCode) {
  return lang === "ko" || lang === "en" ? HERO_COPY[lang] : HERO_COPY.en;
}

export default function Hero() {
  const [lang, setLang] = useState<LanguageCode>("ko");
  const copy = copyFor(lang);
  const isTranslationPending = lang !== "ko" && lang !== "en";

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-gradient-to-b from-indigo-50 to-transparent" />
      <div className="section relative flex flex-col items-center gap-6 text-center">
        <LanguageSwitcher value={lang} onChange={setLang} />

        <span className="eyebrow">{copy.eyebrow}</span>

        <h1 className="max-w-3xl text-[44px] font-bold leading-[1.15] tracking-[-0.03em] text-ink-900 md:text-[60px]">
          <span className="text-indigo-600">AI</span>사주{" "}
          <span className="text-ink-700">Lab</span>
        </h1>

        <p className="max-w-xl text-[16px] font-semibold leading-relaxed text-indigo-600 md:text-[18px]">
          {siteConfig.tagline}
        </p>

        <p className="text-[14px] font-medium text-body">
          {siteConfig.org} · {siteConfig.orgTagline}
        </p>

        <p className="max-w-xl whitespace-pre-line text-[18px] leading-relaxed text-body md:text-[20px]">
          {copy.subtitle}
        </p>

        {isTranslationPending && (
          <p className="text-[12px] text-body/70">
            (전체 페이지 번역은 준비 중이며, 현재는 영어 요약만 제공됩니다)
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a href="/consult" className="btn-primary">
            {copy.cta1}
          </a>
          <a href="/report" className="btn-secondary">
            {copy.cta2}
          </a>
          <a href="#cases" className="btn-ghost">
            {copy.cta3}
          </a>
        </div>
      </div>
    </section>
  );
}
