import { getRecentReviews } from "@/lib/reviews";
import ReviewsBoard from "./ReviewsBoard";

/** 홈페이지 후기 섹션 (서버에서 최근 후기를 가져와 클라이언트 위젯에 전달) */
export default async function Reviews() {
  const reviews = await getRecentReviews(3);
  return <ReviewsBoard initialReviews={reviews} />;
}
