import { getSupabaseServerClient } from "@/lib/supabase";

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pdf_path: string;
  thumbnail_path: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

const BUCKET = "case-studies";

/** Storage 경로 → 공개 URL 변환 */
export function caseStudyFileUrl(path: string | null) {
  if (!path) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * 공개 노출된(published=true) 상담 사례 목록을 가져옵니다.
 * Supabase 미연동 상태(env 미설정)면 빈 배열을 반환합니다.
 */
export async function getPublishedCaseStudies(): Promise<CaseStudy[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CaseStudy[];
}

