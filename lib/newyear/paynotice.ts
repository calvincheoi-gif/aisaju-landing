/**
 * 2027 새해운 — 송금 알림 자동 대조 (2026-11-26 소장님 결정: 실시간 수동 확인이 어려우니 자동으로).
 *
 * 카카오페이 개인 송금(QR 링크)은 사이트가 직접 조회할 길이 없다. 그래서 소장님 폰에 오는
 * 「○○○님이 990원을 보냈어요」 같은 알림을, 폰의 알림 전달 앱(MacroDroid 등)이 이 사이트로 넘겨 준다.
 *   알림 글  →  금액 + 보낸 사람 이름  →  「입금 완료」를 누른 주문(같은 금액·같은 이름)과 맞으면  →  입금 확인 + 결과 생성
 *
 * 원칙: 확실할 때만 자동 확인한다.
 *  · 금액이 상품 가격과 같고, 고객이 적은 입금자명이 알림 속 이름과 맞을 때만(가운데 * 가린 이름도 맞춰 본다).
 *  · 같은 조건이 여러 건이면 먼저 「입금 완료」를 누른 주문 하나만.
 *  · 못 맞춘 알림은 남겨 두었다가, 나중에 「입금 완료」가 들어오면 다시 맞춘다(알림이 먼저 오는 경우).
 *  · 그래도 안 맞으면 관리자 화면에서 손으로 확인 — 아무 것도 잃지 않는다.
 */
import { createHash } from "crypto";
import type { OrderRow } from "./types";

/** 알림 글에서 금액(원) — "990원", "1,990원", "990 원" */
export function parseAmount(text: string): number | null {
  const m = text.replace(/\s+/g, " ").match(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

const norm = (s: string) => s.replace(/[\s·.()\-_]/g, "").toLowerCase();

/** 고객이 적은 입금자명이 알림 글 속 이름과 맞는가 — 그대로 들어 있거나, 「홍*동」처럼 가린 이름과 맞으면 true */
export function nameMatches(payer: string | null, text: string): boolean {
  const p = norm(payer ?? "");
  if (p.length < 2) return false;
  const t = norm(text);
  if (t.includes(p)) return true;
  /* 가린 이름(홍*동): 알림 글에서 입금자명 길이만큼 잘라 가며 * 자리는 아무 글자로 보고 맞춰 본다. 가리지 않은 글자가 2자 이상 맞아야 한다 */
  for (let i = 0; i + p.length <= t.length; i++) {
    const w = t.slice(i, i + p.length);
    if (!w.includes("*")) continue;
    let same = 0, ok = true;
    for (let j = 0; j < p.length; j++) { if (w[j] === "*") continue; if (w[j] !== p[j]) { ok = false; break; } same++; }
    if (ok && same >= Math.min(2, p.length - 1)) return true;
  }
  return false;
}

/** 알림 한 건의 고유 열쇠 — 같은 알림이 두 번 넘어와도 한 번만 처리 */
export function noticeKey(text: string, at?: string): string {
  return "pn_" + createHash("sha256").update(`${at ?? ""}|${text}`).digest("hex").slice(0, 24);
}

/** 알림 하나에 맞는 주문 — 금액 일치 + 이름 일치, 먼저 신고한 순 */
export function pickOrder(amount: number, text: string, candidates: OrderRow[]): OrderRow | null {
  return candidates.find((o) => o.price === amount && nameMatches(o.payer_name, text)) ?? null;
}
