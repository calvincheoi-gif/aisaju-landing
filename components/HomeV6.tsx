"use client";
import { useEffect } from "react";

const KAKAO = "https://open.kakao.com/o/gj3iUKai";
const SB_URL = "https://urazdkvkanjnquqhnrvo.supabase.co";
const SB_KEY = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";

const CSS = String.raw`
:root{
  --blue:#2563EB; --blue-d:#1D4ED8; --blue-l:#60A5FA; --blue-p:#E8F1FF;
  --navy:#12224A; --navy-2:#1E3A8A; --ink:#16233F; --gray:#64748B;
  --line:#DCE7F8; --bg:#F5F9FF; --crim:#A81C46; --crim-l:#FDF3F5; --gold:#F5B921;
  --mok:#22A06B; --hwa:#EF4444; --to:#8B5E3C; --geum:#94A3B8; --su:#2B7FEF;
  --pad:18px;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
body{
  background:#E3EDFB;
  font-family:'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  color:var(--ink);display:flex;justify-content:center;-webkit-font-smoothing:antialiased;
}
.shell{width:100%;max-width:430px;background:var(--bg);position:relative;overflow:hidden;padding-bottom:100px}
@media(min-width:900px){
  body{padding:24px 0;background:#D7E5F8}
  .shell{border-radius:30px;box-shadow:0 26px 70px rgba(20,50,110,.22)}
}

/* ── 상단바 ── */
.topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;
  padding:10px var(--pad);background:rgba(255,255,255,.93);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:baseline;gap:5px;font-weight:800;font-size:17px;letter-spacing:-.04em;color:var(--navy)}
.brand span{color:var(--blue)}
.brand small{font-size:9.5px;font-weight:600;color:var(--gray)}
.util{display:flex;gap:6px;align-items:center}
.chip{font-size:11.5px;font-weight:600;color:var(--gray);border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 9px}
.burger{width:32px;height:32px;border:1px solid var(--line);background:#fff;border-radius:9px;display:grid;place-items:center;gap:3.5px}
.burger i{display:block;width:14px;height:1.7px;background:var(--navy);border-radius:2px}

/* ── 히어로 (1화면 안에 CTA까지) ── */
.hero{position:relative;padding:14px var(--pad) 20px;text-align:center;overflow:hidden;
  background:radial-gradient(120% 66% at 50% -14%,#fff 0%,#E9F1FF 44%,#F5F9FF 100%)}
.hero .blob{position:absolute;border-radius:50%;pointer-events:none}
.hero .b1{width:130px;height:130px;background:rgba(96,165,250,.15);top:-28px;left:-42px}
.hero .b2{width:96px;height:96px;background:rgba(37,99,235,.09);top:130px;right:-36px}

.badges{position:relative;display:flex;gap:6px;justify-content:center;margin-bottom:11px;flex-wrap:wrap}
.bdg{font-size:11.5px;font-weight:800;letter-spacing:-.02em;padding:6px 12px;border-radius:999px;color:#fff}
.bdg.free{background:linear-gradient(135deg,#3B82F6,#1D4ED8);box-shadow:0 5px 14px rgba(37,99,235,.26)}
.bdg.mbti{background:var(--navy)}

h1.hook{position:relative;margin:0 0 7px;font-size:28px;line-height:1.24;letter-spacing:-.05em;font-weight:800;color:var(--navy)}
h1.hook b{color:var(--blue)}
h1.hook .mark{display:inline-block;background:linear-gradient(180deg,transparent 56%,#FFE08A 56%);padding:0 3px}
.sub{position:relative;margin:0 0 14px;font-size:13px;line-height:1.55;color:var(--gray);font-weight:500}

/* 오행 순환 스트립 */
.ohwrap{position:relative;margin-bottom:12px}
.ohstrip{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.oh{
  background:#fff;border:1px solid var(--line);border-radius:14px;padding:9px 3px 8px;
  display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;
  box-shadow:0 2px 8px rgba(20,50,110,.06);
  animation:cyc 6s linear infinite;
}
.oh .han{width:19px;height:19px;border-radius:50%;display:grid;place-items:center;
  font-size:10.5px;font-weight:800;color:#fff;letter-spacing:-.04em}
.oh .sym{font-size:27px;line-height:1.1;margin:1px 0}
.oh .nm{font-size:11.5px;font-weight:800;color:var(--navy);letter-spacing:-.04em}
.oh .kw{font-size:9.5px;font-weight:600;color:var(--gray);letter-spacing:-.04em}
.oh:nth-child(1){animation-delay:0s}
.oh:nth-child(2){animation-delay:1.2s}
.oh:nth-child(3){animation-delay:2.4s}
.oh:nth-child(4){animation-delay:3.6s}
.oh:nth-child(5){animation-delay:4.8s}
@keyframes cyc{
  0%   {background:#fff;border-color:var(--line);transform:translateY(0);box-shadow:0 2px 8px rgba(20,50,110,.06)}
  5%   {background:var(--blue-p);border-color:#9FC5FF;transform:translateY(-5px);box-shadow:0 10px 20px rgba(37,99,235,.24)}
  17%  {background:var(--blue-p);border-color:#9FC5FF;transform:translateY(-5px);box-shadow:0 10px 20px rgba(37,99,235,.24)}
  24%  {background:#fff;border-color:var(--line);transform:translateY(0);box-shadow:0 2px 8px rgba(20,50,110,.06)}
  100% {background:#fff;border-color:var(--line);transform:translateY(0);box-shadow:0 2px 8px rgba(20,50,110,.06)}
}
.ohwrap.paused .oh{animation-play-state:paused}
.oh.on{background:var(--blue-p)!important;border-color:#9FC5FF!important;transform:translateY(-5px)!important;
  box-shadow:0 10px 20px rgba(37,99,235,.24)!important}
.cycnote{margin-top:7px;font-size:11px;font-weight:700;color:var(--blue-d);letter-spacing:-.02em;
  display:flex;align-items:center;justify-content:center;gap:5px;min-height:17px}
.cycnote .arrow{color:#9FC5FF}

/* 시간 + 화살표 */
.timeline{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;margin-bottom:12px}
.timeline .txt{text-align:center}
.timeline .q{font-size:11.5px;font-weight:700;color:var(--gray)}
.timeline .a{font-size:20px;font-weight:800;letter-spacing:-.05em;color:var(--navy);line-height:1.2}
.timeline .a em{font-style:normal;color:var(--blue)}
.timeline svg{flex:0 0 34px;margin-top:6px}
.timeline .hook-arrow{animation:nudge 1.9s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}

/* 듀얼 CTA */
.cta-pair{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.btn{border:0;border-radius:16px;padding:12px 10px;cursor:pointer;font-family:inherit;text-align:left;
  display:flex;align-items:center;gap:8px;min-height:66px}
.btn .ico{flex:0 0 30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:15px;background:rgba(255,255,255,.9)}
.btn .tx{flex:1;min-width:0;text-align:center}
/* 큰 글씨(t1)와 작은 글씨(t2)는 반드시 다른 줄에 둔다.
   원래 nowrap 이 두 span 을 갈라 주고 있었을 뿐이라, 줄바꿈을 허용한
   순간 한 줄로 붙어 버렸다. display:block 으로 구조 자체를 고친다. */
.btn .t1{display:block;font-size:14px;font-weight:800;letter-spacing:-.04em;line-height:1.26;
  white-space:normal;overflow-wrap:anywhere;word-break:keep-all}
.btn .t2{display:block;font-size:10px;font-weight:700;letter-spacing:-.02em;opacity:.88;
  margin-top:4px;line-height:1.32;
  white-space:normal;overflow-wrap:anywhere;word-break:keep-all}
/* 한국어 외 언어도 좌우 2단을 유지한다 — 대신 글자를 조금 줄여 2줄에 담는다 */
html:not([lang="ko"]) .btn{padding:12px 8px;gap:6px}
html:not([lang="ko"]) .btn .ico{flex:0 0 26px;height:26px;font-size:13px}
html:not([lang="ko"]) .btn .go{flex:0 0 18px;height:18px;font-size:10px}
html:not([lang="ko"]) .btn .t1{font-size:12.6px;letter-spacing:-.03em;line-height:1.24}
html:not([lang="ko"]) .btn .t2{font-size:9.2px;margin-top:3px;line-height:1.3}
/* 아주 좁은 화면에서만 세로로 쌓는다 */
@media(max-width:342px){ html:not([lang="ko"]) .cta-pair{grid-template-columns:1fr} }
html:not([lang="ko"]) .sv .sn{white-space:normal;overflow-wrap:anywhere}
html:not([lang="ko"]) .trust .n,html:not([lang="ko"]) .trust .l{white-space:normal;overflow-wrap:anywhere}
html:not([lang="ko"]) .card-title{font-size:26px;line-height:1.2}
html:not([lang="ko"]) .card-pill,html:not([lang="ko"]) .card-foot{white-space:normal;overflow-wrap:anywhere;line-height:1.45}
html:not([lang="ko"]) .card-line{white-space:normal;overflow-wrap:anywhere}
html:not([lang="ko"]) .need span,html:not([lang="ko"]) .ch-btn{white-space:normal;overflow-wrap:anywhere}
html:not([lang="ko"]) .step h4,html:not([lang="ko"]) .step p{overflow-wrap:anywhere}
html:not([lang="ko"]) .oh .nm,html:not([lang="ko"]) .oh .kw{white-space:normal;line-height:1.22}
html:not([lang="ko"]) .cycnote{white-space:normal;line-height:1.5}
html:not([lang="ko"]) .biz{overflow-wrap:anywhere}
.btn .go{flex:0 0 20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:800}
.btn-free{background:linear-gradient(135deg,#3B82F6,#4F46E5);color:#fff;box-shadow:0 10px 22px rgba(37,99,235,.32)}
.btn-free .go{background:rgba(255,255,255,.95);color:var(--blue-d)}
.btn-pro{background:#fff;color:var(--navy);border:2px solid var(--navy);box-shadow:0 8px 18px rgba(18,34,74,.12)}
.btn-pro .ico{background:var(--blue-p)}
.btn-pro .t2{color:var(--crim)}
.btn-pro .go{background:var(--navy);color:#fff}
.btn:active{transform:translateY(1px)}

/* 신뢰 스트립 */
.trust{position:relative;display:flex;margin-top:12px;background:#fff;border:1px solid var(--line);
  border-radius:15px;overflow:hidden;box-shadow:0 4px 12px rgba(20,50,110,.05)}
.trust div.cell{flex:1;padding:10px 4px;text-align:center;border-right:1px solid #ECF2FB}
.trust div.cell:last-child{border-right:0}
.trust .ti{font-size:15px;line-height:1}
.trust .n{font-size:11.5px;font-weight:800;letter-spacing:-.04em;color:var(--navy);margin-top:3px}
.trust .l{font-size:9.5px;color:var(--gray);margin-top:1px;font-weight:600;letter-spacing:-.03em}
.disclosure{position:relative;margin-top:11px;font-size:11px;color:#8B9AB2;line-height:1.55;font-weight:500}

/* ── 섹션 공통 ── */
section{padding:30px var(--pad)}
body{padding-bottom:86px}
.step-drop{width:100%;margin-top:8px;padding:10px 12px;border:1.5px solid #BFD5F5;border-radius:10px;font-size:14px;font-weight:700;color:#1A4E9E;background:#EEF5FF;font-family:inherit;cursor:pointer}
.ch-btn{display:inline-block;padding:8px 14px;border:1.5px solid #D0DFF5;border-radius:99px;font-size:13px;font-weight:700;color:#2F7FF0;text-decoration:none;background:#F4F8FF}
/* 주력 채널 2곳은 색·테두리·그림자로 눌러보고 싶게 */
.ch-btn.hot{color:#fff;border:0;font-weight:800;font-size:13.4px;padding:10px 18px;
  box-shadow:0 3px 10px rgba(20,60,120,.22);transform:translateY(-1px)}
.ch-btn.hot::after{content:" →";font-weight:900}
.ch-btn.naver{background:linear-gradient(135deg,rgba(56,150,255,.92),rgba(29,110,225,.92));
  box-shadow:0 3px 11px rgba(29,124,242,.28)}
.ch-btn.insta{background:linear-gradient(135deg,rgba(96,196,255,.92),rgba(45,160,240,.92));
  box-shadow:0 3px 11px rgba(45,160,240,.26)}
.ch-btn.hot:active{transform:translateY(0);box-shadow:0 1px 4px rgba(20,60,120,.2)}
a.need{text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:center;gap:10px;text-align:center}
a.need:hover{background:#EEF5FF}
.sec-label{font-size:11px;font-weight:800;letter-spacing:.13em;color:var(--blue);margin-bottom:7px}
h2{margin:0 0 6px;font-size:20px;line-height:1.38;letter-spacing:-.045em;font-weight:800;color:var(--navy)}
h2 b{color:var(--blue)}
.sec-sub{margin:0 0 16px;font-size:13px;color:var(--gray);line-height:1.6;font-weight:500}

/* 결과 카드 */
.preview{background:linear-gradient(180deg,#E9F1FF,#F5F9FF)}
.card-lux{border-radius:24px;padding:3px;background:linear-gradient(140deg,#93C5FD,#2563EB 55%,#1E40AF);box-shadow:0 16px 36px rgba(37,99,235,.24)}
.card-in{background:#FBFCFF;border-radius:21px;padding:19px 16px 16px;text-align:center}
.card-brand{display:inline-block;font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#3B82F6,#1D4ED8);padding:6px 14px;border-radius:999px;margin-bottom:11px}
.card-emoji{font-size:40px;line-height:1;margin-bottom:5px}
.card-kicker{font-size:11.5px;font-weight:700;color:var(--gray)}
.card-title{margin:2px 0 1px;font-size:28px;font-weight:800;letter-spacing:-.055em;color:var(--navy)}
.card-en{font-size:12px;font-weight:700;color:#A3B2C9;margin-bottom:6px}
.card-line{font-size:15.5px;font-weight:800;color:var(--blue);letter-spacing:-.04em;margin-bottom:10px}
.card-pill{display:inline-block;font-size:12.5px;font-weight:800;color:var(--navy);border:1.5px solid var(--line);border-radius:999px;padding:6px 15px;margin-bottom:14px}
.caps{display:flex;align-items:flex-end;justify-content:center;gap:9px;margin-bottom:12px}
.cap{width:42px;display:flex;flex-direction:column;align-items:center}
.cap .tube{width:42px;background:#EDF2FA;border-radius:21px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:6px 0 5px;box-shadow:inset 0 1px 3px rgba(20,50,110,.07)}
.cap .num{font-size:15px;font-weight:800;line-height:1}
.cap .pel{width:24px;border-radius:12px}
.cap .pct{font-size:10.5px;font-weight:700;color:#9AA9BF;margin-top:5px}
.cap .han{font-size:21px;font-weight:800}
.card-foot{border-top:1px solid #E9EFF9;padding-top:11px;font-size:13px;font-weight:800;color:var(--navy)}
.card-foot b{color:var(--blue)}
.card-url{font-size:12.5px;font-weight:800;color:var(--blue);margin-top:4px}

/* 대조 섹션 */
.contrast{background:var(--crim-l);border-top:1px solid #F3DDE3;border-bottom:1px solid #F3DDE3}
.contrast .sec-label{color:var(--crim)}
.contrast h2{color:#5C0F26;font-size:24px;line-height:1.3}
.contrast h2 b{color:var(--crim)}
.contrast .sec-sub{color:#8A6572}
.vs{display:flex;align-items:stretch;gap:8px;margin-bottom:13px}
.vs .box{flex:1;background:#fff;border-radius:14px;padding:13px 11px;text-align:center;box-shadow:0 3px 11px rgba(168,28,70,.07)}
.vs .box .t{font-size:13px;font-weight:800;color:var(--navy);margin-bottom:4px}
.vs .box.r .t{color:var(--crim)}
.vs .box .d{font-size:11px;color:var(--gray);line-height:1.5;font-weight:500}
.vs .mid{display:grid;place-content:center;font-size:18px;font-weight:800;color:var(--crim)}
.calibnote{background:#fff;border-left:4px solid var(--crim);border-radius:10px;padding:11px 12px;font-size:11.5px;line-height:1.6;color:#6B4A55;font-weight:500}
.calibnote b{color:var(--crim);font-weight:800}

/* 지금 열려 있는 것 — NOW 카드 독립 구조
 * 각 .slide는 독립 이벤트/콘텐츠 단위
 * data-id 속성으로 향후 CMS 연동 가능 */
.slides{display:flex;gap:9px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 0 8px;scrollbar-width:none}
.slides::-webkit-scrollbar{display:none}
.slide{flex:0 0 79%;scroll-snap-align:center;text-align:center;border-radius:18px;padding:16px;position:relative;background:#fff;border:1px solid var(--line);box-shadow:0 6px 16px rgba(20,50,110,.07)}
.slide .tag{display:inline-block;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;background:var(--blue-p);color:var(--blue-d);margin-bottom:8px}
.slide.warm .tag{background:#FFF3D6;color:#A97904}
.slide h3{margin:0 0 5px;font-size:16px;letter-spacing:-.04em;font-weight:800;color:var(--navy);line-height:1.35}
.slide p{margin:0 0 10px;font-size:12px;color:var(--gray);line-height:1.55;font-weight:500}
.slide a{display:inline-block;font-size:12px;font-weight:800;color:var(--blue);text-decoration:none;border-bottom:1.5px solid rgba(37,99,235,.35)}
.dday{position:absolute;top:13px;right:13px;z-index:1;font-size:10.5px;font-weight:800;color:var(--crim);background:#FDECF1;padding:4px 9px;border-radius:999px}

/* 고민 */
.needs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.need{background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px 12px;font-size:13.5px;font-weight:700;letter-spacing:-.04em;color:var(--navy);display:flex;align-items:center;gap:8px;box-shadow:0 3px 9px rgba(20,50,110,.05)}
.need i{font-style:normal;font-size:17px}
.need.more{grid-column:1/-1;justify-content:center;color:var(--gray);font-weight:600;font-size:12.5px;background:transparent;border-style:dashed;box-shadow:none}

/* 3단계 */
.steps{position:relative;padding-left:26px}
.steps::before{content:"";position:absolute;left:7px;top:9px;bottom:16px;width:2px;background:linear-gradient(180deg,var(--blue),rgba(37,99,235,.12))}
.step{position:relative;margin-bottom:16px;text-align:center}
.step::before{content:"";position:absolute;left:-24px;top:4px;width:15px;height:15px;border-radius:50%;background:#fff;border:3px solid var(--blue)}
.step .t{font-size:10.5px;color:var(--blue);font-weight:800}
.step h4{margin:1px 0 3px;font-size:14.5px;font-weight:800;letter-spacing:-.04em;color:var(--navy)}
.step p{margin:0;font-size:12.5px;color:var(--gray);line-height:1.6;font-weight:500}

/* 후기 */
.review{background:#fff;text-align:center;border:1px solid var(--line);border-radius:16px;padding:15px;box-shadow:0 4px 12px rgba(20,50,110,.05)}
.review .stars{color:var(--gold);font-size:13px;letter-spacing:2px}
.review p{margin:8px 0 9px;font-size:13px;line-height:1.7;color:var(--ink);font-weight:500}
.review .who{font-size:11.5px;color:var(--gray);font-weight:600}
.review-cta{margin-top:10px;background:var(--blue-p);border:1px solid #C9DDFB;border-radius:13px;padding:11px 13px;font-size:12px;color:var(--navy-2);line-height:1.55;font-weight:600}
.review-cta b{color:var(--crim);font-weight:800}

/* 채널 */
.channels{display:flex;flex-wrap:wrap;gap:6px}
.channels span{font-size:12px;font-weight:600;color:var(--navy);background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 12px}

footer{padding:22px var(--pad) 28px;background:var(--navy);color:rgba(255,255,255,.72);font-size:11px;line-height:1.75;font-weight:500}
footer b{color:#fff;font-size:14px;font-weight:800;letter-spacing:-.04em}
.util .ver{font-size:10.6px;font-weight:800;color:#9AA7BD;letter-spacing:.02em;margin-right:2px}
.util .chip{cursor:pointer}
.util .burger{cursor:pointer}
.voc{font-size:11px;line-height:1.65;color:#7A8AA3;text-align:center;padding:9px var(--pad);
  background:#F4F8FD;border-top:1px solid #E9F0F9;border-bottom:1px solid #E9F0F9}
.voc.bot{background:none;border:0;color:#8C9AAF;padding:16px var(--pad) 2px}
footer .biz{display:inline-block;color:rgba(255,255,255,.55);font-size:10.6px;line-height:1.85}
footer .lg{display:inline-block;margin:6px 12px 0 0;color:rgba(255,255,255,.85);
  font-size:11.6px;font-weight:800;text-decoration:underline;text-underline-offset:3px}

/* 하단 고정 */
.dock{position:fixed;bottom:0;left:0;right:0;z-index:50;max-width:430px;margin:0 auto;
  background:rgba(255,255,255,.95);backdrop-filter:blur(14px);border-top:1px solid var(--line);
  padding:9px var(--pad) calc(9px + env(safe-area-inset-bottom));
  display:grid;grid-template-columns:1fr 1fr;gap:8px;box-shadow:0 -6px 20px rgba(20,50,110,.10)}
.dock .btn{padding:10px 9px;border-radius:14px}

@media(prefers-reduced-motion:reduce){
  .oh,.timeline .hook-arrow{animation:none}
}
@media(max-width:359px){
  .oh .kw{display:none}
  .btn .t1{font-size:13px}
}

/* ═══ v6: 서비스 카드 그리드 ═══ */
.svc{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}
.sv-wide{grid-column:1 / -1}
/* 신규 상품 강조 — 밝고 투명한 청색 바탕 + 도톰한 테두리 */
.sv-new{background:linear-gradient(180deg,rgba(228,240,255,.92),rgba(240,247,255,.88));
  border:2px solid var(--blue);box-shadow:0 6px 20px rgba(45,127,240,.20)}
.sv-new .sn{color:var(--navy)}
.sv-new .tag{background:var(--blue);color:#fff}
.sv-new::after{content:"NEW";position:absolute;top:9px;left:11px;font-size:9px;font-weight:900;
  letter-spacing:.06em;color:#fff;background:#F0455E;border-radius:999px;padding:2px 7px}
.sv{position:relative;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 13px 12px;box-shadow:0 4px 12px rgba(20,50,110,.05);text-align:center}
.sv .si{font-size:23px;line-height:1}
.sv .sn{font-size:14.5px;font-weight:800;color:var(--ink);margin-top:7px}
.sv .sd{font-size:11.5px;color:var(--gray);margin-top:3px;line-height:1.45;font-weight:500}
.tag{position:absolute;top:10px;right:10px;font-size:10px;font-weight:800;padding:3px 8px;border-radius:99px;letter-spacing:-.2px}
.tag.free{background:#E7F6EE;color:#0F8A4C}
.tag.day{background:#FFF3DE;color:#B8792A}
.tag.pay{background:#EAF2FF;color:#1D6DE3}
/* ═══ v6: 상담 카드 — 간편(채움) vs 정밀(투명+테두리) ═══ */
.consult{margin-top:9px;background:linear-gradient(180deg,#F2F7FF,#fff);border:1px solid #D7E6FB;border-radius:18px;padding:15px 13px 13px}
.consult .ct{font-size:15px;font-weight:800;color:var(--ink)}
.consult .cs{font-size:11.5px;color:var(--gray);margin-top:3px;font-weight:500}
.cbtns{display:grid;grid-template-columns:1.15fr 1fr;gap:8px;margin-top:11px}
.cb{border-radius:14px;padding:12px 10px;text-align:center;font-family:inherit;cursor:pointer}
.cb .b1{display:block;font-size:13.5px;font-weight:800;letter-spacing:-.3px}
.cb .b2{display:block;font-size:11px;margin-top:3px;font-weight:600;opacity:.92}
.cb-quick{background:linear-gradient(135deg,#2F7FF0,#1D6DE3);border:0;color:#fff;box-shadow:0 6px 14px rgba(29,109,227,.28)}
.cb-deep{background:linear-gradient(135deg,#EEF5FF,#E0EDFF);border:1.5px solid #93C0F5;color:#1A4E9E;box-shadow:0 2px 8px rgba(29,109,227,.12)}
.pricenote{margin-top:8px;font-size:10.5px;color:#9AA7BD;font-weight:600}
/* ═══ v6: 하단 탭바 (기존 dock 대체) ═══ */
.tabbar{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:100%;max-width:430px;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr 1.2fr 1fr 1fr;padding:7px 6px calc(9px + env(safe-area-inset-bottom));z-index:60}
.tb{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:700;color:#9AA7BD;background:none;border:0;font-family:inherit}
.tb .ti{line-height:0}
.tb .ti svg{width:22px;height:22px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.tb.on{color:var(--blue)}
.tb.main{margin-top:-22px}
.tb.main .ti{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#2F7FF0,#1D6DE3);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(29,109,227,.35);border:3px solid #fff}
.tb.main .ti svg{width:24px;height:24px;stroke-width:2}
.tb.main{color:var(--blue)}
.wallchip{display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:#0F2A5C;color:#DCE9FF;font-size:11.5px;font-weight:700;padding:7px 12px;border-radius:99px}

/* ══════════════════════════════════════════════════════════════
   상품 진열 블록 (PRODUCT SHOWCASE)
   ──────────────────────────────────────────────────────────────
   작명 3종 세트를 첫 사례로 만들지만, 구조는 상품 종류와 무관하다.
   나중에 사주 리포트 10~12종을 붙일 때도 마크업만 복제하면 된다.

     .prod        상품 한 덩어리 (이미지 + 설명 + 등급 + CTA)
     .prod-hero   대표 이미지
     .prod-inc    포함 내용 3가지
     .prod-step   진행 단계
     .prod-tier   등급 카드 (가격)
     .prod-cta    신청 버튼
   ══════════════════════════════════════════════════════════════ */
.prod{background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;
  box-shadow:0 8px 26px rgba(20,50,110,.08);margin-top:16px}
.prod-hero{display:block;width:100%;aspect-ratio:1200/750;object-fit:cover;background:var(--bg-alt)}
.prod-body{padding:18px 16px 20px;text-align:center}
.prod-kick{font-size:11px;font-weight:900;letter-spacing:.09em;color:var(--blue);margin-bottom:7px}
.prod-h{font-size:19px;font-weight:900;line-height:1.35;letter-spacing:-.03em;color:var(--navy)}
.prod-lead{margin-top:9px;font-size:13px;line-height:1.72;color:var(--body);word-break:keep-all}

/* 포함 내용 3가지 */
.prod-inc{margin-top:15px;display:grid;gap:8px}
.prod-inc-i{display:flex;gap:10px;align-items:flex-start;text-align:left;
  background:var(--bg-alt);border-radius:12px;padding:11px 13px}
.prod-inc-n{flex:0 0 21px;height:21px;border-radius:7px;background:var(--blue);color:#fff;
  font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:1px}
.prod-inc-t{font-size:13px;font-weight:800;color:var(--ink);letter-spacing:-.02em}
.prod-inc-d{font-size:11.8px;line-height:1.6;color:var(--body);margin-top:2px;word-break:keep-all}

/* 진행 단계 */
.prod-steps{margin-top:15px;border-top:1px dashed var(--line);padding-top:14px;display:grid;gap:9px}
.prod-step{text-align:left;background:#F7FAFF;border:1px solid #E4EDFB;border-radius:12px;padding:11px 13px}
.prod-step b{display:block;font-size:12.6px;font-weight:900;color:var(--navy);letter-spacing:-.02em}
.prod-step span{display:block;font-size:11.6px;line-height:1.62;color:var(--body);margin-top:3px;word-break:keep-all}

.prod-peek{margin-top:13px;font-size:12.6px;font-weight:700;color:var(--navy);background:var(--bg-alt);border-radius:11px;padding:10px 12px;word-break:keep-all}
/* 샘플 뷰어 */
.gal{position:fixed;inset:0;z-index:90;background:rgba(8,20,40,.94);display:none;
  flex-direction:column;-webkit-user-select:none;user-select:none}
.gal.on{display:flex}
.gal-bar{display:flex;align-items:center;gap:10px;padding:14px 16px;color:#fff}
.gal-t{font-size:14px;font-weight:800;flex:1;min-width:0}
.gal-n{font-size:12.5px;font-weight:700;opacity:.75;white-space:nowrap}
.gal-x{width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,.16);
  color:#fff;font-size:20px;line-height:1;cursor:pointer;font-family:inherit;flex:0 0 32px}
.gal-stage{flex:1;display:flex;align-items:center;justify-content:center;padding:0 14px;overflow:hidden}
.gal-stage img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;
  box-shadow:0 10px 40px rgba(0,0,0,.5);pointer-events:none}
.gal-nav{display:flex;gap:10px;justify-content:center;padding:12px}
.gal-nav button{width:46px;height:46px;border:0;border-radius:50%;background:rgba(255,255,255,.16);
  color:#fff;font-size:24px;line-height:1;cursor:pointer;font-family:inherit}
.gal-nav button:disabled{opacity:.3}
.gal-foot{text-align:center;color:rgba(255,255,255,.72);font-size:11.6px;padding:0 16px 18px}

/* 접기 — 홈이 길어지지 않도록 상세는 눌러야 펼친다 */
.prod-fold{overflow:hidden;max-height:0;opacity:0;
  transition:max-height .38s ease,opacity .3s ease}
.prod-fold.on{max-height:4200px;opacity:1}
.prod-pdf{margin-top:15px;border-top:1px dashed var(--line);padding-top:14px}
.prod-pdf-t{font-size:12.6px;font-weight:800;color:var(--navy);margin-bottom:9px}
.prod-pdf-n{font-size:11.6px;line-height:1.6;color:var(--body);background:var(--bg-alt);
  border-radius:9px;padding:8px 11px;margin-bottom:9px;word-break:keep-all}
.prod-pdf-n b{color:var(--navy)}
.prod-pdf-g{display:grid;gap:7px}
.prod-pdf-g button{display:flex;align-items:center;justify-content:center;gap:6px;
  border:1.5px solid var(--line);border-radius:11px;padding:11px;background:#fff;
  font-size:12.8px;font-weight:800;color:var(--blue);text-decoration:none;transition:.15s}
.prod-pdf-g button::before{content:"🔍";font-size:13px}
.prod-pdf-g button{width:100%;font-family:inherit;cursor:pointer}
.prod-pdf-g button:hover{background:var(--blue-p);border-color:var(--blue-l)}
.prod-more{margin-top:13px;width:100%;border:1.5px solid var(--line);background:#fff;border-radius:12px;
  padding:11px;font-family:inherit;font-size:13px;font-weight:800;color:var(--blue);cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:6px;transition:.15s}
.prod-more:hover{background:var(--blue-p);border-color:var(--blue-l)}
.prod-more i{font-style:normal;font-size:10px;transition:transform .3s}
.prod-more.on i{transform:rotate(180deg)}

/* 등급 안내 · 카드 */
.prod-same{margin-top:16px;font-size:12.2px;line-height:1.6;color:var(--body);background:#F3F7FD;border:1px solid #DCE7F5;border-radius:11px;padding:9px 12px;word-break:keep-all}
.prod-same b{color:var(--navy)}
.prod-tiers{margin-top:16px;display:grid;gap:9px}
.prod-tier{position:relative;border:1.5px solid var(--line);border-radius:14px;padding:13px 12px;background:#fff;
  display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left}
.prod-tier{text-decoration:none;color:inherit;cursor:pointer;transition:.15s}
.prod-tier:hover{border-color:var(--blue-l);box-shadow:0 4px 14px rgba(45,127,240,.14);transform:translateY(-1px)}
.prod-tier::after{content:"›";position:absolute;right:12px;top:50%;transform:translateY(-50%);
  font-size:19px;font-weight:900;color:var(--gray);line-height:1}
.prod-tier .prod-tier-p{padding-right:16px}
.prod-tier.best{border-color:var(--blue);background:var(--blue-p);box-shadow:0 4px 14px rgba(45,127,240,.16)}
.prod-tier-l .n{font-size:13.4px;font-weight:900;color:var(--ink);letter-spacing:-.02em}
.prod-tier-l .d{font-size:11.4px;color:var(--body);margin-top:2px}
.prod-tier-p{font-size:16px;font-weight:900;color:var(--navy);white-space:nowrap}
.prod-tier.best .prod-tier-p{color:var(--blue)}
.prod-best-tag{position:absolute;top:-9px;left:12px;background:var(--blue);color:#fff;
  font-size:9.6px;font-weight:900;letter-spacing:.02em;border-radius:999px;padding:3px 9px}

/* 공통 조건 · 안내 */
.prod-note{margin-top:13px;background:#FFF8E8;border:1px solid #F0DDB0;border-radius:12px;
  padding:11px 13px;font-size:11.6px;line-height:1.7;color:#7A5A18;text-align:left;word-break:keep-all}
.prod-note b{color:#5E4410}

/* CTA */
.prod-cta{margin-top:14px;display:grid;gap:8px}
.prod-cta a,.prod-cta button{display:block;width:100%;border:0;border-radius:14px;padding:14px 12px;
  font-family:inherit;font-size:14.6px;font-weight:900;letter-spacing:-.02em;text-align:center;
  text-decoration:none;cursor:pointer;transition:.15s}
.prod-cta .go{background:linear-gradient(135deg,#2F7FF0,#1D6DE3);color:#fff}
.prod-cta .go:hover{filter:brightness(1.06)}
.prod-cta .sub{background:#fff;color:var(--blue);border:1.5px solid var(--line)}
.prod-cta .sub:hover{background:var(--blue-p);border-color:var(--blue-l)}
.prod-other{margin-top:13px;font-size:12.2px;line-height:1.65;color:var(--body);word-break:keep-all}

/* 샘플 미리보기 2장 */
.prod-samples{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.prod-samples img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;
  border:1px solid var(--line);background:var(--bg-alt)}
.prod-samples figcaption{font-size:10.8px;font-weight:700;color:var(--body);margin-top:5px;text-align:center}
@media(max-width:342px){ .prod-samples{grid-template-columns:1fr} }

/* ── 언어 드롭다운 (5개 국어) ── */
.langbox{position:relative}
.langbtn{font-size:11.5px;font-weight:700;color:var(--navy);border:1px solid var(--line);background:#fff;
  border-radius:999px;padding:5px 10px;cursor:pointer;font-family:inherit;white-space:nowrap;display:flex;align-items:center;gap:4px}
.langbtn:hover{background:var(--blue-p);border-color:var(--blue-l)}
.langbtn i{font-style:normal;font-size:9px;color:var(--gray);transition:transform .18s}
.langbox.open .langbtn{background:var(--blue-p);border-color:var(--blue)}
.langbox.open .langbtn i{transform:rotate(180deg)}
.langmenu{position:absolute;right:0;top:calc(100% + 7px);min-width:132px;background:#fff;
  border:1px solid var(--line);border-radius:13px;box-shadow:0 12px 32px rgba(20,50,110,.16);
  padding:5px;display:none;z-index:60}
.langbox.open .langmenu{display:block}
.langmenu button{display:block;width:100%;text-align:left;border:none;background:none;font-family:inherit;
  font-size:13px;font-weight:600;color:var(--ink);padding:9px 11px;border-radius:9px;cursor:pointer}
.langmenu button:hover{background:var(--bg)}
.langmenu button.on{background:linear-gradient(135deg,#2F7FF0,#1D6DE3);color:#fff;font-weight:800}
.langmenu button small{display:block;font-size:10.5px;font-weight:500;opacity:.62;margin-top:1px}
.langmenu button.on small{opacity:.85}
`;

