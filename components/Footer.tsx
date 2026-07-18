import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-content flex-col items-center gap-2 px-6 py-10 text-center">
        <p className="flex items-baseline gap-1 text-[15px] font-bold">
          <span className="text-indigo-600">AI</span>
          <span className="text-ink-900">사주</span>
          <span className="text-[12px] font-semibold text-body">Lab</span>
        </p>
        <p className="text-[13px] text-body">
          {siteConfig.org} · {siteConfig.orgTagline}
        </p>
        <p className="text-[12px] text-body/70">
          © {new Date().getFullYear()} {siteConfig.org}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
