/**
 * 2027 새해운 — 사양(spec) + 칸 값(values) → 한 쪽의 HTML 문자열.
 *
 * 프레임워크에 기대지 않는 순수 함수다. 고객 화면·관리자 미리보기·PNG/PDF 내보내기가 모두 이 결과 하나를 쓴다.
 * 글자는 진짜 글자(선택·검색 가능)로 놓고, 넘침 맞춤은 브라우저에서 fit.ts 가 한다.
 *
 *   mode "final"   고객에게 나가는 모습 — 빈 칸은 비워 둔다
 *   mode "preview" 관리자 미리보기 — 빈 칸에 [무엇을 쓰는 칸인지] 를 옅게 보여 준다
 */
import type { FieldValues, SpecField, SpecPage, SpecShape, TemplateSpec, TextStyle } from "./spec";

export const NY_FONT = "'NY Noto Sans KR','Noto Sans KR','Noto Sans CJK KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif";
const ASC = 0.936; // line-height 1 일 때 글줄 위끝 = 기준선 − 0.936 × 글자 크기
const base = (lh: number) => (lh - 1.448) / 2 + 1.16; // 줄 위끝 → 기준선 (글자 크기 배수)
/** 기준선 탐침 — fit.ts 가 이 점의 높이를 재어 첫 줄 기준선을 목표(data-bl)에 정확히 맞춘다 */
const BL = '<span class="ny-bl" style="display:inline-block;width:0;height:0"></span>';

/** 오행 타일 색 — 프리미엄 4쪽 범례와 같은 값 */
export const TONE: Record<string, { fill: string; ink: string }> = {
  木: { fill: "#2b7c51", ink: "#ffffff" },
  火: { fill: "#c53b30", ink: "#ffffff" },
  土: { fill: "#c7a128", ink: "#ffffff" },
  金: { fill: "#d2d6db", ink: "#1b2a4a" },
  水: { fill: "#213e67", ink: "#ffffff" },
};
const ELEMENT_OF: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
  寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土", 戌: "土", 丑: "土", 未: "土", 申: "金", 酉: "金", 亥: "水", 子: "水",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (v: number) => (Math.round(v * 100) / 100).toString();
const font = (st: TextStyle, k = false) =>
  `font-size:${k ? `calc(var(--k,1)*${n(st.s)}px)` : `${n(st.s)}px`};font-weight:${st.b ? 700 : 400};color:${st.c};`;

export interface RenderOptions {
  mode?: "final" | "preview";
  /** 그림 주소 앞에 붙일 바탕 주소 (다른 도메인에서 그릴 때) */
  assetBase?: string;
}

/** 글줄 틀({0} {1} …)에 값을 끼워 넣는다. 비어 있으면 미리보기에서는 [힌트], 최종본에서는 빈칸. */
function fill(tpl: string, keys: string[], values: FieldValues, hints: Map<string, SpecField>, preview: boolean): { html: string; empty: boolean } {
  let empty = false;
  const html = esc(tpl).replace(/\{(\d+)\}/g, (_m, i: string) => {
    const key = keys[Number(i)];
    const v = (values[key] ?? "").trim();
    if (v) return esc(v).replace(/\n/g, "<br>");
    empty = true;
    if (!preview) return "";
    const h = hints.get(key)?.hint || key;
    return `<span class="ny-ph">[${esc(h)}]</span>`;
  });
  return { html, empty };
}

function shapeSvg(s: SpecShape, tone?: { fill: string }): string {
  if (s.k === "l") return `<line x1="${n(s.x1)}" y1="${n(s.y1)}" x2="${n(s.x2)}" y2="${n(s.y2)}" stroke="${s.stroke}" stroke-width="${n(s.sw)}"/>`;
  const fillC = tone ? tone.fill : s.fill ?? "none";
  const stroke = s.stroke && !tone ? ` stroke="${s.stroke}" stroke-width="${n(s.sw ?? 1)}"` : "";
  return `<rect x="${n(s.x)}" y="${n(s.y)}" width="${n(s.w)}" height="${n(s.h)}"${s.r ? ` rx="${n(s.r)}"` : ""} fill="${fillC}"${stroke}/>`;
}

