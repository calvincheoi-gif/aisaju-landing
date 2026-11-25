"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/worries/links";
import { daysLeft, kstDay, SEASON, seasonVisible } from "@/lib/newyear/season";

/**
 * 홈 팝업 — 「새해맞이 새해운 EVENT」 (2026-11-24 소장님 확정: 네이비 빛결 배경 · 금빛 주역 카드 + 흰 카드 2장, 오행 카드 줄 위).
 *
 *  · 홈에 들어오면 바로 뜨고, 처음 나타날 때 금빛 테두리가 네 번 깜빡여 눈길을 끈다.
 *  · ✕ 는 이번만 닫는다(다음 방문에 다시 뜸). 「오늘 하루 다시 열지 않기」는 오늘(한국 날짜) 동안 뜨지 않는다.
 *  · 세 선택지(주역 무료 · 토정 1장 · 사주 1장)로 바로 들어간다. 클릭은 utm=popup 으로 표시해 홈 지표와 따로 센다.
 *  · 사전 오픈(11/24~)부터 뜬다 — 팝업의 세 가지(한 장 상품)는 이때부터 바로 받을 수 있다. 상세본은 12/1 오픈.
 *  · 홈 화면 구조는 건드리지 않는다 — 이 부품 하나를 app/page.tsx 에 얹었다 뗐다 한다.
 */
const HIDE_KEY = "ny_pop_hide_day";
/** 팝업 바탕색 — "navy" | "red" | "green". 미리보기는 주소 끝 ?nypop=1&nytheme=red */
const THEME_DEFAULT: "navy" | "red" | "green" = "navy";

const OPTIONS = [
  { key: "iching-card", icon: "易", name: "주역 카드", price: "무료", hot: true },
  { key: "tojeong-card", icon: "亭", name: "토정비결 1매", price: "990원", hot: false },
  { key: "saju-card", icon: "命", name: "사주명리 1매", price: "990원", hot: false },
] as const;

export default function NySeasonPopup() {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const [theme, setTheme] = useState<string>(THEME_DEFAULT);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const preview = q.get("nypop") === "1";
    const th = q.get("nytheme"); if (th === "red" || th === "green" || th === "navy") setTheme(th);
    if (!preview && !seasonVisible()) return;
    try { if (!preview && localStorage.getItem(HIDE_KEY) === kstDay()) return; } catch { /* 저장소 막힘 — 그냥 띄운다 */ }
    setLeft(daysLeft());
    const t = window.setTimeout(() => { setOpen(true); track("ny_pop_view", { season: SEASON.key }); }, 350);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const close = (how: "x" | "today") => {
    if (how === "today") try { localStorage.setItem(HIDE_KEY, kstDay()); } catch { /* 무시 */ }
    track(how === "today" ? "ny_pop_hide_today" : "ny_pop_close", { season: SEASON.key });
    setOpen(false);
  };

  return (
    <div id="nyc" className={theme} role="dialog" aria-label="2027 새해운 이벤트">
      <style>{CSS}</style>
      <div className="box">
        <span className="glow" aria-hidden />
        {/* 붉은 양·별: 팝업 윗선과 세 선택 상자 윗선의 가운데 높이(2026-11-25 소장님 지시) */}
        <span className="mark" aria-hidden><span className="spk">✦<small>✦</small></span><img className="sheep" src="/newyear/2027/sheep-mini.png" alt="" width={40} height={40} /></span>
        <div className="top">
          <span className="pill"><i />새해맞이 새해운 EVENT<span className="pd">{SEASON.endShort}{left > 0 && left <= 30 ? ` · D-${left}` : ""}</span></span>

          <button type="button" className="x" aria-label="닫기" onClick={() => close("x")}>✕</button>
        </div>
        <h3>2027 정미년, <span className="gd">내 새해운 1장</span></h3>
        <div className="opts">
          {OPTIONS.map((o) => (
            <a key={o.key} className={`op${o.hot ? " hot" : ""}`} href={`/2027/${o.key}?utm=popup`} onClick={() => track("ny_pop_click", { item: o.key, season: SEASON.key })}>
              <span className="ic">{o.icon}</span><b>{o.name}</b><em>{o.price}</em>
            </a>
          ))}
        </div>
        <div className="foot">
          <button type="button" className="chk" onClick={() => close("today")}><span className="bx" aria-hidden />오늘 하루 다시 열지 않기</button>
          <a href="/2027?utm=popup" onClick={() => track("ny_pop_click", { item: "all", season: SEASON.key })}>상세본·전체 보기 ›</a>
        </div>
      </div>
    </div>
  );
}

