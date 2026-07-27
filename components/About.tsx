"use client";

import { siteConfig } from "@/lib/site-config";
import { useT } from "./LanguageProvider";

export default function About() {
  const { t } = useT();

  return (
    <section id="about" className="bg-bg-alt">
      <div className="section grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="eyebrow">{t.about.eyebrow}</span>
          <h2 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            {siteConfig.org}
          </h2>
          <p className="mt-1 text-[14px] font-medium text-indigo-600">
            {t.about.tagline} · {siteConfig.orgTagline}
          </p>
          <p className="mt-5 text-[16px] leading-relaxed text-body">{t.about.body}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-[28px] font-bold text-indigo-600">AI</p>
            <p className="mt-1 text-[13px] text-body">{t.about.dataCard}</p>
          </div>
          <div className="card">
            <p className="text-[28px] font-bold text-indigo-600">命理</p>
            <p className="mt-1 text-[13px] text-body">{t.about.myeongriCard}</p>
          </div>
          <div className="card col-span-2">
            <p className="text-[16px] font-semibold text-ink-900">{siteConfig.org}</p>
            <p className="mt-1 text-[13px] text-body">
              {t.about.orgCardDesc} · {siteConfig.orgTagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
