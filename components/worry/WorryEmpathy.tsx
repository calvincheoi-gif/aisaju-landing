import type { Worry } from "@/lib/worries/types";

/** 블록 ② 공감 — "딱 내 얘기" 3줄 */
export default function WorryEmpathy({ w }: { w: Worry }) {
  return (
    <section className="mx-[18px] mt-5 rounded-2xl border border-[#DCE7F8] bg-white p-5 shadow-[0_6px_20px_rgba(18,34,74,.05)]">
      <h2 className="text-center text-[15px] font-extrabold text-[#12224A]">혹시, 이런 마음인가요?</h2>
      <ul className="mt-3.5 space-y-2.5">
        {w.empathy.map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-[#334155]">
            <span className="mt-[1px] flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#E8F1FF] text-[11px] font-black text-[#2563EB]">✓</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
