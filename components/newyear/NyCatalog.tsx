"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProduct, NEWYEAR, PRODUCTS, won, type Product } from "@/lib/newyear/catalog";
import { recentOrders, type RecentOrder } from "@/lib/newyear/client";
import { SEASON, seasonState, startLabel } from "@/lib/newyear/season";

/**
 * 2027 새해운 — 상품 목록 (무료 주역 → 990원 한 장 → 상세본 순으로 선택을 넓힌다).
 * 가격·장수·형식은 lib/newyear/catalog.ts 한 곳에서 온다.
 */
const FAMILY: { key: Product["family"]; title: string; what: string; tone: string; ring: string }[] = [
  { key: "iching", title: "주역", what: "질문 하나를 품고 괘를 뽑아, 올해의 방향과 첫 행동을 정합니다.", tone: "#387D97", ring: "#CFE6EE" },
  { key: "tojeong", title: "토정비결", what: "음력 생일로 보는 한 해 신수. 음력 열두 달의 흐름을 봅니다.", tone: "#A87B22", ring: "#EFE2C4" },
  { key: "saju", title: "사주명리", what: "일간과 태어난 계절로 나의 기질을 읽고, 절기 열두 달을 봅니다.", tone: "#335CC4", ring: "#D5DFF7" },
];

function ProductRow({ p, tone, pre = false }: { p: Product; tone: string; pre?: boolean }) {
  /* 이름 옆에는 가격만 두고, 형식·전달 방식은 아래 두 줄로 — 좁은 화면에서도 가운뎃점(·)에서 줄이 끊기지 않는다 */
  return (
    <Link href={`${NEWYEAR.path}/${p.key}`} className="group flex items-start gap-3 rounded-2xl border border-[#DCE7F8] bg-white px-4 py-3.5 transition hover:border-[#9DB8F5] hover:shadow-[0_6px_18px_rgba(59,108,245,.12)]">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-black text-white" style={{ background: tone }}>{"①②③④⑤".indexOf(p.no) + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2.5">
          <span className="block break-keep text-[15px] font-extrabold leading-snug text-[#12224A]">{p.name}</span>
          <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[13.5px] font-extrabold ${p.price === 0 ? "bg-[#FFF3BF] text-[#7A5B00]" : "bg-[#EEF3FB] text-[#12224A]"}`}>{won(p.price)}</span>
        </span>
        <span className="mt-1 block whitespace-nowrap text-[12.5px] leading-snug text-[#64748B]">{p.format}</span>
        <span className="block whitespace-nowrap text-[12.5px] font-semibold leading-snug" style={{ color: tone }}>{p.review ? (pre ? `${startLabel(true)} 오픈 · 감수 후 전달` : "소장 감수 후 전달") : "바로 받기"}</span>
      </span>
    </Link>
  );
}

export default function NyCatalog() {
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [pre, setPre] = useState(false);
  useEffect(() => { setRecent(recentOrders()); setPre(seasonState() === "pre"); }, []);
  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-6">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#12224A] px-3.5 py-1.5 text-[12px] font-bold tracking-wide text-white">2027 {NEWYEAR.ganji}年 · 새해운</span>
        <h1 className="mt-4 break-keep text-[27px] font-black leading-[1.3] tracking-[-0.03em] text-[#12224A]">2027 정미년 새해운,<br />한 장으로 먼저 받아 보세요</h1>
        <p className="mt-2 text-[12.5px] font-bold text-[#A87B22]">{pre ? `사전 오픈 · 한 장 3종은 지금 바로 · 상세본은 ${startLabel(true)} 오픈` : `${SEASON.label} · ${startLabel(true)} ~ ${SEASON.endLabel}까지만 열려요`}</p>
        <p className="mx-auto mt-3 max-w-[420px] break-keep text-[14.5px] leading-relaxed text-[#64748B] [text-wrap:balance]">주역 카드는 무료, 한 장 요약은 990원. 더 깊이 보고 싶을 때만 상세 리포트로 넘어가면 됩니다.</p>
      </div>

      {recent.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#F1E3A8] bg-[#FFFBEA] px-4 py-3">
          <p className="text-[12.5px] font-bold text-[#7A5B00]">이 기기에서 신청한 내역</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {recent.slice(0, 4).map((r) => (
              <Link key={r.token} href={`${NEWYEAR.path}/o/${r.token}`} className="rounded-full border border-[#E9D48A] bg-white px-3 py-1 text-[12.5px] font-semibold text-[#12224A]">{getProduct(r.productKey)?.name ?? "신청"} · {r.refNo}</Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 space-y-5">
        {FAMILY.map((f) => {
          const items = PRODUCTS.filter((p) => p.family === f.key);
          return (
            <section key={f.key} className="rounded-[22px] border bg-[#F7FAFF] p-4" style={{ borderColor: f.ring }}>
              <div className="flex items-baseline gap-2 px-1">
                <h2 className="text-[19px] font-black tracking-[-0.02em]" style={{ color: f.tone }}>{f.title}</h2>
                <span className="text-[12.5px] font-semibold text-[#94A3B8]">{items[0].tagline}</span>
              </div>
              <p className="mt-1 break-keep px-1 text-[13.5px] leading-relaxed text-[#475569] [text-wrap:balance]">{f.what}</p>
              <div className="mt-3 space-y-2.5">{items.map((p) => <ProductRow key={p.key} p={p} tone={f.tone} pre={pre} />)}</div>
            </section>
          );
        })}
      </div>

      <section className="mt-8 rounded-[22px] bg-[#12224A] px-5 py-5 text-white">
        <h2 className="text-[16px] font-black">받는 방법</h2>
        <ol className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-[#DCE7F8]">
          <li className="break-keep"><b className="text-white">1. 고르고 입력</b> — 상품에 필요한 정보만 적습니다. 주역 카드는 질문만 있으면 됩니다.</li>
          <li className="break-keep"><b className="text-white">2. 한 장은 빠르게</b> — 송금하고 <span className="whitespace-nowrap">「입금 완료」</span>를 누르시면, 입금 확인 뒤 바로 만들어 드립니다.</li>
          <li className="break-keep"><b className="text-white">3. 상세본은 감수 후</b> — 초안을 최형철 소장이 직접 확인하고 고친 뒤 전달합니다.</li>
        </ol>
      </section>

      <p className="mt-5 break-keep text-center text-[12px] leading-relaxed text-[#94A3B8] [text-wrap:balance]">
        한 장 상품은 AI 간편풀이이며, 상세본은 소장 감수를 거칩니다. 풀이는 참고용 조언입니다.<br />
        결제·환불 기준은 <a href="/legal/#t3" className="font-semibold text-[#3B6CF5] underline">이용 안내</a>를 확인해 주세요.
      </p>
    </div>
  );
}
