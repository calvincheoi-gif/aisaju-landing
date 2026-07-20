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

  // TODO: 실제 채널 URL로 교체
  channels: {
    daangn: "#",
    naverBlog: "#",
    kakaoChannel: "#",
    instagram: "#",
    cafe: "#",
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
