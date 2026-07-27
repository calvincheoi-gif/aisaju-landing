"use client";

import { useT } from "./LanguageProvider";

export default function ConsultGuide() {
  const { t } = useT();

  return (
    <section id="guide" className="section">
      <div className="mb-12 text-center">
        <span className="eyebrow">{t.consultGuide.eyebrow}</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink-900">
          {t.consultGuide.title}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {t.consultGuide.steps.map((step, i) => (
          <div key={step.title} className="card">
            <span className="font-mono text-[13px] font-semibold text-indigo-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-[17px] font-semibold text-ink-900">{step.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-body">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a href="/consult" className="btn-primary">
          {t.consultGuide.cta}
        </a>
      </div>
    </section>
  );
}
