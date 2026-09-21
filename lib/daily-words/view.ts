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
      const meta = w.source ? ` · ${esc(w.source)}` : "";
      const sub = w.meaning ? `<span class="dw-sub">${esc(w.meaning)}</span>` : "";
      return `<div class="dw-s${i === 0 ? " on" : ""}" data-el="${EL_KEY[w.element] || ""}" aria-hidden="${i === 0 ? "false" : "true"}">
  <div class="dw-meta"><span class="dw-lab">💬 Today's <b>촌철활인</b></span> · <span class="dw-el">${EL_SYM[w.element] || ""} ${esc(w.element)}</span><span class="dw-src">${meta}</span><span class="dw-me">나에게 필요한 기운</span></div>
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

export const WORDS_CSS = `
.v6 .voc.top[hidden],.v6 .dw[hidden]{display:none!important}
.dw{position:relative;padding:8px var(--pad) 8px;background:#F4F8FD;
  border-top:1px solid #E9F0F9;border-bottom:1px solid #E9F0F9}
.dw-dots{position:absolute;top:9px;right:var(--pad);display:flex;gap:5px;z-index:2}
.dw-dot{width:7px;height:7px;border-radius:50%;border:0;padding:0;cursor:pointer;opacity:.35;background:#9AA7BD}
.dw-dot.on{opacity:1;transform:scale(1.15)}
.dw-dot.me{box-shadow:0 0 0 2px #fff,0 0 0 3px currentColor}
.dw-dot[data-el=wood]{background:#2E9E5B;color:#2E9E5B}.dw-dot[data-el=fire]{background:#E0483A;color:#E0483A}
.dw-dot[data-el=earth]{background:#A87B3E;color:#A87B3E}.dw-dot[data-el=metal]{background:#8C9AAF;color:#8C9AAF}
.dw-dot[data-el=water]{background:#2F6FD6;color:#2F6FD6}
.dw-stage{position:relative;height:55px}
.dw-s{position:absolute;inset:0;opacity:0;transition:opacity .45s ease;pointer-events:none}
.dw-s.on{opacity:1;pointer-events:auto}
.dw-meta{font-size:10.5px;line-height:15px;color:#7A8AA3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:70px}
.dw-lab b{color:#1F4FA8;font-weight:800}
.dw-el{font-weight:800;color:#44546E}
.dw-s[data-el=wood] .dw-el{color:#2E9E5B}.dw-s[data-el=fire] .dw-el{color:#E0483A}
.dw-s[data-el=earth] .dw-el{color:#A87B3E}.dw-s[data-el=metal] .dw-el{color:#6F7E95}.dw-s[data-el=water] .dw-el{color:#2F6FD6}
.dw-me{display:none;margin-left:6px;padding:0 6px;border-radius:999px;background:#1F4FA8;color:#fff;font-size:9.6px;font-weight:800}
.dw-s.me .dw-me{display:inline-block}
.dw-txt{margin-top:3px;font-size:12.6px;line-height:18.5px;color:#34435C;letter-spacing:-.02em;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dw-s.me .dw-q{font-weight:800;color:#1B2A44}
.dw-q.en{font-style:italic}
.dw-sub{display:block;font-size:11.4px;color:#7A8AA3}
@media(prefers-reduced-motion:reduce){.dw-s{transition:none}}
`;
