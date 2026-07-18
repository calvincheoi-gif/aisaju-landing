const SERVICES = [
  { title: "개인사주", desc: "타고난 기질과 인생 흐름을 정리해드립니다." },
  { title: "궁합", desc: "두 사람의 조화와 균형을 살펴봅니다." },
  { title: "직업·진로", desc: "적성에 맞는 방향과 시기를 제안합니다." },
  { title: "사업운", desc: "창업·확장의 타이밍을 짚어드립니다." },
  { title: "재물운", desc: "재물의 흐름과 관리 전략을 안내합니다." },
  { title: "대운·세운", desc: "장기·단기 운의 흐름을 함께 봅니다." },
  { title: "작명", desc: "이름에 담을 방향을 제안합니다." },
  {
    title: "AI 사주 리포트",
    desc: "AI가 정리한 나만의 분석 리포트를 받아보세요.",
    highlight: true,
    href: "/report",
  },
];

export default function ServiceMenu() {
  return (
    <section id="services" className="section">
      <div className="mb-12 text-center">
        <span className="eyebrow">Services</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-[-0.02em] text-ink-900">
          어떤 고민이든, 사주로 방향을 찾습니다
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SERVICES.map((s) => {
          const cardClass = `card flex flex-col gap-2 ${
            s.highlight ? "border-indigo-600/30 bg-indigo-50" : ""
          }`;
          const content = (
            <>
              <h3 className="text-[16px] font-semibold text-ink-900">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-body">{s.desc}</p>
            </>
          );
          return s.href ? (
            <a key={s.title} href={s.href} className={cardClass}>
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
