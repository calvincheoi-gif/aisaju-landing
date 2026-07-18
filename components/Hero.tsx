import { siteConfig } from "@/lib/site-config";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-gradient-to-b from-indigo-50 to-transparent" />
      <div className="section relative flex flex-col items-center gap-6 text-center">
        <span className="eyebrow">AI × 명리학</span>

        <h1 className="max-w-3xl text-[44px] font-bold leading-[1.15] tracking-[-0.03em] text-ink-900 md:text-[60px]">
          <span className="text-indigo-600">AI</span>사주{" "}
          <span className="text-ink-700">Lab</span>
        </h1>

        <p className="text-[14px] font-medium text-body">
          {siteConfig.org} · {siteConfig.orgTagline}
        </p>

        <p className="max-w-xl text-[18px] leading-relaxed text-body md:text-[20px]">
          AI와 명리학으로 인생과 비즈니스의
          <br className="hidden md:block" />
          중요한 의사결정을 돕습니다.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={siteConfig.consultUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            상담 신청
          </a>
          <a href="/report" className="btn-secondary">
            AI 리포트 보기
          </a>
          <a href="#cases" className="btn-ghost">
            상담 사례
          </a>
        </div>
      </div>
    </section>
  );
}
