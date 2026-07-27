import { getSupabaseServerClient } from "@/lib/supabase";

export interface Review {
  id: string;
  name: string;
  content: string;
  rating: number | null;
  created_at: string;
}

/** 최근 후기 목록. Supabase 미연동 상태면 빈 배열 반환. */
export async function getRecentReviews(limit = 3): Promise<Review[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Review[];
}
