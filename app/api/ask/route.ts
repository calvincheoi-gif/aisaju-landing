import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * 선착순 Daily 3명 무료 1문 1답 (2026-10-04)
 *
 *   GET  /api/ask  → { cap, used, remaining, day }   홈 배지 「오늘 남은 자리 n/3」
 *   POST /api/ask  → { saved, refNo, remaining } | { saved:false, reason }
 *
 * 정원 확인과 저장은 DB 함수(free_ask_submit)가 한 트랜잭션에서 처리한다.
 * 그래서 두 사람이 동시에 눌러도 4번째 신청이 들어가지 않는다.
 * 정원(3명)을 바꾸려면 supabase/migrations/20261004_free_questions.sql 의 cap 만 고친다.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const EMPTY = { cap: 3, used: 0, remaining: 3, day: null as string | null };

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ...EMPTY, live: false }, { headers: { "Cache-Control": "no-store" } });
  const { data, error } = await supabase.rpc("free_ask_status");
  if (error || !data) return NextResponse.json({ ...EMPTY, live: false }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ ...(data as object), live: true }, { headers: { "Cache-Control": "no-store" } });
}

interface AskBody {
  name: string;
  gender?: string | null;
  birthInfo: string;
  contact: string;
  question: string;
  kakaoAgree?: boolean;
  reviewAgree?: boolean;
  utm?: string | null;
  referrer?: string | null;
  deviceCode?: string | null;
}

export async function POST(req: Request) {
  let body: AskBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ saved: false, reason: "bad_request" }, { status: 400 });
  }
  const name = String(body.name || "").trim();
  const birthInfo = String(body.birthInfo || "").trim();
  const contact = String(body.contact || "").trim();
  const question = String(body.question || "").trim();
  if (!name || !birthInfo || !contact || !question) {
    return NextResponse.json({ saved: false, reason: "missing" }, { status: 400 });
  }
  if (question.length > 300) {
    return NextResponse.json({ saved: false, reason: "too_long" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ saved: false, reason: "no_db" }, { status: 503 });

  const { data, error } = await supabase.rpc("free_ask_submit", {
    p_name: name,
    p_gender: body.gender ?? null,
    p_birth_info: birthInfo,
    p_contact: contact,
    p_question: question,
    p_kakao_agree: !!body.kakaoAgree,
    p_review_agree: !!body.reviewAgree,
    p_utm: body.utm ?? null,
    p_referrer: body.referrer ?? null,
    p_device_code: body.deviceCode ?? null,
  });
  if (error) return NextResponse.json({ saved: false, reason: "db", detail: error.message }, { status: 500 });

  const r = data as { ok: boolean; reason?: string; id?: string; ref_no?: string; remaining?: number };
  if (!r.ok) return NextResponse.json({ saved: false, reason: r.reason || "rejected", remaining: r.remaining ?? 0 }, { status: 409 });
  return NextResponse.json({ saved: true, id: r.id, refNo: r.ref_no, remaining: r.remaining ?? 0 });
}
