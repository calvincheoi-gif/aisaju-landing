/**
 * 화면 모듈 — 홈 상단 한마디 블록의 HTML과 CSS.
 * HomeV6 는 이 HTML을 <!--WORDS_SLOT--> 자리에 끼워 넣기만 한다.
 */
import type { DailyWord } from "./types";

const EL_KEY: Record<string, string> = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };
const EL_SYM: Record<string, string> = { 木: "🌲", 火: "🔥", 土: "⛰️", 金: "💎", 水: "💧" };

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export function wordsBlockHtml(words: DailyWord[] | null | undefined): string {
  if (!words || words.length === 0) return "";
  const slides = words
    .map((w, i) => {
      const isEn = w.type === "미국 속담";
      /* 뜻(영어 속담·사자성어)과 출처(경전·고전)는 문구 아래 작은 줄로 */
      const subText = w.meaning || (w.source ? `— ${w.source}` : "");
      const sub = subText ? `<span class="dw-sub">${esc(subText)}</span>` : "";
      return `<div class="dw-s${i === 0 ? " on" : ""}" data-el="${EL_KEY[w.element] || ""}" aria-hidden="${i === 0 ? "false" : "true"}">
  <div class="dw-meta"><span class="dw-lab">Today's <b>寸鐵活人</b><i>(촌철활인)</i></span><span class="dw-el">${EL_SYM[w.element] || ""} ${esc(w.element)}</span><span class="dw-me">나에게 필요한 기운</span></div>
  <div class="dw-txt"><span class="dw-q${isEn ? " en" : ""}">${esc(w.text)}</span>${sub}</div>
</div>`;
    })
    .join("");
  const dots = words
    .map((w, i) =>
      `<button type="button" class="dw-dot${i === 0 ? " on" : ""}" data-el="${EL_KEY[w.element] || ""}" data-idx="${i}" aria-label="${esc(w.element)} 한마디 보기"></button>`)
    .join("");
  return `<div class="dw" role="region" aria-label="오늘의 촌철활인 한마디" aria-live="polite">
  <div class="dw-dots">${dots}</div>
  <div class="dw-stage">${slides}</div>
</div>`;
}

/* 남색 바탕(하단 푸터와 같은 계열) + 흰 글씨로 가시성 확보.
   문구 글자 크기는 client.ts 의 fitWords() 가 칸에 꽉 차도록 12~19px 사이에서 자동 조절 */
export const WORDS_CSS = `
.v6 .voc.top[hidden],.v6 .dw[hidden]{display:none!important}
.dw{position:relative;padding:9px var(--pad) 10px;
  background:linear-gradient(135deg,#15224A 0%,#1C3170 100%);color:#fff;
  box-shadow:inset 0 -1px 0 rgba(255,255,255,.06)}
.dw-dots{position:absolute;top:11px;right:var(--pad);display:flex;gap:6px;z-index:2}
.dw-dot{width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;opacity:.35;background:#fff}
.dw-dot.on{opacity:1;transform:scale(1.2)}
.dw-dot.me{box-shadow:0 0 0 2px #15224A,0 0 0 3.5px #FFD66B}
.dw-dot[data-el=wood].on{background:#4CD787}.dw-dot[data-el=fire].on{background:#FF6B5E}
.dw-dot[data-el=earth].on{background:#E0B060}.dw-dot[data-el=metal].on{background:#D8E1EE}
.dw-dot[data-el=water].on{background:#5AA2FF}
.dw-stage{position:relative;height:74px}
.dw-s{position:absolute;inset:0;opacity:0;transition:opacity .45s ease;pointer-events:none}
.dw-s.on{opacity:1;pointer-events:auto}
.dw-meta{display:flex;align-items:center;gap:6px;height:18px;padding-right:74px;white-space:nowrap;overflow:hidden;font-size:11px}
.dw-lab{color:rgba(255,255,255,.72);letter-spacing:-.01em}
.dw-lab b{color:#FFD66B;font-weight:900;margin-left:3px;letter-spacing:.02em}
.dw-lab i{font-style:normal;color:rgba(255,255,255,.72);margin-left:1px}
.dw-el{padding:0 7px;border-radius:999px;font-weight:800;font-size:10.5px;line-height:17px;color:#fff;background:rgba(255,255,255,.14)}
.dw-s[data-el=wood] .dw-el{background:#2E9E5B}.dw-s[data-el=fire] .dw-el{background:#E0483A}
.dw-s[data-el=earth] .dw-el{background:#A87B3E}.dw-s[data-el=metal] .dw-el{background:#6F7E95}.dw-s[data-el=water] .dw-el{background:#2F6FD6}
.dw-me{display:none;padding:0 7px;border-radius:999px;background:#FFD66B;color:#15224A;font-size:10px;font-weight:900;line-height:17px}
.dw-s.me .dw-me{display:inline-block}
.dw-txt{margin-top:5px;height:51px;overflow:hidden;font-size:15px;line-height:1.3;
  color:#fff;font-weight:800;letter-spacing:-.025em;word-break:keep-all;overflow-wrap:anywhere}
.dw-s.me .dw-q{color:#FFE08A}
.dw-q.en{font-style:italic;letter-spacing:-.01em}
.dw-sub{display:block;margin-top:1px;font-size:.74em;line-height:1.35;font-weight:600;color:#B9C8EA;letter-spacing:-.01em}
@media(prefers-reduced-motion:reduce){.dw-s{transition:none}}
`;
