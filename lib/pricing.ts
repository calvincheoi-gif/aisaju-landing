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