/** 괘상 — 아래에서 위로 여섯 효(1=양 ━━━ / 0=음 ━ ━) */
function hexSvg(bits: string, box: { x: number; y: number; w: number; h: number }): string {
  if (!/^[01]{6}$/.test(bits)) return "";
  const W = box.w * 0.5, H = box.h * 0.62, x0 = box.x + (box.w - W) / 2, y0 = box.y + (box.h - H) / 2;
  const step = H / 6, bar = step * 0.56, gap = W * 0.16;
  let out = "";
  for (let i = 0; i < 6; i++) {
    const y = y0 + H - (i + 1) * step + (step - bar) / 2; // i=0 이 맨 아래(초효)
    if (bits[i] === "1") out += `<rect x="${n(x0)}" y="${n(y)}" width="${n(W)}" height="${n(bar)}" rx="1.5" fill="#20265e"/>`;
    else
      out +=
        `<rect x="${n(x0)}" y="${n(y)}" width="${n((W - gap) / 2)}" height="${n(bar)}" rx="1.5" fill="#20265e"/>` +
        `<rect x="${n(x0 + (W + gap) / 2)}" y="${n(y)}" width="${n((W - gap) / 2)}" height="${n(bar)}" rx="1.5" fill="#20265e"/>`;
  }
  return out;
}