const CSS = `
#nyc{--bg:var(--bg-navy);--sh:rgba(10,16,40,.42);
  --bg-navy:radial-gradient(70% 55% at 62% 58%,rgba(86,122,220,.55) 0%,rgba(86,122,220,0) 70%),radial-gradient(60% 40% at 15% 95%,rgba(60,96,200,.45) 0%,rgba(60,96,200,0) 70%),linear-gradient(165deg,#13204A 0%,#18285E 45%,#0E1838 100%);}
#nyc.red{--bg:radial-gradient(70% 55% at 62% 58%,rgba(255,120,100,.45) 0%,rgba(255,120,100,0) 70%),radial-gradient(60% 40% at 15% 95%,rgba(200,40,40,.5) 0%,rgba(200,40,40,0) 70%),linear-gradient(165deg,#9E1B1F 0%,#B8262A 45%,#6E0F14 100%);--sh:rgba(110,15,20,.45)}
#nyc.green{--bg:radial-gradient(70% 55% at 62% 58%,rgba(90,200,140,.4) 0%,rgba(90,200,140,0) 70%),radial-gradient(60% 40% at 15% 95%,rgba(30,140,90,.5) 0%,rgba(30,140,90,0) 70%),linear-gradient(165deg,#0F5A3C 0%,#14704A 45%,#0A3D29 100%);--sh:rgba(10,60,40,.45)}
#nyc{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(158px + env(safe-area-inset-bottom));width:calc(100% - 40px);max-width:350px;z-index:70;
  font-family:'Pretendard Variable',Pretendard,system-ui,sans-serif;word-break:keep-all;letter-spacing:-.02em;animation:nycUp .45s cubic-bezier(.2,.9,.3,1.15) both}
@keyframes nycUp{from{opacity:0;transform:translate(-50%,16px) scale(.98)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
#nyc .box{position:relative;overflow:hidden;border-radius:20px;padding:10px 11px 8px;
  background:var(--bg);
  box-shadow:0 14px 34px var(--sh),0 0 0 1px rgba(243,211,122,.3);
  animation:nycBlink .7s ease-in-out .45s 4}
/* 깜빡임(2026-11-25 강화): 금빛 테두리·후광 + 밝기 번쩍 — 처음 4번만. 눈에 확 띄게 */
@keyframes nycBlink{0%,100%{filter:brightness(1);box-shadow:0 14px 34px var(--sh),0 0 0 1px rgba(243,211,122,.3)}
  45%{filter:brightness(1.35);box-shadow:0 14px 34px var(--sh),0 0 0 3.5px #FFE17A,0 0 34px 8px rgba(255,214,100,.85)}}
@keyframes nycFade{0%,100%{opacity:1}45%{opacity:.45}}
#nyc .glow{position:absolute;left:-20%;right:-20%;top:38%;height:42%;background:linear-gradient(100deg,rgba(130,165,255,0) 0%,rgba(130,165,255,.22) 45%,rgba(160,190,255,.32) 55%,rgba(130,165,255,0) 100%);filter:blur(14px);transform:rotate(-8deg);pointer-events:none}
#nyc .top{position:relative;display:flex;align-items:center;gap:6px}
#nyc .pill{display:inline-flex;align-items:center;gap:5px;height:21px;padding:0 9px;border-radius:99px;font-size:10.5px;font-weight:900;color:#16234D;background:linear-gradient(180deg,#FFFBEA,#FBEFC4);border:1px solid #FFF6D6;box-shadow:0 2px 8px rgba(243,211,122,.35);white-space:nowrap}
#nyc .pill i{width:5px;height:5px;border-radius:50%;background:#E0A92E;box-shadow:0 0 5px rgba(224,169,46,.8);animation:nycDot .85s ease-in-out .5s 4}
#nyc .pill .pd{margin-left:2px;padding-left:6px;border-left:1px solid rgba(22,35,77,.25);font-weight:700;color:#4A5578}
@keyframes nycDot{50%{opacity:.2}}
#nyc .mark{position:absolute;right:46px;top:16px;display:flex;align-items:center;gap:2px;z-index:1;pointer-events:none}
#nyc .spk{position:relative;color:#FFE7A8;font-size:11px;line-height:1;text-shadow:0 0 6px rgba(255,220,140,.9)}
#nyc .spk small{position:absolute;left:9px;top:-7px;font-size:8px}
#nyc .sheep{width:40px;height:40px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(255,120,120,.35))}
#nyc.red .sheep{border-radius:50%;background:radial-gradient(circle,rgba(255,246,230,.95) 0%,rgba(255,236,210,.75) 48%,rgba(255,236,210,0) 70%);filter:drop-shadow(0 0 6px rgba(255,230,200,.6))}
#nyc .x{margin-left:auto;width:24px;height:24px;flex:none;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center;cursor:pointer}
#nyc h3{position:relative;margin:6px 0 0;font-size:19px;line-height:1.2;font-weight:900;color:#fff;letter-spacing:-.045em;white-space:nowrap}
#nyc h3 .gd{background:linear-gradient(180deg,#FFF1BE 0%,#F5D06A 55%,#E2B444 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
#nyc .opts{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
#nyc .op{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px 6px;border-radius:12px;background:linear-gradient(180deg,#FFFFFF,#EEF2FA);color:#16234D;text-decoration:none;box-shadow:0 4px 12px rgba(5,10,30,.25)}
#nyc .op .ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-family:'Noto Serif KR',serif;font-size:12px;font-weight:900;color:#16234D;border:1.3px solid #16234D;background:transparent}
#nyc .op b{font-size:12.5px;font-weight:900;line-height:1.15;white-space:nowrap}
#nyc .op em{font-style:normal;font-size:10.5px;font-weight:900;padding:0 8px;line-height:17px;border-radius:99px;background:#E1E7F2;color:#16234D}
#nyc .op.hot{background:linear-gradient(180deg,#FFF0B8,#F6D274 60%,#EFC352);box-shadow:0 6px 16px rgba(242,201,76,.32)}
#nyc .op.hot em{background:#16234D;color:#FFE58A}
#nyc .foot{position:relative;display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:10.5px;font-weight:700}
#nyc .foot .chk{display:inline-flex;align-items:center;gap:5px;border:0;background:none;padding:2px 0;color:#DCE4F5;font:inherit;cursor:pointer}
#nyc .foot .bx{width:11px;height:11px;border:1.3px solid #DCE4F5;border-radius:2px}
#nyc .foot a{color:#DCE4F5;text-decoration:none}
/* 움직임 줄이기 설정에서는 올라오기·밝기 효과를 빼고, 은은한 깜빡임(투명도)만 남긴다 */
@media (prefers-reduced-motion:reduce){#nyc{animation:none}#nyc .box{animation:nycFade .8s ease-in-out .45s 4}#nyc .pill i{animation:none}}
`;
