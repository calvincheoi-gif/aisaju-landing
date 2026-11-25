/**
 * 2027 새해운 — 주문 상태를 고객이 읽는 말로 바꾼다.
 * 「생성 대기 · 실패 · 검수 대기 · 전달 완료」를 고객이 구분할 수 있어야 한다(인수인계 6-1 ⑦).
 */
import { siteConfig } from "@/lib/site-config";
import type { Product } from "./catalog";
import type { OrderStatus, PaymentStatus } from "./types";

export interface StatusView {
  step: number;                    // 진행 표시줄에서 몇 번째 단계인가 (1부터)
  steps: string[];
  title: string;
  desc: string;
  tone: "wait" | "work" | "done" | "warn";
  /** 화면이 스스로 다시 확인할 간격(초). 0 이면 확인하지 않는다 */
  poll: number;
}

export function statusView(p: Product, status: OrderStatus, pay: PaymentStatus): StatusView {
  const lead = siteConfig.payment.leadTimeDays;
  const steps = p.pay === "free" ? ["신청", "생성", "완료"] : p.review ? ["신청", "입금 확인", "초안·감수", "전달"] : ["신청", "입금", "생성", "완료"];
  const last = steps.length;
  if (status === "cancelled" || pay === "rejected" || pay === "refunded")
    return { step: 1, steps, tone: "warn", poll: 0, title: "취소된 신청입니다", desc: "입금이 확인되지 않았거나 취소·환불 처리된 건입니다. 문의는 카카오톡 채널로 부탁드립니다." };
  if (status === "awaiting_payment") {
    if (pay === "claimed")
      return p.review
        ? { step: 2, steps, tone: "wait", poll: 60, title: "입금을 확인하고 있습니다", desc: `입금이 확인되면 초안 작성과 감수를 시작합니다. 보통 영업일 ${lead}일 안에 전달드립니다.` }
        /* 한 장 상품: 입금 확인 뒤 생성(2026-11-26~). 확인 즉시 서버가 만들어 두므로 이 주소로 다시 오면 된다 */
        : { step: 2, steps, tone: "wait", poll: 30, title: "입금을 확인하고 있습니다", desc: "입금이 확인되면 바로 만들어 드립니다(보통 1~2시간, 밤에는 다음 날 아침). 이 화면을 닫아도 괜찮아요 — 이 주소로 다시 들어오시면 결과를 받을 수 있습니다." };
    return { step: 2, steps, tone: "wait", poll: 0, title: "입금을 기다리고 있습니다", desc: "아래 안내대로 송금하신 뒤 「입금\u00A0완료」 버튼을 눌러 주세요." };
  }
  if (status === "queued" || status === "generating") {
    if (p.review) return { step: 3, steps, tone: "work", poll: 60, title: "초안을 만들고 있습니다", desc: `입금이 확인되었습니다. 초안 작성 뒤 소장 감수를 거쳐 전달드립니다(영업일 ${lead}일 이내).` };
    return { step: last - 1, steps, tone: "work", poll: 3, title: "결과를 만들고 있습니다", desc: "보통 30초 안에 끝납니다. 이 화면을 그대로 두세요." };
  }
  if (status === "failed")
    return { step: last - 1, steps, tone: "warn", poll: 0, title: "결과를 만들지 못했습니다", desc: "잠시 뒤 「다시\u00A0시도」 버튼을 눌러 주세요. 계속 안 되면 접수번호와 함께 카카오톡 채널로 알려 주세요. 추가 결제는 필요하지 않습니다." };
  if (status === "review")
    return { step: 3, steps, tone: "work", poll: 120, title: "최형철 소장이 감수하고 있습니다", desc: `초안이 완성되어 감수 중입니다. 승인되면 이 주소에서 바로 열립니다(영업일 ${lead}일 이내).` };
  return { step: last, steps, tone: "done", poll: 0, title: "결과가 준비되었습니다", desc: "아래에서 확인하고 이미지·PDF로 저장하세요. 이 주소로 다시 들어오면 언제든 다시 받을 수 있습니다." };
}

export const ADMIN_STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "입금 대기", queued: "생성 대기", generating: "생성 중", failed: "생성 실패", review: "감수 대기", ready: "전달 가능", cancelled: "취소",
};
export const ADMIN_PAY_LABEL: Record<PaymentStatus, string> = {
  none: "무료", pending: "미입금", claimed: "입금 신고", confirmed: "입금 확인", rejected: "미입금 처리", refunded: "환불",
};
