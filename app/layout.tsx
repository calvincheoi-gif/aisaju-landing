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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
        <script src="/august-event.js" defer></script>
        <script src="/card-sheets.js" defer></script>
      </body>
    </html>
  );
}
