import type { WorryResult as R } from "@/lib/worries/types";

/** 블록 ④ 체크 결과 — 상태 한 줄 + 설명 2줄 + 바로 해볼 것 3가지 */
export default function WorryResult({ r }: { r: R }) {
  return (
    <section id="result" className="mx-[18px] mt-5 scroll-mt-16 overflow-hidden rounded-2xl border border-[#DCE7F8] bg-white shadow-[0_6px_20px_rgba(18,34,74,.06)]">
      <div className="bg-[#12224A] px-5 py-3 text-center">
        <span className="text-[12px] font-bold tracking-wide text-[#B9CCF5]">체크 결과</span>
        <span className="ml-2 rounded-full bg-[#F5B921] px-2.5 py-0.5 text-[12px] font-black text-[#12224A]">{r.tag}</span>
      </div>
      <div className="p-5">
        <h3 className="text-center text-[19px] font-black leading-snug tracking-[-0.03em] text-[#12224A]">
          {/* 「A입니다. B입니다」형은 문장 단위로 줄을 나눠, 단어가 어색하게 끊기지 않게 */}
          {r.headline.split(/(?<=\.)\s+/).map((s, i) => (
            <span key={i} className="block">{s}</span>
          ))}
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-[#475569]">{r.body}</p>
        <div className="mt-4 rounded-xl bg-[#F5F9FF] p-4">
          <div className="text-[13px] font-extrabold text-[#1E3A8A]">이번 주, 이것부터</div>
          <ol className="mt-2.5 space-y-2">
            {r.points.map((p, i) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#16233F]">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-black text-white">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
