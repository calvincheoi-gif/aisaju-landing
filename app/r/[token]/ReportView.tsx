"use client";

import { useEffect, useRef, useState } from "react";
import AskReport, { type AskReportProps } from "@/components/AskReport";

/**
 * 고객용 리포트 화면 — 폰 폭에 맞춰 540px 리포트를 비율 축소해 보여 주고, 인쇄(PDF 저장) 시에는
 * A4 폭에 맞춰 키운다. 카드(.rpt-card)는 페이지 사이에서 잘리지 않는다.
 *   · 상단 「PDF 저장」: 브라우저 인쇄 창을 열고 대상 「PDF로 저장」을 고르면 글자가 벡터인 PDF 파일이 내려간다
 *   · 하단: 후속 상담(1문 1답 9,900원 / 개인종합) · 카톡 채널 · 후기 남기기 — 모두 utm=report 로 추적
 *   · ?print=1 로 열면 글꼴이 준비되는 대로 인쇄 창을 자동으로 띄운다 (관리자가 PDF 뽑을 때)
 */
const CTA = {
  ask: "/consult?mode=simple&item=reportOnly&utm=report_cta",
  full: "/consult?mode=simple&item=reportPlusCall&utm=report_cta",
  kakao: "https://pf.kakao.com/_cERaX/chat",
  review: "/?utm=report_review#rv-list",
};

