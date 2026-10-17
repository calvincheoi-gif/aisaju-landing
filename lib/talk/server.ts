import { getSupabaseServerClient } from "@/lib/supabase";
import { TALK_HOME_N, type TalkItem } from "./types";

/**
 * 「오늘 한 줄」 서버 모듈 — 게시된 글 읽기 (2026-10-17)
 *   · 홈: 최신 10개 (app/page.tsx 가 받아 HomeV6 에 넘긴다)
 *   · /talk: 전부 누적, 페이지 단위
 * DB(talk_public 뷰)가 없거나(마이그레이션 전) 오류면 빈 배열 — 홈은 깨지지 않고 블록만 사라진다.
 */
export async function getHomeTalk(): Promise<TalkItem[]> {
  const { items } = await getTalkList(0, TALK_HOME_N);
  return items;
}

export async function getTalkList(offset = 0, limit = 30): Promise<{ items: TalkItem[]; total: number }> {
  const sb = getSupabaseServerClient();
  if (!sb) return { items: [], total: 0 };
  try {
    const { data, error, count } = await sb
      .from("talk_public")
      .select("id, created_at, text, nick", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error || !data) return { items: [], total: 0 };
    return { items: data as TalkItem[], total: count ?? data.length };
  } catch {
    return { items: [], total: 0 };
  }
}
