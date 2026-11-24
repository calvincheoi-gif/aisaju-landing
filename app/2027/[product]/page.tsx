import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NyOrderForm from "@/components/newyear/NyOrderForm";
import { getProduct, PRODUCTS, won } from "@/lib/newyear/catalog";

/** 2027 새해운 — 상품 상세 + 신청서 (/2027/<상품 열쇠>) */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ product: p.key }));
}

export function generateMetadata({ params }: { params: { product: string } }) {
  const p = getProduct(params.product);
  if (!p) return {};
  return {
    title: `${p.name} · ${won(p.price)} | AI사주랩.com`,
    description: `2027 정미년 새해운 — ${p.name}. ${p.tagline}. ${p.format}.`,
    alternates: { canonical: `/2027/${p.key}` },
  };
}

export default function NewYearProductPage({ params }: { params: { product: string } }) {
  const p = getProduct(params.product);
  if (!p) notFound();
  return (
    <>
      <Header />
      <main className="bg-[#EEF3FB]"><NyOrderForm product={p} /></main>
      <Footer />
    </>
  );
}
