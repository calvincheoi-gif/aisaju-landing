import HomeV6 from "@/components/HomeV6";
import { getFeaturedLearnPost, learnImageUrl } from "@/lib/learn-posts";

// 홈은 항상 최신본으로 렌더 (CDN이 옛 페이지를 캐시하지 않도록)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  /* 관리자에서 「홈 노출」로 지정한 글 하나를 가져온다.
     없으면 가장 최근 글이 대신 뜨고, 글이 하나도 없으면 블록 자체가 사라진다. */
  const post = await getFeaturedLearnPost();
  const learn = post
    ? {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || post.description,
        category: post.category,
        cards: (post.card_paths || [])
          .map(learnImageUrl)
          .filter((u): u is string => Boolean(u)),
      }
    : null;

  return <HomeV6 learn={learn} />;
}
