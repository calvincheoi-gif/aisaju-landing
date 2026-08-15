import HomeV6 from "@/components/HomeV6";

// 홈은 항상 최신본으로 렌더 (CDN이 옛 페이지를 캐시하지 않도록)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return <HomeV6 />;
}
