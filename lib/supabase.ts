import { createClient } from "@supabase/supabase-js";

/**
 * 서버(API 라우트)용 Supabase 클라이언트.
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가
 * 설정되지 않은 경우 null을 반환해, 아직 Supabase 연동 전이어도
 * 사이트 자체는 정상 동작하도록 합니다(신청서는 안내 메시지로 대체).
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
