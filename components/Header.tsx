import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const NAV = [
  { label: "서비스", href: "#services" },
  { label: "연구소 소개", href: "#about" },
  { label: "상담 안내", href: "#guide" },
  { label: "채널", href: "#channels" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="#top" className="flex items-baseline gap-1 text-[20px] font-bold tracking-[-0.02em]">
          <span className="text-indigo-600">AI</span>
          <span className="text-ink-900">사주</span>
          <span className="text-[13px] font-semibold text-body">Lab</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[14px] font-medium text-body hover:text-ink-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={siteConfig.consultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !py-2.5 !px-5 !text-[13px]"
        >
          상담 신청
        </a>
      </div>
    </header>
  );
}