export function renderPage(spec: TemplateSpec, pageIndex: number, values: FieldValues, opts: RenderOptions = {}): string {
  const page: SpecPage = spec.pages[pageIndex];
  const preview = opts.mode === "preview";
  const ab = opts.assetBase ?? "";
  const hints = new Map(spec.fields.map((f) => [f.key, f] as const));
  const W = spec.w, H = spec.h;
  const out: string[] = [];
  const img = (im: SpecPage["images"][number]) =>
    `<img alt="" src="${ab}${im.src}" style="position:absolute;left:${n(im.x)}px;top:${n(im.y)}px;width:${n(im.w)}px;height:${n(im.h)}px;display:block">`;
  const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="${n(W)}" height="${n(H)}" viewBox="0 0 ${n(W)} ${n(H)}" style="position:absolute;left:0;top:0;display:block;font-family:${NY_FONT}">`;

  out.push(
    `<div class="ny-page" data-page="${pageIndex + 1}" style="position:relative;width:${n(W)}px;height:${n(H)}px;overflow:hidden;background:#fff;font-family:${NY_FONT};text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;font-kerning:normal;letter-spacing:0">`,
  );
  for (const im of page.images) if (im.full) out.push(img(im));

  /* 오행 타일: 값의 글자에 맞춰 도형 색을 바꾼다 */
  const tones = new Map<number, { fill: string; ink: string }>();
  for (const sl of page.slots) {
    if (sl.toneBox === undefined) continue;
    const el = ELEMENT_OF[(values[sl.f[0]] ?? "").trim()[0] ?? ""];
    if (el) tones.set(sl.toneBox, TONE[el]);
  }
  let svg = svgOpen;
  page.shapes.forEach((s, i) => {
    svg += shapeSvg(s, tones.get(i));
  });
  if (page.hex) svg += hexSvg((values[page.hex.f] ?? "").trim(), page.hex);
  out.push(svg + "</svg>");
  for (const im of page.images) if (!im.full) out.push(img(im));

  /* 고정 글자는 SVG text 로 놓는다. HTML 글줄은 브라우저가 글꼴 높이를 정수로 반올림해 1px 안팎 어긋나지만
     SVG 는 기준선(y)을 그대로 지킨다. */
  let tsvg = svgOpen;
  for (const t of page.texts) {
    tsvg += `<text x="${n(t.x)}" y="${n(t.y)}" font-size="${n(t.s)}" font-weight="${t.b ? 700 : 400}" fill="${t.c}"${t.al === "r" ? ' text-anchor="end"' : ""} style="white-space:pre">${esc(t.t)}</text>`;
  }
  out.push(tsvg + "</svg>");

  for (const sl of page.slots) {
    const { html, empty } = fill(sl.tpl, sl.f, values, hints, preview);
    const key = sl.f.join(" ");
    const tone = sl.toneBox !== undefined ? tones.get(sl.toneBox) : undefined;
    const st = tone ? { ...sl, c: tone.ink } : sl;
    if (sl.k === "cell") {
      out.push(
        `<div class="ny-fit ny-cell${empty ? " ny-empty" : ""}" data-f="${esc(key)}" data-h="${n(sl.h)}" data-bl="${n(sl.y + (ASC - 0.5) * sl.s)}" style="position:absolute;left:${n(sl.x - sl.w / 2)}px;top:${n(sl.y - sl.h / 2)}px;width:${n(sl.w)}px;height:${n(sl.h)}px;display:flex;align-items:center;justify-content:center;text-align:center">` +
          `<div class="ny-t" style="line-height:1.22;${font(st, true)}">${BL}${html}</div></div>`,
      );
    } else {
      const LH = 1.3;
      const top = sl.y + (ASC - base(LH)) * sl.s;
      const pos = sl.al === "r" ? `right:${n(W - sl.x)}px;text-align:right` : `left:${n(sl.x)}px`;
      out.push(
        `<div class="ny-fit ny-free${empty ? " ny-empty" : ""}" data-f="${esc(key)}" data-h="${n(sl.h + 0.2 * sl.s)}" data-bl="${n(sl.y + ASC * sl.s)}" style="position:absolute;${pos};top:${n(top)}px;width:${n(sl.w)}px">` +
          `<div class="ny-t" style="line-height:${LH};${font(st, true)}">${BL}${html}</div></div>`,
      );
    }
  }

  for (const stack of page.stacks) {
    let inner = "";
    const keys: string[] = [];
    let anyEmpty = false;
    stack.items.forEach((it, idx) => {
      const bl = idx === 0 ? BL : "";
      if (it.tpl !== undefined && it.f) {
        const { html, empty } = fill(it.tpl, it.f, values, hints, preview);
        anyEmpty = anyEmpty || empty;
        keys.push(...it.f);
        inner += `<div class="ny-t" data-f="${esc(it.f.join(" "))}" style="margin-top:${n(it.gap)}px;line-height:1.36;${font(it, true)}">${bl}${html || "&nbsp;"}</div>`;
      } else {
        inner += `<div style="margin-top:${n(it.gap)}px;line-height:1.36;white-space:pre;${font(it)}">${bl}${esc(it.t ?? "")}</div>`;
      }
    });
    out.push(
      `<div class="ny-fit ny-stack${anyEmpty ? " ny-empty" : ""}" data-f="${esc(keys.join(" "))}" data-h="${n(stack.h)}" data-bl="${n(stack.y + base(1.36) * stack.items[0].s)}" style="position:absolute;left:${n(stack.x)}px;top:${n(stack.y)}px;width:${n(stack.w)}px">${inner}</div>`,
    );
  }
  out.push("</div>");
  return out.join("");
}

/**
 * 양식 공통 CSS — 한 번만 넣는다.
 * 줄바꿈 원칙(사이트 공통): 낱말 단위로만 끊고, 두 줄이 되면 윗줄·아랫줄 길이를 맞춘다.
 */
export const NY_PAGE_CSS = `
.ny-page .ny-t{word-break:keep-all;overflow-wrap:anywhere;text-wrap:balance;white-space:pre-wrap}
.ny-page .ny-ph{opacity:.42;font-weight:400}
.ny-preview .ny-fit[data-shrunk]{outline:1px dashed #d97706;outline-offset:1px}
.ny-preview .ny-fit[data-over="1"]{outline:1.5px dashed #e11d48;outline-offset:1px;background:rgba(225,29,72,.06)}
`;

export const NY_FONT_CSS = `
@font-face{font-family:'NY Noto Sans KR';font-style:normal;font-weight:400;font-display:block;src:url('/newyear/fonts/NotoSansKR-Regular-core.woff2') format('woff2');unicode-range:U+0-33FF,U+AC00-D7A3,U+FE00-FFEF;}
@font-face{font-family:'NY Noto Sans KR';font-style:normal;font-weight:400;font-display:block;src:url('/newyear/fonts/NotoSansKR-Regular-hanja.woff2') format('woff2');unicode-range:U+3400-9FFF,U+F900-FAFF;}
@font-face{font-family:'NY Noto Sans KR';font-style:normal;font-weight:700;font-display:block;src:url('/newyear/fonts/NotoSansKR-Bold-core.woff2') format('woff2');unicode-range:U+0-33FF,U+AC00-D7A3,U+FE00-FFEF;}
@font-face{font-family:'NY Noto Sans KR';font-style:normal;font-weight:700;font-display:block;src:url('/newyear/fonts/NotoSansKR-Bold-hanja.woff2') format('woff2');unicode-range:U+3400-9FFF,U+F900-FAFF;}
`;
