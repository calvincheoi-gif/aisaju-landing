/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // AI 리포트 API 라우트(/api/report)가 서버에서 실행되어야 하므로
  // 정적 export(output:'export')는 더 이상 사용하지 않습니다.
  // Netlify에 Git 연동으로 배포하면 Next.js 런타임이 자동으로 서버리스 함수로 처리합니다.
};

export default nextConfig;
