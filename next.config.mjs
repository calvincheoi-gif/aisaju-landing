/** @type {import('next').NextConfig} */

/**
 * 채널별 "외우기 쉬운 짧은 주소" (2026-10-17)
 *
 * 카드뉴스·릴스·쇼츠·당근 사진처럼 링크를 걸 수 없는 콘텐츠에는 글자로 주소를 보여 준다.
 *   aisajulab.com/i  → 인스타그램 카드·릴스      aisajulab.com/y → 유튜브 쇼츠
 *   aisajulab.com/d  → 당근(사진·스토리·비즈프로필) aisajulab.com/c → 명함 QR
 *   aisajulab.com/k  → 카카오톡(채널·단톡)         aisajulab.com/b → 블로그·카페
 * 사람에게는 도메인만 치는 것과 수고가 같고, 우리에게는 utm=<채널>_typed 꼬리표가 남는다.
 * 대문자로 쳐도 되게 소문자·대문자 둘 다 받는다. 새 채널은 아래 표에 한 줄만 더하면 된다.
 */
const SHORT_LINKS = {
  i: "insta_typed",
  y: "youtube_typed",
  d: "daangn_typed",
  c: "card_typed",
  k: "kakao_typed",
  b: "blog_typed",
};

const nextConfig = {
  reactStrictMode: true,
  // AI 리포트 API 라우트(/api/report)가 서버에서 실행되어야 하므로
  // 정적 export(output:'export')는 더 이상 사용하지 않습니다.
  // Netlify에 Git 연동으로 배포하면 Next.js 런타임이 자동으로 서버리스 함수로 처리합니다.
  async redirects() {
    return Object.entries(SHORT_LINKS).flatMap(([p, utm]) => [
      { source: `/${p}`, destination: `/?utm=${utm}`, permanent: false },
      { source: `/${p.toUpperCase()}`, destination: `/?utm=${utm}`, permanent: false },
    ]);
  },
};

export default nextConfig;
