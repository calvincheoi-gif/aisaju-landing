import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "이용 안내 — 처음이신가요 | AI사주 Lab",
  description:
    "AI사주랩 처음 이용하는 분을 위한 안내입니다. 무료 오행 진단부터 오늘의 행동 방향, 리포트와 상담까지 1분이면 파악됩니다.",
  keywords: ["AI사주랩 사용법", "사주 무료 진단", "오행 진단", "사주 처음", "사주 보는 법"],
  alternates: { canonical: "https://aisajulab.com/guide" },
  openGraph: {
    title: "이용 안내 — 처음이신가요 | AI사주 Lab",
    description: "무료 오행 진단부터 리포트·상담까지, 1분이면 파악됩니다.",
    url: "https://aisajulab.com/guide",
    type: "website",
  },
};

/* 자주 묻는 것 — 검색결과에 FAQ로 잡히도록 구조화 데이터에도 같은 내용을 넣는다 */
const FAQ = [
  {
    q: "태어난 시간을 모르는데 괜찮나요?",
    a: "괜찮습니다. 신청서에서 「태어난 시간 모름」을 체크하시면 시간을 뺀 여섯 글자로 봅니다. 다만 시(時)는 하루의 방향을 나타내는 자리라, 알고 계시면 해석이 더 촘촘해집니다.",
  },
  {
    q: "무료 진단은 사주를 보는 건가요?",
    a: "아닙니다. 질문 14개로 지금 내 기질이 다섯 기운 중 어디에 가까운지 보는 자가진단입니다. 생년월일시로 여덟 글자를 뽑는 사주 분석은 리포트에서 합니다.",
  },
  {
    q: "결과가 얼마나 정확한가요?",
    a: "명리학은 미래를 맞히는 도구가 아니라 나를 이해하는 틀입니다. 저희는 단정적인 예언을 하지 않습니다. AI가 분석하고 경영지도사 최형철이 직접 검수하며, 해석의 근거를 함께 적어 드립니다.",
  },
  {
    q: "생년월일시를 넘겨도 안전한가요?",
    a: "무료 진단은 가입도 저장도 없이 브라우저 안에서만 계산합니다. 리포트를 신청하시면 작성에 필요한 정보만 받고, 전달이 끝나면 보관 목적 외로 쓰지 않습니다.",
  },
  {
    q: "리포트는 언제 받나요?",
    a: "신청 후 3일 이내에 카카오톡으로 보내 드립니다. 상담이 포함된 상품은 리포트를 먼저 읽어보신 뒤 편한 시간에 진행합니다.",
  },
  {
    q: "궁합은 상대방 동의가 필요한가요?",
    a: "법적으로 필요한 것은 아니지만, 상대의 명식은 상대의 것입니다. 저희는 이 리포트를 상대를 판단하거나 설득하는 근거로 쓰지 않기를 권합니다.",
  },
];

const STEPS = [
  {
    n: "1",
    t: "무료 오행 진단",
    d: "질문 14개, 1분. 가입 없이 바로 시작합니다. 다섯 기운 중 내 기질이 어디에 가까운지 나옵니다.",
    href: "/ohaeng/",
    cta: "진단 시작하기",
    free: true,
  },
  {
    n: "2",
    t: "오늘의 행동 방향",
    d: "오늘 날짜의 기운과 내 기질을 견주어, 오늘 무엇을 하면 좋은지 알려 드립니다. 매일 바뀝니다.",
    href: "/ohaeng/#today",
    cta: "오늘 확인하기",
    free: true,
  },
  {
    n: "3",
    t: "읽을거리",
    d: "일간·오행·궁합 같은 기본 개념을 쉬운 말로 정리했습니다. 용어를 몰라도 읽을 수 있게 썼습니다.",
    href: "/learn",
    cta: "읽을거리 보기",
    free: true,
  },
];

const PRODUCTS = [
  {
    t: "AI 오행 해설",
    p: "990원",
    d: "진단 결과를 자동으로 풀어 드립니다. 즉시 발급.",
    href: "/ohaeng/",
  },
  {
    t: "개인 종합 리포트 20장",
    p: "9,900원",
    d: "여덟 글자와 10년 단위 대운까지. 전문가가 직접 작성합니다.",
    href: "/consult",
    best: true,
  },
  {
    t: "연애 · 부부 궁합 리포트",
    p: "100,000원",
    d: "두 사람의 명식을 함께 봅니다. 점수를 매기지 않습니다.",
    href: "/consult",
  },
  {
    t: "전문가 상담",
    p: "50,000원부터",
    d: "리포트에 전화·톡 또는 대면 상담이 더해집니다.",
    href: "/consult",
  },
];

export default function GuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Header />
      <main className="section">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mb-10 text-center">
          <span className="eyebrow">GUIDE</span>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">
            처음이신가요
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-body">
            무료로 할 수 있는 것부터 보세요. 1분이면 됩니다.
            <br className="hidden sm:block" />
            가입도, 결제도 필요 없습니다.
          </p>
        </div>

        {/* 무료 3단계 */}
        <div className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-white p-5 shadow-1">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-indigo-100 text-[14px] font-bold text-indigo-600">
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink-900">{s.t}</h2>
                    {s.free && (
                      <span className="rounded-pill bg-indigo-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-indigo-600">
                        무료
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-body">{s.d}</p>
                  <a
                    href={s.href}
                    className="mt-3 inline-block text-[13.5px] font-semibold text-indigo-600 hover:underline"
                  >
                    {s.cta} →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더 알고 싶을 때 */}
        <div className="mt-12">
          <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">
            더 알고 싶으시면
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            무료 진단은 다섯 기운의 균형만 봅니다. 사주 여덟 글자 전체와 10년 단위 흐름은
            리포트에서 다룹니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PRODUCTS.map((p) => (
              <Link
                key={p.t}
                href={p.href}
                className={`card block ${p.best ? "border-2 border-indigo-600" : ""}`}
              >
                {p.best && (
                  <span className="mb-2 inline-block rounded-pill bg-indigo-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-indigo-600">
                    가장 많이 찾으시는 것
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[15.5px] font-bold leading-snug text-ink-900">{p.t}</h3>
                  <span className="flex-none text-[14px] font-bold text-indigo-600">{p.p}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-body">{p.d}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 자주 묻는 것 */}
        <div className="mt-12">
          <h2 className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">자주 묻는 것</h2>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-[14.5px] font-semibold text-ink-900 marker:hidden">
                  <span className="mr-2 text-indigo-600">Q</span>
                  {f.q}
                </summary>
                <p className="mt-2.5 pl-6 text-[13.5px] leading-relaxed text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* 마무리 */}
        <div className="mt-12 rounded-lg bg-bg-alt p-6 text-center">
          <p className="text-[15px] font-bold text-ink-900">
            사주는 정해진 답을 알려주는 것이 아닙니다
          </p>
          <p className="mx-auto mt-2 max-w-lg text-[13.5px] leading-relaxed text-body">
            타고난 기질과 지금 흐름을 알면, 같은 상황에서 다른 선택을 할 수 있습니다.
            저희는 그 판단을 돕는 일을 합니다.
          </p>
          <a href="/ohaeng/" className="btn-primary mt-5 inline-flex">
            무료 진단부터 시작하기
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[13.5px] text-body hover:text-indigo-600">
            ← 홈으로
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

