import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIVE_WORRIES, getWorry } from "@/lib/worries/data";
import WorryShell from "@/components/worry/WorryShell";
import WorryHero from "@/components/worry/WorryHero";
import WorryEmpathy from "@/components/worry/WorryEmpathy";
import WorryLanding from "@/components/worry/WorryLanding";
import WorryRelated from "@/components/worry/WorryRelated";

/**
 * 고민 랜딩 템플릿 — aisajulab.com/q/[slug] (2026-10-11)
 * 블록 순서: ①훅 → ②공감 → ③30초 체크 → ④결과 → ⑤사주로 더 보면 → ⑥다음 단계 → ⑦이런 고민도
 * 내용은 lib/worries/data.ts 에서만 고친다.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return LIVE_WORRIES.map((w) => ({ slug: w.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const w = getWorry(params.slug);
  if (!w) return {};
  const title = `${w.title} | AI사주랩.com`;
  return {
    title,
    description: w.metaDesc,
    alternates: { canonical: `/q/${w.slug}` },
    openGraph: { title: w.title, description: "30초 체크로 정리하고, 내 사주로 무료 답까지 · AI사주랩.com", url: `/q/${w.slug}`, type: "article" },
  };
}

export default function WorryPage({ params }: { params: { slug: string } }) {
  const w = getWorry(params.slug);
  if (!w) notFound();
  return (
    <WorryShell>
      <WorryHero w={w} />
      <WorryEmpathy w={w} />
      <WorryLanding w={w} />
      <WorryRelated slugs={w.related} />
    </WorryShell>
  );
}
