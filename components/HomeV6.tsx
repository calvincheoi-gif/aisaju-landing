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
  display:flex;align-items:center;gap:8px}
.btn .ico{flex:0 0 30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:15px;background:rgba(255,255,255,.9)}
.btn .tx{flex:1;min-width:0}
.btn .t1{font-size:14px;font-weight:800;letter-spacing:-.05em;line-height:1.2;white-space:nowrap}
.btn .t2{font-size:9.5px;font-weight:700;letter-spacing:-.03em;opacity:.9;margin-top:1px;white-space:nowrap}
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
a.need{text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px}
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
.slide{flex:0 0 79%;scroll-snap-align:center;border-radius:18px;padding:16px;position:relative;background:#fff;border:1px solid var(--line);box-shadow:0 6px 16px rgba(20,50,110,.07)}
.slide .tag{display:inline-block;font-size:10.5px;font-weight:800;padding:4px 10px;border-radius:999px;background:var(--blue-p);color:var(--blue-d);margin-bottom:8px}
.slide.warm .tag{background:#FFF3D6;color:#A97904}
.slide h3{margin:0 0 5px;font-size:16px;letter-spacing:-.04em;font-weight:800;color:var(--navy);line-height:1.35}
.slide p{margin:0 0 10px;font-size:12px;color:var(--gray);line-height:1.55;font-weight:500}
.slide a{display:inline-block;font-size:12px;font-weight:800;color:var(--blue);text-decoration:none;border-bottom:1.5px solid rgba(37,99,235,.35)}
.dday{position:absolute;top:13px;right:13px;font-size:10.5px;font-weight:800;color:var(--crim);background:#FDECF1;padding:4px 9px;border-radius:999px}

/* 고민 */
.needs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.need{background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px 12px;font-size:13.5px;font-weight:700;letter-spacing:-.04em;color:var(--navy);display:flex;align-items:center;gap:8px;box-shadow:0 3px 9px rgba(20,50,110,.05)}
.need i{font-style:normal;font-size:17px}
.need.more{grid-column:1/-1;justify-content:center;color:var(--gray);font-weight:600;font-size:12.5px;background:transparent;border-style:dashed;box-shadow:none}

/* 3단계 */
.steps{position:relative;padding-left:26px}
.steps::before{content:"";position:absolute;left:7px;top:9px;bottom:16px;width:2px;background:linear-gradient(180deg,var(--blue),rgba(37,99,235,.12))}
.step{position:relative;margin-bottom:16px}
.step::before{content:"";position:absolute;left:-24px;top:4px;width:15px;height:15px;border-radius:50%;background:#fff;border:3px solid var(--blue)}
.step .t{font-size:10.5px;color:var(--blue);font-weight:800}
.step h4{margin:1px 0 3px;font-size:14.5px;font-weight:800;letter-spacing:-.04em;color:var(--navy)}
.step p{margin:0;font-size:12.5px;color:var(--gray);line-height:1.6;font-weight:500}

/* 후기 */
.review{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px;box-shadow:0 4px 12px rgba(20,50,110,.05)}
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
.sv{position:relative;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 13px 12px;box-shadow:0 4px 12px rgba(20,50,110,.05);text-align:left}
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
.cb{border-radius:14px;padding:12px 10px;text-align:left;font-family:inherit;cursor:pointer}
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
`;
const HTML = String.raw`
<div class="shell">

  <div class="topbar">
    <div class="brand">AI<span>사주랩</span>.com <small>AI × 명리학</small></div>
    <div class="util">
      <span class="chip">한국어 ▾</span>
      <div class="burger"><i></i><i></i><i></i></div>
    </div>
  </div>

  <!-- 히어로 : 여기까지가 첫 화면 -->
  <div class="hero">
    <div class="blob b1"></div><div class="blob b2"></div>

    <div class="badges">
      <span class="bdg free">🎁 오행 진단 · 오늘의 흐름 무료</span>
      <span class="bdg mbti">혈액형, MBTI처럼!</span>
    </div>

    <h1 class="hook">그럼, 나의<br><span class="mark"><b>(자연) 오행</b></span> 성격은?</h1>
    <p class="sub">사주 명리학 × AI 분석으로 찾는 나만의 성향과 강점</p>

    <!-- 오행 순환 스트립 -->
    <div class="ohwrap" id="ohwrap">
      <div class="ohstrip">
        <div class="oh" data-d="목(木) — 자라나는 힘. 새로 벌이고 넓혀 갑니다.">
          <span class="han" style="background:#22A06B">木</span>
          <span class="sym">🌲</span><span class="nm">목(木)</span><span class="kw">성장 · 확장</span>
        </div>
        <div class="oh" data-d="화(火) — 드러내는 힘. 열정과 표현으로 사람을 모읍니다.">
          <span class="han" style="background:#EF4444">火</span>
          <span class="sym">🔥</span><span class="nm">화(火)</span><span class="kw">열정 · 표현</span>
        </div>
        <div class="oh" data-d="토(土) — 붙드는 힘. 중심을 잡고 오래 버팁니다.">
          <span class="han" style="background:#8B5E3C">土</span>
          <span class="sym">⛰️</span><span class="nm">토(土)</span><span class="kw">중심 · 안정</span>
        </div>
        <div class="oh" data-d="금(金) — 매듭짓는 힘. 기준이 분명하고 결정이 빠릅니다.">
          <span class="han" style="background:#94A3B8">金</span>
          <span class="sym">💎</span><span class="nm">금(金)</span><span class="kw">결단 · 실행</span>
        </div>
        <div class="oh" data-d="수(水) — 헤아리는 힘. 유연하게 흐르며 깊이 생각합니다.">
          <span class="han" style="background:#2B7FEF">水</span>
          <span class="sym">💧</span><span class="nm">수(水)</span><span class="kw">지혜 · 흐름</span>
        </div>
      </div>
      <div class="cycnote" id="cycnote">木 <span class="arrow">→</span> 火 <span class="arrow">→</span> 土 <span class="arrow">→</span> 金 <span class="arrow">→</span> 水 <span class="arrow">→</span> 다시 木</div>
    </div>

    <!-- 시간 + CTA를 가리키는 화살표 -->
    <div class="timeline">
      <div class="txt">
        <div class="q">질문 14개</div>
        <div class="a"><em>1분</em>이면 나와요!</div>
      </div>
      <svg class="hook-arrow" width="34" height="40" viewBox="0 0 34 40" fill="none" aria-hidden="true">
        <path d="M4 4 C22 6, 28 14, 27 30" stroke="#9FC5FF" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M21 25 L27 33 L33 25" stroke="#9FC5FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>

    <div class="cta-pair">
      <button class="btn btn-free">
        <span class="ico">🤖</span>
        <span class="tx"><span class="t1">무료 오행 진단</span><span class="t2">가입 없이 바로</span></span>
        <span class="go">›</span>
      </button>
      <button class="btn btn-pro">
        <span class="ico">💬</span>
        <span class="tx"><span class="t1">전문가 상담</span><span class="t2">기본 50,000원</span></span>
        <span class="go">›</span>
      </button>
    </div>

    <div class="trust">
      <div class="cell"><div class="ti">🛡️</div><div class="n">개인정보 안심</div><div class="l">저장 최소화</div></div>
      <div class="cell"><div class="ti">⚡</div><div class="n">초간단 14문항</div><div class="l">1분 빠른 분석</div></div>
      <div class="cell"><div class="ti">🎯</div><div class="n">AI + 전문가</div><div class="l">해석을 사람이 검수</div></div>
    </div>

    <div class="disclosure">AI사주랩은 명리학을 기반으로 AI가 보조 분석하여<br>더 쉽고 정확한 인사이트를 제공합니다.</div>
  </div>

  <!-- v6 ③⑤⑦: 서비스 카드 그리드 -->
  <section style="padding-top:24px">
    <div class="sec-label">SERVICES</div>
    <h2>여기서 할 수 있는 것</h2>
    <div class="svc">
      <button class="sv"><span class="tag free">무료</span>
        <div class="si">🤖</div><div class="sn">오행 성격 진단</div>
        <div class="sd">14문항 1분 · 가입 없이 바로</div></button>
      <button class="sv"><span class="tag day">하루 1회 무료</span>
        <div class="si">🌤️</div><div class="sn">오늘의 흐름</div>
        <div class="sd">내 오행으로 보는 오늘 컨디션</div></button>
      <button class="sv"><span class="tag free">무료</span>
        <div class="si">🤝</div><div class="sn">친구와 오행 궁합</div>
        <div class="sd">링크 보내면 둘의 궁합 공개</div></button>
      <button class="sv"><span class="tag pay">990원 · 즉시</span>
        <div class="si">📊</div><div class="sn">AI 심층 리포트</div>
        <div class="sd">고민 반영 맞춤 해석 · 카카오페이</div></button>
    </div>

    <!-- v6 ④안: 상담 — 간편(채움) 우선, 정밀(투명+테두리) -->
    <div class="consult">
      <div class="ct">👨‍🏫 전문가 1:1 상담</div>
      <div class="cs">경영지도사 최형철 · 30년 경력이 직접 해석합니다</div>
      <div class="cbtns">
        <button class="cb cb-quick"><span class="b1">기본 상담 · 50,000원</span><span class="b2">리포트 + 전화/카톡 해석 · D+2일</span></button>
        <button class="cb cb-deep"><span class="b1">맞춤 상담</span><span class="b2">신청서 작성 · 내용 보고 안내</span></button>
      </div>
      <div class="pricenote">맞춤 상담은 기존 상담 신청서로 접수 후 범위·비용을 안내드립니다</div>
    </div>
  </section>

  <!-- 결과 카드 -->
  <section class="preview">
    <div class="sec-label">RESULT</div>
    <h2>받게 될 <b>결과 카드</b>는 이런 모습</h2>
    <p class="sec-sub">계절과 상징으로 이름 붙인 나만의 카드. 저장해서 친구에게 바로 보낼 수 있어요.</p>
    <div style="text-align:center;margin:10px 0 16px"><span class="wallchip">📱 폰 배경화면으로 저장 가능한 화질</span></div>

    <div class="card-lux">
      <div class="card-in">
        <div class="card-brand">✓ AI사주랩.com</div>
        <div class="card-emoji">✨🌲✨</div>
        <div class="card-kicker">나의 오행 성격</div>
        <div class="card-title">「봄 소나무」</div>
        <div class="card-en">Spring 소나무</div>
        <div class="card-line">쭉쭉 뻗어야 봄이 온 줄 안다</div>
        <div class="card-pill">甲 · 양(陽) · 목(木) 35%</div>
        <div class="caps">
          <div class="cap"><div class="tube" style="height:86px"><span class="num" style="color:#22A06B">7</span><span class="pel" style="height:22px;background:#22A06B"></span></div><div class="pct">35%</div><div class="han" style="color:#1E40AF">木</div></div>
          <div class="cap"><div class="tube" style="height:64px"><span class="num" style="color:#EF4444">4</span><span class="pel" style="height:16px;background:#EF4444"></span></div><div class="pct">20%</div><div class="han" style="color:#DC2626">火</div></div>
          <div class="cap"><div class="tube" style="height:54px"><span class="num" style="color:#B45309">3</span><span class="pel" style="height:14px;background:#B45309"></span></div><div class="pct">15%</div><div class="han" style="color:#B45309">土</div></div>
          <div class="cap"><div class="tube" style="height:44px"><span class="num" style="color:#94A3B8">2</span><span class="pel" style="height:12px;background:#94A3B8"></span></div><div class="pct">10%</div><div class="han" style="color:#64748B">金</div></div>
          <div class="cap"><div class="tube" style="height:64px"><span class="num" style="color:#2B7FEF">4</span><span class="pel" style="height:16px;background:#2B7FEF"></span></div><div class="pct">20%</div><div class="han" style="color:#1D4ED8">水</div></div>
        </div>
        <div class="card-foot">균형지수 <b>64</b> · 보완이 필요한 기운 <b>금(金)</b></div>
        <div class="card-url">AI사주랩.com</div>
      </div>
    </div>
  </section>

  <!-- 대조 -->
  <section class="contrast">
    <div class="sec-label">WHY US</div>
    <h2>AI는 <b>분석</b>하고,<br>방향은 <b>사람</b>이 찾습니다</h2>
    <p class="sec-sub">무료 사주, AI 자동 풀이… 그 속에 숨어 있는 광고와 상업성. AI사주랩은 다르게 갑니다.</p>
    <div class="vs">
      <div class="box"><div class="t">AI 분석</div><div class="d">사주와 데이터를<br>빠르고 객관적으로</div></div>
      <div class="mid">≠</div>
      <div class="box r"><div class="t">전문가 해석</div><div class="d">명리학 10년 · 경영지도사가<br>직접 검수</div></div>
    </div>
    <div class="calibnote">전문가 상담은 사주팔자의 <b>「영점 조정」</b> 과정을 거칩니다. AI가 제시한 솔루션은 그 과정을 거치지 않으므로, 나에게 맞는 솔루션을 직접 선택해 활용해 주세요.</div>
  </section>

  <!-- 지금 열려 있는 것 -->
  <section>
    <div class="sec-label">NOW</div>
    <h2>지금 열려 있는 것</h2>
    <p class="sec-sub">좌우로 넘겨 보세요.</p>
    <div class="slides">
      <div class="slide">
        <div class="dday">D-16</div>
        <div class="tag">9월 오픈 이벤트</div>
        <h3>AI 심층 리포트<br>런칭가 990원</h3>
        <p>정가 2,900원 → 9월 한 달만 990원. 진단 후 결과 화면에서 신청.</p>
        <a href="/ohaeng/">지금 진단하고 신청하기</a>
      </div>
      <div class="slide">
        <div class="tag">신규</div>
        <h3>(자연) 오행 성격 진단</h3>
        <p>질문 14개, 1분. 계절과 상징으로 읽는 나의 기질 카드.</p>
        <a href="/ohaeng/">바로 진단하기</a>
      </div>
      <div class="slide warm">
        <div class="tag">읽을거리</div>
        <h3>AI에게 사주 볼 때<br>어디까지 입력해도 될까?</h3>
        <p>생년월일시를 넘기기 전에 꼭 확인할 것들.</p>
        <a href="#">글 읽기</a>
      </div>
    </div>
  </section>

  <!-- 고민 -->
  <section>
    <div class="sec-label">CONSULTING</div>
    <h2>당신도 이런 고민, <b>해본 적 있나요?</b></h2>
    <p class="sec-sub">진단으로 방향을 잡았다면, 사람이 직접 보는 상담으로 이어집니다.</p>
    <div class="needs">
      <a class="need" href="/ohaeng/"><i>💼</i>지금, 이직해야 할까?</a>
      <a class="need" href="/ohaeng/"><i>💗</i>이 사람과 궁합이 맞을까?</a>
      <a class="need" href="/ohaeng/"><i>📈</i>창업해도 괜찮을까?</a>
      <a class="need" href="/ohaeng/"><i>🏠</i>지금 집을 사도 될까?</a>
      <a class="need more" href="/consult">개인사주 · 재물운 · 대운/세운 · 작명 더 보기 ▾</a>
    </div>
  </section>

  <!-- 3단계 -->
  <section>
    <div class="sec-label">HOW</div>
    <h2>상담은 <b>3단계</b>면 충분합니다</h2>
    <div class="steps" style="margin-top:18px">
      <div class="step step-sel">
        <span class="t">30초</span>
        <h4>상담 종류 선택</h4>
        <select class="step-drop" onchange="if(this.value)window.location.href='/consult'">
          <option value="">▾ 유형 선택하기</option>
          <option value="1">개인사주 (생년월일시 분석)</option>
          <option value="2">이직·직업·커리어</option>
          <option value="3">연애·궁합·결혼</option>
          <option value="4">창업·사업·재물운</option>
          <option value="5">부동산·이사·투자</option>
          <option value="6">대운·세운 흐름</option>
          <option value="7">작명 (이름 짓기)</option>
          <option value="8">기타 고민</option>
        </select>
      </div>
      <div class="step" onclick="window.location.href='/consult'" style="cursor:pointer">
        <span class="t">1분</span><h4>생년월일시 입력</h4>
        <p>모르면 "모른다"고 체크해도 됩니다 →</p>
      </div>
      <div class="step" onclick="window.location.href='/consult'" style="cursor:pointer">
        <span class="t">2분</span><h4>고민 남기기</h4>
        <p>AI가 정리하고 연구소가 검수합니다 →</p>
      </div>
    </div>
    <a href="/consult" style="display:block;margin-top:16px;background:linear-gradient(135deg,#2F7FF0,#1D6DE3);color:#fff;text-align:center;padding:14px;border-radius:14px;font-weight:800;font-size:15px;text-decoration:none">지금 바로 상담 신청하기 →</a>
  </section>

  <!-- 후기 -->
  <section>
    <div class="sec-label">REVIEWS</div>
    <h2>먼저 만난 분들</h2>
    <div class="review" style="margin-top:16px">
      <div class="stars">★★★★★</div>
      <p>누구에게나 똑같은 8개의 달란트를 주신다고 시작해 주신 상담, 역대급 감동이었습니다. 앞으로도 중요한 결정에 도움 부탁드려요.</p>
      <div class="who">Jennifer · 개인사주</div>
    </div>
    <div class="review-cta">후기를 남겨 주시면 다음 상담 <b>50% 할인</b>을 드려요.</div>
  </section>

  <!-- 채널 -->
  <section>
    <div class="sec-label">CHANNELS</div>
    <h2>다른 곳에서도 만나요</h2>
    <div class="channels" style="margin-top:14px;text-align:center;display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
      <a class="ch-btn" href="https://aisajulab.com/ohaeng/?utm=daangn" target="_blank">당근 비즈프로필</a>
      <a class="ch-btn" href="https://aisajulab.com/ohaeng/?utm=blog" target="_blank">네이버 블로그</a>
      <a class="ch-btn" href="https://aisajulab.com/ohaeng/?utm=kakao" target="_blank">카카오톡 채널</a>
      <a class="ch-btn" href="https://aisajulab.com/ohaeng/?utm=insta" target="_blank">인스타그램</a>
      <a class="ch-btn" href="https://aisajulab.com/ohaeng/?utm=cafe" target="_blank">명리학 Self-study 카페</a>
    </div>
  </section>

  <footer>
    <b>AI사주랩.com</b><br>
    AI는 분석하고, 명리학은 방향을 찾습니다<br>
    최형철 사주명리 연구소 · 전문 상담 및 AI 명리 리포트<br>
    © 2026 최형철 사주명리 연구소
  </footer>
</div>

<nav class="tabbar">
  <button class="tb on"><span class="ti"><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></svg></span>홈</button>
  <button class="tb"><span class="ti"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></svg></span>오늘</button>
  <button class="tb main"><span class="ti"><svg viewBox="0 0 24 24"><path d="M12 3.5 13.8 10 20.5 12 13.8 14 12 20.5 10.2 14 3.5 12 10.2 10Z"/></svg></span>진단</button>
  <button class="tb"><span class="ti"><svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-9-9.3C1.9 7.2 4.2 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3 0 5.3 2.7 4.2 6.2C20.5 15.4 12 20 12 20Z"/></svg></span>궁합</button>
  <button class="tb"><span class="ti"><svg viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 4v-4h-1A2.5 2.5 0 0 1 4 13.5Z"/></svg></span>상담</button>
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
    const onClick = (e: Event) => {
      const b = (e.target as HTMLElement).closest("[data-go]") as HTMLElement | null;
      if (!b) return;
      const go = b.dataset.go, from = b.dataset.from || "home";
      if (b.dataset.ev === "report_open") track("report_open", { kind: "report", from });
      if (go === "kakao") { track("consult_open", { from }); window.open(KAKAO, "_blank"); }
      else if (go === "consult") { track("consult_open", { from, kind: "custom" }); window.location.href = "/consult"; }
      else if (go === "ohaeng") { window.location.href = "/ohaeng/"; }
      else if (go === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); }
    };
    root.addEventListener("click", onClick);
    const wrap = document.getElementById("ohwrap");
    const note = document.getElementById("cycnote");
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (wrap && note) {
      const base = note.innerHTML;
      const cards = Array.from(wrap.querySelectorAll<HTMLElement>(".oh"));
      cards.forEach(c => c.addEventListener("click", () => {
        cards.forEach(x => x.classList.remove("on"));
        c.classList.add("on"); wrap.classList.add("paused");
        note.textContent = c.getAttribute("data-d") || "";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { c.classList.remove("on"); wrap.classList.remove("paused"); note.innerHTML = base; }, 3500);
      }));
    }
    return () => { root.removeEventListener("click", onClick); if (timer) clearTimeout(timer); };
  }, []);

  return (
    <div className="v6">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </div>
  );
}
