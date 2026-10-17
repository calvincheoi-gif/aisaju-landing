/**
 * 고민 랜딩 → 다음 단계 링크 만들기 + 계측 (브라우저 전용)
 *
 * 들어온 채널(utm=insta·daangn·kakao·blog …)을 잊지 않고 다음 단계까지 들고 간다.
 *   /q/quit?utm=insta  →  /ask?utm=q_quit_insta&topic=quit&q=…
 * 그래서 관리자 /admin/ask 에서 "어느 고민 페이지, 어느 채널"에서 온 신청인지 바로 보인다.
 */

const SB_URL = "https://urazdkvkanjnquqhnrvo.supabase.co";
const SB_KEY = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";

/* 홈(HomeV6)·오행 앱(track.js)과 같은 규칙을 쓴다 (2026-10-17)
   · /?notrack=1 을 연 기기는 집계에서 뺀다
   · 채널 꼬리표는 30일이 지나면 버린다 — 끝난 이벤트 꼬리표가 몇 달씩 따라붙던 문제 */
const UTM_TTL = 30 * 24 * 3600 * 1000;

function isNoTrack(): boolean {
  try {
    const ls = window.localStorage;
    const v = new URLSearchParams(window.location.search).get("notrack");
    if (v === "1") ls.setItem("aisaju_notrack", "1");
    if (v === "0") ls.removeItem("aisaju_notrack");
    return ls.getItem("aisaju_notrack") === "1";
  } catch { return false; }
}

/** 저장된 채널 꼬리표 — 30일이 지났으면 버린다 */
function readUtm(): Record<string, string> {
  try {
    const ls = window.localStorage;
    const saved = JSON.parse(ls.getItem("aisaju_utm") || "{}");
    if (saved && saved.t && Date.now() - Number(saved.t) < UTM_TTL) return saved;
    ls.removeItem("aisaju_utm");
  } catch {}
  return {};
}

/** 이 페이지로 들어온 채널. 없으면 30일 안에 저장된 값, 그것도 없으면 direct */
export function inboundChannel(): string {
  try {
    const qs = new URLSearchParams(window.location.search);
    const now = qs.get("utm") || qs.get("utm_source");
    if (now) return now.replace(/[^a-z0-9_-]/gi, "").slice(0, 20) || "direct";
    const saved = readUtm();
    if (saved.utm) return String(saved.utm).replace(/[^a-z0-9_-]/gi, "").slice(0, 20);
  } catch {}
  return "direct";
}

/** 무료 1문 1답으로 — 질문 미리 채움 */
export function askHref(slug: string, prefill: string): string {
  const p = new URLSearchParams({ utm: `q_${slug}_${inboundChannel()}`, topic: slug, q: prefill });
  return `/ask?${p.toString()}`;
}

/** 1분 오행 진단으로 */
export function ohaengHref(slug: string): string {
  return `/ohaeng/?utm=q_${slug}_${inboundChannel()}`;
}

function rid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

/** 홈(HomeV6)의 track() 과 같은 events 테이블·같은 세션 키를 쓴다 */
export function track(name: string, props: Record<string, unknown> = {}) {
  try {
    if (/bot|crawl|spider|preview/i.test(navigator.userAgent)) return;
    if (isNoTrack()) return;
    const ss = window.sessionStorage, ls = window.localStorage;
    let sid = ss.getItem("aisaju_sid"); if (!sid) { sid = rid(); ss.setItem("aisaju_sid", sid); }
    let vid = ls.getItem("aisaju_vid"); if (!vid) { vid = rid(); ls.setItem("aisaju_vid", vid); }
    const q = new URLSearchParams(window.location.search);
    const now: Record<string, string> = {};
    ["utm", "utm_source", "utm_medium", "utm_campaign"].forEach((k) => { const v = q.get(k); if (v) now[k] = v; });
    if (Object.keys(now).length) { now.t = String(Date.now()); ls.setItem("aisaju_utm", JSON.stringify(now)); }
    const u = readUtm();
    const w = window.innerWidth;
    fetch(SB_URL + "/rest/v1/events", {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id: sid, visitor_id: vid, name, step: null, props,
        utm: u.utm || null, utm_source: u.utm_source || null, utm_medium: u.utm_medium || null, utm_campaign: u.utm_campaign || null,
        referrer: document.referrer || null, path: window.location.pathname,
        device: w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop", lang: "ko",
      }),
    }).catch(() => {});
  } catch {}
}
