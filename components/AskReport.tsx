"use client";

import { forwardRef } from "react";
import type { AskAnswer, AskModule } from "@/lib/ask-report";

/**
 * 무료 1문 1답 · 1매 리포트 — 그리기 전담 (2026-10-04)
 *
 * 540px 폭 고정(PNG는 2배 = 1080px). 관리자 미리보기와 PNG 내보내기가 같은 컴포넌트를 쓴다.
 * 디자인 기준은 캔버스 시안 v3: 결론 먼저 · 섹션별 행동 제목 · 고정 요소 중앙 정렬 ·
 * 남색 #1E2A55 / 파랑 #2F5BEA / 금색 #F2C94C / 바탕 #EEF3FB.
 * 스타일은 인라인으로 둔다 — PNG로 구울 때 외부 CSS 누락이 없게 하기 위해서다.
 */

const NAVY = "#1E2A55", BLUE = "#2F5BEA", GOLD = "#F2C94C", BG = "#EEF3FB", INK = "#1B2140", GRAY = "#5B6480", BODY = "#3B4256";
const CARD: React.CSSProperties = { background: "#fff", borderRadius: 18, boxShadow: "0 4px 16px rgba(30,42,85,.06)" };

function SHead({ label, action, color = BLUE }: { label: string; action: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color, letterSpacing: 1.5 }}>{label}</div>
      <div style={{ margin: "6px auto 0", fontSize: 17, fontWeight: 900, color: NAVY, lineHeight: 1.4, letterSpacing: -0.4, maxWidth: 440 }}>{action || " "}</div>
      <div style={{ width: 28, height: 3, background: GOLD, borderRadius: 2, margin: "10px auto 0" }} />
    </div>
  );
}

function Cell({ bg, border, lab, sub, txt }: { bg: string; border: string; lab: string; sub: string; txt: string }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: NAVY, textAlign: "center" }}>{lab} <span style={{ fontWeight: 600, color: GRAY, fontSize: 12 }}>{sub}</span></div>
      <div style={{ fontSize: 14.5, lineHeight: 1.5, color: INK, whiteSpace: "pre-wrap" }}>{txt}</div>
    </div>
  );
}

function Dark({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, padding: "13px 15px", background: NAVY, borderRadius: 12, color: "#fff", fontSize: 15, lineHeight: 1.55, textAlign: "center" }}>
      <b style={{ color: GOLD }}>{k} ·</b> {children}
    </div>
  );
}
function HowTo({ t }: { t: string }) {
  return <div style={{ marginTop: 12, fontSize: 14, color: "#4C5570", lineHeight: 1.55 }}><b style={{ color: NAVY }}>읽는 법 ·</b> {t}</div>;
}

