"use client";

/**
 * 2027 새해운 — 브라우저 쪽 공용 도우미 (유입 꼬리표·최근 신청 기억·API 호출).
 */
import type { OrderInput, PublicOrder } from "./types";

/** 사이트의 다른 신청서(1문 1답·상담)와 같은 방식으로 유입 꼬리표와 기기 코드를 읽는다 */
export function readTracking(): { utm: string | null; referrer: string | null; deviceCode: string | null } {
  if (typeof window === "undefined") return { utm: null, referrer: null, deviceCode: null };
  const paramUtm = new URLSearchParams(window.location.search).get("utm");
  if (paramUtm) { try { window.localStorage.setItem("sp_utm", paramUtm); } catch { /* 저장 못 해도 진행 */ } }
  let saved: string | null = null;
  try { saved = window.localStorage.getItem("sp_utm"); } catch { /* 없음 */ }
  const m = document.cookie.match(/(?:^|; )sp_device=([^;]*)/);
  return { utm: paramUtm || saved || null, referrer: document.referrer || null, deviceCode: m ? decodeURIComponent(m[1]) : null };
}

/* 가입이 없는 서비스라, 이 기기에서 신청한 건을 기억해 두었다가 다시 찾아갈 수 있게 한다 */
const RECENT_KEY = "ny2027_orders";
export interface RecentOrder { token: string; refNo: string; productKey: string; at: string }
export function recentOrders(): RecentOrder[] {
  try { return JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]") as RecentOrder[]; } catch { return []; }
}
export function rememberOrder(o: RecentOrder) {
  try {
    const list = [o, ...recentOrders().filter((x) => x.token !== o.token)].slice(0, 12);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch { /* 기억 못 해도 진행 */ }
}

type Res = { ok: boolean; error?: string; order?: PublicOrder; token?: string; refNo?: string };
async function call(url: string, init?: RequestInit): Promise<Res> {
  try {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" }, cache: "no-store" });
    const text = await res.text();
    try { return JSON.parse(text) as Res; } catch { return { ok: false, error: `서버가 제때 답하지 못했습니다(${res.status}). 잠시 뒤 다시 시도해 주세요.` }; }
  } catch {
    return { ok: false, error: "네트워크가 불안정합니다. 연결을 확인하고 다시 시도해 주세요." };
  }
}
export const apiCreate = (product: string, input: OrderInput) => call("/api/newyear/order", { method: "POST", body: JSON.stringify({ product, input, ...readTracking() }) });
export const apiGet = (token: string, count = false) => call(`/api/newyear/order/${token}${count ? "?count=1" : ""}`);
export const apiClaim = (token: string, payerName: string) => call(`/api/newyear/order/${token}`, { method: "POST", body: JSON.stringify({ action: "claim", payerName }) });
export const apiGenerate = (token: string) => call(`/api/newyear/order/${token}`, { method: "POST", body: JSON.stringify({ action: "generate" }) });
