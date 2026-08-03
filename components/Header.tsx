"use client";

import Link from "next/link";
import { useT } from "./LanguageProvider";
import VisitCounter from "./VisitCounter";

export default function Header() {
  const { t } = useT();

  const nav = [
    { label: t.header.nav.services, href: "/#services" },
    { label: t.header.nav.about, href: "/#about" },
    { label: t.header.nav.guide, href: "/#guide" },
    { label: t.header.nav.channels, href: "/#channels" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex flex-col">
          <span className="flex items-baseline gap-1 text-[20px] font-bold tracking-[-0.02em]">
            <span className="text-indigo-600">AI</span>
            <span className="text-ink-900">사주</span>
            <span className="text-[13px] font-semibold text-body">Lab</span>
          </span>
          <VisitCounter />
        </Link>

        <nav className="hidden gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14px] font-medium text-body hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/qna" className="btn-ghost !py-2.5 !px-4 !text-[13px]">
            {t.header.qna}
          </Link>
          <Link href="/consult" className="btn-primary !py-2.5 !px-5 !text-[13px]">
            {t.header.consult}
          </Link>
        </div>
      </div>
    </header>
  );
}
