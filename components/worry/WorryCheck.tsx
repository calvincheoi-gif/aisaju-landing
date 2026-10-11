"use client";

import { useState } from "react";
import type { Worry } from "@/lib/worries/types";

/**
 * 블록 ③ 30초 체크 — 한 번에 한 문항, 누르면 다음으로.
 * 다 고르면 onDone(합계, 고른 번호들)을 부른다. 결과 화면은 부모가 그린다.
 */
export default function WorryCheck({
  w,
  onAnswer,
  onDone,
}: {
  w: Worry;
  onAnswer?: (step: number, choice: number) => void;
  onDone: (total: number, picks: number[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const n = w.questions.length;
  const finished = picks.length === n;

  function pick(i: number) {
    const next = [...picks.slice(0, step), i];
    setPicks(next);
    onAnswer?.(step + 1, i);
    if (step + 1 < n) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      const total = next.reduce((s, c, qi) => s + w.questions[qi].options[c].score, 0);
      onDone(total, next);
    }
  }

  const q = w.questions[Math.min(step, n - 1)];

  return (
    <section id="check" className="mx-[18px] mt-5 rounded-2xl border-2 border-[#2563EB]/25 bg-white p-5 shadow-[0_10px_26px_rgba(37,99,235,.10)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold tracking-wide text-[#2563EB]">30초 체크</span>
        <div className="flex gap-1.5" aria-label={`${n}문항 중 ${Math.min(step + 1, n)}번째`}>
          {w.questions.map((_, i) => (
            <span key={i} className={`h-2 w-7 rounded-full ${i < picks.length || i === step ? "bg-[#2563EB]" : "bg-[#DCE7F8]"}`} />
          ))}
        </div>
      </div>

      <h3 className="mt-3 text-[17px] font-extrabold leading-snug text-[#12224A]">
        <span className="mr-1.5 text-[#2563EB]">Q{step + 1}.</span>
        {q.q}
      </h3>

      <div className="mt-3.5 space-y-2">
        {q.options.map((o, i) => {
          const on = picks[step] === i;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => pick(i)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] font-semibold transition active:scale-[.99] ${
                on ? "border-[#2563EB] bg-[#E8F1FF] text-[#1D4ED8]" : "border-[#DCE7F8] bg-white text-[#16233F] hover:bg-[#F5F9FF]"
              }`}
            >
              <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[12px] font-black ${on ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                {String.fromCharCode(65 + i)}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      {step > 0 && (
        <button type="button" onClick={() => setStep(step - 1)} className="mt-3 text-[12.5px] font-bold text-[#64748B]">
          ‹ 이전 문항
        </button>
      )}
      {finished && (
        <p className="mt-3 text-center text-[12.5px] font-bold text-[#2563EB]">결과가 아래에 나왔어요 ↓</p>
      )}
    </section>
  );
}
