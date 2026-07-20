/**
 * 상담 신청 가격 로직 (임시 하드코딩 버전).
 *
 * 실제 서비스 단계에서는 이 값들을 Supabase의 `pricing` / `membership_tiers`
 * 테이블에서 불러와 관리자가 자유롭게 수정할 수 있도록 전환할 예정입니다.
 * (설계 문서 "AI사주Lab_플랫폼_재설계_v2.0.md" 7, 8번 항목 참고)
 */

export type CustomerType = "general" | "member";
export type ApplicationMode = "simple" | "detail";

/** 간편 버전: 3가지 패키지 */
export const SIMPLE_PACKAGES = [
  {
    key: "reportOnly",
    label: "개인종합 프리미엄 리포트",
    desc: "AI 분석 + 전문가 검토 리포트(PDF)",
    price: 20000,
  },
  {
    key: "reportPlusCall",
    label: "리포트 + 톡/전화 상담",
    desc: "리포트와 함께 실시간 상담사 대화",
    price: 50000,
  },
  {
    key: "reportPlusMeeting",
    label: "리포트 + 커피톡(대면 상담)",
    desc: "리포트와 함께 오프라인 대면 상담",
    price: 100000,
  },
] as const;

/** 디테일 버전: 10개 상담 목적, 옵션별 추가 가격 */
export const DETAIL_PURPOSES = [
  { key: "personal", label: "개인종합", price: 30000 },
  { key: "compatibility", label: "궁합", price: 40000 },
  { key: "career", label: "직업·진로", price: 30000 },
  { key: "business", label: "사업운", price: 40000 },
  { key: "wealth", label: "재물운", price: 30000 },
  { key: "yearly", label: "대운·세운", price: 30000 },
  { key: "naming", label: "작명", price: 50000 },
  { key: "children", label: "자녀운", price: 30000 },
  { key: "health", label: "건강운", price: 30000 },
  { key: "comprehensive", label: "종합 분석", price: 60000 },
] as const;

export const DETAIL_ADDONS = [
  { key: "call", label: "전화 상담 추가", price: 30000 },
  { key: "meeting", label: "대면 상담(커피톡) 추가", price: 70000 },
  { key: "pdfExpress", label: "리포트 익일 발급(일반은 3일)", price: 10000 },
] as const;

/**
 * 단골(멤버십) 고객 할인율.
 * 실제로는 관리자가 등급별(A/B/C, VIP/Gold/Family 등)로 설정하지만,
 * DB 연동 전까지는 "단골" 선택 시 일괄 30% 할인으로 임시 적용합니다.
 */
export const MEMBER_DISCOUNT_RATE = 0.3;

export function applyMemberDiscount(price: number, customerType: CustomerType) {
  if (customerType !== "member") return price;
  return Math.round((price * (1 - MEMBER_DISCOUNT_RATE)) / 100) * 100;
}

export function formatKrw(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}
