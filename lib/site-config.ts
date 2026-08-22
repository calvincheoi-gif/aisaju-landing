/**
 * 사이트 전역 설정값.
 * 값만 교체하면 사이트 전체에 반영됩니다.
 */
export const siteConfig = {
  name: "AI사주 Lab",
  brandNameEn: "AI SAJU LAB",
  org: "최형철 사주명리 연구소",
  orgTagline: "전문 상담 및 AI 명리 리포트",
  domain: "aisajulab.com",

  /** 브랜드 슬로건: 첫 화면 상단에 노출 */
  tagline: "명리학은 나를 알고, 나를 찾고, 나를 완성해 가는 최적의 Tool",

  consultUrl: "https://kaleidoscopic-fudge-a78803.netlify.app/",

  // TODO: 실제 운영 이메일로 교체
  contactEmail: "calvincheoi@gmail.com",

  /**
   * 결제·송금 안내.
   * ─ kakaoPayUrl : 오행 앱 990원 결제에 쓰는 것과 같은 카카오페이 송금 링크.
   *                 상담은 금액이 건마다 달라 사용자가 직접 금액을 입력합니다.
   * ─ bank/account/holder : 계좌이체를 함께 안내하려면 채우세요.
   *                 account 가 비어 있으면 계좌 안내 영역은 화면에 나오지 않습니다.
   * ─ leadTimeDays : 입금 확인 후 회신까지 걸리는 영업일 수.
   */
  payment: {
    kakaoPayUrl: "https://qr.kakaopay.com/281006011152525201002095",
    bank: "카카오뱅크",
    account: "3333-37-2825990",
    holder: "라이프앤비즈(Life & Biz) 성장 연구소",   // 사업자등록증 상호 기준
    leadTimeDays: 2,
    vatIncluded: true,
  },

  channels: {
    daangn: "https://www.daangn.com/kr/local-profile/yhqzhrhmoopf/?referrer=share",
    naverBlog: "https://m.blog.naver.com/naming_supporter",
    kakaoChannel: "https://open.kakao.com/o/gj3iUKai",
    instagram: "https://www.instagram.com/choi_calvin?igsh=OWQwdjR4MDV6Nnln",
    cafe: "https://cafe.daangn.com/sajupalja-myeon?utm_medium=copy_link",
  },
};

/** 첫 화면 언어 선택 옵션 (기본 2개 + "기타" 하위 목록) */
export const PRIMARY_LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
] as const;

export const OTHER_LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "fr", label: "Français" },
] as const;
