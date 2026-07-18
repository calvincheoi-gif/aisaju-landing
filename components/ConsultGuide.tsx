import { siteConfig } from "@/lib/site-config";

const STEPS = [
  { n: "01", title: "상담 종류 선택", desc: "개인사주, 궁합, 사업운 등 필요한 상담을 선택합니다." },
  { n: "02", title: "기본정보 입력", desc: "생년월일시 등 사주 분석에 필요한 정보를 입력합니다." },
  { n: "03", title: "고민 입력", desc: "구체적인 고민을 남기면 AI와 연구소가 함께 분석합니다." },
];

export default function ConsultGuide() {
  return (
    <section id="guide" className="section">
      <div className="mb-12 text-center">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink-900">
          상담은 3단계면 충분합니다
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="card">
            <span className="font-mono text-[13px] font-semibold text-indigo-600">
              {step.n}
            </span>
            <h3 className="mt-3 text-[17px] font-semibold text-ink-900">
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-body">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href={siteConfig.consultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          지금 상담 신청하기
        </a>
      </div>
    </section>
  );
}