/* ═══════════════════════════════════════════════════════════════════
   홈 다국어 사전 — 5개 국어
   용어 기준: 오행 = Five Elements (5行) / 五行 / 五行 / Cinq Phases (五行)
             영점조정 = 번역하지 않고 "실제 나와의 차이"를 설명하는 말로
             중국어 = 간체 · 일반 사용자 기준
             옮기기 어려운 용어는 () 안에 한자·한글 병기
   언어 선택은 오행 앱과 같은 저장소 키(ohaeng_lang)를 쓴다 —
   여기서 바꾸면 /ohaeng/ 으로 넘어가도 그대로 유지된다.
   ═══════════════════════════════════════════════════════════════════ */
const LANGS = ["ko", "en", "ja", "zh", "fr"] as const;
type Lang = typeof LANGS[number];
const LANGNAME: Record<Lang, string> = { ko: "한국어", en: "English", ja: "日本語", zh: "中文", fr: "Français" };

const I18N: Record<Lang, Record<string, string>> = {

ko: {},   /* 한국어는 HTML 원문을 그대로 쓴다 (applyLang 이 원본을 기억한다) */

en: {
 nmMore:"See prices and contents",
 nmLess:"Close",
 nmPeek:"Report of 20–25 pages · framed certificate · 8-page keepsake commentary",
 nmPdfT:"See the actual deliverables",
 nmPdf1:"Preview the report",
 nmPdf2:"Preview the certificate",
 nmPdf3:"Preview the commentary",
 nmPdfN:"These samples are <b>fictional examples</b>, not real customer data.",
 nmPdfN2:"These samples are <b>fictional examples</b>, not real customer data.",
 nmGalFoot:"The full document goes only to those who order · view only",
 nmH2:"A child's name is the word they will hear <b>more than any other</b>",
 nmSub:"So it should not merely be pretty. It should fit.",
 nmKick:"Newborn naming, premium",
 nmTitle:"The Naming Set of Three",
 nmLead:"We analyse the child's Saju down to the useful god, the supporting element and the ten-year cycles to find the elements they will need for life. Only names that clear all three checks — radical elements, phonetic flow and the 81 numerology — become candidates. We also verify the characters against the Supreme Court's approved list.",
 nmInc1t:"Detailed report, 20–25 pages",
 nmInc1d:"From the full Saju analysis to a scoreboard comparing five or six candidate names",
 nmInc2t:"Framed certificate of naming (命名書)",
 nmInc2d:"The chart, the prescribed elements, the three checks, a blessing and the representative's signature. High-resolution A4 original.",
 nmInc3t:"Keepsake name commentary, 8 pages",
 nmInc3d:"What each character carries, why these sounds and stroke counts, and a letter to the child",
 nmSmp1:"The actual set",
 nmSmp2:"The certificate",
 nmS1t:"Step 1 · Saju analysis",
 nmS1d:"The strength of the Day Master, which elements run short or over, the ten gods, the ten-year cycles. From this we find the element this child will need for life, and the channel to release what runs over.",
 nmS2t:"Step 2 · Three checks",
 nmS2d:"Do the characters' own elements fill what the chart lacks? Do the surname and given name flow without clashing? Are all four numerology segments auspicious? Only names that clear all three become candidates.",
 nmS3t:"Step 3 · The set of three",
 nmS3d:"Not just a name, but the record of why this name.",
 nmSame:"All three tiers include <b>the same set of three</b>. Only the consultation differs.<br>Just <b>pick the tier you want</b> on the request form.",
 nmT1n:"Basic · report only",
 nmT1d:"No consultation · ask by chat",
 nmT2n:"Standard · chat or phone",
 nmT2d:"Includes 30 minutes by chat or phone",
 nmT3n:"Premium · in person",
 nmT3d:"60 minutes in person · at a café by agreement",
 nmWon:" KRW",
 nmWon2:" KRW",
 nmWon3:" KRW",
 nmBest:"Most chosen",
 nmNote:"First report delivered within <b>72 hours</b> · <b>two or three revisions free</b> until the name is settled · we can start from an expected birth date and <b>re-verify free of charge</b> once the actual time is known.<br>In-person meetings are arranged at a café by agreement while our office is between locations.",
 nmGo:"Request a naming →",
 nmAsk:"Ask first (KakaoTalk)",
 nmOther:"Renaming, stage names and business names follow the same process. Just tell us on the request form.",
 sv5n:"Naming Set of Three",
 sv5d:"Report · certificate · commentary",
 tagNm:"From 200,000 KRW",
 navNaming:"Naming",
 secResult:"FREE ELEMENT CHECK · RESULT",
 brand:'AI<span>sajuLab</span>.com', brandSub:'AI × Myeongnihak',
 voc:'AIsajuLab.com listens to every piece of customer feedback and keeps refining its analysis and report quality, so that your satisfaction and your quality of life keep improving.',
 voc2:'AIsajuLab.com listens to every piece of customer feedback and keeps refining its analysis and report quality, so that your satisfaction and your quality of life keep improving.',
 bdgFree:'🎁 Element check · Today\u0027s flow — free', bdgMbti:'Like blood type or MBTI!',
 hook:'So what are my<br><span class="mark"><b>Five Elements (5行)</b></span> really?',
 heroSub:'Your temperament and strengths, found through Saju myeongnihak × AI analysis',
 nMok:'Wood (木)', kMok:'Growth · expansion',
 nHwa:'Fire (火)', kHwa:'Passion · expression',
 nTo:'Earth (土)', kTo:'Center · stability',
 nGeum:'Metal (金)', kGeum:'Decision · execution',
 nSu:'Water (水)', kSu:'Wisdom · flow',
 dMok:'Wood (木) — the force that grows. You open new things and widen them.',
 dHwa:'Fire (火) — the force that shows. Passion and expression draw people in.',
 dTo:'Earth (土) — the force that holds. You keep the center and last.',
 dGeum:'Metal (金) — the force that concludes. Clear standards, fast decisions.',
 dSu:'Water (水) — the force that weighs. You flow flexibly and think deeply.',
 cyc:'木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> back to 木',
 tlQ:'14 questions', tlA:'Done in <em>1 minute</em>!',
 ctaFree1:"Free element check", ctaFree2:'No sign-up needed',
 ctaPro1:'Expert consultation', ctaPro2:'Reports from 20,000 KRW',
 tr1n:'Privacy first', tr1l:'Minimal storage',
 tr2n:'Just 14 questions', tr2l:'Analysis in a minute',
 tr3n:'AI + expert', tr3l:'Readings checked by a person',
 disclosure:'AIsajuLab builds on myeongnihak, with AI assisting the analysis<br>to give you clearer, more accurate insight.',
 h2Svc:'What you can do here',
 tagFree:'Free', tagFree2:'Free', tagDay:'Free once a day', tagPay:'990 KRW · instant',
 sv1n:"Free element check", sv1d:'14 questions, 1 minute · no sign-up',
 sv2n:'Today\u0027s flow', sv2d:'Today\u0027s condition, read from your elements',
 sv3n:'Element match with a friend', sv3d:'Send a link and your match opens up',
 sv4n:'AI in-depth report', sv4d:'Tailored to your question · KakaoPay',
 ctT:'👨‍🏫 One-on-one expert consultation',
 ctS:'Choi Hyungchul, certified management consultant · 30 years of experience, reading it himself',
 cbQ1:'Standard consultation · 50,000 KRW', cbQ2:'Report + phone/KakaoTalk reading · within 2 days',
 cbD1:'Custom consultation', cbD2:'Send the form · we reply after reading it',
 priceNote:'For custom consultations we receive your form first, then confirm the scope and the fee',
 h2Prev:'Here is the <b>result card</b> you will get',
 prevSub:'Your own card, named after a season and a symbol. Save it and send it straight to a friend.',
 wallchip:'📱 Sharp enough for a phone wallpaper',
 cardBrand:'✓ AIsajuLab.com', cardKicker:'My Five Elements', cardTitle:'"Spring Pine"',
 cardLine:'Spring arrives only once it has stretched out', cardPill:'甲 · Yang (陽) · Wood (木) 35%',
 cardFoot:'Balance index <b>64</b> · element to strengthen <b>Metal (金)</b>',
 h2Why:'AI does the <b>analysis</b>,<br>a <b>person</b> finds the direction',
 whySub:'Free readings, automatic AI interpretations — and the advertising hidden inside them. AIsajuLab goes another way.',
 vsLt:'AI analysis', vsLd:'Saju and data,<br>fast and objective',
 vsRt:'Expert reading', vsRd:'10 years of myeongnihak · reviewed<br>by a certified consultant',
 calibNote:'An expert consultation puts your reading side by side with your birth chart — a step we call <b>the reality check (영점 조정)</b>. A solution generated by AI does not go through it, so please choose for yourself what actually fits you.',
 h2Now:'Open right now', nowSub:'Swipe sideways.',
 sl1tag:'September launch event', sl1h:'AI in-depth report<br>launch price 990 KRW',
 sl1p:'Regular price 2,900 KRW → 990 KRW for September only. Order from the result screen after your check.',
 sl1a:'Take the check and order',
 sl2tag:'New', sl2h:'Five Elements personality check',
 sl2p:'14 questions, one minute. Your temperament as a card, named by season and symbol.',
 sl2a:'Start the check',
 sl3tag:'Reading', sl3h:'Asking AI about your Saju —<br>how much should you type in?',
 sl3p:'What to check before you hand over your birth date and time.', sl3a:'Read the article',
 h2Needs:'Have you ever <b>wondered these things too?</b>',
 needsSub:'Once the check has given you a direction, a person takes it from there.',
 need1:'Should I change jobs now?', need2:'Are we actually a good match?',
 need3:'Is it alright to start my own business?', need4:'Should I buy a home now?',
 needMore:'Personal Saju · wealth · major and yearly cycles · naming — see more ▾',
 h2How:'<b>Three steps</b> are enough',
 st1t:'30 sec', st1h:'Pick a consultation type',
 op0:'▾ Choose a type', op1:'Personal Saju (birth date and time)', op2:'Career change · work',
 op3:'Love · compatibility · marriage', op4:'Startup · business · wealth',
 op5:'Property · moving · investment', op6:'Major and yearly cycles', op7:'Naming', op8:'Something else',
 st2t:'1 min', st2h:'Enter your birth date and time', st2p:'If you do not know it, just tick "not sure" →',
 st3t:'2 min', st3h:'Leave your question', st3p:'AI organises it and the institute reviews it →',
 howCta:'Request a consultation now →',
 h2Rev:'People who came before you',
 revP:'It began with the thought that everyone is given the same eight talents — that consultation moved me more than any I have had. I hope you will help me with the decisions ahead too.',
 revWho:'Jennifer · personal Saju',
 revCta:'Leave a review and get <b>50% off</b> your next consultation.',
 h2Ch:'Find us elsewhere too',
 ch1:'Daangn business profile', ch2:'Naver blog', ch3:'KakaoTalk channel',
 ch4:'Instagram', ch5:'Myeongnihak self-study cafe',
 ftBrand:'AIsajuLab.com', ftTag:'AI analyses; myeongnihak finds the direction',
 ftDisc:'Results are AI-generated content grounded in myeongnihak. They are not scientific fact and do not guarantee the future.',
 bizName:'Business name: Life &amp; Biz Growth Institute (라이프앤비즈 성장 연구소) · Representative: Choi Hyungchul',
 bizNo:'Business registration no. 688-13-03146 · Mail-order reg. no. 2026-서울강동-1350',
 bizAddr:'Address: 103-602, 60 Olympic-ro 78-gil, Gangdong-gu, Seoul, Republic of Korea',
 bizTel:'Tel +82 10-6789-1341 · Email calvincheoi@gmail.com',
 bizHost:'Hosting provider: Netlify, Inc.',
 lg1:'Terms', lg2:'Privacy policy', lg3:'Refunds', lg4:'Business info',
 copy:'© 2026 Choi Hyungchul Saju Myeongni Institute',
 tabHome:'Home', tabToday:'Today', tabDiag:'Check', tabMatch:'Match', tabConsult:'Consult'
},

ja: {
 nmMore:"価格 · 内容を詳しく見る",
 nmLess:"閉じる",
 nmPeek:"精密レポート20~25P · 額装用命名書 · 保存用解説書8P",
 nmPdfT:"実際の成果物をご覧ください",
 nmPdf1:"精密レポートを見る",
 nmPdf2:"命名書を見る",
 nmPdf3:"名前解説書を見る",
 nmPdfN:"こちらのサンプルは<b>架空の例</b>であり、実際のお客様の情報ではありません。",
 nmPdfN2:"こちらのサンプルは<b>架空の例</b>であり、実際のお客様の情報ではありません。",
 nmGalFoot:"全編はお申込みの方にのみお渡しします · 画面閲覧専用",
 nmH2:"子どもの名前は、<b>生涯もっとも多く</b>呼ばれる言葉です",
 nmSub:"だから、きれいな名前ではなく、合う名前であるべきです。",
 nmKick:"新生児の命名 プレミアム",
 nmTitle:"命名 3点セット",
 nmLead:"赤ちゃんの四柱を用神・喜神・大運まで精密に分析し、生涯にわたって最適な五行を導き出します。字源五行・発音五行・81数理の三重検証をすべて通過した名前だけを候補に挙げ、大法院の人名用漢字と不用文字も併せて確認します。",
 nmInc1t:"精密レポート 20~25P",
 nmInc1d:"四柱の精密分析から、名前の候補5~6件を点数で比較したスコアボードまで",
 nmInc2t:"額装用 命名書",
 nmInc2d:"命造・処方五行・三重検証の結果・祝願文・代表署名。A4の高解像度原本",
 nmInc3t:"保存用 名前解説書 8P",
 nmInc3d:"一文字ごとの字源、音と画数の根拠、お子さまへの手紙",
 nmSmp1:"実際の3点セット",
 nmSmp2:"額装用 命名書",
 nmS1t:"第1段階 · 四柱の精密分析",
 nmS1d:"日干の強弱、五行の過不足、十神の構造、10年単位の大運まで。この子に生涯必要な五行と、あふれる気を流す通路を見つけます。",
 nmS2t:"第2段階 · 三重検証",
 nmS2d:"字源五行が四柱の不足を満たすか、姓と名の音が相剋なく流れるか、81数理の四つの格がすべて吉数か。三つすべてを通過した名前だけを候補にします。",
 nmS3t:"第3段階 · 3点セットで完成",
 nmS3d:"名前ひとつではなく、その名前がなぜこの名前なのかという記録を一緒にお渡しします。",
 nmSame:"3つの等級とも<b>3点セットの内容は同じ</b>です。違うのは相談の方法だけです。<br>申込書で<b>ご希望の等級をそのまま選択</b>してください。",
 nmT1n:"基本 · レポートのみ",
 nmT1d:"相談なし · 気になる点はトークで",
 nmT2n:"標準 · トーク/電話相談",
 nmT2d:"トークまたは電話30分を含む",
 nmT3n:"プレミアム · 対面相談",
 nmT3d:"直接会って60分 · カフェなど協議",
 nmWon:"ウォン",
 nmWon2:"ウォン",
 nmWon3:"ウォン",
 nmBest:"いちばん選ばれています",
 nmNote:"1次レポートは<b>72時間</b>以内にお渡し · 名前が決まるまで<b>2~3次の補完が無料</b> · 出生前の予定日時でも進められ、実際の出生日時が確定した時点で<b>無料で再検証</b>します。<br>対面相談は事務所の移転中のため、<b>カフェなど協議のうえ</b>で行います。",
 nmGo:"命名を申し込む →",
 nmAsk:"まず問い合わせる (カカオトーク)",
 nmOther:"改名・芸名/活動名・商号/事業体名も同じ工程で進めます。相談申込書にお書きください。",
 sv5n:"命名 3点セット",
 sv5d:"レポート · 命名書 · 解説書",
 tagNm:"20万ウォン〜",
 navNaming:"命名",
 secResult:"無料 五行性格診断 RESULT",
 brand:'AI<span>四柱ラボ</span>.com', brandSub:'AI × 命理学',
 voc:'AIsajuLab.com は、お客様の声と継続的な分析、レポートの品質改善を通じて、ご満足と暮らしの質の向上に力を尽くしてまいります。',
 voc2:'AIsajuLab.com は、お客様の声と継続的な分析、レポートの品質改善を通じて、ご満足と暮らしの質の向上に力を尽くしてまいります。',
 bdgFree:'🎁 五行診断 · 今日の流れ 無料', bdgMbti:'血液型やMBTIのように!',
 hook:'では、私の<br><span class="mark"><b>(自然) 五行</b></span>の性格は?',
 heroSub:'四柱命理学 × AI分析で見つける、私だけの気質と強み',
 nMok:'木(もく)', kMok:'成長 · 拡張',
 nHwa:'火(か)', kHwa:'情熱 · 表現',
 nTo:'土(ど)', kTo:'中心 · 安定',
 nGeum:'金(ごん)', kGeum:'決断 · 実行',
 nSu:'水(すい)', kSu:'知恵 · 流れ',
 dMok:'木 — 育つ力。新しく始め、広げていきます。',
 dHwa:'火 — 表す力。情熱と表現で人を集めます。',
 dTo:'土 — 支える力。中心を保ち、長く持ちこたえます。',
 dGeum:'金 — 締めくくる力。基準が明確で決断が速いです。',
 dSu:'水 — 汲みとる力。柔らかく流れ、深く考えます。',
 cyc:'木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> ふたたび 木',
 tlQ:'質問14問', tlA:'<em>1分</em>で出ます!',
 ctaFree1:"無料 五行性格診断", ctaFree2:'登録なしですぐに',
 ctaPro1:'専門家に相談', ctaPro2:'レポート20,000ウォン〜',
 tr1n:'個人情報は安心', tr1l:'保存は最小限',
 tr2n:'たった14問', tr2l:'1分で分析',
 tr3n:'AI + 専門家', tr3l:'解釈は人が検証',
 disclosure:'AIsajuLab は命理学をもとに、AIが分析を補助して<br>よりわかりやすく確かな示唆をお届けします。',
 h2Svc:'ここでできること',
 tagFree:'無料', tagFree2:'無料', tagDay:'1日1回無料', tagPay:'990ウォン · 即時',
 sv1n:"無料 五行性格診断", sv1d:'14問1分 · 登録なしですぐに',
 sv2n:'今日の流れ', sv2d:'自分の五行で読む今日の調子',
 sv3n:'友だちと五行の相性', sv3d:'リンクを送れば二人の相性が開きます',
 sv4n:'AI 詳細レポート', sv4d:'悩みを反映した個別解釈 · カカオペイ',
 ctT:'👨‍🏫 専門家との1対1相談',
 ctS:'経営指導士 チェ・ヒョンチョル · 30年の経験で直接読み解きます',
 cbQ1:'基本相談 · 50,000ウォン', cbQ2:'レポート + 電話/カカオトークでの解釈 · 2日以内',
 cbD1:'オーダーメイド相談', cbD2:'申込書を作成 · 内容を見てご案内',
 priceNote:'オーダーメイド相談は、まず申込書を受け付けてから範囲と費用をご案内します',
 h2Prev:'受け取る<b>結果カード</b>はこんな姿です',
 prevSub:'季節とシンボルで名づけられた自分だけのカード。保存して友だちにすぐ送れます。',
 wallchip:'📱 スマホの壁紙にできる画質',
 cardBrand:'✓ AIsajuLab.com', cardKicker:'私の五行性格', cardTitle:'「春の松」',
 cardLine:'まっすぐ伸びてこそ春が来たと知る', cardPill:'甲 · 陽(よう) · 木(もく) 35%',
 cardFoot:'バランス指数 <b>64</b> · 補うべき五行 <b>金(ごん)</b>',
 h2Why:'AIは<b>分析</b>し、<br>方向は<b>人</b>が見つけます',
 whySub:'無料の占い、AIの自動解釈… その中に潜む広告と商業性。AIsajuLab は違う道を行きます。',
 vsLt:'AIの分析', vsLd:'四柱とデータを<br>速く、客観的に',
 vsRt:'専門家の解釈', vsRd:'命理学10年 · 経営指導士が<br>直接検証',
 calibNote:'専門家の鑑定は、四柱推命の命式と照らし合わせる<b>「ズレの確認(영점 조정)」</b>という工程を経ます。AIが示すソリューションはその工程を経ていませんので、ご自身に合うものを選んでお使いください。',
 h2Now:'いま開いているもの', nowSub:'左右にスワイプしてください。',
 sl1tag:'9月オープン記念', sl1h:'AI 詳細レポート<br>ローンチ価格 990ウォン',
 sl1p:'通常価格2,900ウォン → 9月の一か月だけ990ウォン。診断後、結果画面からお申し込みください。',
 sl1a:'いま診断して申し込む',
 sl2tag:'新着', sl2h:'(自然) 五行性格の診断',
 sl2p:'質問14問、1分。季節とシンボルで読む自分の気質カード。',
 sl2a:'すぐに診断する',
 sl3tag:'読みもの', sl3h:'AIに四柱を見てもらうとき<br>どこまで入力してよい?',
 sl3p:'生年月日時を渡す前に必ず確かめたいこと。', sl3a:'記事を読む',
 h2Needs:'あなたにも、こんな悩み<br><b>ありませんでしたか?</b>',
 needsSub:'診断で方向が定まったら、人が直接見る相談へつながります。',
 need1:'いま、転職すべきだろうか?', need2:'この人と相性は合うだろうか?',
 need3:'起業しても大丈夫だろうか?', need4:'いま家を買ってもよいだろうか?',
 needMore:'個人四柱 · 財運 · 大運/歳運 · 命名 をもっと見る ▾',
 h2How:'相談は<b>3ステップ</b>で十分です',
 st1t:'30秒', st1h:'相談の種類を選ぶ',
 op0:'▾ 種類を選ぶ', op1:'個人四柱 (生年月日時の分析)', op2:'転職 · 仕事 · キャリア',
 op3:'恋愛 · 相性 · 結婚', op4:'起業 · 事業 · 財運',
 op5:'不動産 · 引っ越し · 投資', op6:'大運 · 歳運の流れ', op7:'命名 (名づけ)', op8:'その他の悩み',
 st2t:'1分', st2h:'生年月日時を入力', st2p:'わからなければ「不明」にチェックでも大丈夫です →',
 st3t:'2分', st3h:'悩みを書き残す', st3p:'AIが整理し、研究所が検証します →',
 howCta:'いますぐ相談を申し込む →',
 h2Rev:'先に出会った方々',
 revP:'誰にも同じ8つのタラントが与えられている、という話から始まった鑑定は、これまでで一番心に残りました。これからの大事な決断でも助けてください。',
 revWho:'Jennifer · 個人四柱',
 revCta:'レビューをいただくと、次回の相談を<b>50%割引</b>いたします。',
 h2Ch:'ほかの場所でも会えます',
 ch1:'タンジン ビジネスプロフィール', ch2:'NAVER ブログ', ch3:'カカオトークチャンネル',
 ch4:'Instagram', ch5:'命理学 Self-study カフェ',
 ftBrand:'AIsajuLab.com', ftTag:'AIが分析し、命理学が方向を見つけます',
 ftDisc:'診断結果は命理学にもとづくAI生成コンテンツであり、科学的事実や未来を保証するものではありません。',
 bizName:'商号 ライフアンドビズ(Life &amp; Biz) 成長研究所 · 代表 チェ・ヒョンチョル',
 bizNo:'事業者登録番号 688-13-03146 · 通信販売業申告 第 2026-서울강동-1350 号',
 bizAddr:'所在地 大韓民国 ソウル特別市 江東区 オリンピック路78ギル60, 103棟602号',
 bizTel:'電話 +82 10-6789-1341 · メール calvincheoi@gmail.com',
 bizHost:'ホスティング提供 Netlify, Inc.',
 lg1:'利用規約', lg2:'プライバシーポリシー', lg3:'返金・撤回', lg4:'事業者情報',
 copy:'© 2026 チェ・ヒョンチョル 四柱命理研究所',
 tabHome:'ホーム', tabToday:'今日', tabDiag:'診断', tabMatch:'相性', tabConsult:'相談'
},

zh: {
 nmMore:"查看价格与内容",
 nmLess:"收起",
 nmPeek:"精密报告20~25页 · 装裱用命名书 · 收藏用释义8页",
 nmPdfT:"看看实际的成果物",
 nmPdf1:"预览精密报告",
 nmPdf2:"预览命名书",
 nmPdf3:"预览名字释义",
 nmPdfN:"以下样本为<b>虚构示例</b>，并非真实客户信息。",
 nmPdfN2:"以下样本为<b>虚构示例</b>，并非真实客户信息。",
 nmGalFoot:"完整内容仅提供给下单的客户 · 仅供屏幕查看",
 nmH2:"孩子的名字，是<b>一生被叫得最多</b>的那个词",
 nmSub:"所以它不该只是好听，而该是合适。",
 nmKick:"新生儿取名 高级版",
 nmTitle:"取名三件套",
 nmLead:"我们把宝宝的八字分析到用神、喜神与大运，找出一生最需要的五行。只有同时通过字源五行、发音五行与81数理三重检验的名字，才会进入候选，并核对大法院人名用汉字与不用字。",
 nmInc1t:"精密报告 20~25页",
 nmInc1d:"从八字精密分析，到把5~6个候选名字用分数排出的对照表",
 nmInc2t:"装裱用命名书(命名書)",
 nmInc2d:"命造 · 处方五行 · 三重检验结果 · 祝愿文 · 代表签名。A4高清原件",
 nmInc3t:"收藏用名字释义 8页",
 nmInc3d:"逐字的字源、声音与笔画的依据，以及写给孩子的一封信",
 nmSmp1:"实际三件套",
 nmSmp2:"装裱用命名书",
 nmS1t:"第一步 · 八字精密分析",
 nmS1d:"日干强弱、五行多寡、十神结构、十年一运的走势。由此找出这个孩子一生需要的五行，以及疏导过盛之气的通道。",
 nmS2t:"第二步 · 三重检验",
 nmS2d:"字源五行能否补上八字的欠缺，姓与名的声音是否顺而不相克，81数理四格是否皆为吉数。三项全过的名字才进候选。",
 nmS3t:"第三步 · 以三件套收尾",
 nmS3d:"给你的不只是一个名字，还有这个名字为什么是它的记录。",
 nmSame:"三个等级的<b>三件套内容完全相同</b>，差别只在咨询方式。<br>在申请表中<b>直接选择你想要的等级</b>即可。",
 nmT1n:"基础 · 仅报告",
 nmT1d:"不含咨询 · 有疑问可用聊天",
 nmT2n:"标准 · 聊天/电话咨询",
 nmT2d:"含聊天或电话30分钟",
 nmT3n:"高级 · 面谈",
 nmT3d:"当面60分钟 · 咖啡厅等协商",
 nmWon:"韩元",
 nmWon2:"韩元",
 nmWon3:"韩元",
 nmBest:"最多人选择",
 nmNote:"首份报告<b>72小时</b>内交付 · 名字定下之前<b>2~3次补充免费</b> · 也可按预产期先行，实际出生时辰确定后<b>免费重新校验</b>。<br>面谈因办公室迁址中，将<b>约在咖啡厅等地</b>协商进行。",
 nmGo:"申请取名 →",
 nmAsk:"先问问看 (KakaoTalk)",
 nmOther:"改名、艺名/活动名、商号/公司名也走同样流程，在申请表里写下即可。",
 sv5n:"取名三件套",
 sv5d:"报告 · 命名书 · 释义",
 tagNm:"20万韩元起",
 navNaming:"取名",
 secResult:"免费五行性格测试 RESULT",
 brand:'AI<span>四柱Lab</span>.com', brandSub:'AI × 命理学',
 voc:'AIsajuLab.com 将始终倾听客户的声音，持续改进分析与报告质量，努力提升您的满意度与生活品质。',
 voc2:'AIsajuLab.com 将始终倾听客户的声音，持续改进分析与报告质量，努力提升您的满意度与生活品质。',
 bdgFree:'🎁 五行测试 · 今日运势 免费', bdgMbti:'就像血型、MBTI 一样!',
 hook:'那么，我的<br><span class="mark"><b>(自然) 五行</b></span>性格是?',
 heroSub:'用四柱命理学 × AI 分析，找到只属于你的性情与强项',
 nMok:'木', kMok:'成长 · 扩展',
 nHwa:'火', kHwa:'热情 · 表达',
 nTo:'土', kTo:'中心 · 稳定',
 nGeum:'金', kGeum:'决断 · 执行',
 nSu:'水', kSu:'智慧 · 流动',
 dMok:'木 — 生长的力量。你不断开启新事，把它做大。',
 dHwa:'火 — 显现的力量。用热情与表达把人聚过来。',
 dTo:'土 — 承托的力量。守住重心，撑得久。',
 dGeum:'金 — 收束的力量。标准清楚，决定得快。',
 dSu:'水 — 权衡的力量。柔韧地流动，想得也深。',
 cyc:'木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> 再回到 木',
 tlQ:'14 道题', tlA:'<em>1分钟</em>就出结果!',
 ctaFree1:"免费五行性格测试", ctaFree2:'无需注册，直接开始',
 ctaPro1:'专家咨询', ctaPro2:'报告 20,000韩元起',
 tr1n:'个人信息放心', tr1l:'最少化保存',
 tr2n:'仅 14 道题', tr2l:'1分钟快速分析',
 tr3n:'AI + 专家', tr3l:'解读由人工复核',
 disclosure:'AIsajuLab 以命理学为基础，由 AI 辅助分析，<br>为你提供更易懂、更准确的洞察。',
 h2Svc:'在这里你可以做什么',
 tagFree:'免费', tagFree2:'免费', tagDay:'每天免费1次', tagPay:'990韩元 · 即时',
 sv1n:"免费五行性格测试", sv1d:'14题1分钟 · 无需注册',
 sv2n:'今日运势', sv2d:'用你的五行看今天的状态',
 sv3n:'与朋友的五行配对', sv3d:'把链接发过去，就能看到两人的配对',
 sv4n:'AI 深度报告', sv4d:'结合你的困惑定制解读 · KakaoPay',
 ctT:'👨‍🏫 专家一对一咨询',
 ctS:'经营指导师 崔炯哲 · 30年经验亲自解读',
 cbQ1:'基础咨询 · 50,000韩元', cbQ2:'报告 + 电话/KakaoTalk 解读 · 2天内',
 cbD1:'定制咨询', cbD2:'填写申请表 · 看过内容后回复',
 priceNote:'定制咨询会先收到你的申请表，再告知范围与费用',
 h2Prev:'你将拿到的<b>结果卡</b>长这样',
 prevSub:'以季节和象征命名、只属于你的一张卡。保存后可以直接发给朋友。',
 wallchip:'📱 画质足够做手机壁纸',
 cardBrand:'✓ AIsajuLab.com', cardKicker:'我的五行性格', cardTitle:'「春松」',
 cardLine:'要一直往上长，才知道春天到了', cardPill:'甲 · 阳(陽) · 木 35%',
 cardFoot:'平衡指数 <b>64</b> · 需补充的五行 <b>金</b>',
 h2Why:'AI 负责<b>分析</b>，<br>方向由<b>人</b>来找',
 whySub:'免费算命、AI 自动解读……里面藏着广告和生意。AIsajuLab 选另一条路。',
 vsLt:'AI 分析', vsLd:'把四柱和数据<br>快速、客观地理出来',
 vsRt:'专家解读', vsRd:'命理学10年 · 由经营指导师<br>亲自复核',
 calibNote:'专业咨询会把解读与八字原局逐项对照，这道工序我们称为<b>「核对真实差距(영점 조정)」</b>。AI 给出的方案没有经过它，所以请自行判断，选择真正适合自己的建议。',
 h2Now:'现在正在进行', nowSub:'左右滑动查看。',
 sl1tag:'9月开业活动', sl1h:'AI 深度报告<br>上线价 990 韩元',
 sl1p:'原价 2,900 韩元 → 仅9月一个月 990 韩元。测试后在结果页面申请。',
 sl1a:'现在测试并申请',
 sl2tag:'新上线', sl2h:'(自然) 五行性格测试',
 sl2p:'14 道题，1分钟。用季节与象征读出你的气质卡。',
 sl2a:'马上测试',
 sl3tag:'读物', sl3h:'让 AI 看八字时<br>可以填到什么程度?',
 sl3p:'交出出生年月日时之前，务必先确认的几件事。', sl3a:'阅读文章',
 h2Needs:'这些事，<b>你是不是也想过?</b>',
 needsSub:'测试帮你定下方向之后，就交给真人来看。',
 need1:'现在该换工作吗?', need2:'和这个人合得来吗?',
 need3:'创业没问题吗?', need4:'现在买房合适吗?',
 needMore:'个人八字 · 财运 · 大运/流年 · 取名 查看更多 ▾',
 h2How:'咨询只要<b>3个步骤</b>',
 st1t:'30秒', st1h:'选择咨询类型',
 op0:'▾ 选择类型', op1:'个人八字 (出生年月日时分析)', op2:'跳槽 · 职业 · 事业发展',
 op3:'恋爱 · 配对 · 婚姻', op4:'创业 · 生意 · 财运',
 op5:'房产 · 搬家 · 投资', op6:'大运 · 流年走势', op7:'取名', op8:'其他困惑',
 st2t:'1分钟', st2h:'填写出生年月日时', st2p:'不知道的话，勾选「不确定」也可以 →',
 st3t:'2分钟', st3h:'写下你的困惑', st3p:'AI 先梳理，研究所再复核 →',
 howCta:'马上申请咨询 →',
 h2Rev:'先来过的人',
 revP:'咨询是从「每个人都被给了同样的八份才能」这句话开始的，那次谈话让我印象最深。以后遇到重要的决定，还请多帮忙。',
 revWho:'Jennifer · 个人八字',
 revCta:'留下评价，下次咨询可享<b>5折优惠</b>。',
 h2Ch:'在别的地方也能找到我们',
 ch1:'Daangn 商家主页', ch2:'NAVER 博客', ch3:'KakaoTalk 频道',
 ch4:'Instagram', ch5:'命理学 Self-study 社群',
 ftBrand:'AIsajuLab.com', ftTag:'AI 做分析，命理学找方向',
 ftDisc:'测试结果是以命理学为基础的 AI 生成内容，并非科学事实，也不保证未来。',
 bizName:'商号 Life &amp; Biz 成长研究所 (라이프앤비즈 성장 연구소) · 代表 崔炯哲',
 bizNo:'营业执照号 688-13-03146 · 通信销售业申报 第 2026-서울강동-1350 号',
 bizAddr:'地址 大韩民国 首尔特别市 江东区 奥林匹克路78街60, 103栋602号',
 bizTel:'电话 +82 10-6789-1341 · 邮箱 calvincheoi@gmail.com',
 bizHost:'主机服务商 Netlify, Inc.',
 lg1:'服务条款', lg2:'隐私政策', lg3:'退款与撤销', lg4:'企业信息',
 copy:'© 2026 崔炯哲 四柱命理研究所',
 tabHome:'首页', tabToday:'今日', tabDiag:'测试', tabMatch:'配对', tabConsult:'咨询'
},

fr: {
 nmMore:"Voir prix et contenu",
 nmLess:"Fermer",
 nmPeek:"Rapport de 20 à 25 pages · certificat encadrable · livret de 8 pages",
 nmPdfT:"Voyez les livrables réels",
 nmPdf1:"Aperçu du rapport",
 nmPdf2:"Aperçu du certificat",
 nmPdf3:"Aperçu du livret",
 nmPdfN:"Ces exemples sont <b>fictifs</b> et ne correspondent à aucun client réel.",
 nmPdfN2:"Ces exemples sont <b>fictifs</b> et ne correspondent à aucun client réel.",
 nmGalFoot:"Le document complet est réservé aux clients · consultation à l'écran",
 nmH2:"Le prénom d'un enfant est le mot qu'il entendra <b>plus que tout autre</b>",
 nmSub:"Il ne doit donc pas seulement être joli. Il doit convenir.",
 nmKick:"Nomination du nouveau-né, premium",
 nmTitle:"L'ensemble de trois pièces",
 nmLead:"Nous analysons le Saju de l'enfant jusqu'à l'élément utile, l'élément de soutien et les cycles décennaux, afin de dégager les phases dont il aura besoin toute sa vie. Seuls les noms qui passent les trois vérifications — éléments des caractères, flux phonétique et numérologie des 81 — deviennent candidats. Les caractères sont aussi vérifiés sur la liste officielle de la Cour suprême de Corée.",
 nmInc1t:"Rapport détaillé, 20 à 25 pages",
 nmInc1d:"De l'analyse complète du Saju au tableau comparant cinq ou six noms candidats",
 nmInc2t:"Certificat de nomination encadrable (命名書)",
 nmInc2d:"Le thème, les éléments prescrits, les trois vérifications, un vœu et la signature du représentant. Original A4 haute résolution.",
 nmInc3t:"Livret explicatif à conserver, 8 pages",
 nmInc3d:"Ce que porte chaque caractère, la raison des sons et des traits, et une lettre à l'enfant",
 nmSmp1:"L'ensemble réel",
 nmSmp2:"Le certificat",
 nmS1t:"Étape 1 · Analyse du Saju",
 nmS1d:"La force du Maître du Jour, les phases en excès ou en manque, les dix dieux, les cycles de dix ans. Nous en tirons la phase dont l'enfant aura besoin, et le canal pour évacuer ce qui déborde.",
 nmS2t:"Étape 2 · Trois vérifications",
 nmS2d:"Les éléments des caractères comblent-ils ce qui manque au thème ? Le nom et le prénom s'enchaînent-ils sans conflit ? Les quatre segments numérologiques sont-ils tous favorables ? Seuls les noms qui passent les trois deviennent candidats.",
 nmS3t:"Étape 3 · L'ensemble de trois",
 nmS3d:"Pas seulement un nom, mais la trace écrite de la raison de ce nom.",
 nmSame:"Les trois formules comprennent <b>le même ensemble de trois</b>. Seule la consultation change.<br><b>Choisissez simplement la formule</b> qui vous convient sur le formulaire.",
 nmT1n:"Essentiel · rapport seul",
 nmT1d:"Sans consultation · questions par messagerie",
 nmT2n:"Standard · échange ou téléphone",
 nmT2d:"30 minutes par messagerie ou téléphone",
 nmT3n:"Premium · en personne",
 nmT3d:"60 minutes en personne · dans un café, d'un commun accord",
 nmWon:" KRW",
 nmWon2:" KRW",
 nmWon3:" KRW",
 nmBest:"Le plus choisi",
 nmNote:"Premier rapport remis sous <b>72 heures</b> · <b>deux à trois révisions offertes</b> jusqu'à ce que le nom soit arrêté · possible dès la date prévue d'accouchement, avec <b>revérification gratuite</b> une fois l'heure réelle connue.<br>Les rencontres se tiennent dans un café, d'un commun accord, le temps que notre bureau change d'adresse.",
 nmGo:"Demander une nomination →",
 nmAsk:"Poser une question (KakaoTalk)",
 nmOther:"Changement de nom, nom de scène et nom d'entreprise suivent le même processus. Indiquez-le sur le formulaire.",
 sv5n:"Ensemble de trois",
 sv5d:"Rapport · certificat · livret",
 tagNm:"Dès 200 000 KRW",
 navNaming:"Nomination",
 secResult:"DIAGNOSTIC GRATUIT · RÉSULTAT",
 brand:'AI<span>sajuLab</span>.com', brandSub:'IA × Myeongnihak (命理学)',
 voc:"AIsajuLab.com écoute chaque retour de ses clients et continue d'affiner ses analyses et la qualité de ses rapports, pour votre satisfaction et votre qualité de vie.",
 voc2:"AIsajuLab.com écoute chaque retour de ses clients et continue d'affiner ses analyses et la qualité de ses rapports, pour votre satisfaction et votre qualité de vie.",
 bdgFree:"🎁 Diagnostic des phases · flux du jour — gratuit", bdgMbti:"Comme le groupe sanguin ou le MBTI !",
 hook:"Alors, quelles sont mes<br><span class=\"mark\"><b>Cinq Phases (五行)</b></span> ?",
 heroSub:"Votre tempérament et vos forces, révélés par le Saju myeongnihak × l'analyse IA",
 nMok:'Bois (木)', kMok:'Croissance · expansion',
 nHwa:'Feu (火)', kHwa:'Passion · expression',
 nTo:'Terre (土)', kTo:'Centre · stabilité',
 nGeum:'Métal (金)', kGeum:'Décision · exécution',
 nSu:'Eau (水)', kSu:'Sagesse · fluidité',
 dMok:"Bois (木) — la force qui pousse. Vous ouvrez et vous élargissez.",
 dHwa:"Feu (火) — la force qui se montre. Passion et expression rassemblent autour de vous.",
 dTo:"Terre (土) — la force qui soutient. Vous tenez le centre et vous durez.",
 dGeum:"Métal (金) — la force qui conclut. Des critères nets, des décisions rapides.",
 dSu:"Eau (水) — la force qui pèse. Vous coulez avec souplesse et pensez en profondeur.",
 cyc:'木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> de nouveau 木',
 tlQ:'14 questions', tlA:"Résultat en <em>1 minute</em> !",
 ctaFree1:"Diagnostic gratuit", ctaFree2:'Sans inscription',
 ctaPro1:"Consultation d'expert", ctaPro2:'Rapports dès 20 000 KRW',
 tr1n:'Vie privée protégée', tr1l:'Stockage minimal',
 tr2n:'14 questions seulement', tr2l:'Analyse en une minute',
 tr3n:'IA + expert', tr3l:'Lecture revue par un humain',
 disclosure:"AIsajuLab s'appuie sur le myeongnihak, l'IA venant en soutien de l'analyse,<br>pour un éclairage plus clair et plus juste.",
 h2Svc:'Ce que vous pouvez faire ici',
 tagFree:'Gratuit', tagFree2:'Gratuit', tagDay:'1 fois par jour, gratuit', tagPay:'990 KRW · immédiat',
 sv1n:"Diagnostic gratuit", sv1d:'14 questions, 1 minute · sans inscription',
 sv2n:'Le flux du jour', sv2d:'Votre journée lue à travers vos phases',
 sv3n:'Compatibilité avec un ami', sv3d:"Envoyez le lien et votre compatibilité s'ouvre",
 sv4n:'Rapport IA approfondi', sv4d:'Lecture adaptée à votre question · KakaoPay',
 ctT:"👨‍🏫 Consultation individuelle avec un expert",
 ctS:"Choi Hyungchul, consultant en gestion agréé · 30 ans d'expérience, lecture personnelle",
 cbQ1:'Consultation standard · 50 000 KRW', cbQ2:'Rapport + lecture par téléphone ou KakaoTalk · sous 2 jours',
 cbD1:'Consultation sur mesure', cbD2:'Remplissez le formulaire · réponse après lecture',
 priceNote:"Pour une consultation sur mesure, nous recevons d'abord votre formulaire, puis nous précisons le périmètre et le tarif",
 h2Prev:"Voici la <b>carte de résultat</b> que vous recevrez",
 prevSub:"Votre carte, nommée d'après une saison et un symbole. Enregistrez-la et envoyez-la directement à un ami.",
 wallchip:"📱 Une qualité digne d'un fond d'écran",
 cardBrand:'✓ AIsajuLab.com', cardKicker:'Mes Cinq Phases', cardTitle:'« Pin de printemps »',
 cardLine:"Il faut pousser droit pour savoir que le printemps est là", cardPill:'甲 · Yang (陽) · Bois (木) 35 %',
 cardFoot:"Indice d'équilibre <b>64</b> · élément à renforcer <b>Métal (金)</b>",
 h2Why:"L'IA <b>analyse</b>,<br>c'est un <b>humain</b> qui trouve la direction",
 whySub:"Lectures gratuites, interprétations automatiques… et la publicité qui s'y cache. AIsajuLab prend un autre chemin.",
 vsLt:'Analyse IA', vsLd:'Le Saju et les données,<br>vite et objectivement',
 vsRt:"Lecture d'expert", vsRd:'10 ans de myeongnihak · revu<br>par un consultant agréé',
 calibNote:"Une consultation d'expert confronte la lecture au thème natal (四柱原局) — une étape que nous appelons <b>la vérification de l'écart réel (영점 조정)</b>. Une solution produite par l'IA n'y passe pas : retenez donc vous-même ce qui vous correspond vraiment.",
 h2Now:"Ce qui est ouvert en ce moment", nowSub:'Faites défiler latéralement.',
 sl1tag:'Événement de lancement — septembre', sl1h:'Rapport IA approfondi<br>prix de lancement 990 KRW',
 sl1p:'Prix normal 2 900 KRW → 990 KRW pendant tout septembre. À demander depuis l\u0027écran de résultat.',
 sl1a:'Faire le diagnostic et commander',
 sl2tag:'Nouveau', sl2h:'Diagnostic des Cinq Phases',
 sl2p:'14 questions, une minute. Votre tempérament sur une carte, nommée par saison et symbole.',
 sl2a:'Commencer le diagnostic',
 sl3tag:'À lire', sl3h:"Demander son Saju à une IA :<br>jusqu'où peut-on aller ?",
 sl3p:"Ce qu'il faut vérifier avant de livrer sa date et son heure de naissance.", sl3a:"Lire l'article",
 h2Needs:"Vous aussi, <b>vous êtes-vous déjà demandé ceci ?</b>",
 needsSub:"Une fois la direction trouvée, un humain prend le relais.",
 need1:'Dois-je changer de travail maintenant ?', need2:'Sommes-nous vraiment compatibles ?',
 need3:'Puis-je me lancer à mon compte ?', need4:'Est-ce le moment d\u0027acheter un logement ?',
 needMore:'Saju personnel · richesse · grands cycles · choix du nom — voir plus ▾',
 h2How:'<b>Trois étapes</b> suffisent',
 st1t:'30 s', st1h:'Choisir le type de consultation',
 op0:'▾ Choisir un type', op1:'Saju personnel (date et heure de naissance)', op2:'Reconversion · métier · carrière',
 op3:'Amour · compatibilité · mariage', op4:'Création · entreprise · richesse',
 op5:'Immobilier · déménagement · investissement', op6:'Grands cycles et cycles annuels', op7:'Choix du nom', op8:'Autre question',
 st2t:'1 min', st2h:'Saisir date et heure de naissance', st2p:'Si vous ne les connaissez pas, cochez « je ne sais pas » →',
 st3t:'2 min', st3h:'Laisser votre question', st3p:"L'IA la met en forme, l'institut la relit →",
 howCta:'Demander une consultation →',
 h2Rev:'Celles et ceux qui sont venus avant vous',
 revP:"La consultation a commencé par cette idée : chacun reçoit les mêmes huit talents. Rien ne m'avait autant touchée. J'espère pouvoir compter sur vous pour mes prochaines décisions.",
 revWho:'Jennifer · Saju personnel',
 revCta:"Laissez un avis et bénéficiez de <b>50 % de réduction</b> sur votre prochaine consultation.",
 h2Ch:'On se retrouve aussi ailleurs',
 ch1:'Profil pro Daangn', ch2:'Blog Naver', ch3:'Chaîne KakaoTalk',
 ch4:'Instagram', ch5:'Café Self-study myeongnihak',
 ftBrand:'AIsajuLab.com', ftTag:"L'IA analyse ; le myeongnihak trouve la direction",
 ftDisc:"Les résultats sont un contenu généré par IA fondé sur le myeongnihak. Ils ne constituent pas un fait scientifique et ne garantissent pas l'avenir.",
 bizName:'Raison sociale : Life &amp; Biz Growth Institute (라이프앤비즈 성장 연구소) · Représentant : Choi Hyungchul',
 bizNo:"N° d'enregistrement 688-13-03146 · Vente à distance n° 2026-서울강동-1350",
 bizAddr:'Adresse : 103-602, 60 Olympic-ro 78-gil, Gangdong-gu, Séoul, République de Corée',
 bizTel:'Tél. +82 10-6789-1341 · E-mail calvincheoi@gmail.com',
 bizHost:'Hébergeur : Netlify, Inc.',
 lg1:"Conditions", lg2:'Confidentialité', lg3:'Remboursement', lg4:"Informations légales",
 copy:'© 2026 Institut Saju Myeongni Choi Hyungchul',
 tabHome:'Accueil', tabToday:"Aujourd'hui", tabDiag:'Diagnostic', tabMatch:'Compatibilité', tabConsult:'Consultation'
}

};

