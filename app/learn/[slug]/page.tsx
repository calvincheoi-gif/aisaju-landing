import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEARN_POSTS, getLearnPost, getRelatedPosts } from "@/lib/learn-posts";

const BASE = "https://aisajulab.com";

/** 글이 늘어나도 이 함수 덕분에 라우트를 따로 만들 필요가 없다 */
export function generateStaticParams() {
  return LEARN_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getLearnPost(slug);
  if (!post) return { title: "읽을거리 | AI사주 Lab" };
  const url = `${BASE}/learn/${post.slug}`;
  return {
    title: `${post.title} | AI사주 Lab`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated || post.published,
    },
  };
}

export default async function LearnPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getLearnPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 2);
  const headings = post.body.filter((b): b is { h2: string } => "h2" in b);

  /* Article 구조화 데이터 — 검색엔진과 AI가 글의 성격을 알아보게 한다 */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated || post.published,
    inLanguage: "ko",
    keywords: post.keywords.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/learn/${post.slug}` },
    author: {
      "@type": "Person",
      name: "최형철",
      jobTitle: "경영지도사 · 사주명리 연구가",
      url: BASE,
    },
    publisher: {
      "@type": "Organization",
      name: "라이프앤비즈(Life & Biz) 성장 연구소",
      url: BASE,
    },
  };

  return (
    <>
      <Header />
      <main className="section">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav className="mb-6 text-[13px] text-body">
          <Link href="/" className="hover:text-indigo-600">홈</Link>
          <span className="mx-1.5">›</span>
          <Link href="/learn" className="hover:text-indigo-600">읽을거리</Link>
          <span className="mx-1.5">›</span>
          <span className="text-ink-900">{post.category}</span>
        </nav>

        <article className="mx-auto max-w-[720px]">
          <header className="mb-8">
            <span className="eyebrow">{post.category}</span>
            <h1 className="mt-3 text-[27px] font-bold leading-snug tracking-[-0.02em] text-ink-900 sm:text-[31px]">
              {post.title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-body">{post.description}</p>
            <p className="mt-4 text-[12.5px] text-body/70">
              최형철 사주명리 연구소 · {post.published} · 약 {post.readMin}분
            </p>
          </header>

          {headings.length > 1 && (
            <div className="mb-9 rounded-lg border border-border bg-bg-alt px-5 py-4">
              <p className="text-[12.5px] font-bold text-ink-900">이 글의 순서</p>
              <ol className="mt-2 space-y-1.5">
                {headings.map((h, i) => (
                  <li key={i} className="text-[13.5px] text-body">
                    <a href={`#h-${i}`} className="hover:text-indigo-600">
                      {i + 1}. {h.h2}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="space-y-5">
            {post.body.map((block, i) => {
              if ("h2" in block) {
                const idx = headings.indexOf(block);
                return (
                  <h2
                    key={i}
                    id={`h-${idx}`}
                    className="scroll-mt-24 pt-4 text-[20px] font-bold tracking-[-0.02em] text-ink-900"
                  >
                    {block.h2}
                  </h2>
                );
              }
              if ("p" in block) {
                return (
                  <p
                    key={i}
                    className="text-[15.5px] leading-[1.85] text-ink-900/90"
                    dangerouslySetInnerHTML={{ __html: block.p }}
                  />
                );
              }
              if ("list" in block) {
                return (
                  <ul key={i} className="space-y-2 rounded-lg bg-bg-alt px-5 py-4">
                    {block.list.map((li, j) => (
                      <li
                        key={j}
                        className="flex gap-2 text-[14.5px] leading-relaxed text-ink-900/90"
                      >
                        <span className="text-indigo-600">·</span>
                        <span dangerouslySetInnerHTML={{ __html: li }} />
                      </li>
                    ))}
                  </ul>
                );
              }
              if ("quote" in block) {
                return (
                  <p
                    key={i}
                    className="rounded-lg bg-indigo-50 px-5 py-4 text-[15.5px] font-semibold leading-relaxed text-indigo-600"
                  >
                    {block.quote}
                  </p>
                );
              }
              return (
                <p key={i} className="text-[12.5px] leading-relaxed text-body/80">
                  ※ {block.note}
                </p>
              );
            })}
          </div>

          {/* 하단 CTA — 무료에서 시작해 단계적으로 안내한다 */}
          <div className="mt-12 rounded-lg border border-border bg-white p-6 shadow-1">
            <p className="text-[13px] font-semibold text-indigo-600">다음 단계</p>
            <h2 className="mt-1.5 text-[19px] font-bold tracking-[-0.02em] text-ink-900">
              내 사주는 어떤지 직접 확인해 보세요
            </h2>
            <div className="mt-5 space-y-2.5">
              <a
                href="/ohaeng/"
                className="flex items-center justify-between rounded-lg bg-indigo-600 px-5 py-4 text-white transition-colors hover:bg-indigo-500"
              >
                <span>
                  <span className="block text-[15px] font-bold">오행 성격 진단 · 무료</span>
                  <span className="mt-0.5 block text-[12.5px] text-white/85">
                    질문 14개 · 1분 · 가입 없이 바로
                  </span>
                </span>
                <span className="text-[18px]">›</span>
              </a>
              <a
                href="/ohaeng/"
                className="flex items-center justify-between rounded-lg border border-border px-5 py-4 transition-colors hover:bg-bg-alt"
              >
                <span>
                  <span className="block text-[15px] font-bold text-ink-900">
                    AI 오행 해설 · 990원
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-body">
                    진단 결과를 자동으로 풀어 드립니다
                  </span>
                </span>
                <span className="text-[18px] text-body">›</span>
              </a>
              <Link
                href="/consult"
                className="flex items-center justify-between rounded-lg border border-border px-5 py-4 transition-colors hover:bg-bg-alt"
              >
                <span>
                  <span className="block text-[15px] font-bold text-ink-900">
                    개인 종합 리포트 20장 · 9,900원
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-body">
                    전문가가 직접 작성 · 상담 포함은 5만원부터
                  </span>
                </span>
                <span className="text-[18px] text-body">›</span>
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <p className="text-[13px] font-bold text-ink-900">함께 읽으면 좋은 글</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/learn/${r.slug}`} className="card block">
                    <span className="text-[12px] font-semibold text-indigo-600">{r.category}</span>
                    <h3 className="mt-1 text-[15px] font-bold leading-snug text-ink-900">
                      {r.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/learn" className="btn-ghost">
              읽을거리 목록으로
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

