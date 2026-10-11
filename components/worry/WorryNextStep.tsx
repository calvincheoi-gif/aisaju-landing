"use client";

import { useEffect, useState } from "react";
import type { Worry } from "@/lib/worries/types";
import { askHref, ohaengHref, track } from "@/lib/worries/links";

/**
 * 블록 ⑥ 다음 단계 — 유일한 채움 버튼은 「무료 1문 1답」(질문이 미리 채워져 열림).
 * 보조는 테두리 버튼 「1분 오행 진단」. 오늘 남은 자리는 /api/ask 에서 실시간으로.
 */
export default function WorryNextStep({ w, resultTag }: { w: Worry; resultTag?: string }) {
  const [left, setLeft] = useState<{ remaining: number; cap: number } | null>(null);
  const [hrefs, setHrefs] = useState({ ask: "/ask", ohaeng: "/ohaeng/" });

  useEffect(() => {
    setHrefs({ ask: askHref(w.slug, w.askPrefill), ohaeng: ohaengHref(w.slug) });
    fetch("/api/ask", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && typeof d.remaining === "number" && setLeft({ remaining: d.remaining, cap: d.cap }))
      .catch(() => {});
  }, [w.slug, w.askPrefill]);

  const full = left ? left.remaining <= 0 : false;

  return (
    <section className="mx-[18px] mt-5 rounded-2xl border border-[#DCE7F8] bg-white p-5 text-center shadow-[0_6px_20px_rgba(18,34,74,.06)]">
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-full border-[1.5px] border-[#12224A] px-3 py-1 text-[12px] font-bold text-[#12224A]">선착순 Daily 3명 무료</span>
        {left && (
          <span className={`rounded-full px-3 py-1 text-[12px] font-bold text-white ${full ? "bg-[#94A3B8]" : "bg-[#E8542E]"}`}>
            {full ? "오늘 마감 · 내일 다시" : `오늘 남은 자리 ${left.remaining}/${left.cap}`}
          </span>
        )}
      </div>
      <h3 className="mt-3.5 text-[18px] font-black leading-snug text-[#12224A]">
        내 생년월일시로,<br />이 고민에 대한 답을 받아 보세요
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
        질문은 이미 적어 두었어요. 생년월일만 넣으면 끝.<br />
        최형철 소장이 <b className="text-[#12224A]">24시간 안에</b> 폰으로 보는 1~3매 리포트로 답합니다.
      </p>

      <a
        href={hrefs.ask}
        onClick={() => track("q_cta_ask", { slug: w.slug, result: resultTag || null })}
        className="mt-4 flex h-[54px] items-center justify-center rounded-2xl text-[17px] font-black text-white shadow-[0_10px_22px_rgba(37,99,235,.30)]"
        style={{ background: "linear-gradient(180deg,#5B8CFF 0%,#2563EB 100%)" }}
      >
        {full ? "내일 자리 알아보기 ›" : "내 사주로 무료 답 받기 ›"}
      </a>
      <a
        href={hrefs.ohaeng}
        onClick={() => track("q_cta_ohaeng", { slug: w.slug, result: resultTag || null })}
        className="mt-2.5 flex h-[48px] items-center justify-center rounded-2xl border-[1.5px] border-[#2563EB] bg-white text-[15px] font-extrabold text-[#2563EB]"
      >
        1분 오행 성격 진단 먼저 해 보기
      </a>

      {w.note && (
        <p className="mt-4 rounded-xl bg-[#F5F9FF] p-3 text-left text-[12px] leading-relaxed text-[#475569]">※ {w.note}</p>
      )}
    </section>
  );
}