const HTML = String.raw`
<div class="shell">

  <div class="topbar">
    <div class="brand"><span class="bn" data-i="brand">AI<span>사주랩</span>.com</span> <small data-i="brandSub">AI × 명리학</small></div>
    <div class="util">
      <span class="ver">v1.0.0</span>
      <div class="langbox" id="langbox">
        <button class="langbtn" id="langbtn" type="button" aria-haspopup="true" aria-expanded="false">
          <span id="langnow">한국어</span><i>▾</i>
        </button>
        <div class="langmenu" id="langmenu" role="menu">
          <button type="button" data-setlang="ko">한국어<small>Korean</small></button>
          <button type="button" data-setlang="en">English<small>영어</small></button>
          <button type="button" data-setlang="ja">日本語<small>일본어</small></button>
          <button type="button" data-setlang="zh">中文<small>중국어</small></button>
          <button type="button" data-setlang="fr">Français<small>프랑스어</small></button>
        </div>
      </div>
      <div class="burger" data-go="menu" data-from="top"><i></i><i></i><i></i></div>
    </div>
  </div>

  <div class="voc top" data-i="voc">AI사주랩.com은 항상 고객님의 VOC와 지속적인 분석, 리포트 Quality 개선을 통해 고객 만족도, 삶의 질 향상에 최선을 다하겠습니다.</div>

  <!-- 히어로 : 여기까지가 첫 화면 -->
  <div class="hero">
    <div class="blob b1"></div><div class="blob b2"></div>

    <div class="badges">
      <span class="bdg free" data-i="bdgFree">🎁 오행 진단 · 오늘의 흐름 무료</span>
      <span class="bdg mbti" data-i="bdgMbti">혈액형, MBTI처럼!</span>
    </div>

    <h1 class="hook" data-i="hook">그럼, 나의<br><span class="mark"><b>(자연) 오행</b></span> 성격은?</h1>
    <p class="sub" data-i="heroSub">사주 명리학 × AI 분석으로 찾는 나만의 성향과 강점</p>

    <!-- 오행 순환 스트립 -->
    <div class="ohwrap" id="ohwrap">
      <div class="ohstrip">
        <div class="oh" data-di="dMok" data-d="목(木) — 자라나는 힘. 새로 벌이고 넓혀 갑니다.">
          <span class="han" style="background:#22A06B">木</span>
          <span class="sym">🌲</span><span class="nm" data-i="nMok">목(木)</span><span class="kw" data-i="kMok">성장 · 확장</span>
        </div>
        <div class="oh" data-di="dHwa" data-d="화(火) — 드러내는 힘. 열정과 표현으로 사람을 모읍니다.">
          <span class="han" style="background:#EF4444">火</span>
          <span class="sym">🔥</span><span class="nm" data-i="nHwa">화(火)</span><span class="kw" data-i="kHwa">열정 · 표현</span>
        </div>
        <div class="oh" data-di="dTo" data-d="토(土) — 붙드는 힘. 중심을 잡고 오래 버팁니다.">
          <span class="han" style="background:#8B5E3C">土</span>
          <span class="sym">⛰️</span><span class="nm" data-i="nTo">토(土)</span><span class="kw" data-i="kTo">중심 · 안정</span>
        </div>
        <div class="oh" data-di="dGeum" data-d="금(金) — 매듭짓는 힘. 기준이 분명하고 결정이 빠릅니다.">
          <span class="han" style="background:#94A3B8">金</span>
          <span class="sym">💎</span><span class="nm" data-i="nGeum">금(金)</span><span class="kw" data-i="kGeum">결단 · 실행</span>
        </div>
        <div class="oh" data-di="dSu" data-d="수(水) — 헤아리는 힘. 유연하게 흐르며 깊이 생각합니다.">
          <span class="han" style="background:#2B7FEF">水</span>
          <span class="sym">💧</span><span class="nm" data-i="nSu">수(水)</span><span class="kw" data-i="kSu">지혜 · 흐름</span>
        </div>
      </div>
      <div class="cycnote" id="cycnote" data-i="cyc">木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> 다시 木</div>
    </div>

    <!-- 시간 + CTA를 가리키는 화살표 -->
    <div class="timeline">
      <div class="txt">
        <div class="q" data-i="tlQ">질문 14개</div>
        <div class="a" data-i="tlA"><em>1분</em>이면 나와요!</div>
      </div>
      <svg class="hook-arrow" width="34" height="40" viewBox="0 0 34 40" fill="none" aria-hidden="true">
        <path d="M4 4 C22 6, 28 14, 27 30" stroke="#9FC5FF" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M21 25 L27 33 L33 25" stroke="#9FC5FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>

    <div class="cta-pair">
      <button class="btn btn-free" data-go="ohaeng" data-from="hero">
        <span class="ico">🤖</span>
        <span class="tx"><span class="t1" data-i="ctaFree1">무료 오행 성격 진단</span><span class="t2" data-i="ctaFree2">가입 없이 바로</span></span>
        <span class="go">›</span>
      </button>
      <button class="btn btn-pro" data-go="consult" data-from="hero">
        <span class="ico">💬</span>
        <span class="tx"><span class="t1" data-i="ctaPro1">전문가 상담</span><span class="t2" data-i="ctaPro2">리포트 20,000원부터</span></span>
        <span class="go">›</span>
      </button>
    </div>

    <div class="trust">
      <div class="cell"><div class="ti">🛡️</div><div class="n" data-i="tr1n">개인정보 안심</div><div class="l" data-i="tr1l">저장 최소화</div></div>
      <div class="cell"><div class="ti">⚡</div><div class="n" data-i="tr2n">초간단 14문항</div><div class="l" data-i="tr2l">1분 빠른 분석</div></div>
      <div class="cell"><div class="ti">🎯</div><div class="n" data-i="tr3n">AI + 전문가</div><div class="l" data-i="tr3l">해석을 사람이 검수</div></div>
    </div>

    <div class="disclosure" data-i="disclosure">AI사주랩은 명리학을 기반으로 AI가 보조 분석하여<br>더 쉽고 정확한 인사이트를 제공합니다.</div>
  </div>

  <!-- 서비스 카드 그리드 -->
  <section style="padding-top:24px">
    <div class="sec-label">SERVICES</div>
    <h2 data-i="h2Svc">여기서 할 수 있는 것</h2>
    <div class="svc">
      <button class="sv" data-go="ohaeng" data-from="svc"><span class="tag free" data-i="tagFree">무료</span>
        <div class="si">🤖</div><div class="sn" data-i="sv1n">무료 오행 성격 진단</div>
        <div class="sd" data-i="sv1d">14문항 1분 · 가입 없이 바로</div></button>
      <button class="sv" data-go="today" data-from="svc"><span class="tag day" data-i="tagDay">하루 1회 무료</span>
        <div class="si">🌤️</div><div class="sn" data-i="sv2n">오늘의 흐름</div>
        <div class="sd" data-i="sv2d">내 오행으로 보는 오늘 컨디션</div></button>
      <button class="sv" data-go="match" data-from="svc"><span class="tag free" data-i="tagFree2">무료</span>
        <div class="si">🤝</div><div class="sn" data-i="sv3n">친구와 오행 궁합</div>
        <div class="sd" data-i="sv3d">링크 보내면 둘의 궁합 공개</div></button>
      <button class="sv" data-go="report" data-from="svc" data-ev="report_open"><span class="tag pay" data-i="tagPay">990원 · 즉시</span>
        <div class="si">📊</div><div class="sn" data-i="sv4n">AI 심층 리포트</div>
        <div class="sd" data-i="sv4d">고민 반영 맞춤 해석 · 카카오페이</div></button>
      <button class="sv sv-wide sv-new" data-go="naming" data-from="svc"><span class="tag pay" data-i="tagNm">20만원부터</span>
        <div class="si">✍️</div><div class="sn" data-i="sv5n">작명 3종 세트</div>
        <div class="sd" data-i="sv5d">리포트 · 명명서 · 풀이서</div></button>
    </div>

    <!-- 상담 — 간편(채움) 우선, 정밀(투명+테두리) -->
    <div class="consult">
      <div class="ct" data-i="ctT">👨‍🏫 전문가 1:1 상담</div>
      <div class="cs" data-i="ctS">경영지도사 최형철 · 30년 경력이 직접 해석합니다</div>
      <div class="cbtns">
        <button class="cb cb-quick" data-go="consult" data-from="svc_quick"><span class="b1" data-i="cbQ1">기본 상담 · 50,000원</span><span class="b2" data-i="cbQ2">리포트 + 전화/카톡 해석 · D+2일</span></button>
        <button class="cb cb-deep" data-go="consult" data-from="svc_deep"><span class="b1" data-i="cbD1">맞춤 상담</span><span class="b2" data-i="cbD2">신청서 작성 · 내용 보고 안내</span></button>
      </div>
      <div class="pricenote" data-i="priceNote">맞춤 상담은 기존 상담 신청서로 접수 후 범위·비용을 안내드립니다</div>
    </div>
  </section>

  <!-- ═══════ 상품 진열 · 작명 3종 세트 ═══════
       구조는 상품 종류와 무관하다. 사주 리포트 10~12종을 붙일 때는
       이 <section> 을 복제하고 data-i 키만 새로 만들면 된다. -->
  <section id="naming">
    <div class="sec-label">NAMING</div>
    <h2 data-i="nmH2">아이의 이름은 <b>평생 가장 많이</b> 불리는 단어입니다</h2>
    <p class="sec-sub" data-i="nmSub">그래서 예쁜 이름이 아니라, 맞는 이름이어야 합니다.</p>

    <div class="prod">
      <img class="prod-hero" src="/img/naming-3set.jpg" alt="" loading="lazy" width="1200" height="750">
      <div class="prod-body">
        <div class="prod-kick" data-i="nmKick">신생아 작명 프리미엄</div>
        <div class="prod-h" data-i="nmTitle">작명 3종 세트</div>
        <div class="prod-peek" data-i="nmPeek">정밀 리포트 20~25P · 액자용 명명서 · 소장용 풀이서 8P</div>
        <div class="prod-pdf">
          <div class="prod-pdf-t" data-i="nmPdfT">실제 결과물을 직접 확인해 보세요</div>
          <div class="prod-pdf-n" data-i="nmPdfN">아래 샘플은 <b>가상의 예시</b>입니다. 실제 고객 정보가 아닙니다.</div>
          <div class="prod-pdf-g">
            <button type="button" data-gal="report" data-i="nmPdf1">정밀 리포트 미리보기</button>
            <button type="button" data-gal="cert" data-i="nmPdf2">명명서 미리보기</button>
            <button type="button" data-gal="comm" data-i="nmPdf3">이름 풀이서 미리보기</button>
          </div>
        </div>

        <button class="prod-more" id="nmMore" type="button" aria-expanded="false">
          <span data-i="nmMore">가격 · 구성 자세히 보기</span><i>▾</i></button>

        <div class="prod-fold" id="nmFold">
        <p class="prod-lead" data-i="nmLead">아기의 사주를 용신·희신·대운까지 정밀 분석해 평생 최적의 오행을 도출하고, 자원오행 · 발음오행 · 81수리 삼중 검증을 모두 통과한 이름만 후보로 올립니다. 대법원 인명용 한자와 불용문자도 함께 확인합니다.</p>

        <div class="prod-inc">
          <div class="prod-inc-i"><div class="prod-inc-n">1</div><div>
            <div class="prod-inc-t" data-i="nmInc1t">정밀 리포트 20~25P</div>
            <div class="prod-inc-d" data-i="nmInc1d">사주 정밀 분석부터 이름 후보 5~6개를 점수로 비교한 스코어보드까지</div></div></div>
          <div class="prod-inc-i"><div class="prod-inc-n">2</div><div>
            <div class="prod-inc-t" data-i="nmInc2t">액자용 명명서(命名書)</div>
            <div class="prod-inc-d" data-i="nmInc2d">명조 · 처방 오행 · 삼중 검증 결과 · 축원문 · 대표 서명. A4 고해상도 원본</div></div></div>
          <div class="prod-inc-i"><div class="prod-inc-n">3</div><div>
            <div class="prod-inc-t" data-i="nmInc3t">소장용 이름 풀이서 8P</div>
            <div class="prod-inc-d" data-i="nmInc3d">글자별 자원 풀이, 소리와 획수의 근거, 아이에게 보내는 편지</div></div></div>
        </div>

        <div class="prod-samples">
          <figure><img src="/img/naming-3set-sq.jpg" alt="" loading="lazy" width="900" height="900">
            <figcaption data-i="nmSmp1">실제 3종 세트</figcaption></figure>
          <figure><img src="/img/naming-cert-sq.jpg" alt="" loading="lazy" width="900" height="900">
            <figcaption data-i="nmSmp2">액자용 명명서</figcaption></figure>
        </div>

        <div class="prod-pdf-n" style="margin:9px 0 0" data-i="nmPdfN2">아래 샘플은 <b>가상의 예시</b>입니다. 실제 고객 정보가 아닙니다.</div>

        <div class="prod-steps">
          <div class="prod-step"><b data-i="nmS1t">1단계 · 사주 정밀 분석</b>
            <span data-i="nmS1d">일간의 강약, 오행의 과부족, 십신 구조, 10년 단위 대운까지. 이 아이에게 평생 필요한 오행과 넘치는 기운을 흘려보낼 통로를 찾습니다.</span></div>
          <div class="prod-step"><b data-i="nmS2t">2단계 · 삼중 검증</b>
            <span data-i="nmS2d">자원오행이 사주의 부족을 채우는가, 성과 이름의 소리가 상극 없이 흐르는가, 81수리 네 구간이 모두 길수인가. 셋을 모두 통과한 이름만 후보에 올립니다.</span></div>
          <div class="prod-step"><b data-i="nmS3t">3단계 · 3종 세트로 완성</b>
            <span data-i="nmS3d">이름 하나가 아니라, 그 이름이 왜 이 이름인지에 대한 기록을 함께 드립니다.</span></div>
        </div>



        <div class="prod-same" data-i="nmSame">세 등급 모두 <b>결과물 3종은 동일</b>합니다. 차이는 상담 방식뿐입니다.<br>신청서에서 <b>원하시는 등급을 그대로 선택</b>하시면 됩니다.</div>
        <div class="prod-tiers">
          <a class="prod-tier" href="/consult?mode=detail&naming=200000" data-tier="basic">
            <div class="prod-tier-l"><div class="n" data-i="nmT1n">기본 · 리포트만</div>
              <div class="d" data-i="nmT1d">상담 없음 · 궁금한 건 톡으로</div></div>
            <div class="prod-tier-p">200,000<span data-i="nmWon">원</span></div>
          </a>
          <a class="prod-tier best" href="/consult?mode=detail&naming=250000" data-tier="std">
            <span class="prod-best-tag" data-i="nmBest">가장 많이 선택</span>
            <div class="prod-tier-l"><div class="n" data-i="nmT2n">표준 · 톡/전화 상담</div>
              <div class="d" data-i="nmT2d">톡 또는 전화 30분 포함</div></div>
            <div class="prod-tier-p">250,000<span data-i="nmWon2">원</span></div>
          </a>
          <a class="prod-tier" href="/consult?mode=detail&naming=300000" data-tier="prem">
            <div class="prod-tier-l"><div class="n" data-i="nmT3n">프리미엄 · 대면 상담</div>
              <div class="d" data-i="nmT3d">직접 만나 60분 · 카페 등 협의</div></div>
            <div class="prod-tier-p">300,000<span data-i="nmWon3">원</span></div>
          </a>
        </div>

        <div class="prod-note" data-i="nmNote">1차 리포트 <b>72시간</b> 내 전달 · 이름 확정까지 <b>2~3차 보완 무료</b> · 출생 전 예정일시로도 진행 가능하며 실제 출생일시 확정 시 <b>무료 재검증</b>합니다.<br>대면 상담은 사무실 이전 중이라 <b>카페 등 협의</b>로 진행합니다.</div>

        <div class="prod-cta">
          <a class="go" href="/consult?mode=detail&naming=250000" data-i="nmGo">작명 신청하기 →</a>
          <button class="sub" data-go="kakao" data-from="naming" data-i="nmAsk">먼저 물어보기 (카카오톡)</button>
        </div>

        <p class="prod-other" data-i="nmOther">개명 · 예명/활동명 · 상호/사업체명도 동일한 프로세스로 진행됩니다. 상담 신청서에 남겨 주세요.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 샘플 뷰어 — 다운로드 없이 화면에서만 본다 -->
  <div class="gal" id="gal" aria-hidden="true">
    <div class="gal-bar">
      <span class="gal-t" id="galT"></span>
      <span class="gal-n" id="galN"></span>
      <button class="gal-x" id="galX" type="button" aria-label="Close">×</button>
    </div>
    <div class="gal-stage" id="galStage"></div>
    <div class="gal-nav">
      <button type="button" id="galP" aria-label="Prev">‹</button>
      <button type="button" id="galNx" aria-label="Next">›</button>
    </div>
    <div class="gal-foot" data-i="nmGalFoot">전체 분량은 신청하신 분께만 드립니다 · 화면 보기 전용</div>
  </div>

  <!-- 결과 카드 -->
  <section class="preview">
    <div class="sec-label" data-i="secResult">무료 오행 성격 진단 RESULT</div>
    <h2 data-i="h2Prev">받게 될 <b>결과 카드</b>는 이런 모습</h2>
    <p class="sec-sub" data-i="prevSub">계절과 상징으로 이름 붙인 나만의 카드. 저장해서 친구에게 바로 보낼 수 있어요.</p>
    <div style="text-align:center;margin:10px 0 16px"><span class="wallchip" data-i="wallchip">📱 폰 배경화면으로 저장 가능한 화질</span></div>

    <div class="card-lux">
      <div class="card-in">
        <div class="card-brand" data-i="cardBrand">✓ AI사주랩.com</div>
        <div class="card-emoji">✨🌲✨</div>
        <div class="card-kicker" data-i="cardKicker">나의 오행 성격</div>
        <div class="card-title" data-i="cardTitle">「봄 소나무」</div>
        <div class="card-en">Spring Pine</div>
        <div class="card-line" data-i="cardLine">쭉쭉 뻗어야 봄이 온 줄 안다</div>
        <div class="card-pill" data-i="cardPill">甲 · 양(陽) · 목(木) 35%</div>
        <div class="caps">
          <div class="cap"><div class="tube" style="height:86px"><span class="num" style="color:#22A06B">7</span><span class="pel" style="height:22px;background:#22A06B"></span></div><div class="pct">35%</div><div class="han" style="color:#1E40AF">木</div></div>
          <div class="cap"><div class="tube" style="height:64px"><span class="num" style="color:#EF4444">4</span><span class="pel" style="height:16px;background:#EF4444"></span></div><div class="pct">20%</div><div class="han" style="color:#DC2626">火</div></div>
          <div class="cap"><div class="tube" style="height:54px"><span class="num" style="color:#B45309">3</span><span class="pel" style="height:14px;background:#B45309"></span></div><div class="pct">15%</div><div class="han" style="color:#B45309">土</div></div>
          <div class="cap"><div class="tube" style="height:44px"><span class="num" style="color:#94A3B8">2</span><span class="pel" style="height:12px;background:#94A3B8"></span></div><div class="pct">10%</div><div class="han" style="color:#64748B">金</div></div>
          <div class="cap"><div class="tube" style="height:64px"><span class="num" style="color:#2B7FEF">4</span><span class="pel" style="height:16px;background:#2B7FEF"></span></div><div class="pct">20%</div><div class="han" style="color:#1D4ED8">水</div></div>
        </div>
        <div class="card-foot" data-i="cardFoot">균형지수 <b>64</b> · 보완이 필요한 기운 <b>금(金)</b></div>
        <div class="card-url">AIsajuLab.com</div>
      </div>
    </div>
  </section>

  <!-- 대조 -->
  <section class="contrast">
    <div class="sec-label">WHY US</div>
    <h2 data-i="h2Why">AI는 <b>분석</b>하고,<br>방향은 <b>사람</b>이 찾습니다</h2>
    <p class="sec-sub" data-i="whySub">무료 사주, AI 자동 풀이… 그 속에 숨어 있는 광고와 상업성. AI사주랩은 다르게 갑니다.</p>
    <div class="vs">
      <div class="box"><div class="t" data-i="vsLt">AI 분석</div><div class="d" data-i="vsLd">사주와 데이터를<br>빠르고 객관적으로</div></div>
      <div class="mid">≠</div>
      <div class="box r"><div class="t" data-i="vsRt">전문가 해석</div><div class="d" data-i="vsRd">명리학 10년 · 경영지도사가<br>직접 검수</div></div>
    </div>
    <div class="calibnote" data-i="calibNote">전문가 상담은 사주팔자의 <b>「영점 조정」</b> 과정을 거칩니다. AI가 제시한 솔루션은 그 과정을 거치지 않으므로, 나에게 맞는 솔루션을 직접 선택해 활용해 주세요.</div>
  </section>

  <!-- 지금 열려 있는 것 -->
  <section>
    <div class="sec-label">NOW</div>
    <h2 data-i="h2Now">지금 열려 있는 것</h2>
    <p class="sec-sub" data-i="nowSub">좌우로 넘겨 보세요.</p>
    <div class="slides">
      <div class="slide">
        <div class="dday">D-16</div>
        <div class="tag" data-i="sl1tag">9월 오픈 이벤트</div>
        <h3 data-i="sl1h">AI 심층 리포트<br>런칭가 990원</h3>
        <p data-i="sl1p">정가 2,900원 → 9월 한 달만 990원. 진단 후 결과 화면에서 신청.</p>
        <a href="/ohaeng/" data-i="sl1a">지금 진단하고 신청하기</a>
      </div>
      <div class="slide">
        <div class="tag" data-i="sl2tag">신규</div>
        <h3 data-i="sl2h">(자연) 오행 성격 진단</h3>
        <p data-i="sl2p">질문 14개, 1분. 계절과 상징으로 읽는 나의 기질 카드.</p>
        <a href="/ohaeng/" data-i="sl2a">바로 진단하기</a>
      </div>
      <div class="slide warm">
        <div class="tag" data-i="sl3tag">읽을거리</div>
        <h3 data-i="sl3h">AI에게 사주 볼 때<br>어디까지 입력해도 될까?</h3>
        <p data-i="sl3p">생년월일시를 넘기기 전에 꼭 확인할 것들.</p>
        <a href="#" data-i="sl3a">글 읽기</a>
      </div>
    </div>
  </section>

  <!-- 고민 -->
  <section>
    <div class="sec-label">CONSULTING</div>
    <h2 data-i="h2Needs">당신도 이런 고민, <b>해본 적 있나요?</b></h2>
    <p class="sec-sub" data-i="needsSub">진단으로 방향을 잡았다면, 사람이 직접 보는 상담으로 이어집니다.</p>
    <div class="needs">
      <a class="need" href="/ohaeng/#report"><i>💼</i><span data-i="need1">지금, 이직해야 할까?</span></a>
      <a class="need" href="/ohaeng/#match"><i>💗</i><span data-i="need2">이 사람과 궁합이 맞을까?</span></a>
      <a class="need" href="/ohaeng/#report"><i>📈</i><span data-i="need3">창업해도 괜찮을까?</span></a>
      <a class="need" href="/ohaeng/#report"><i>🏠</i><span data-i="need4">지금 집을 사도 될까?</span></a>
      <a class="need more" href="/consult" data-i="needMore">개인사주 · 재물운 · 대운/세운 · 작명 더 보기 ▾</a>
    </div>
  </section>

  <!-- 3단계 -->
  <section>
    <div class="sec-label">HOW</div>
    <h2 data-i="h2How">상담은 <b>3단계</b>면 충분합니다</h2>
    <div class="steps" style="margin-top:18px">
      <div class="step step-sel">
        <span class="t" data-i="st1t">30초</span>
        <h4 data-i="st1h">상담 종류 선택</h4>
        <select class="step-drop" onchange="if(this.value)window.location.href='/consult'">
          <option value="" data-i="op0">▾ 유형 선택하기</option>
          <option value="1" data-i="op1">개인사주 (생년월일시 분석)</option>
          <option value="2" data-i="op2">이직·직업·커리어</option>
          <option value="3" data-i="op3">연애·궁합·결혼</option>
          <option value="4" data-i="op4">창업·사업·재물운</option>
          <option value="5" data-i="op5">부동산·이사·투자</option>
          <option value="6" data-i="op6">대운·세운 흐름</option>
          <option value="7" data-i="op7">작명 (이름 짓기)</option>
          <option value="8" data-i="op8">기타 고민</option>
        </select>
      </div>
      <div class="step" onclick="window.location.href='/consult'" style="cursor:pointer">
        <span class="t" data-i="st2t">1분</span><h4 data-i="st2h">생년월일시 입력</h4>
        <p data-i="st2p">모르면 "모른다"고 체크해도 됩니다 →</p>
      </div>
      <div class="step" onclick="window.location.href='/consult'" style="cursor:pointer">
        <span class="t" data-i="st3t">2분</span><h4 data-i="st3h">고민 남기기</h4>
        <p data-i="st3p">AI가 정리하고 연구소가 검수합니다 →</p>
      </div>
    </div>
    <a href="/consult" data-i="howCta" style="display:block;margin-top:16px;background:linear-gradient(135deg,#2F7FF0,#1D6DE3);color:#fff;text-align:center;padding:14px;border-radius:14px;font-weight:800;font-size:15px;text-decoration:none">지금 바로 상담 신청하기 →</a>
  </section>

  <!-- 후기 -->
  <section>
    <div class="sec-label">REVIEWS</div>
    <h2 data-i="h2Rev">먼저 만난 분들</h2>
    <div class="review" style="margin-top:16px">
      <div class="stars">★★★★★</div>
      <p data-i="revP">누구에게나 똑같은 8개의 달란트를 주신다고 시작해 주신 상담, 역대급 감동이었습니다. 앞으로도 중요한 결정에 도움 부탁드려요.</p>
      <div class="who" data-i="revWho">Jennifer · 개인사주</div>
    </div>
    <div class="review-cta" data-i="revCta">후기를 남겨 주시면 다음 상담 <b>50% 할인</b>을 드려요.</div>
  </section>

  <!-- 채널 -->
  <section>
    <div class="sec-label">CHANNELS</div>
    <h2 data-i="h2Ch">다른 곳에서도 만나요</h2>
    <div class="channels" style="margin-top:14px;text-align:center;display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
      <a class="ch-btn" href="https://www.daangn.com/kr/local-profile/yhqzhrhmoopf/?referrer=share" target="_blank" rel="noopener" data-i="ch1">당근 비즈프로필</a>
      <a class="ch-btn hot naver" href="https://m.blog.naver.com/naming_supporter" target="_blank" rel="noopener" data-i="ch2">네이버 블로그</a>
      <a class="ch-btn" href="https://open.kakao.com/o/gj3iUKai" target="_blank" rel="noopener" data-i="ch3">카카오톡 채널</a>
      <a class="ch-btn hot insta" href="https://www.instagram.com/choi_calvin" target="_blank" rel="noopener" data-i="ch4">인스타그램</a>
      <a class="ch-btn" href="https://cafe.daangn.com/sajupalja-myeon?utm_medium=copy_link" target="_blank" rel="noopener" data-i="ch5">명리학 Self-study 카페</a>
    </div>
  </section>

  <div class="voc bot" data-i="voc2">AI사주랩.com은 항상 고객님의 VOC와 지속적인 분석, 리포트 Quality 개선을 통해 고객 만족도, 삶의 질 향상에 최선을 다하겠습니다.</div>

  <footer>
    <b data-i="ftBrand">AI사주랩.com</b><br>
    <span data-i="ftTag">AI는 분석하고, 명리학은 방향을 찾습니다</span><br>
    <span data-i="ftDisc">진단 결과는 명리학에 기반한 AI 생성 콘텐츠이며, 과학적 사실이나 미래를 보장하지 않습니다.</span><br><br>
    <span class="biz">
      <span data-i="bizName">상호 라이프앤비즈(Life &amp; Biz) 성장 연구소 · 대표 최형철</span><br>
      <span data-i="bizNo">사업자등록번호 688-13-03146 · 통신판매업신고 제 2026-서울강동-1350 호</span><br>
      <span data-i="bizAddr">사업장 소재지 서울특별시 강동구 올림픽로78길 60, 103동 602호 (천호동, 강동밀레니얼중흥S클래스)</span><br>
      <span data-i="bizTel">전화 010-6789-1341 · 이메일 calvincheoi@gmail.com</span><br>
      <span data-i="bizHost">호스팅 제공자 Netlify, Inc.</span>
    </span><br>
    <a class="lg" href="/legal/#t1" data-i="lg1">이용약관</a>
    <a class="lg" href="/legal/#t2" data-i="lg2">개인정보처리방침</a>
    <a class="lg" href="/legal/#t3" data-i="lg3">환불·청약철회</a>
    <a class="lg" href="/legal/#t4" data-i="lg4">사업자정보</a><br><br>
    <span data-i="copy">© 2026 최형철 사주명리 연구소</span>
  </footer>
</div>

<nav class="tabbar">
  <button class="tb on" data-go="top" data-from="tab"><span class="ti"><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></svg></span><span data-i="tabHome">홈</span></button>
  <button data-go="today" data-from="tab" class="tb"><span class="ti"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></svg></span><span data-i="tabToday">오늘</span></button>
  <button data-go="ohaeng" data-from="tab" class="tb main"><span class="ti"><svg viewBox="0 0 24 24"><path d="M12 3.5 13.8 10 20.5 12 13.8 14 12 20.5 10.2 14 3.5 12 10.2 10Z"/></svg></span><span data-i="tabDiag">진단</span></button>
  <button data-go="match" data-from="tab" class="tb"><span class="ti"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9-9.3C1.9 7.2 4.2 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3 0 5.3 2.7 4.2 6.2C20.5 15.4 12 20 12 20Z"/></svg></span><span data-i="tabMatch">궁합</span></button>
  <button data-go="consult" data-from="tab" class="tb"><span class="ti"><svg viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 13.5Z"/></svg></span><span data-i="tabConsult">상담</span></button>
</nav>

`;

