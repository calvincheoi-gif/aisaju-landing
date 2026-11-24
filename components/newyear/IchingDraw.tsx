"use client";

import { useEffect, useRef, useState } from "react";
import { tossLine } from "@/lib/newyear/engines/toss";

/**
 * 2027 새해운 — 주역 괘 뽑기 (깜빡이는 버튼식, 2026-11-24 소장님 요청으로 동전 그림을 대신함).
 *
 *  · 빛나는 원형 버튼을 누르면 아래 효부터 위로 한 줄씩, 음·양이 빠르게 깜빡이다가 멈춰 정해진다.
 *  · 값은 예전과 같은 척전법(동전 세 닢 × 6번, 6·7·8·9)을 암호 난수로 계산한다 — 보이는 방식만 바뀌었다.
 *  · 결과(6개 값)는 onDone 으로 넘긴다. 다른 화면에서도 이 블록만 가져다 쓸 수 있다.
 */
const FLICKER_MS = 520;   // 한 줄이 깜빡이는 시간
const GAP_MS = 140;       // 다음 줄로 넘어가는 틈

function rnd(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
}

export default function IchingDraw({ onDone }: { onDone: (lines: number[]) => void }) {
  const [lines, setLines] = useState<number[]>([]);
  const [flick, setFlick] = useState<{ at: number; yang: boolean } | null>(null);
  const busy = flick !== null || (lines.length > 0 && lines.length < 6);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  function start() {
    if (busy) return;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    const result = Array.from({ length: 6 }, () => tossLine(rnd));
    setLines([]);
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) try { navigator.vibrate?.(12); } catch { /* 진동 없음 */ }
    result.forEach((v, i) => {
      const base = i * (FLICKER_MS + GAP_MS);
      for (let k = 0; k < 7; k++) later(base + k * (FLICKER_MS / 7), () => setFlick({ at: i, yang: k % 2 === 0 }));
      later(base + FLICKER_MS, () => {
        setFlick(null);
        setLines((prev) => [...prev, v]);
        if (i === 5) onDone(result);
      });
    });
  }

  const done = lines.length === 6;
  return (
    <div className="nyd relative overflow-hidden rounded-[22px] px-4 pb-4 pt-4 text-center">
      <style>{CSS}</style>
      <span className="relative block text-[12.5px] font-bold tracking-wide text-[#F3D37A]">3. 질문을 떠올리며 버튼을 누르세요</span>

      {/* 괘 — 아래에서 위로 쌓인다 */}
      <div className="relative mx-auto mt-3 flex h-[128px] w-[132px] flex-col-reverse justify-between rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3.5">
        {Array.from({ length: 6 }, (_, i) => {
          const v = lines[i];
          const now = flick && flick.at === i;
          const yang = now ? flick!.yang : v === 7 || v === 9;
          const lit = now || v !== undefined;
          const cls = `nyd-bar ${now ? "is-flick" : v !== undefined ? "is-set" : ""}`;
          return (
            <div key={i} className="flex h-[11px] items-center justify-between">
              {!lit ? <span className="h-[3px] w-full rounded bg-white/10" /> : yang ? <span className={`${cls} h-full w-full`} /> : <><span className={`${cls} h-full w-[42%]`} /><span className={`${cls} h-full w-[42%]`} /></>}
            </div>
          );
        })}
      </div>

      {/* 빛나는 버튼 */}
      <button type="button" onClick={start} disabled={busy} aria-label={done ? "다시 뽑기" : "괘 뽑기"} className={`nyd-btn relative mx-auto mt-4 grid h-[86px] w-[86px] place-items-center rounded-full ${busy ? "is-busy" : ""}`}>
        <span className="nyd-ring" aria-hidden />
        <span className="nyd-ring r2" aria-hidden />
        <span className="relative text-[13.5px] font-black leading-tight text-[#16234D]">{busy ? `${lines.length + (flick ? 1 : 0)} / 6` : done ? <>다시<br />뽑기</> : <>TAP<br />괘 열기</>}</span>
      </button>
      <p className="relative mt-3 break-keep text-[12px] leading-relaxed text-[#B9C5E6]">
        {done ? "여섯 줄이 모두 정해졌어요. 아래에서 카드를 받으세요." : "누르면 아래 줄부터 여섯 번 깜빡이며 괘가 정해집니다."}
      </p>
    </div>
  );
}

const CSS = `
.nyd{background:radial-gradient(120% 90% at 80% 0%,#2D3F86 0%,#16234D 58%,#0F1838 100%);box-shadow:0 10px 28px rgba(15,24,56,.25)}
.nyd:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(243,211,122,.55) 1px,transparent 1.2px);background-size:26px 26px;opacity:.25;pointer-events:none}
.nyd-bar{border-radius:3px;background:#F3D37A;box-shadow:0 0 10px rgba(243,211,122,.55)}
.nyd-bar.is-flick{background:#fff;box-shadow:0 0 16px rgba(160,200,255,.95),0 0 4px #fff}
.nyd-bar.is-set{animation:nydSet .35s ease-out}
@keyframes nydSet{0%{background:#fff;box-shadow:0 0 22px rgba(255,255,255,.95)}100%{background:#F3D37A;box-shadow:0 0 10px rgba(243,211,122,.55)}}
.nyd-btn{background:radial-gradient(circle at 35% 30%,#FFF3C4,#F2C94C 60%,#D9A92E);box-shadow:0 0 0 6px rgba(243,211,122,.18),0 10px 26px rgba(242,201,76,.35);transition:transform .15s}
.nyd-btn:active{transform:scale(.95)}
.nyd-ring{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(243,211,122,.7);animation:nydPulse 1.6s ease-out infinite}
.nyd-ring.r2{animation-delay:.8s}
.nyd-btn.is-busy .nyd-ring{animation-duration:.6s;border-color:rgba(170,205,255,.9)}
@keyframes nydPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.55);opacity:0}}
@media (prefers-reduced-motion:reduce){.nyd-ring{animation:none;opacity:.5}}
`;
