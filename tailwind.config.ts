import type { Config } from "tailwindcss";

/**
 * AI사주 디자인 토큰
 * 확정 방향: Indigo 600(#4338CA) 단일 액센트 + 밝고 심플한 뉴트럴, 가독성 우선.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0A0A0F", // 헤드라인
          700: "#26262E", // 서브헤드
        },
        body: "#52525B", // 본문 텍스트 (대비 확보)
        border: "#E4E4E9",
        bg: {
          DEFAULT: "#FFFFFF",
          alt: "#F7F8FC", // 섹션 구분용 옅은 배경
        },
        indigo: {
          600: "#4338CA", // Primary
          500: "#4F46E5", // Hover / Gradient
          100: "#EEF0FF", // Tint 배경
          50: "#F5F6FF",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "22px",
        pill: "999px",
      },
      boxShadow: {
        1: "0 1px 2px rgba(10,10,15,0.04), 0 1px 1px rgba(10,10,15,0.03)",
        2: "0 8px 24px rgba(10,10,15,0.08), 0 2px 6px rgba(10,10,15,0.04)",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