function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function track(name: string, props: Record<string, unknown> = {}) {
  try {
    const ss = window.sessionStorage, ls = window.localStorage;
    let sid = ss.getItem("aisaju_sid"); if (!sid) { sid = rid(); ss.setItem("aisaju_sid", sid); }
    let vid = ls.getItem("aisaju_vid"); if (!vid) { vid = rid(); ls.setItem("aisaju_vid", vid); }
    const q = new URLSearchParams(window.location.search);
    const now: Record<string, string> = {};
    ["utm","utm_source","utm_medium","utm_campaign"].forEach(k => { const v = q.get(k); if (v) now[k] = v; });
    if (Object.keys(now).length) ls.setItem("aisaju_utm", JSON.stringify(now));
    let u: Record<string, string> = {}; try { u = JSON.parse(ls.getItem("aisaju_utm") || "{}"); } catch {}
    const w = window.innerWidth;
    fetch(SB_URL + "/rest/v1/events", {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, Prefer: "return=minimal" },
      body: JSON.stringify({ session_id: sid, visitor_id: vid, name, step: null, props,
        utm: u.utm||null, utm_source: u.utm_source||null, utm_medium: u.utm_medium||null, utm_campaign: u.utm_campaign||null,
        referrer: document.referrer||null, path: window.location.pathname,
        device: w<768?"mobile":w<1024?"tablet":"desktop", lang: document.documentElement.lang||"ko" }),
    }).catch(()=>{});
  } catch {}
}

