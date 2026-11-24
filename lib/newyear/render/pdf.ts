/**
 * 2027 새해운 — 그림(JPEG) 여러 장을 PDF 한 파일로 묶는다 (브라우저용, 의존 라이브러리 없음).
 *
 * 왜 직접 만드는가: 폰의 카카오톡·인스타 인앱 브라우저에서는 인쇄 창(→ PDF로 저장)이 열리지 않는 일이 많다.
 * 그래서 「PDF 저장」은 쪽마다 구운 그림을 묶은 PDF 를 바로 내려 주고, 글자가 벡터인 PDF 는 PC의 인쇄 창으로 따로 받게 한다.
 * 쪽 크기는 양식의 pt 그대로(한 장 540×960, A4 595.3×841.9, 프리미엄 960×540)다.
 */
export interface PdfPage { jpeg: Uint8Array; pxW: number; pxH: number }

export function imagesToPdf(pages: PdfPage[], ptW: number, ptH: number): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (d: string | Uint8Array) => { const b = typeof d === "string" ? enc.encode(d) : d; chunks.push(b); pos += b.length; };
  const obj = (n: number, body: string | (() => void)) => { offsets[n] = pos; push(`${n} 0 obj\n`); if (typeof body === "string") push(body); else body(); push("\nendobj\n"); };
  const f = (v: number) => (Math.round(v * 100) / 100).toString();
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const n = pages.length;
  /* 1 = 목차, 2 = 쪽 묶음, 그다음 쪽마다 3개(쪽·내용·그림) */
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] >>`);
  pages.forEach((p, i) => {
    const base = 3 + i * 3;
    obj(base, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(ptW)} ${f(ptH)}] /Resources << /XObject << /Im0 ${base + 2} 0 R >> >> /Contents ${base + 1} 0 R >>`);
    const content = `q ${f(ptW)} 0 0 ${f(ptH)} 0 0 cm /Im0 Do Q`;
    obj(base + 1, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    obj(base + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${p.pxW} /Height ${p.pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
      push(p.jpeg);
      push("\nendstream");
    });
  });
  const xref = pos, total = 3 + n * 3;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
