"use client";

import { useEffect, useRef, useState } from "react";
import AskReport, { type AskReportProps } from "@/components/AskReport";

/**
 * 고객용 리포트 화면 — 폰 폭에 맞춰 540px 리포트를 비율 축소해 보여 주고, 인쇄(PDF 저장) 시에는
 * A4 폭에 맞춰 키운다. 카드(.rpt-card)는 페이지 사이에서 잘리지 않는다.
 * ?print=1 로 열면 글꼴이 준비되는 대로 인쇄 창을 자동으로 띄운다 (관리자가 PDF 뽑을 때).
 */
export default function ReportView(props: AskReportProps & { autoPrint?: boolean }) {
  const [scale, setScale] = useState(1);
  const [h, setH] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 16) / 540));
    fit(); window.addEventListener("resize", fit);
    /* transform 은 레이아웃 높이를 바꾸지 않으므로 바깥 상자 높이를 직접 맞춘다 */
    const ro = new ResizeObserver(() => { if (stageRef.current) setH(stageRef.current.offsetHeight); });
    if (stageRef.current) { ro.observe(stageRef.current); setH(stageRef.current.offsetHeight); }
    return () => { window.removeEventListener("resize", fit); ro.disconnect(); };
  }, []);
  useEffect(() => {
    if (!props.autoPrint) return;
    const go = async () => {
      if ("fonts" in document) await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      setTimeout(() => window.print(), 400);
    };
    void go();
  }, [props.autoPrint]);

  return (
    <div className="rv-root">
      <style>{`
        .rv-root{min-height:100vh;background:#DCE4EE;display:flex;flex-direction:column;align-items:center;padding:12px 8px 40px;font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif}
        .rv-bar{width:100%;max-width:540px;display:flex;gap:8px;justify-content:space-between;align-items:center;margin-bottom:10px}
        .rv-bar a,.rv-bar button{font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:9px 14px;border:0;cursor:pointer;text-decoration:none}
        .rv-pdf{background:#1E2A55;color:#fff}
        .rv-home{background:#fff;color:#1E2A55;border:1px solid #C9D2EA !important}
        .rv-stage{width:540px;transform-origin:top left}
        .rv-outer{overflow:hidden}
        @media print{
          @page{size:A4 portrait;margin:10mm}
          html,body{background:#fff !important}
          .rv-root{background:#fff;padding:0;display:block}
          .rv-bar{display:none}
          .rv-outer{overflow:visible;height:auto !important;width:auto !important}
          .rv-stage{transform:none !important;width:540px;zoom:1.32;margin:0 auto}
          .rpt-card{break-inside:avoid;page-break-inside:avoid}
          .rv-stage *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        }
      `}</style>
      <div className="rv-bar">
        <a className="rv-home" href="/">AI사주랩.com</a>
        <button className="rv-pdf" type="button" onClick={() => window.print()}>PDF로 저장 / 인쇄</button>
      </div>
      <div className="rv-outer" style={{ width: 540 * scale, height: h ? h * scale : undefined }}>
        <div ref={stageRef} className="rv-stage" style={{ transform: `scale(${scale})` }}>
          <AskReport {...props} />
        </div>
      </div>
    </div>
  );
}
