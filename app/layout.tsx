import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";
import FloatNav from "@/components/FloatNav";

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
  /**
   * 카카오톡·문자·SNS에 주소를 붙여넣었을 때 뜨는 미리보기.
   *
   * images 를 지정하지 않으면 카톡이 페이지 안에서 아무 그림이나 골라 쓴다.
   * 실제로 작명 3종 세트 사진이 뽑혀 나오는 일이 있었다. 홈 첫 화면을 담은
   * /og-home.jpg 를 못 박아 둔다. 이미지를 바꾸면 카톡이 한동안 옛 그림을
   * 물고 있으므로, 아래 도구에서 캐시를 지워야 새 그림이 보인다.
   *   https://developers.kakao.com/tool/debugger/sharing
   */
  openGraph: {
    title: "AI사주랩.com | 나의 오행 성격, 1분이면 나옵니다",
    description:
      "질문 14개로 보는 나의 오행 성격과 오늘의 기운. 가입 없이 바로 · 무료",
    url: "https://aisajulab.com",
    siteName: "AI사주 Lab",
    locale: "ko_KR",
    type: "website",
    /* 정사각(1:1)을 주면 카톡이 큰 카드 대신 작은 썸네일로 보여준다 — 폰에서 아담하게.
       가로판(/og-home.jpg)은 트위터·슬랙 등 큰 카드가 어울리는 곳에만 쓴다. */
    images: [
      {
        url: "/og-home-sq.jpg",
        width: 800,
        height: 800,
        alt: "AI사주랩.com — 나의 오행 성격, 1분이면 나옵니다",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI사주랩.com | 나의 오행 성격, 1분이면 나옵니다",
    description: "질문 14개로 보는 나의 오행 성격과 오늘의 기운. 가입 없이 바로",
    images: ["/og-home.jpg"],
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
        {/* 뒤로·목록·오행·홈 떠 있는 버튼 — 홈·관리자 화면에서는 스스로 숨는다 */}
        <FloatNav />
        <script src="/card-sheets.js" defer></script>
        <script src="/visitor.js" defer></script>
        <script src="/pwa.js" defer></script>
      </body>
    </html>
  );
}
