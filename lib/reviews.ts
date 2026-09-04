import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";

export interface Review {
  id: string;
  name: string;
  content: string;
  rating: number | null;
  created_at: string;
}

/**
 * 홈에 노출할 후기 목록.
 *
 * ⚠️ 반드시 `is_published = true` 인 것만 반환한다.
 * 후기 등록은 누구나 할 수 있으므로(익명 insert), 승인되지 않은 글이
 * 홈 화면에 그대로 뜨면 광고·비방 글을 막을 방법이 없다.
 * 승인은 /admin/reviews 에서 소장님이 직접 「게시」로 바꿔 준다.
 *
 * Supabase 미연동 상태면 빈 배열을 반환한다(사이트는 정상 동작).
 */
export async function getPublishedReviews(limit = 5): Promise<Review[]> {
  const supabase = getSupabaseAdminClient() ?? getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id,name,content,rating,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Review[];
}

/** @deprecated 승인 여부를 가리지 않으므로 화면 노출에는 쓰지 말 것. getPublishedReviews 를 사용한다. */
export async function getRecentReviews(limit = 3): Promise<Review[]> {
  return getPublishedReviews(limit);
}