function WhyRow({ n, bg, fg, lab, txt, last }: { n: number; bg: string; fg: string; lab: string; txt: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 34px" }}>
        <span style={{ width: 34, height: 34, borderRadius: "50%", background: bg, color: fg, fontSize: 12.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>왜{n}</span>
        {!last && <span style={{ width: 2, flex: 1, minHeight: 18, background: "#C9D2EA", margin: "4px 0" }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: GRAY }}>{lab}</div>
        <div style={{ fontSize: 15, lineHeight: 1.55, color: INK, marginTop: 3, whiteSpace: "pre-wrap" }}>{txt}</div>
      </div>
    </div>
  );
}

function Module({ a, module }: { a: AskAnswer; module: AskModule }) {
  if (module === "none") return null;
  const tag = module === "swot" ? "SWOT" : module === "whys" ? "3 Whys" : "타임라인 · PDCA";
  return (
    <div className="rpt-card" style={{ ...CARD, padding: "20px 22px 20px" }}>
      <SHead label={`근거 2 · 분석 틀 ${tag}`} action={a.mod_action} color={GRAY} />
      {module === "swot" && (
        <>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
            <Cell bg="#fff" border={BLUE} lab="S 강점" sub="사주·안" txt={a.swot.s} />
            <Cell bg="#F4F6FA" border="#DCE4EE" lab="W 약점" sub="사주·안" txt={a.swot.w} />
            <Cell bg={BG} border="#C9D7F3" lab="O 기회" sub="흐름·밖" txt={a.swot.o} />
            <Cell bg="#F4F6FA" border="#DCE4EE" lab="T 위협" sub="흐름·밖" txt={a.swot.t} />
          </div>
          <Dark k="S×O 전략">{a.swot.strategy}</Dark>
          <HowTo t="위 두 칸(S·W)은 사주에서, 아래 두 칸(O·T)은 올해 흐름에서 읽었습니다. 강점이 기회를 만나는 칸이 전략입니다." />
        </>
      )}
      {module === "whys" && (
        <>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
            <WhyRow n={1} bg={BG} fg={BLUE} lab="표면의 고민" txt={a.whys.w1} />
            <WhyRow n={2} bg="#DCE7FA" fg={NAVY} lab="반복되는 행동" txt={a.whys.w2} />
            <WhyRow n={3} bg={NAVY} fg={GOLD} lab="명식의 뿌리" txt={a.whys.w3} last />
          </div>
          <Dark k="진짜 원인">{a.whys.root}</Dark>
          <HowTo t='"왜?"를 세 번 물어 명식에 닿을 때까지 내려갑니다. 세 번째 답이 바뀌지 않으면 그게 뿌리입니다.' />
        </>
      )}
      {module === "timeline" && (
        <>
          <div style={{ marginTop: 22, position: "relative", height: 84 }}>
            <div style={{ position: "absolute", left: 14, right: 14, top: 16, height: 12, borderRadius: 999, background: "linear-gradient(90deg,#C9D2EA 0%,#2F5BEA 55%,#1E2A55 100%)" }} />
            {[["0", "#E8542E"], ["calc(50% - 18px)", BLUE], ["auto", NAVY]].map(([left, c], i) => (
              <div key={i} style={{ position: "absolute", left: i === 2 ? undefined : left, right: i === 2 ? 0 : undefined, top: 4, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: `5px solid ${c}`, boxSizing: "border-box" }} />
            ))}
            <div style={{ position: "absolute", left: 0, top: 48, width: 150, fontSize: 13, lineHeight: 1.4 }}><b style={{ color: "#E8542E" }}>{a.timeline.t1}</b><br /><span style={{ color: "#4C5570" }}>{a.timeline.t1s}</span></div>
            <div style={{ position: "absolute", left: "calc(50% - 75px)", top: 48, width: 150, textAlign: "center", fontSize: 13, lineHeight: 1.4 }}><b style={{ color: BLUE }}>{a.timeline.t2}</b><br /><span style={{ color: "#4C5570" }}>{a.timeline.t2s}</span></div>
            <div style={{ position: "absolute", right: 0, top: 48, width: 150, textAlign: "right", fontSize: 13, lineHeight: 1.4 }}><b style={{ color: NAVY }}>{a.timeline.t3}</b><br /><span style={{ color: "#4C5570" }}>{a.timeline.t3s}</span></div>
          </div>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            {(["P", "D", "C", "A"] as const).map((s) => {
              const on = a.timeline.stage === s;
              const lab = { P: "계획", D: "실행", C: "점검", A: "조정" }[s];
              return (
                <div key={s} style={{ background: on ? NAVY : "#F4F6FA", color: on ? "#fff" : GRAY, border: on ? "none" : "1.5px solid #DCE4EE", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{s}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{lab}</div>
                </div>
              );
            })}
          </div>
          <Dark k="지금 단계">{a.timeline.stage_note}</Dark>
          <HowTo t="굵은 선이 흐름, 동그라미가 시점입니다. 아래 P·D·C·A 중 색이 칠해진 칸이 지금 할 일입니다." />
        </>
      )}
    </div>
  );
}

export interface AskReportProps {
  refNo: string;
  date: string;          // "2026. 10. 6"
  name: string;          // 고객 표시 이름 (예: 김○○)
  question: string;
  module: AskModule;
  a: AskAnswer;
  photoSrc?: string;     // 기본 /img/choi-profile.jpg
  className?: string;
}

/** ref 는 PNG 내보내기용 — 이 노드를 그대로 그림으로 굽는다 */
const AskReport = forwardRef<HTMLDivElement, AskReportProps>(function AskReport({ refNo, date, name, question, module, a, photoSrc = "/img/choi-profile.jpg", className }, ref) {
  const ActionRow = ({ tag, bg, txt }: { tag: string; bg: string; txt: string }) => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ flex: "0 0 auto", minWidth: 62, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: "#fff", background: bg, padding: "6px 10px", borderRadius: 999 }}>{tag}</span>
      <span style={{ fontSize: 16, lineHeight: 1.55, color: INK, paddingTop: 3, whiteSpace: "pre-wrap" }}>{txt}</span>
    </div>
  );
  return (
    <div ref={ref} className={className} style={{ width: 540, boxSizing: "border-box", background: BG, fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Noto Sans KR', sans-serif", color: INK, position: "relative", overflow: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "#DCE7FA", left: -100, top: 420 }} />
      <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "#E3ECFA", right: -80, top: 1500 }} />

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", background: NAVY, color: "#fff" }}>
        <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.3 }}>AI사주랩<span style={{ color: GOLD }}>.com</span><span style={{ fontSize: 12.5, fontWeight: 500, color: "#B9C4E6", marginLeft: 8 }}>무료 1문 1답</span></div>
        <div style={{ fontSize: 12, color: "#C9D2EA", textAlign: "right", lineHeight: 1.45 }}>접수 {refNo}<br />{date}</div>
      </div>

      <div style={{ position: "relative", padding: "22px 24px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="rpt-card" style={{ ...CARD, padding: "22px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: BLUE, letterSpacing: 1.5 }}>{name}님의 질문</div>
          <div style={{ margin: "10px auto 0", fontSize: 23, fontWeight: 900, lineHeight: 1.42, letterSpacing: -0.5, maxWidth: 460, whiteSpace: "pre-wrap" }}>“{question}”</div>
        </div>

        <div className="rpt-card" style={{ background: NAVY, borderRadius: 18, padding: "22px 24px 20px", color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: GOLD, letterSpacing: 1.5 }}>결론부터</div>
          <div style={{ margin: "10px auto 0", fontSize: 19, fontWeight: 900, lineHeight: 1.45, letterSpacing: -0.4, maxWidth: 460, whiteSpace: "pre-wrap" }}>{a.one}</div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {(["판단", "시기", "첫 행동"] as const).map((k, i) => (
              <div key={k} style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#C9D2EA" }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 3, lineHeight: 1.35 }}>{a.chips[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rpt-card" style={{ ...CARD, padding: "20px 22px 20px" }}>
          <SHead label="근거 1 · 명식" action={a.m_action} color={GRAY} />
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {[["나의 일간", a.ilgan, a.ilgan_sub, a.ilgan_desc], ["올해·내년 흐름", a.seun, a.seun_sub, a.seun_desc]].map(([h, big, sub, desc]) => (
              <div key={h} style={{ background: BG, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: GRAY }}>{h}</div>
                <div style={{ marginTop: 4, fontSize: 26, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{big}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: BLUE, marginTop: 3 }}>{sub}</div>
                <div style={{ fontSize: 14, color: BODY, marginTop: 6, lineHeight: 1.5, textAlign: "left", whiteSpace: "pre-wrap" }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "12px 14px", borderLeft: `3px solid ${BLUE}`, background: "#F7F9FD", borderRadius: "0 12px 12px 0", fontSize: 15.5, lineHeight: 1.6, color: INK, whiteSpace: "pre-wrap" }}><b>이 질문에 명식이 말하는 것 ·</b> {a.read}</div>
        </div>

        <Module a={a} module={module} />

        <div className="rpt-card" style={{ ...CARD, padding: "20px 22px 22px" }}>
          <SHead label="판단 · 소장의 답" action="세 줄로 정리하면 이렇습니다" />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {a.ans.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ flex: "0 0 28px", height: 28, borderRadius: "50%", background: GOLD, color: NAVY, fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 17, lineHeight: 1.6, fontWeight: 500, whiteSpace: "pre-wrap" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rpt-card" style={{ ...CARD, padding: "20px 22px 20px" }}>
          <SHead label="시기" action={a.t_action} color={GRAY} />
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <div style={{ border: `1.5px solid ${BLUE}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: BLUE, textAlign: "center" }}>움직이기 좋은 때</div>
              <div style={{ fontSize: 15, lineHeight: 1.55, color: INK, marginTop: 8, whiteSpace: "pre-wrap" }}>{a.good}</div>
            </div>
            <div style={{ border: "1.5px solid #DCE4EE", borderRadius: 14, padding: "14px 16px", background: "#F7F9FD" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: GRAY, textAlign: "center" }}>서두르지 않을 때</div>
              <div style={{ fontSize: 15, lineHeight: 1.55, color: INK, marginTop: 8, whiteSpace: "pre-wrap" }}>{a.avoid}</div>
            </div>
          </div>
        </div>

        <div className="rpt-card" style={{ ...CARD, padding: "20px 22px 20px" }}>
          <SHead label="실행" action={a.a_action} color={GRAY} />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <ActionRow tag="오늘" bg="#E8542E" txt={a.today} />
            <ActionRow tag="이번 주" bg={BLUE} txt={a.week} />
            <ActionRow tag="이번 달" bg={NAVY} txt={a.month} />
          </div>
          {a.stop && <div style={{ marginTop: 14, padding: "12px 14px", background: "#F7F9FD", borderRadius: 12, fontSize: 14.5, lineHeight: 1.55, color: BODY, whiteSpace: "pre-wrap" }}><b style={{ color: NAVY }}>이럴 땐 멈추세요 ·</b> {a.stop}</div>}
        </div>
      </div>

      <div className="rpt-card rpt-foot" style={{ position: "relative", marginTop: 22, padding: "22px 28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderTop: "1px solid #DCE4EE", background: "#fff", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc} alt="최형철 소장" width={56} height={56} crossOrigin="anonymous" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${GOLD}` }} />
        <div style={{ fontSize: 15, fontWeight: 800 }}>최형철 · 사주보는 경영지도사</div>
        <div style={{ fontSize: 12, color: GRAY, lineHeight: 1.4 }}>명리에 기반한 참고 의견이며 결과를 보장하지 않습니다</div>
        <a href="/consult?mode=simple&item=reportOnly&utm=report_foot" style={{ marginTop: 6, padding: "10px 18px", borderRadius: 999, background: BG, fontSize: 13, color: NAVY, lineHeight: 1.4, textDecoration: "none", display: "inline-block" }}>더 깊이 보려면 <b style={{ color: BLUE }}>1문 1답 9,900원 · 개인종합 20장</b> · aisajulab.com ›</a>
      </div>
    </div>
  );
});

export default AskReport;
