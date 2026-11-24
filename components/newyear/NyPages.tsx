"use client";

import { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { fitPages, fontsReady } from "@/lib/newyear/render/fit";
import { NY_FONT_CSS, NY_PAGE_CSS, renderPage } from "@/lib/newyear/render/page";
import { dataUrlToBytes, imagesToPdf } from "@/lib/newyear/render/pdf";
import { getSpec, type FieldValues, type TemplateKey } from "@/lib/newyear/render/spec";

/**
 * 2027 새해운 — 양식 보기·내보내기 (고객 결과 화면과 관리자 미리보기가 함께 쓴다).
 *
 *  · 양식은 원래 크기(pt = CSS px)로 그리고, 화면 폭에 맞춰 통째로 줄여 보여 준다.
 *  · 글꼴이 준비된 뒤 넘침 맞춤(fit)을 하고, 끝내 넘친 칸을 onFit 으로 알려 준다.
 *  · 내보내기는 화면에 그려진 바로 그 모습을 굽는다 — PNG(2배, 한 장 = 1080×1920) / PDF(그림 묶음) / 인쇄 창(글자 선명 PDF).
 */
export interface NyPagesHandle {
  /** 쪽마다 PNG 파일을 만든다 */
  toPng: (pages?: number[]) => Promise<File[]>;
  /** 모든 쪽을 PDF 한 파일로 묶는다 */
  toPdf: () => Promise<File>;
  /** 인쇄 창을 연다 — 「PDF로 저장」을 고르면 글자가 벡터인 PDF 가 된다(PC 권장) */
  print: () => Promise<void>;
  /** 지금 넘친 칸 목록 */
  overflow: () => string[];
}

interface Props {
  template: TemplateKey;
  values: FieldValues;
  mode?: "final" | "preview";
  fileBase?: string;
  /** 쪽 사이 간격(px, 화면 기준) */
  gap?: number;
  onFit?: (over: string[]) => void;
  /** 보여 줄 쪽 (0부터). 없으면 전부 */
  only?: number[];
}

let fontCssCache: Promise<string> | null = null;
/** 내보낼 때 그림 안에 심을 글꼴 CSS — 받은 글꼴 파일을 base64 로 바꿔 한 번만 만든다 */
function fontEmbedCss(): Promise<string> {
  if (fontCssCache) return fontCssCache;
  fontCssCache = (async () => {
    const urls = Array.from(new Set(NY_FONT_CSS.match(/\/newyear\/fonts\/[\w.-]+\.woff2/g) ?? []));
    let css = NY_FONT_CSS;
    await Promise.all(urls.map(async (u) => {
      const buf = new Uint8Array(await (await fetch(u)).arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      css = css.split(`url('${u}')`).join(`url(data:font/woff2;base64,${btoa(bin)})`);
    }));
    return css;
  })().catch((e) => { fontCssCache = null; throw e; });
  return fontCssCache;
}

/**
 * 양식 한 쪽 — 글(html 문자열)이 바뀔 때만 다시 그린다.
 * Next 14 가 쓰는 React 는 dangerouslySetInnerHTML 에 넘긴 객체가 새것이면(글이 같아도) 안쪽을 통째로 다시 만든다.
 * 그러면 넘침 맞춤(글자 줄임·기준선 보정)이 지워지므로, 부모가 다시 그려져도 이 쪽은 건드리지 않게 memo 로 막는다.
 */
const Sheet = memo(function Sheet({ html, w, h }: { html: string; w: number; h: number }) {
  return <div className="ny-sheet" style={{ width: w, height: h }} dangerouslySetInnerHTML={{ __html: html }} />;
});

const NyPages = forwardRef<NyPagesHandle, Props>(function NyPages({ template, values, mode = "final", fileBase = "AI사주랩_2027", gap = 12, onFit, only }, ref) {
  const spec = getSpec(template);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const overRef = useRef<string[]>([]);
  /* only 는 부모가 그릴 때마다 새 배열로 넘어오므로 내용(문자열)으로 비교한다 — 그러지 않으면 맞춤이 끝없이 다시 돈다 */
  const onlyKey = only ? only.join(",") : "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pageIdx = useMemo(() => only ?? spec.pages.map((_, i) => i), [onlyKey, spec.pages]);
  const html = useMemo(() => pageIdx.map((i) => renderPage(spec, i, values, { mode })), [spec, values, mode, pageIdx]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1.6, el.clientWidth / spec.w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [spec.w]);

  /* 맞춤 결과는 바뀌었을 때만 부모에 알린다 — 같은 결과로 부모를 다시 그리게 하지 않는다 */
  const lastOver = useRef<string | null>(null);
  const onFitRef = useRef(onFit);
  onFitRef.current = onFit;
  useEffect(() => {
    let alive = true;
    const fitNow = () => {
      if (!alive || !stageRef.current) return;
      const over = fitPages(stageRef.current);
      overRef.current = over;
      const key = over.join("|");
      if (key !== lastOver.current) { lastOver.current = key; onFitRef.current?.(over); }
    };
    void fontsReady().then(fitNow);
    /* 글꼴이 늦게 도착하면(느린 통신) 그때 한 번 더 맞춘다 */
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.addEventListener?.("loadingdone", fitNow);
    return () => { alive = false; fonts?.removeEventListener?.("loadingdone", fitNow); };
  }, [html, scale]);

  const nodes = () => Array.from(stageRef.current?.querySelectorAll<HTMLElement>(".ny-page") ?? []);

  async function bake(kind: "png" | "jpeg", pages?: number[]): Promise<{ url: string; w: number; h: number; n: number }[]> {
    const { toPng, toJpeg } = await import("html-to-image");
    await fontsReady();
    const fontEmbedCSS = await fontEmbedCss();
    const out: { url: string; w: number; h: number; n: number }[] = [];
    const all = nodes();
    for (let i = 0; i < all.length; i++) {
      if (pages && !pages.includes(i)) continue;
      const pixelRatio = spec.pages.length > 1 && kind === "jpeg" ? 2.5 : 2;
      const opts = { pixelRatio, cacheBust: false, backgroundColor: "#ffffff", fontEmbedCSS, width: spec.w, height: spec.h, style: { transform: "none", margin: "0" } };
      /* 사파리는 첫 굽기에서 그림·글꼴이 빠지는 일이 있어 한 번 헛굽고 다시 굽는다 */
      if (i === 0) await (kind === "png" ? toPng : toJpeg)(all[i], opts).catch(() => "");
      const url = kind === "png" ? await toPng(all[i], opts) : await toJpeg(all[i], { ...opts, quality: 0.93 });
      out.push({ url, w: Math.round(spec.w * pixelRatio), h: Math.round(spec.h * pixelRatio), n: pageIdx[i] + 1 });
    }
    return out;
  }

  useImperativeHandle(ref, () => ({
    overflow: () => overRef.current,
    async toPng(pages) {
      const baked = await bake("png", pages);
      return baked.map((b) => new File([dataUrlToBytes(b.url) as BlobPart], spec.pages.length > 1 ? `${fileBase}_${String(b.n).padStart(2, "0")}.png` : `${fileBase}.png`, { type: "image/png" }));
    },
    async toPdf() {
      const baked = await bake("jpeg");
      const blob = imagesToPdf(baked.map((b) => ({ jpeg: dataUrlToBytes(b.url), pxW: b.w, pxH: b.h })), spec.w, spec.h);
      return new File([blob], `${fileBase}.pdf`, { type: "application/pdf" });
    },
    async print() {
      /* 양식만 담은 숨은 창을 만들어 인쇄한다 — 화면의 다른 요소가 섞이지 않고, 쪽 크기가 양식 크기(pt) 그대로 나온다 */
      await fontsReady();
      const pagesHtml = nodes().map((n) => `<div class="pg">${n.outerHTML}</div>`).join("");
      const doc = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><base href="${location.origin}/"><title>${fileBase}</title><style>${NY_FONT_CSS}${NY_PAGE_CSS}
        @page{size:${spec.w}pt ${spec.h}pt;margin:0}html,body{margin:0;padding:0;background:#fff}
        .pg{width:${spec.w}pt;height:${spec.h}pt;overflow:hidden;break-after:page;page-break-after:always}.pg>.ny-page{zoom:1.33333}
        *{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${pagesHtml}</body></html>`;
      const frame = document.createElement("iframe");
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
      document.body.appendChild(frame);
      await new Promise<void>((resolve) => { frame.onload = () => resolve(); frame.srcdoc = doc; });
      const w = frame.contentWindow;
      if (!w) { frame.remove(); return; }
      try { await (w.document as Document & { fonts: FontFaceSet }).fonts.ready; } catch { /* 그대로 진행 */ }
      await new Promise((r) => setTimeout(r, 250));
      w.focus();
      w.print();
      setTimeout(() => frame.remove(), 60_000);
    },
  }));

  const H = spec.h * scale;
  const css = useMemo(() => ({ __html: `${NY_FONT_CSS}${NY_PAGE_CSS}
        .ny-stage{transform-origin:top left}
        .ny-sheet{box-shadow:0 6px 24px rgba(18,34,74,.14);border-radius:${Math.max(2, 10 / Math.max(scale, 0.4))}px;overflow:hidden;background:#fff}` }), [scale]);
  return (
    <div ref={wrapRef} className={`ny-wrap${mode === "preview" ? " ny-preview" : ""}`} style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={css} />
      <div ref={stageRef} className="ny-stage" style={{ width: spec.w, transform: `scale(${scale})`, height: 0 }}>
        {html.map((h, i) => (
          <div key={pageIdx[i]} className="ny-slot" style={{ height: spec.h, marginBottom: gap / scale }}>
            <Sheet html={h} w={spec.w} h={spec.h} />
          </div>
        ))}
      </div>
      {/* 줄여 그린 높이만큼 자리를 잡아 준다 */}
      <div aria-hidden style={{ height: pageIdx.length * H + (pageIdx.length - 1) * gap }} />
    </div>
  );
});

export default NyPages;

/** 만든 파일을 내려받는다. 인앱 브라우저처럼 내려받기가 막힌 곳에서는 공유 창을 연다. */
export async function saveFiles(files: File[]): Promise<"saved" | "shared" | "failed"> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const inApp = /KAKAOTALK|Instagram|NAVER\(inapp|FBAN|FBAV|Line\//i.test(navigator.userAgent);
  if (inApp && nav.share && (!nav.canShare || nav.canShare({ files }))) {
    try { await nav.share({ files, title: "AI사주랩 2027 새해운" }); return "shared"; } catch { /* 취소했거나 막힘 → 내려받기로 */ }
  }
  try {
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const a = document.createElement("a");
      a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      await new Promise((r) => setTimeout(r, 250));
    }
    return "saved";
  } catch { return "failed"; }
}
