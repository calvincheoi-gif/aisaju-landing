import type { MetadataRoute } from "next";

const BASE_URL = "https://aisajulab.com";

/**
 * 검색엔진(구글/네이버 등)이 사이트 구조를 파악할 수 있도록
 * 정적 페이지 목록을 sitemap.xml로 제공합니다.
 * https://aisajulab.com/sitemap.xml 로 자동 노출됩니다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/consult`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/report`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/qna`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];
}
