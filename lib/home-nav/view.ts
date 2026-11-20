/**
 * 홈 바로가기·전체 메뉴 화면 모듈 — HTML·CSS (v7, 2026-11-20)
 *
 * HomeV6 는 quickBlockHtml() 을 <!--QUICK_SLOT-->, navSheetHtml() 을 <!--NAVSHEET_SLOT--> 자리에 끼워 넣기만 한다.
 * 버튼에는 data-go="nav" · data-to="<어디로>" · data-from="<어디서>" 가 붙고, 눌렀을 때의 일은 client.ts 가 한다.
 *
 * 배경: 예전 서비스 카드(.svc .sv)는 리포트 샘플 뷰어의 .sv 와 이름이 겹쳐 2026-08 말부터 화면에 보이지 않았다.
 *       이 블록이 그 자리를 잇는다 — 그래서 여기 쓰는 이름은 모두 q-(바로가기) · ns-(메뉴)로 시작한다.
 */
import { MENU, QUICK, QUICK_LINKS } from "./items";

/** {n} → 고민 주제 수. 언어를 바꿔도 수가 유지되도록 .wn 으로 감싼다 */
const wn = (s: string, n: number) => s.replace("{n}", `<var class="wn">${n}</var>`);
const di = (key?: string) => (key ? ` data-i="${key}"` : "");

/** 첫 화면 바로 아래 「여기서 할 수 있는 것」 — 6칸 + 글자 링크 */
export function quickBlockHtml(topicN: number): string {
  const tiles = QUICK.map((q) =>
    `<button class="qk${q.tag === "pay" ? " pay" : ""}" type="button" data-go="nav" data-from="quick" data-to="${q.to}">` +
    `<span class="qi">${q.icon}</span><b${di(q.key)}>${wn(q.ko, topicN)}</b>` +
    `<span class="qt ${q.tag}"${di(q.tagKey)}>${wn(q.tagKo, topicN)}</span></button>`).join("\n      ");
  const links = QUICK_LINKS.map((l) =>
    `<button type="button" data-go="nav" data-from="quick" data-to="${l.to}"${di(l.key)}>${l.ko}</button>`).join("\n      ");
  return `
  <section class="qsec" id="quick" data-sec="quick">
    <div class="sec-label">SERVICES</div>
    <h2 data-i="h2Svc">여기서 할 수 있는 것</h2>
    <p class="sec-sub qsub" data-i="qSub">가입 없이, 누르면 바로 열립니다.</p>
    <div class="quick">
      ${tiles}
    </div>
    <div class="qlinks">
      ${links}
    </div>
  </section>`;
}

/** ≡ 를 누르면 아래에서 올라오는 전체 메뉴 */
export function navSheetHtml(topicN: number): string {
  const groups = MENU.map((g) => {
    const items = g.items.map((m) =>
      `<button type="button" data-go="nav" data-from="menu" data-to="${m.to}"><i>${m.icon}</i>` +
      `<span><b${di(m.key)}>${wn(m.ko, topicN)}</b>${m.noteKo ? `<em${di(m.noteKey)}>${wn(m.noteKo, topicN)}</em>` : ""}</span></button>`).join("\n        ");
    return `<div class="ns-g"${di(g.key)}>${g.ko}</div>
      <div class="ns-list">
        ${items}
      </div>`;
  }).join("\n      ");
  return `
  <div class="navsheet" id="navsheet" aria-hidden="true">
    <div class="ns-in" role="dialog" aria-label="전체 메뉴">
      <div class="ns-top"><b data-i="nsTitle">전체 메뉴</b><button class="ns-x" id="ns-x" type="button" aria-label="닫기">×</button></div>
      ${groups}
    </div>
  </div>`;
}

export const NAV_CSS = `
/* ── 홈 바로가기 6칸 (lib/home-nav) ── */
.wn{font-style:normal}
#quick{scroll-margin-top:66px}
.qsec{padding-top:22px;padding-bottom:22px}
.qsec .qsub{margin-bottom:0}
.quick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.qk{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;padding:13px 3px 11px;
  background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 4px 12px rgba(20,50,110,.05);
  cursor:pointer;font-family:inherit;color:var(--navy);text-align:center;transition:transform .12s}
.qk:active{transform:scale(.96)}
.qk .qi{font-size:25px;line-height:1.1}
.qk b{font-size:13px;font-weight:800;letter-spacing:-.055em;line-height:1.25;word-break:keep-all;overflow-wrap:anywhere}
.qk .qt{max-width:100%;overflow:hidden;text-overflow:ellipsis;font-size:9.6px;font-weight:800;letter-spacing:-.03em;
  padding:2.5px 7px;border-radius:99px;white-space:nowrap;margin-top:auto}
.qt.free{background:#E7F6EE;color:#0F8A4C}
.qt.day{background:#FFF3DE;color:#B8792A}
.qt.week{background:#EEF0FF;color:#4653C4}
.qt.pay{background:#2563EB;color:#fff}
.qk.pay{background:linear-gradient(180deg,#EAF2FF,#fff);border-color:#BFD5F5}
.qlinks{display:flex;justify-content:center;flex-wrap:wrap;gap:2px 16px;margin-top:10px}
.qlinks button{background:none;border:0;padding:5px 0;font-family:inherit;font-size:12px;font-weight:700;
  color:#3D5F96;letter-spacing:-.03em;cursor:pointer}
@media(max-width:352px){.qk b{font-size:12px}.qk .qt{font-size:9px;padding:2px 5px}}
/* ── 전체 메뉴(≡) ── */
.burger{cursor:pointer}
.navsheet{position:fixed;inset:0;z-index:90;background:rgba(8,18,38,.5);display:none;align-items:flex-end;justify-content:center}
.navsheet.on{display:flex}
.ns-in{width:100%;max-width:430px;max-height:88vh;overflow-y:auto;background:#fff;border-radius:22px 22px 0 0;
  padding:14px 14px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -12px 40px rgba(8,18,38,.3)}
.ns-top{display:flex;align-items:center;justify-content:space-between;padding:0 4px 6px}
.ns-top b{font-size:16px;font-weight:800;color:var(--navy);letter-spacing:-.04em}
.ns-x{width:34px;height:34px;border:0;border-radius:50%;background:#EEF3FB;color:var(--navy);font-size:20px;line-height:1;cursor:pointer}
.ns-g{margin:10px 4px 6px;font-size:11px;font-weight:800;letter-spacing:.02em;color:var(--blue)}
.ns-list{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ns-list button{display:flex;align-items:center;gap:8px;min-width:0;padding:11px 10px;background:#F7FAFF;
  border:1px solid var(--line);border-radius:13px;cursor:pointer;font-family:inherit;text-align:left;color:var(--navy)}
.ns-list button > i{font-style:normal;font-size:19px;line-height:1}
.ns-list button > span{display:flex;flex-direction:column;gap:1px;min-width:0}
.ns-list button b{font-size:13.2px;font-weight:800;letter-spacing:-.05em;line-height:1.25;word-break:keep-all;overflow-wrap:anywhere}
.ns-list button em{font-style:normal;font-size:10.5px;font-weight:600;color:var(--gray);letter-spacing:-.03em;line-height:1.3}
`;
