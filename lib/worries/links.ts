/**
 * 고민 랜딩 → 다음 단계 링크 만들기 + 계측 (브라우저 전용)
 *
 * 들어온 채널(utm=insta·daangn·kakao·blog …)을 잊지 않고 다음 단계까지 들고 간다.
 *   /q/quit?utm=insta  →  /ask?utm=q_quit_insta&topic=quit&q=…
 * 그래서 관리자 /admin/ask 에서 "어느 고민 페이지, 어느 채널"에서 온 신청인지 바로 보인다.
 */

const SB_URL = "https://urazdkvkanjnquqhnrvo.supabase.co";
const SB_KEY = "sb_publishable_fSG-HqZrC9GVTT5FOprPnA_sDiFoiD2";

/** 이 페이지로 들어온 채널. 없으면 이전에 저장된 값, 그것도 없으면 direct */
export function inboundChannel(): string {
  try {
    const qs = new URLSearchParams(window.location.search);
    const now = qs.get("utm") || qs.get("utm_source");
    if (now) return now.replace(/[^a-z0-9_-]/gi, "").slice(0, 20) || "direct";
    const saved = JSON.parse(window.localStorage.getItem("aisaju_utm") || "{}");
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
    const ss = window.sessionStorage, ls = window.localStorage;
    let sid = ss.getItem("aisaju_sid"); if (!sid) { sid = rid(); ss.setItem("aisaju_sid", sid); }
    let vid = ls.getItem("aisaju_vid"); if (!vid) { vid = rid(); ls.setItem("aisaju_vid", vid); }
    const q = new URLSearchParams(window.location.search);
    const now: Record<string, string> = {};
    ["utm", "utm_source", "utm_medium", "utm_campaign"].forEach((k) => { const v = q.get(k); if (v) now[k] = v; });
    if (Object.keys(now).length) ls.setItem("aisaju_utm", JSON.stringify(now));
    let u: Record<string, string> = {}; try { u = JSON.parse(ls.getItem("aisaju_utm") || "{}"); } catch {}
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
