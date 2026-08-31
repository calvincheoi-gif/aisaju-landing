import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * 읽을거리(/learn) 글 데이터 — Supabase `learn_posts` 테이블에서 읽는다.
 *
 * 글을 올리는 방법: 관리자 화면(/admin/learn)에서 등록한다.
 * 코드를 고칠 필요가 없고, 등록하는 순간 목록·상세·홈·sitemap 에 모두 반영된다.
 *
 * body 표기법 — 한 줄에 한 블록:
 *   ## 소제목   → 소제목(목차에 자동으로 잡힘)
 *   - 항목      → 점 목록
 *   > 문장      → 강조 인용
 *   ※ 문장      → 각주·용어 설명
 *   그 외       → 본문 문단 (<b> <a> 태그 사용 가능)
 */

export const LEARN_BUCKET = "learn";

export interface LearnPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  emoji: string;
  body: string;
  card_paths: string[];
  keywords: string[];
  read_min: number;
  published: boolean;
  featured: boolean;
  published_at: string;
  updated_at: string;
}

export type LearnBlock =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "note"; text: string };

/** Storage 상대경로 → 공개 URL */
export function learnImageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${LEARN_BUCKET}/${path}`;
}

/** 본문 텍스트를 블록 배열로 바꾼다. 연속된 「- 」 줄은 하나의 목록으로 묶는다. */
export function parseLearnBody(body: string): LearnBlock[] {
  const out: LearnBlock[] = [];
  for (const raw of (body || "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      out.push({ kind: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      const item = line.slice(2).trim();
      const last = out[out.length - 1];
      if (last && last.kind === "list") last.items.push(item);
      else out.push({ kind: "list", items: [item] });
    } else if (line.startsWith("> ")) {
      out.push({ kind: "quote", text: line.slice(2).trim() });
    } else if (line.startsWith("※")) {
      out.push({ kind: "note", text: line.replace(/^※\s*/, "") });
    } else {
      out.push({ kind: "p", text: line });
    }
  }
  return out;
}

/** 공개된 글 전체 (최신순) */
export async function getPublishedLearnPosts(): Promise<LearnPost[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("learn_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as LearnPost[];
}

/** 슬러그로 글 하나 */
export async function getLearnPost(slug: string): Promise<LearnPost | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("learn_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as LearnPost;
}

/**
 * 홈에 띄울 「이번 주 읽을거리」.
 * featured 로 지정한 글이 있으면 그것을, 없으면 가장 최근 글을 쓴다.
 */
export async function getFeaturedLearnPost(): Promise<LearnPost | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("learn_posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .maybeSingle();
  if (data) return data as LearnPost;
  const posts = await getPublishedLearnPosts();
  return posts[0] ?? null;
}

/** 같은 분류를 우선해 관련 글을 고른다 */
export async function getRelatedLearnPosts(slug: string, limit = 2): Promise<LearnPost[]> {
  const all = await getPublishedLearnPosts();
  const current = all.find((p) => p.slug === slug);
  const others = all.filter((p) => p.slug !== slug);
  if (!current) return others.slice(0, limit);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}
