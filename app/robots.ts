import type { MetadataRoute } from "next";

/**
 * 검색엔진 크롤러 접근 규칙 (robots.txt).
 * 관리자 페이지(/admin)와 내부 API(/api)는 색인에서 제외하고,
 * 나머지 공개 페이지는 모두 허용하며 sitemap 위치를 안내합니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://aisajulab.com/sitemap.xml",
  };
}
