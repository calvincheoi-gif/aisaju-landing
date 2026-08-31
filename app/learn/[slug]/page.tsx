import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getLearnPost,
  getPublishedLearnPosts,
  getRelatedLearnPosts,
  parseLearnBody,
  learnImageUrl,
} from "@/lib/learn-posts";

const BASE = "https://aisajulab.com";

export const revalidate = 3600;

/** 관리자에서 글을 올리면 새 주소가 자동으로 생긴다 */
export async function generateStaticParams() {
  const posts = await getPublishedLearnPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getLearnPost(slug);
  if (!post) return { title: "읽을거리 | AI사주 Lab" };
  const url = `${BASE}/learn/${post.slug}`;
  const ogImage = learnImageUrl(post.card_paths?.[0]);
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
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function LearnPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getLearnPost(slug);
  if (!post) notFound();

  const blocks = parseLearnBody(post.body);
  const related = await getRelatedLearnPosts(slug, 2);
  const headings = blocks.filter((b) => b.kind === "h2");
  const cards = (post.card_paths || []).map(learnImageUrl).filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    inLanguage: "ko",
    keywords: post.keywords.join(", "),
    ...(cards.length ? { image: cards } : {}),
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

  let hIdx = -1;

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
              최형철 사주명리 연구소 · {post.published_at} · 약 {post.read_min}분
            </p>
          </header>

          {cards.length > 0 && (
            <div className="mb-9 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {cards.map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full rounded-md border border-border"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {headings.length > 1 && (
            <div className="mb-9 rounded-lg border border-border bg-bg-alt px-5 py-4">
              <p className="text-[12.5px] font-bold text-ink-900">이 글의 순서</p>
              <ol className="mt-2 space-y-1.5">
                {headings.map((h, i) => (
                  <li key={i} className="text-[13.5px] text-body">
                    <a href={`#h-${i}`} className="hover:text-indigo-600">
                      {i + 1}. {h.kind === "h2" ? h.text : ""}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="space-y-5">
            {blocks.map((block, i) => {
              if (block.kind === "h2") {
                hIdx += 1;
                return (
                  <h2
                    key={i}
                    id={`h-${hIdx}`}
                    className="scroll-mt-24 pt-4 text-[20px] font-bold tracking-[-0.02em] text-ink-900"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.kind === "p") {
                return (
                  <p
                    key={i}
                    className="text-[15.5px] leading-[1.85] text-ink-900/90"
                    dangerouslySetInnerHTML={{ __html: block.text }}
                  />
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} className="space-y-2 rounded-lg bg-bg-alt px-5 py-4">
                    {block.items.map((li, j) => (
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
              if (block.kind === "quote") {
                return (
                  <p
                    key={i}
                    className="rounded-lg bg-indigo-50 px-5 py-4 text-[15.5px] font-semibold leading-relaxed text-indigo-600"
                  >
                    {block.text}
                  </p>
                );
              }
              return (
                <p key={i} className="text-[12.5px] leading-relaxed text-body/80">
                  ※ {block.text}
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