export default function HomeV6() {
  useEffect(() => {
    track("home_view");
    const root = document.querySelector(".v6"); if (!root) return;

    /* ══════════ 언어 전환 ══════════
       · 원본(한국어)은 첫 실행 때 요소마다 기억해 둔다 — ko 사전을 따로 두지 않아도 된다
       · 선택은 오행 앱과 같은 키(ohaeng_lang)에 저장한다 → /ohaeng/ 으로 넘어가도 유지 */
    const LS_KEY = "ohaeng_lang";
    const readLang = (): Lang => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) { const v = JSON.parse(raw); if ((LANGS as readonly string[]).includes(v)) return v as Lang; }
        const a = localStorage.getItem("aisaju_lang");
        if (a && (LANGS as readonly string[]).includes(a)) return a as Lang;
      } catch {}
      const n = (navigator.language || "ko").toLowerCase();
      if (n.startsWith("ko")) return "ko";
      if (n.startsWith("ja")) return "ja";
      if (n.startsWith("zh")) return "zh";
      if (n.startsWith("fr")) return "fr";
      return "en";
    };

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-i]"));
    const dNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-di]"));
    const origin = new Map<HTMLElement, string>();
    nodes.forEach(el => origin.set(el, el.innerHTML));
    const dOrigin = new Map<HTMLElement, string>();
    dNodes.forEach(el => dOrigin.set(el, el.getAttribute("data-d") || ""));

    let LANG: Lang = readLang();

    const applyLang = () => {
      const dict = I18N[LANG] || {};
      nodes.forEach(el => {
        const k = el.dataset.i || "";
        const v = dict[k];
        el.innerHTML = (v !== undefined && v !== "") ? v : (origin.get(el) || "");
      });
      dNodes.forEach(el => {
        const k = el.dataset.di || "";
        const v = dict[k];
        el.setAttribute("data-d", (v !== undefined && v !== "") ? v : (dOrigin.get(el) || ""));
      });
      const now = document.getElementById("langnow");
      if (now) now.textContent = LANGNAME[LANG];
      document.documentElement.lang = LANG;
      root.querySelectorAll<HTMLElement>("[data-setlang]").forEach(b =>
        b.classList.toggle("on", b.dataset.setlang === LANG));
      /* 순환 안내문의 기준 문장도 새 언어로 갱신한다 */
      const note = document.getElementById("cycnote");
      if (note) cycBase = note.innerHTML;
    };

    const setLang = (l: Lang) => {
      LANG = l;
      /* Next.js 쪽(LanguageProvider)은 raw 문자열 aisaju_lang 을 쓰므로 함께 기록한다 */
      try { localStorage.setItem(LS_KEY, JSON.stringify(l)); localStorage.setItem("aisaju_lang", l); } catch {}
      applyLang();
      track("lang_change", { lang: l });
    };

    const box = document.getElementById("langbox");
    const btn = document.getElementById("langbtn");
    const closeMenu = () => { box?.classList.remove("open"); btn?.setAttribute("aria-expanded", "false"); };
    const onDocClick = (e: Event) => { if (box && !box.contains(e.target as Node)) closeMenu(); };
    document.addEventListener("click", onDocClick);

    /* ── 샘플 뷰어 ── PDF 다운로드 대신 이미지로만 보여 준다 */
    const GAL: Record<string, { t: string; n: number; src: string[] }> = {
      report: { t: "정밀 리포트", n: 23, src: ["/img/sample/report-1.jpg", "/img/sample/report-2.jpg", "/img/sample/report-3.jpg", "/img/sample/report-4.jpg"] },
      cert:   { t: "액자용 명명서", n: 1, src: ["/img/sample/cert-1.jpg"] },
      comm:   { t: "이름 풀이서", n: 8, src: ["/img/sample/comm-1.jpg", "/img/sample/comm-2.jpg", "/img/sample/comm-3.jpg"] },
    };
    let galKey = "report", galI = 0;
    const galEl = document.getElementById("gal");
    const drawGal = () => {
      const g = GAL[galKey]; if (!g) return;
      const stage = document.getElementById("galStage");
      const im = new window.Image();
      im.src = g.src[galI]; im.alt = ""; im.draggable = false;
      if (stage) { stage.innerHTML = ""; stage.appendChild(im); }
      const tEl = document.getElementById("galT");
      const nEl = document.getElementById("galN");
      if (tEl) tEl.textContent = g.t;
      if (nEl) nEl.textContent = (galI + 1) + " / " + g.src.length + (g.n > g.src.length ? "  (전체 " + g.n + "P)" : "");
      const pB = document.getElementById("galP") as HTMLButtonElement | null;
      const nB = document.getElementById("galNx") as HTMLButtonElement | null;
      if (pB) pB.disabled = galI === 0;
      if (nB) nB.disabled = galI >= g.src.length - 1;
    };
    const openGal = (k: string) => {
      galKey = k; galI = 0;
      galEl?.classList.add("on");
      galEl?.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      drawGal(); track("naming_sample", { doc: k });
    };
    const closeGal = () => {
      galEl?.classList.remove("on");
      galEl?.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };
    document.getElementById("galX")?.addEventListener("click", closeGal);
    document.getElementById("galP")?.addEventListener("click", () => { if (galI > 0) { galI--; drawGal(); } });
    document.getElementById("galNx")?.addEventListener("click", () => { if (galI < GAL[galKey].src.length - 1) { galI++; drawGal(); } });
    galEl?.addEventListener("click", (e) => { if (e.target === galEl) closeGal(); });
    galEl?.addEventListener("contextmenu", (e) => e.preventDefault());

    let cycBase = "";
    applyLang();

    const onClick = (e: Event) => {
      const t = e.target as HTMLElement;

      /* 언어 드롭다운 */
      const lb = t.closest("[data-setlang]") as HTMLElement | null;
      if (lb) { setLang(lb.dataset.setlang as Lang); closeMenu(); return; }
      if (t.closest("#langbtn")) {
        const open = box?.classList.toggle("open");
        btn?.setAttribute("aria-expanded", open ? "true" : "false");
        track("lang_click", { from: "top" });
        return;
      }

      const gb = t.closest("[data-gal]") as HTMLElement | null;
      if (gb) { openGal(gb.dataset.gal || "report"); return; }

      /* 작명 상세 펼치기 — 두 구역을 함께 여닫는다 */
      if (t.closest("#nmMore")) {
        const fold2 = document.getElementById("nmFold2");
        const fold = document.getElementById("nmFold");
        const btn = document.getElementById("nmMore");
        const open = fold?.classList.toggle("on");
        fold2?.classList.toggle("on", !!open);
        btn?.classList.toggle("on", !!open);
        btn?.setAttribute("aria-expanded", open ? "true" : "false");
        const label = btn?.querySelector("[data-i]") as HTMLElement | null;
        if (label) {
          label.dataset.i = open ? "nmLess" : "nmMore";
          label.innerHTML = (I18N[LANG] && I18N[LANG][label.dataset.i]) || label.innerHTML;
        }
        track("naming_expand", { open: !!open });
        return;
      }

      const b = t.closest("[data-go]") as HTMLElement | null;
      if (!b) return;
      const go = b.dataset.go, from = b.dataset.from || "home";
      if (b.dataset.ev === "report_open") track("report_open", { kind: "report", from });
      if (go === "kakao") { track("consult_open", { from }); window.open(KAKAO, "_blank"); }
      else if (go === "consult") { track("consult_open", { from, kind: "custom" }); window.location.href = "/consult"; }
      else if (go === "ohaeng") { window.location.href = "/ohaeng/"; }
      else if (go === "menu") { track("menu_click", { from }); window.location.href = "/ohaeng/#me"; }
      else if (go === "today")  { track("svc_click", { to: "today", from });  window.location.href = "/ohaeng/#today"; }
      else if (go === "match")  { track("svc_click", { to: "match", from });  window.location.href = "/ohaeng/#match"; }
      else if (go === "report") { track("svc_click", { to: "report", from }); window.location.href = "/ohaeng/#report"; }
      else if (go === "naming") {
        track("svc_click", { to: "naming", from });
        document.getElementById("naming")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      else if (go === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); }
    };
    root.addEventListener("click", onClick);

    const wrap = document.getElementById("ohwrap");
    const note = document.getElementById("cycnote");
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (wrap && note) {
      cycBase = note.innerHTML;
      const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".oh"));
      cards.forEach(c => c.addEventListener("click", () => {
        cards.forEach(x => x.classList.remove("on"));
        c.classList.add("on"); wrap.classList.add("paused");
        note.textContent = c.getAttribute("data-d") || "";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { c.classList.remove("on"); wrap.classList.remove("paused"); note.innerHTML = cycBase; }, 3500);
      }));
    }

    return () => {
      root.removeEventListener("click", onClick);
      document.removeEventListener("click", onDocClick);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="v6">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </div>
  );
}
