import type { Metadata } from "next";
import { LIVE_WORRIES } from "@/lib/worries/data";
import WorryShell from "@/components/worry/WorryShell";

/** 고민 모아보기 — aisajulab.com/q (분야별 묶음) */

export const metadata: Metadata = {
  title: "지금 어떤 고민이세요? | AI사주랩.com",
  description: "연애·취업·이직·결혼… 내 고민을 고르면 30초 체크와 내 사주로 받는 무료 답까지 이어집니다.",
  alternates: { canonical: "/q" },
};

export default function WorryIndex() {
  const cats = Array.from(new Set(LIVE_WORRIES.map((w) => w.category)));
  return (
    <WorryShell>
      <section className="px-[18px] pt-7 text-center">
        <span className="text-[12px] font-bold tracking-[.12em] text-[#2563EB]">MY WORRY</span>
        <h1 className="mt-2 text-[26px] font-black leading-snug tracking-[-0.035em] text-[#12224A]">
          지금, <span className="bg-[linear-gradient(transparent_58%,#FDE68A_58%)] px-0.5">어떤 고민</span>이세요?
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[#64748B]">
          내 이야기 같은 제목을 눌러 보세요.<br />30초 체크 → 내 사주로 무료 답까지 이어집니다.
        </p>
      </section>

      {cats.map((c) => (
        <section key={c} className="mx-[18px] mt-6">
          <h2 className="mb-2 text-[13px] font-extrabold text-[#1E3A8A]">{c}</h2>
          <div className="space-y-2">
            {LIVE_WORRIES.filter((w) => w.category === c).map((w) => (
              <a
                key={w.slug}
                href={`/q/${w.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-[#DCE7F8] bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(18,34,74,.04)] hover:bg-[#F5F9FF]"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#E8F1FF] text-[20px]">{w.emoji}</span>
                <span className="flex-1">
                  <span className="block text-[15px] font-extrabold leading-snug text-[#12224A]">{w.title}</span>
                  <span className="mt-0.5 block text-[12px] text-[#64748B]">{w.target}</span>
                </span>
                <span className="text-[18px] text-[#2563EB]">›</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </WorryShell>
  );
}
