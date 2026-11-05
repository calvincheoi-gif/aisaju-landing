import { getSupabaseServerClient } from "@/lib/supabase";
import { LIVE_WORRIES } from "@/lib/worries/data";
import { TOPIC_CATALOG } from "./home-topics/catalog";
import type { HomeTopic } from "./home-topics/types";

export * from "./home-topics/types";
export { TOPIC_CATALOG } from "./home-topics/catalog";
export { ROLL_BODY, rollScriptTag } from "./home-topics/roll";

/**
 * 홈 첫 화면 고민 주제 롤링 — 데이터 읽기 (v3, 2026-11-05)
 *
 * DB(home_topics)에서 게시 중인 것을 읽는다(최대 108개). 순서는 브라우저가 규칙대로 섞으므로 sort 는 관리자 목록 순서일 뿐이다.
 * DB 가 없거나(마이그레이션 전) 비어 있으면 catalog.ts 의 24개로 대신한다 — SQL 을 아직 안 돌렸어도 홈은 깨지지 않는다.
 * v2 행(새 컬럼이 비어 있는 경우)도 기본값을 채워 그대로 쓴다.
 */
export const TOPIC_SELECT = "id, sort, category, title, slug, i18n, live, grp, link_type, ask_prefill, weight, time_slot, tone";

/** 빠진 컬럼을 기본값으로 채운다 (v2 표 → v3 형식) */
export function normalizeTopic(raw: Partial<HomeTopic> & { category: string; title: string; slug: string }): HomeTopic {
  return {
    ...raw,
    sort: Number(raw.sort ?? 0),
    i18n: raw.i18n || {},
    grp: raw.grp || "",
    link_type: raw.link_type === "ask" ? "ask" : "q",
    ask_prefill: raw.ask_prefill ?? null,
    weight: Math.min(3, Math.max(1, Number(raw.weight ?? 1) || 1)),
    time_slot: (["any", "am", "pm", "night"] as const).includes(raw.time_slot as "any") ? (raw.time_slot as HomeTopic["time_slot"]) : "any",
    tone: raw.tone === "heavy" ? "heavy" : "light",
  };
}

/** 예비 목록 — q 형은 랜딩이 실제로 있을 때만, ask 형은 그대로 */
const FALLBACK: HomeTopic[] = TOPIC_CATALOG.filter((t) => t.link_type === "ask" || LIVE_WORRIES.some((w) => w.slug === t.slug));

export async function getHomeTopics(): Promise<HomeTopic[]> {
  const sb = getSupabaseServerClient();
  if (!sb) return FALLBACK;
  try {
    let { data, error } = await sb.from("home_topics").select(TOPIC_SELECT).eq("live", true).order("sort", { ascending: true }).limit(108);
    if (error) {
      /* v3 마이그레이션 전(새 컬럼 없음)이면 v2 컬럼만으로 읽는다 */
      const r2 = await sb.from("home_topics").select("id, sort, category, title, slug, i18n, live").eq("live", true).order("sort", { ascending: true }).limit(108);
      data = r2.data as typeof data; error = r2.error;
    }
    if (error || !data || data.length === 0) return FALLBACK;
    return (data as Array<Partial<HomeTopic> & { category: string; title: string; slug: string }>).map(normalizeTopic);
  } catch {
    return FALLBACK;
  }
}
