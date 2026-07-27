"use client";

import { siteConfig } from "@/lib/site-config";
import { useT } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import ScrollHint from "./ScrollHint";

export default function Hero() {
  const { lang, setLang, t } = useT();

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-gradient-to-b from-indigo-50 to-transparent" />
      <div className="section relative flex flex-col items-center gap-6 text-center">
        <LanguageSwitcher value={lang} onChange={setLang} />

        <span className="eyebrow">{t.hero.eyebrow}</span>

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
          {t.hero.subtitle}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a href="/consult" className="btn-primary">
            {t.hero.cta1}
          </a>
          <a href="/report" className="btn-secondary">
            {t.hero.cta2}
          </a>
          <a href="/cases" className="btn-ghost">
            {t.hero.cta3}
          </a>
        </div>
      </div>
      <ScrollHint />
    </section>
  );
}
