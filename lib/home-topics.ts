import { getSupabaseServerClient } from "@/lib/supabase";
import { LIVE_WORRIES } from "@/lib/worries/data";

/**
 * 홈 첫 화면 고민 주제 롤링 — 데이터 읽기 (2026-10-11)
 *
 * DB(home_topics)에서 게시 중인 것을 순서대로 읽는다. 번역(i18n)은 en·ja·zh·fr 네 언어.
 * DB 가 없거나(마이그레이션 전) 비어 있으면 아래 고정 7개로 대신한다 — SQL 을 아직 안 돌렸어도 홈은 깨지지 않는다.
 */
export const TOPIC_LANGS = ["en", "ja", "zh", "fr"] as const;
export type TopicLang = (typeof TOPIC_LANGS)[number];
export type TopicText = { category: string; title: string };
export type HomeTopic = {
  id?: string;
  sort: number;
  category: string;
  title: string;
  slug: string;
  i18n: Partial<Record<TopicLang, TopicText>>;
  live?: boolean;
};

const FALLBACK: HomeTopic[] = [
  { sort: 1, category: "연애", title: "왜 나는 사랑에 상처 받을까?", slug: "love-pattern",
    i18n: { en: { category: "Love", title: "Why do I keep getting hurt in love?" }, ja: { category: "恋愛", title: "なぜ私はいつも恋で傷つくの？" }, zh: { category: "恋爱", title: "为什么我总在爱情里受伤？" }, fr: { category: "Amour", title: "Pourquoi je souffre en amour ?" } } },
  { sort: 2, category: "취업", title: "99년생, 올해 안에 취업할 수 있을까?", slug: "job-99",
    i18n: { en: { category: "Job", title: "Born in ’99 — a job this year?" }, ja: { category: "就職", title: "99年生まれ、今年中に就職できる？" }, zh: { category: "求职", title: "99年生，今年能找到工作吗？" }, fr: { category: "Emploi", title: "Né en 99 : un job cette année ?" } } },
  { sort: 3, category: "이직", title: "퇴사하고 싶다… 지금 나가도 될까?", slug: "quit",
    i18n: { en: { category: "Career", title: "I want to quit… is now the time?" }, ja: { category: "転職", title: "辞めたい…今辞めても大丈夫？" }, zh: { category: "跳槽", title: "想辞职……现在走合适吗？" }, fr: { category: "Carrière", title: "Démissionner… est-ce le moment ?" } } },
  { sort: 4, category: "궁합", title: "결혼해도 될까? 사랑 말고 봐야 할 3가지", slug: "marriage",
    i18n: { en: { category: "Match", title: "Marry? 3 things beyond love" }, ja: { category: "相性", title: "結婚していい？愛以外に見る3つ" }, zh: { category: "合婚", title: "该结婚吗？爱情之外要看的3件事" }, fr: { category: "Couple", title: "Se marier ? 3 points à vérifier" } } },
  { sort: 5, category: "사업", title: "손님 없는 가게, 버틸까 접을까?", slug: "close-or-hold",
    i18n: { en: { category: "Business", title: "Empty shop — hold on or close?" }, ja: { category: "事業", title: "客の来ない店、続ける？畳む？" }, zh: { category: "生意", title: "没客人的店，撑还是关？" }, fr: { category: "Business", title: "Boutique vide : tenir ou fermer ?" } } },
  { sort: 6, category: "적성", title: "지금 새로 시작하면 늦을까?", slug: "second-prime",
    i18n: { en: { category: "Path", title: "Is it too late to start over?" }, ja: { category: "適性", title: "今から始めるのは遅い？" }, zh: { category: "方向", title: "现在重新开始，晚吗？" }, fr: { category: "Voie", title: "Trop tard pour recommencer ?" } } },
  { sort: 7, category: "재물", title: "월급은 들어오는데 왜 늘 돈이 없을까?", slug: "no-savings",
    i18n: { en: { category: "Money", title: "Paid monthly — why always broke?" }, ja: { category: "お金", title: "給料はあるのに、なぜお金がない？" }, zh: { category: "财运", title: "有工资，为什么总是没钱？" }, fr: { category: "Argent", title: "Un salaire, mais jamais d’argent ?" } } },
].filter((t) => LIVE_WORRIES.some((w) => w.slug === t.slug));

export async function getHomeTopics(): Promise<HomeTopic[]> {
  const sb = getSupabaseServerClient();
  if (!sb) return FALLBACK;
  try {
    const { data, error } = await sb
      .from("home_topics")
      .select("id, sort, category, title, slug, i18n, live")
      .eq("live", true)
      .order("sort", { ascending: true })
      .limit(12);
    if (error || !data || data.length === 0) return FALLBACK;
    return (data as HomeTopic[]).map((t) => ({ ...t, i18n: t.i18n || {} }));
  } catch {
    return FALLBACK;
  }
}
