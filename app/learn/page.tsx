import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEARN_POSTS } from "@/lib/learn-posts";

export const metadata: Metadata = {
  title: "읽을거리 | AI사주 Lab",
  description:
    "일간·오행·궁합 등 사주 명리학의 기본 개념을 쉬운 말로 정리했습니다. 최형철 사주명리 연구소가 씁니다.",
  alternates: { canonical: "https://aisajulab.com/learn" },
  openGraph: {
    title: "읽을거리 | AI사주 Lab",
    description: "사주 명리학의 기본 개념을 쉬운 말로 정리했습니다.",
    url: "https://aisajulab.com/learn",
    type: "website",
  },
};

export default function LearnListPage() {
  /* 목록 구조화 데이터 — 검색결과에 글 묶음으로 인식되게 한다 */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "읽을거리 — 사주 명리학 입문",
    url: "https://aisajulab.com/learn",
    hasPart: LEARN_POSTS.map((p) => ({
      "@type": "Article",
      headline: p.title,
      url: `https://aisajulab.com/learn/${p.slug}`,
      datePublished: p.published,
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
          <span className="eyebrow">LEARN</span>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.02em] text-ink-900">읽을거리</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-body">
            사주 명리학의 기본 개념을 쉬운 말로 정리했습니다.
            <br className="hidden sm:block" />
            용어를 몰라도 읽을 수 있게 썼습니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {LEARN_POSTS.map((post) => (
            <Link key={post.slug} href={`/learn/${post.slug}`} className="card block">
              <div className="flex items-start gap-3">
                <span className="text-[26px] leading-none" aria-hidden>
                  {post.emoji}
                </span>
                <div className="min-w-0">
                  <span className="text-[12px] font-semibold text-indigo-600">{post.category}</span>
                  <h2 className="mt-1 text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink-900">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-body">{post.excerpt}</p>
                  <p className="mt-3 text-[12px] text-body/70">
                    {post.published} · 약 {post.readMin}분
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 이미 있는 텍스트 자산도 같은 자리에서 만나게 한다 */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/cases" className="card block">
            <span className="text-[12px] font-semibold text-indigo-600">상담 사례</span>
            <h2 className="mt-1 text-[16px] font-bold text-ink-900">실제로 이런 상담을 했습니다</h2>
            <p className="mt-2 text-[13.5px] text-body">
              최형철 사주명리 연구소가 작성한 실제 리포트 사례입니다.
            </p>
          </Link>
          <Link href="/qna" className="card block">
            <span className="text-[12px] font-semibold text-indigo-600">Q&amp;A</span>
            <h2 className="mt-1 text-[16px] font-bold text-ink-900">궁금한 점을 물어보세요</h2>
            <p className="mt-2 text-[13.5px] text-body">
              사주와 상담에 대해 자주 묻는 질문과 답변입니다.
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
