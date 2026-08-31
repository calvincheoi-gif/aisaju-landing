import type { MetadataRoute } from "next";
import { LEARN_POSTS } from "@/lib/learn-posts";

const BASE_URL = "https://aisajulab.com";

/**
 * 검색엔진(구글/네이버 등)이 사이트 구조를 파악할 수 있도록
 * 페이지 목록을 sitemap.xml로 제공합니다.
 * https://aisajulab.com/sitemap.xml 로 자동 노출됩니다.
 *
 * 원칙: 실제로 존재하고 사람이 볼 수 있는 페이지만 넣는다.
 *   없는 주소를 신고하면 크롤러가 404를 받아 사이트 신뢰도가 깎이고,
 *   반대로 있는 페이지가 빠지면 색인 기회를 잃는다.
 *   public/ 아래 정적 페이지(/ohaeng/, /legal/)도 함께 넣는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${BASE_URL}/ohaeng/`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/consult`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/learn`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/report`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/cases`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/qna`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/legal/`, changeFrequency: "yearly" as const, priority: 0.3 },
  ].map((p) => ({ ...p, lastModified: now }));

  /* 글이 늘어나면 lib/learn-posts.ts 목록만 고치면 sitemap도 따라온다 */
  const learnPages: MetadataRoute.Sitemap = LEARN_POSTS.map((post) => ({
    url: `${BASE_URL}/learn/${post.slug}`,
    lastModified: new Date(post.updated || post.published),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...learnPages];
}
