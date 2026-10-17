import HomeV6 from "@/components/HomeV6";
import { getFeaturedLearnCard, getOhaengLearnLinks, learnImageUrl } from "@/lib/learn-posts";
import { getPublishedReviews } from "@/lib/reviews";
import { getTodayWords } from "@/lib/daily-words/server";
import { getHomeTopics } from "@/lib/home-topics";
import { getHomeTalk } from "@/lib/talk/server";

/**
 * 홈은 CDN에 5분간 캐시한다.
 *
 * 예전에는 `dynamic = "force-dynamic"` + `revalidate = 0` 으로 캐시를 완전히 껐다.
 * 이유는 "글을 올리면 즉시 홈에 반영되게" 하기 위해서였는데, 그 대가로
 * 모든 방문자가 매번 서버 함수를 깨워야 했다 — 첫 화면이 느려지던 원인이다.
 *
 * 지금은 방식을 바꿨다. 평소에는 CDN이 바로 내주고,
 * 관리자에서 글·후기를 바꾸는 순간 그 API 가 `revalidatePath("/")` 를 불러
 * 캐시를 즉시 갈아 끼운다. 그래서 "즉시 반영"은 그대로 유지된다.
 * 아래 300초는 혹시 갱신 신호를 놓쳤을 때를 위한 안전망이다.
 */
/**
 * 정규 주소(canonical) — 2026-10-16
 *
 * 홍보용 추적 링크(?utm=daangn, ?utm=kakao …)는 내용이 같은데 주소만 다르다.
 * 표시가 없으면 구글이 "중복 페이지, 어느 게 원본인지 모름"으로 보고 색인을 보류한다
 * (Search Console 경고: 사용자가 선택한 표준이 없는 중복 페이지).
 * 아래 한 줄이 "원본은 이 주소"라고 알려 준다. utm 추적 자체에는 영향이 없다.
 */
export const metadata = { alternates: { canonical: "/" } };

export const revalidate = 300;

export default async function Home() {
  /* 세 가지를 한꺼번에 가져온다.
     예전에는 await 를 세 번 줄줄이 걸어 두어 DB 왕복이 차례로 세 번 일어났다.
     서로 의존하지 않는 값이므로 병렬로 받으면 가장 느린 하나만큼만 기다린다.

       (1) 관리자에서 「홈 노출」로 지정한 글 하나 — 없으면 최근 글, 글이 없으면 블록 자체가 사라진다
       (2) 승인(게시)된 후기만 — 승인 전 글은 여기 들어오지 않는다
       (3) 오행 카드의 「더 읽기」 연결 — 글이 공개돼 있을 때만 버튼이 붙는다
       (4) Today's 촌철활인 한마디 — 오늘(한국 시간) 날짜의 오행별 5문구, 없으면 기존 VOC 문구 */
  const [post, reviews, ohaengLinks, words, topics, talk] = await Promise.all([
    getFeaturedLearnCard(),
    getPublishedReviews(5),
    getOhaengLearnLinks(),
    getTodayWords(),
    getHomeTopics(), /* (5) 첫 화면 고민 주제 롤링 — /admin/topics 에서 관리 (2026-10-11) */
    getHomeTalk(),   /* (6) 「오늘 한 줄」 최신 10개 — 누구나 남기고, 걸린 글은 /admin/talk 승인 (2026-10-17) */
  ]);

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

  return <HomeV6 learn={learn} reviews={reviews} ohaengLinks={ohaengLinks} words={words} topics={topics} talk={talk} />;
}
