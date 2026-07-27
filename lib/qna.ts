import { getSupabaseServerClient } from "@/lib/supabase";

export interface QnaPost {
  id: string;
  name: string;
  title: string;
  content: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

/** 공개 Q&A 목록 (최신순). Supabase 미연동 상태면 빈 배열 반환. */
export async function getQnaPosts(): Promise<QnaPost[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("qna_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as QnaPost[];
}
