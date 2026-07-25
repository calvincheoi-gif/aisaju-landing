/**
 * 상담 신청 가격 로직.
 *
 * 패키지/옵션 기준가격은 하드코딩 상태입니다. 할인율은 더 이상 고정값이 아니라
 * (1) 연락처 기반 회원 자동조회, (2) 고객 직접 입력, (3) 관리자 수동 조정
 * 세 경로 중 하나로 결정되며, ConsultWizard/관리자 대시보드에서 실제 rate를 넘겨받아
 * applyDiscount()로 계산합니다. (설계 문서 "AI사주Lab_플랫폼_재설계_v2.0.md" 7, 8번 항목 참고)
 */

export type CustomerType = "general" | "member";
export type ApplicationMode = "simple" | "detail";

/** 간편 버전: 3가지 패키지 */
export const SIMPLE_PACKAGES = [
  {
    key: "reportOnly",
    label: "리포트 Only (개인종합 프리미엄 기준)",
    desc: "AI 분석 + 전문가 검토 리포트(PDF)",
    price: 20000,
  },
  {
    key: "reportPlusCall",
    label: "리포트 + 톡상담",
    desc: "리포트와 함께 카카오톡/당근톡 실시간 상담",
    price: 50000,
  },
  {
    key: "reportPlusMeeting",
    label: "리포트 + 카페・대면 상담",
    desc: "리포트와 함께 오프라인 대면 상담",
    price: 100000,
  },
] as const;

/** 간편 버전 전용: 노블레스 오블리주 프리미엄 요금(정가의 2배) */
export const NOBLESSE_OBLIGE = {
  key: "noblesse",
  label: "노블레스 오블리주",
  desc: "재산 상위 10% · 월수입 1,000만원 이상 — 여유가 있으신 만큼 조금 더 나누는 마음으로 프리미엄 요금(정가의 2배)을 적용합니다.",
  multiplier: 2,
} as const;

/** 디테일 버전: 10개 상담 목적, 옵션별 추가 가격 */
export const DETAIL_PURPOSES = [
  { key: "personalBasic", label: "개인종합 - 기본", price: 10000 },
  { key: "personalSpecial", label: "개인종합 - 스페셜", price: 50000 },
  { key: "personalPremium", label: "개인종합 - 프리미엄", price: 90000 },
  { key: "health", label: "건강운", price: 30000 },
  { key: "wealth", label: "재물운", price: 30000 },
  { key: "compatibility", label: "궁합", price: 100000 },
  { key: "career", label: "직업진로", price: 30000 },
  { key: "business", label: "사업운", price: 100000 },
  { key: "naming", label: "네이밍", price: 300000 },
  { key: "etc", label: "기타 (명예운 등)", price: 30000 },
] as const;

export const DETAIL_ADDONS = [
  { key: "call", label: "톡 상담 추가 (카카오톡/당근톡, 질문 1~2개 포함)", price: 10000 },
  { key: "phone", label: "전화상담 추가 (10분 단위)", price: 15000 },
  { key: "meeting", label: "대면상담 추가 (서울・경기, 이동 1시간 이내, ~60분)", price: 100000 },
] as const;

/** 디테일 버전 전용: 리포트 납기 속도별 가격 배율 */
export const DELIVERY_SPEEDS = [
  { key: "standard", label: "표준 (1주)", multiplier: 1 },
  { key: "fast", label: "빠른 (3일)", multiplier: 1.3 },
  { key: "express", label: "초고속 (24시간)", multiplier: 1.8 },
] as const;

/** 프로모션 안내 문구 — 실제 할인 계산은 기존 회원 할인 로직(자동조회/직접입력/관리자조정)을 그대로 사용합니다 */
export const PROMO_NOTICE =
  "~8월까지 오픈 기념, 개인종합(기본 이상) 20% 할인 — 상담사 확인 후 적용됩니다.";

/**
 * 참고용 기본 할인율(단골 등급 미확인 시 안내 문구 등에 사용).
 * 실제 계산에는 사용하지 않습니다 — 실제 rate는 항상 호출부에서 전달됩니다.
 */
export const MEMBER_DISCOUNT_RATE = 0.3;

/**
 * 임의의 할인율(0~1)을 가격에 적용합니다.
 * rate 출처(자동조회/직접입력/관리자조정)는 호출부에서 별도로 기록합니다.
 */
export function applyDiscount(price: number, rate: number) {
  const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 1) : 0;
  if (!safeRate) return price;
  return Math.round((price * (1 - safeRate)) / 100) * 100;
}

export function formatKrw(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}
