import type { Worry } from "@/lib/worries/types";

/** 블록 ① 훅 — 게시글 제목 그대로 + 한 줄 + 3특징 스트립 */
export default function WorryHero({ w }: { w: Worry }) {
  return (
    <section className="px-[18px] pt-6 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12224A] px-3 py-1 text-[12px] font-bold text-white">
        <span>{w.emoji}</span>
        {w.category}
        <span className="font-medium text-[#B9CCF5]">· {w.target}</span>
      </span>
      <h1 className="mt-4 text-[26px] font-black leading-[1.32] tracking-[-0.035em] text-[#12224A]">{w.title}</h1>
      <p className="mt-3 text-[15px] font-bold text-[#334155]">
        <span className="bg-[linear-gradient(transparent_58%,#FDE68A_58%)] px-0.5">{w.sub}</span>
      </p>
      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#DCE7F8] bg-white text-center">
        {[
          ["⏱", "30초 체크"],
          ["✅", "3문항"],
          ["🔒", "가입 없이"],
        ].map(([ic, tx], i) => (
          <div key={tx} className={`py-2.5 ${i ? "border-l border-[#DCE7F8]" : ""}`}>
            <div className="text-[15px] leading-none">{ic}</div>
            <div className="mt-1 text-[12px] font-bold text-[#1E3A8A]">{tx}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
