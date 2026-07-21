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

  channels: {
    daangn: "https://www.daangn.com/kr/local-profile/yhqzhrhmoopf/?referrer=share",
    naverBlog: "https://m.blog.naver.com/naming_supporter?tab=1",
    kakaoChannel: "https://open.kakao.com/o/gj3iUKai",
    instagram: "#",
    cafe: "https://cafe.daangn.com/sajupalja-myeon?utm_medium=copy_link",
  },

  /** 결제 안내 정보 (계좌이체 / 카카오페이 송금) */
  payment: {
    bank: {
      bankName: "카카오뱅크",
      accountNumber: "3333372825990",
      accountHolder: "Life_Biz 성장연구소",
    },
    kakaopayLink: "https://qr.kakaopay.com/FRQ005kvF",
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
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
] as const;

export type LanguageCode =
  | (typeof PRIMARY_LANGUAGES)[number]["code"]
  | (typeof OTHER_LANGUAGES)[number]["code"];
