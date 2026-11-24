/**
 * 2027 새해운 — 주문 데이터 모델과 상태.
 *
 * 주문 한 건의 흐름
 *   무료 카드   : queued → generating → ready
 *   990원 카드  : awaiting_payment → (입금 완료 신고) queued → generating → ready     ※ 입금은 나중에 대조
 *   상세본      : awaiting_payment → (입금 확인) queued → generating(초안) → review(감수) → ready(승인·전달)
 *   어디서든    : failed(다시 시도 가능) / cancelled
 */
import { teaserOf, type Teaser } from "./teaser";
import type { ProductKey } from "./catalog";
import type { FieldValues } from "./render/spec";

export type OrderStatus = "awaiting_payment" | "queued" | "generating" | "failed" | "review" | "ready" | "cancelled";
export type PaymentStatus = "none" | "pending" | "claimed" | "confirmed" | "rejected" | "refunded";

/** 고객이 신청서에 적는 값 */
export interface OrderInput {
  name?: string;
  contact?: string;
  gender?: "male" | "female";
  birth?: { year: number; month: number; day: number; isLunar: boolean; isLeapMonth: boolean };
  time?: { hour: number; minute: number } | null;     // null = 모름
  place?: string;
  longitude?: number | null;
  category?: string;
  question?: string;
  lines?: number[];                                    // 주역: 여섯 번 던진 값(6·7·8·9)
  concern?: string;
}

export interface OrderRow {
  id: string;
  created_at: string;
  updated_at: string;
  ref_no: string;
  share_token: string;
  product_key: ProductKey;
  target_year: number;
  price: number;
  name: string | null;
  contact: string | null;
  payer_name: string | null;
  input: OrderInput;
  computed: Record<string, unknown> | null;
  content: FieldValues | null;
  content_source: string | null;
  template_version: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  paid_claimed_at: string | null;
  paid_confirmed_at: string | null;
  gen_started_at: string | null;
  gen_attempts: number;
  gen_error: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  delivered_at: string | null;
  viewed_at: string | null;
  view_count: number;
  utm: string | null;
  referrer: string | null;
  device_code: string | null;
}

/** 고객 화면에 내려 주는 모습 — 결과(content)는 열람할 수 있을 때만 들어 있다 */
export interface PublicOrder {
  refNo: string;
  token: string;
  productKey: ProductKey;
  price: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  name: string | null;
  createdAt: string;
  templateVersion: string | null;
  content: FieldValues | null;
  genError: string | null;
  /** 결제 전 미리보기 — 엔진 계산값 한 줄(해석 아님) */
  teaser: Teaser | null;
}

export function toPublic(o: OrderRow): PublicOrder {
  const visible = o.status === "ready" && o.payment_status !== "rejected" && o.payment_status !== "refunded";
  return {
    refNo: o.ref_no, token: o.share_token, productKey: o.product_key, price: o.price, status: o.status, paymentStatus: o.payment_status,
    name: o.name, createdAt: o.created_at, templateVersion: o.template_version, content: visible ? o.content : null, genError: o.status === "failed" ? o.gen_error : null,
    teaser: o.status === "cancelled" ? null : teaserOf(o.product_key, o.computed as Record<string, unknown> | null),
  };
}
