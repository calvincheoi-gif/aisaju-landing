/**
 * 서버 모듈 — 오늘(한국 시간) 날짜의 한마디 5개를 DB(daily_words)에서 읽는다.
 * 표에 없거나 Supabase 미연동이면 빈 배열 → 홈은 기존 VOC 문구를 그대로 보여 준다.
 */
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";
import { WORD_ELEMENTS, type DailyWord } from "./types";

export function kstMonthDay(now = new Date()): { month: number; day: number } {
  const k = new Date(now.getTime() + 9 * 3600_000);
  return { month: k.getUTCMonth() + 1, day: k.getUTCDate() };
}

export async function getTodayWords(): Promise<DailyWord[]> {
  const supabase = getSupabaseServerClient() ?? getSupabaseAdminClient();
  if (!supabase) return [];
  const { month, day } = kstMonthDay();
  const { data, error } = await supabase
    .from("daily_words")
    .select("element,type,text,meaning,source")
    .eq("month", month)
    .eq("day", day);
  if (error || !data) return [];
  const byEl = new Map((data as DailyWord[]).map((w) => [w.element, w]));
  /* 木火土金水 순서로, 빠진 칸이 있으면 그 칸만 건너뛴다 */
  return WORD_ELEMENTS.map((e) => byEl.get(e)).filter((w): w is DailyWord => Boolean(w));
}