export default function ReportView(props: AskReportProps & { autoPrint?: boolean }) {
  const [scale, setScale] = useState(1);
  const [h, setH] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 16) / 540));
    fit(); window.addEventListener("resize", fit);
    const ro = new ResizeObserver(() => { if (stageRef.current) setH(stageRef.current.offsetHeight); });
    if (stageRef.current) { ro.observe(stageRef.current); setH(stageRef.current.offsetHeight); }
    return () => { window.removeEventListener("resize", fit); ro.disconnect(); };
  }, []);
  const printPdf = async () => {
    if ("fonts" in document) await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    setHint("인쇄 창에서 대상(프린터)을 「PDF로 저장」으로 고르고 저장하세요. 폰은 공유 아이콘 → 「PDF로 저장」입니다.");
    setTimeout(() => window.print(), 300);
  };
  useEffect(() => { if (props.autoPrint) void printPdf(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [props.autoPrint]);

  /* 인쇄 배율 자동 맞춤 (2026-10-06)
     A4 세로 · 여백 10mm 기준 한 쪽에 들어가는 영역 = 가로 718px · 세로 1047px(CSS 96dpi).
     리포트 높이(540px 폭 기준)를 재어, 「1~3매」 안에 떨어지는 가장 큰 배율을 고른다.
     0.90 을 곱하는 것은 카드가 쪽 경계에서 밀리며 생기는 손실을 미리 빼 두는 것이다. */
  const printZoom = (() => {
    const PAGE = 1047, MAXZ = 1.33, MINZ = 0.92;
    if (!h) return 1.24;
    for (const n of [1, 2, 3]) {
      const z = (n * PAGE * 0.9) / h;
      if (z >= MINZ) return Math.min(MAXZ, Math.round(z * 100) / 100);
    }
    return MINZ;
  })();

  return (
    <div className="rv-root">
      <style>{`
        .rv-root{min-height:100vh;background:#DCE4EE;display:flex;flex-direction:column;align-items:center;padding:12px 8px 48px;font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif}
        .rv-bar{width:100%;max-width:540px;display:flex;gap:8px;justify-content:space-between;align-items:center;margin-bottom:10px}
        .rv-bar a,.rv-bar button{font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:9px 14px;border:0;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
        .rv-pdf{background:#1E2A55;color:#fff}
        .rv-home{background:#fff;color:#1E2A55;border:1px solid #C9D2EA !important}
        .rv-hint{width:100%;max-width:540px;margin:-4px 0 10px;font-size:12.5px;color:#4C5570;background:#fff;border:1px solid #DCE4EE;border-radius:10px;padding:8px 12px;line-height:1.5}
        .rv-stage{width:540px;transform-origin:top left}
        .rv-outer{overflow:hidden}
        .rv-next{width:100%;max-width:540px;margin-top:14px;background:#fff;border-radius:18px;padding:18px 18px 16px;box-shadow:0 4px 16px rgba(30,42,85,.06);text-align:center}
        .rv-next h3{margin:0;font-size:16px;font-weight:900;color:#1E2A55;letter-spacing:-.3px}
        .rv-next p{margin:6px 0 0;font-size:13px;color:#5B6480;line-height:1.5}
        .rv-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
        .rv-grid a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:62px;border-radius:14px;text-decoration:none;font-weight:800;font-size:14px;line-height:1.3;padding:10px 8px}
        .rv-grid small{font-weight:600;font-size:11.5px;opacity:.85}
        .rv-a1{background:linear-gradient(180deg,#6896FF,#3B6CF5);color:#fff}
        .rv-a2{background:#EEF3FB;color:#1E2A55;border:1.5px solid #C9D7F3}
        .rv-a3{background:#FEE500;color:#191919}
        .rv-a4{background:#fff;color:#1E2A55;border:1.5px solid #DCE4EE}
        @media print{
          @page{size:A4 portrait;margin:10mm}
          html,body{background:#fff !important;margin:0;padding:0}
          .rv-root{background:#fff;padding:0;display:block}
          .rv-bar,.rv-hint,.rv-next,.floatnav,nav[aria-label="빠른 이동"]{display:none !important}
          .rv-outer{overflow:visible;height:auto !important;width:auto !important}
          /* A4 가로폭(190mm ≒ 718px)에 꽉 차게 키운다 */
          .rv-stage{transform:none !important;width:540px;zoom:${printZoom};margin:0 auto}
          /* 페이지 나눔 규칙 (2026-10-06 재설계)
             · 카드 통째로 넘기면 앞 페이지 절반이 비어 버린다 → 카드는 쪼개지되(auto),
               카드 안의 한 덩어리(표·박스·줄)는 절대 쪼개지 않는다.
             · 제목만 페이지 끝에 남는 것을 막기 위해 제목 뒤 나눔 금지. */
          .rpt-card{break-inside:auto;page-break-inside:auto}
          .rpt-card>div{break-inside:avoid;page-break-inside:avoid}
          .rpt-card>div:first-child{break-after:avoid;page-break-after:avoid}
          .rpt-foot{break-inside:avoid;page-break-inside:avoid}
          p,div{orphans:3;widows:3}
          img{break-inside:avoid}
          /* flex 컨테이너는 크롬 인쇄에서 쪼개지지 않아 카드 하나가 통째로 다음 장으로 넘어가며
             앞 장을 반쯤 비워 놓는다 → 인쇄에서만 보통 블록으로 바꾼다 (2026-10-06 공백 원인) */
          .rpt-root{overflow:visible !important}
          /* overflow 를 풀면 장식 원이 리포트 밖으로 삐져나오므로 인쇄에서는 감춘다 */
          .rpt-deco{display:none !important}
          .rpt-wrap{display:block !important;gap:0 !important;padding:12px 20px 0 !important}
          .rpt-wrap>*{margin-bottom:8px !important}
          /* 인쇄는 화면보다 촘촘하게 — 흰 공간을 남기지 않고 1~3매 안에 담는다 */
          .rpt-card{padding:13px 18px !important}
          .rpt-q{font-size:19px !important;margin-top:7px !important}
          .rpt-one{font-size:16.5px !important;margin-top:7px !important}
          .rpt-big{font-size:21px !important}
          .rpt-ans{font-size:15px !important;line-height:1.5 !important}
          .rpt-foot{margin-top:8px !important;padding:12px 24px 12px !important;gap:6px !important}
          .rv-stage *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
        }
      `}</style>
      <div className="rv-bar">
        <a className="rv-home" href="/?utm=report_home">AI사주랩.com</a>
        <button className="rv-pdf" type="button" onClick={printPdf}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>
          PDF 저장
        </button>
      </div>
      {hint && <div className="rv-hint">{hint}</div>}
      <div className="rv-outer" style={{ width: 540 * scale, height: h ? h * scale : undefined }}>
        <div ref={stageRef} className="rv-stage" style={{ transform: `scale(${scale})` }}>
          <AskReport {...props} />
        </div>
      </div>

      <div className="rv-next">
        <h3>더 묻고 싶은 것이 있다면</h3>
        <p>이 답은 질문 하나에 대한 <b>1~3매 Key 리포트</b>입니다. 이어지는 질문이나 전체 명식 풀이는 아래에서 받으실 수 있습니다.</p>
        <div className="rv-grid">
          <a className="rv-a1" href={CTA.ask}>1문 1답 더 묻기<small>9,900원 · 24시간 안 답</small></a>
          <a className="rv-a2" href={CTA.full}>개인종합 20장<small>리포트 + 전화·톡 상담</small></a>
          <a className="rv-a3" href={CTA.kakao} target="_blank" rel="noopener">카톡으로 궁금한 점<small>AI사주랩 채널</small></a>
          <a className="rv-a4" href={CTA.review}>후기 한 줄 남기기<small>다음 상담 50% 할인</small></a>
        </div>
      </div>
    </div>
  );
}
