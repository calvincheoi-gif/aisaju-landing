import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://aisajulab.com"),
  title: "AI사주 Lab | AI와 명리학으로 완성하는 인생·비즈니스 의사결정",
  description:
    "AI사주 Lab은 AI와 명리학을 결합해 개인사주, 궁합, 사업운, 재물운 등 인생과 비즈니스의 중요한 의사결정을 돕는 플랫폼입니다. 전문 상담 및 AI 명리 리포트는 최형철 사주명리 연구소가 제공합니다.",
  keywords: [
    "AI사주",
    "AI사주 Lab",
    "사주",
    "사주풀이",
    "명리학",
    "궁합",
    "사업운",
    "재물운",
    "AI 명리 리포트",
    "최형철 사주명리 연구소",
  ],
  verification: {
    google: "RM29hZ0nuU3g-e1MRNlBB8jSrHO7qsWM32ZCZ_rd1bg",
    other: {
      "naver-site-verification": "b141b457220f4988533588043233f5c325455b07",
    },
  },
  openGraph: {
    title: "AI사주 Lab | AI와 명리학으로 완성하는 인생·비즈니스 의사결정",
    description:
      "AI와 명리학으로 인생과 비즈니스의 중요한 의사결정을 돕는 플랫폼",
    url: "https://aisajulab.com",
    siteName: "AI사주 Lab",
    locale: "ko_KR",
    type: "website",
  },
};

/**
 * 조직·웹사이트 구조화 데이터.
 * 검색엔진과 AI가 「최형철 사주명리 연구소」를 하나의 사업자로 인식하게 한다.
 * 사업자 정보(상호·번호·주소)는 푸터 표기와 반드시 같아야 한다.
 */
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://aisajulab.com/#organization",
      name: "라이프앤비즈(Life & Biz) 성장 연구소",
      alternateName: ["최형철 사주명리 연구소", "AI사주랩", "AI사주 Lab"],
      url: "https://aisajulab.com",
      email: "calvincheoi@gmail.com",
      telephone: "+82-10-6789-1341",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KR",
        addressRegion: "서울특별시",
        addressLocality: "강동구",
        streetAddress: "올림픽로78길 60, 103동 602호",
      },
      founder: {
        "@type": "Person",
        name: "최형철",
        jobTitle: "경영지도사 · 사주명리 연구가",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://aisajulab.com/#website",
      url: "https://aisajulab.com",
      name: "AI사주 Lab",
      inLanguage: "ko",
      publisher: { "@id": "https://aisajulab.com/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" translate="no" className="notranslate">
      <head>
        {/* 자체 5개 국어 전환을 쓰므로 브라우저 자동번역을 끈다.
            켜져 있으면 크롬이 우리 화면을 다시 기계번역해 덮어쓴다. */}
        <meta name="google" content="notranslate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
        <script src="/card-sheets.js" defer></script>
        <script src="/visitor.js" defer></script>
        <script src="/pwa.js" defer></script>
      </body>
    </html>
  );
}
