import { siteConfig } from "@/lib/site-config";

export default function About() {
  return (
    <section id="about" className="bg-bg-alt">
      <div className="section grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="eyebrow">About</span>
          <h2 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            {siteConfig.org}
          </h2>
          <p className="mt-1 text-[14px] font-medium text-indigo-600">
            AI사주 Lab · {siteConfig.orgTagline}
          </p>
          <p className="mt-5 text-[16px] leading-relaxed text-body">
            오랜 시간 명리학을 연구해 온 최형철 사주명리 연구소가 AI사주
            Lab이라는 플랫폼을 통해 AI 기술을 더해, 더 정확하고 일관된 분석을
            빠르게 전달합니다. 전통적인 사주풀이의 통찰에 AI의 데이터 정리
            능력을 결합해, 인생과 비즈니스의 중요한 순간에 실질적인 도움을
            드리는 것을 목표로 합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-[28px] font-bold text-indigo-600">AI</p>
            <p className="mt-1 text-[13px] text-body">데이터 기반 분석</p>
          </div>
          <div className="card">
            <p className="text-[28px] font-bold text-indigo-600">命理</p>
            <p className="mt-1 text-[13px] text-body">전통 명리학 이론</p>
          </div>
          <div className="card col-span-2">
            <p className="text-[16px] font-semibold text-ink-900">
              {siteConfig.org}
            </p>
            <p className="mt-1 text-[13px] text-body">
              AI사주 Lab 운영 · {siteConfig.orgTagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
