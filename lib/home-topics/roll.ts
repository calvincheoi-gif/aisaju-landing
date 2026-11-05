import { TOPIC_WINDOW } from "./types";

/**
 * 홈 고민 주제 롤링 — 노출 순서 규칙 (v3, 2026-11-05)
 *
 * 홈은 CDN 에 5분 캐시되므로 "방문마다 다른 조합"은 서버가 아니라 브라우저에서 만든다.
 * 아래 함수 본문은 문자열 하나로 두고 두 곳에서 같은 코드를 쓴다.
 *   ① 서버 HTML 에 <script> 로 박아 첫 그림이 그려지기 전에 순서를 정한다(깜빡임 없음)
 *   ② 사이트 안에서 홈으로 돌아올 때(스크립트가 다시 돌지 않는 경우) HomeV6 가 같은 본문을 new Function 으로 한 번 돈다
 *
 * 규칙 (li 의 data-g / data-tone / data-w / data-slot 을 읽는다)
 *   1. 가중 무작위: weight × 시간대(맞으면 ×2.2, 다른 시간대면 ×0.5, any 는 ×1)
 *   2. 같은 축(data-g)은 연달아 나오지 않는다
 *   3. heavy 톤은 한 창(W줄) 안에 최대 1줄 — 이혼·이별·갈등이 한 화면에 몰리지 않게
 *   4. 끝에 앞 W줄을 복제해 붙여 끊김 없이 순환
 *   규칙을 다 못 지키면 2 → 3 순으로 느슨하게 푼다(주제가 적을 때).
 */
export const ROLL_BODY = `
var ul = box && box.querySelector("ul"); if (!ul || box.dataset.ready === "1") return;
var W = parseInt(box.dataset.win || "${TOPIC_WINDOW}", 10) || ${TOPIC_WINDOW};
var items = Array.prototype.slice.call(ul.children).filter(function (li) { return !li.getAttribute("data-clone"); });
var n = items.length;
box.dataset.n = String(n); box.dataset.ready = "1";
if (n <= W) { box.dataset.roll = "0"; return; }
var h = new Date().getHours(), slot = h < 6 ? "night" : h < 12 ? "am" : h < 18 ? "pm" : "night";
function w(li) { var b = parseInt(li.getAttribute("data-w") || "1", 10) || 1, s = li.getAttribute("data-slot") || "any"; return b * (s === "any" ? 1 : s === slot ? 2.2 : 0.5); }
function g(li) { return li.getAttribute("data-g") || ""; }
function heavy(li) { return li.getAttribute("data-tone") === "heavy"; }
var out = [], rest = items.slice();
function okGroup(li) { var p = out[out.length - 1]; return !(p && g(p) && g(p) === g(li)); }
function okTone(li) { if (!heavy(li)) return true; for (var k = Math.max(0, out.length - (W - 1)); k < out.length; k++) if (heavy(out[k])) return false; return true; }
function pick(c) { var t = 0, i; for (i = 0; i < c.length; i++) t += w(c[i]); var r = Math.random() * t; for (i = 0; i < c.length; i++) { r -= w(c[i]); if (r <= 0) return c[i]; } return c[c.length - 1]; }
while (rest.length) {
  var c = rest.filter(function (li) { return okGroup(li) && okTone(li); });
  if (!c.length) c = rest.filter(okTone);
  if (!c.length) c = rest.filter(okGroup);
  if (!c.length) c = rest;
  var p = pick(c); out.push(p); rest.splice(rest.indexOf(p), 1);
}
/* 순환 이음새: 마지막 줄과 첫 줄이 같은 축이면 첫 줄을 다른 축의 줄과 바꾼다 */
if (g(out[0]) && g(out[0]) === g(out[n - 1])) { for (var j = 1; j < n - 1; j++) { if (g(out[j]) !== g(out[n - 1]) && g(out[j]) !== g(out[1])) { var tmp = out[0]; out[0] = out[j]; out[j] = tmp; break; } } }
var frag = document.createDocumentFragment();
out.forEach(function (li) { frag.appendChild(li); });
out.slice(0, W).forEach(function (li) { var cl = li.cloneNode(true); cl.setAttribute("data-clone", "1"); cl.setAttribute("aria-hidden", "true"); frag.appendChild(cl); });
ul.innerHTML = ""; ul.appendChild(frag); ul.style.transform = "translateY(0)";
box.dataset.roll = "1";
`;

/** 서버 HTML 에 넣을 인라인 스크립트 — 롤링 블록 바로 뒤에 둔다 */
export function rollScriptTag(boxId = "topics"): string {
  return `<script>(function(box){${ROLL_BODY}})(document.getElementById(${JSON.stringify(boxId)}))</script>`;
}
