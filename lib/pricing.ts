/**
 * 상담 신청 가격 로직.
 *
 * 아래 DEFAULT_* 값은 Supabase(pricing_config 테이블)에 관리자가 설정한
 * 값이 없을 때 사용되는 기본값입니다. 실제 서비스 중인 가격은
 * /admin/pricing 에서 관리자가 자유롭게 수정할 수 있으며,
 * ConsultWizard가 /api/pricing 을 통해 최신 값을 불러옵니다.
 */

export type CustomerType = "general" | "member";
export type ApplicationMode = "simple" | "detail";

export interface SimplePackage {
  key: string;
  label: string;
  desc: string;
  price: number;
}

export interface PricedItem {
  key: string;
  label: string;
  price: number;
}

/** 간편 버전: 3가지 패키지 (기본값) */
export const DEFAULT_SIMPLE_PACKAGES: SimplePackage[] = [
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
];

/** 디테일 버전: 10개 상담 목적 (기본값) */
export const DEFAULT_DETAIL_PURPOSES: PricedItem[] = [
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
];

/** 디테일 버전: 추가 옵션 (기본값) */
export const DEFAULT_DETAIL_ADDONS: PricedItem[] = [
  { key: "call", label: "전화 상담 추가", price: 30000 },
  { key: "meeting", label: "대면 상담(커피톡) 추가", price: 70000 },
  { key: "pdfExpress", label: "리포트 익일 발급(일반은 3일)", price: 10000 },
];

/** 단골(멤버십) 고객 기본 할인율 */
export const DEFAULT_MEMBER_DISCOUNT_RATE = 0.3;

export function applyMemberDiscount(price: number, customerType: CustomerType, discountRate: number) {
  if (customerType !== "member") return price;
  return Math.round((price * (1 - discountRate)) / 100) * 100;
}

export function formatKrw(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}
