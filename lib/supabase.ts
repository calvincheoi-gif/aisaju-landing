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

/**
 * 관리자 전용 Supabase 클라이언트 (service_role 키 사용, RLS 우회).
 * SUPABASE_SERVICE_ROLE_KEY는 절대 NEXT_PUBLIC_ 접두사를 붙이지 않습니다 —
 * 클라이언트 번들에 노출되면 안 되는 서버 전용 비밀키입니다.
 * 상담 사례 업로드/삭제(app/api/admin/cases) 등 관리자 기능에서만 사용하세요.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
