"use client";

import { useT } from "./LanguageProvider";

export default function ServiceMenu() {
  const { t } = useT();
  const items = t.serviceMenu.items;

  return (
    <section id="services" className="section">
      <div className="mb-12 text-center">
        <span className="eyebrow">{t.serviceMenu.eyebrow}</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink-900">
          {t.serviceMenu.title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((s, i) => {
          const highlight = i === items.length - 1;
          const cardClass = `card flex flex-col gap-2 ${
            highlight ? "border-indigo-600/30 bg-indigo-50" : ""
          }`;
          const content = (
            <>
              <h3 className="text-[16px] font-semibold text-ink-900">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-body">{s.desc}</p>
            </>
          );
          return highlight ? (
            <a key={s.title} href="/report" className={cardClass}>
              {content}
            </a>
          ) : (
            <div key={s.title} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
