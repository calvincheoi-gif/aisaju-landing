import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";

export interface Review {
  id: string;
  name: string;
  content: string;
  rating: number | null;
  created_at: string;
}

/**
 * 최근 후기 목록. Supabase 미연동 상태면 빈 배열 반환.
 * anon 키 조회에서 삭제 직후 오래된 데이터가 보이는 현상이 있어,
 * 관리자(서비스 롤) 클라이언트로 항상 최신 데이터를 읽어온다.
 */
export async function getRecentReviews(limit = 3): Promise<Review[]> {
  const supabase = getSupabaseAdminClient() ?? getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Review[];
}
