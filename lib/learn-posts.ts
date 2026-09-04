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

/**
 * 홈 히어로의 오행 카드 → 「더 읽기」 연결.
 *
 * 글을 어느 오행 카드에 붙일지 정하는 방법은 셋이고, 위에서부터 우선한다.
 *
 *   ① 키워드에 「오행:화」 를 넣는다   ← 권장. 관리자 화면 「검색 키워드」 칸에 한 항목만 추가하면 된다
 *   ② 주소(slug)를 ohaeng-hwa 로 짓는다
 *   ③ 아무것도 안 하면 제목·키워드에서 자동으로 알아본다 (아래 pickByText)
 *
 * ①을 권하는 이유: 관리자 화면이 주소를 자동으로 지어 주고 그게 검색에도 유리한데,
 * 주소를 억지로 바꾸면 그 이점을 버리게 된다. 키워드는 글을 쓰면서 한 번에 넣을 수 있다.
 *
 * ⚠️ 지금 관리자 화면에는 등록한 글을 고치는 기능이 없다(공개/숨김·삭제만 가능).
 *    그래서 ③ 자동 인식을 안전망으로 둔다 — 표시를 깜빡해도 대개는 붙는다.
 */
export const OHAENG_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;
export type OhaengKey = (typeof OHAENG_KEYS)[number];

/** ② 주소로 지정하는 경우의 약속값 */
export const OHAENG_SLUGS: Record<OhaengKey, string> = {
  wood: "ohaeng-mok",
  fire: "ohaeng-hwa",
  earth: "ohaeng-to",
  metal: "ohaeng-geum",
  water: "ohaeng-su",
};

/** ① 키워드로 지정하는 경우 인정하는 표기들 (띄어쓰기·대소문자는 무시) */
const OHAENG_TAGS: Record<OhaengKey, string[]> = {
  wood: ["오행:목", "오행:木", "ohaeng:wood"],
  fire: ["오행:화", "오행:火", "ohaeng:fire"],
  earth: ["오행:토", "오행:土", "ohaeng:earth"],
  metal: ["오행:금", "오행:金", "ohaeng:metal"],
  water: ["오행:수", "오행:水", "ohaeng:water"],
};

/** ③ 자동 인식에 쓰는 한자. 한글 한 글자(목·화·토·금·수)는 쓰지 않는다
 *  — 「금요일」「화가」「수업」처럼 엉뚱한 말에 걸린다. */
const OHAENG_HANJA: Record<OhaengKey, string> = {
  wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const countOf = (text: string, ch: string) => text.split(ch).length - 1;

/**
 * 제목·키워드에 나온 한자를 세어 어느 오행 글인지 추측한다.
 * 제목은 2배로 셈한다. 1등이 2등보다 확실히 많을 때만 인정하고,
 * 비기면 판단을 포기한다 — 엉뚱한 카드에 붙는 것보다 안 붙는 편이 낫다.
 */
function pickByText(title: string, keywords: string[]): OhaengKey | null {
  const t = title || "";
  const k = (keywords || []).join(" ");
  let best: OhaengKey | null = null;
  let bestScore = 0;
  let runnerUp = 0;
  for (const key of OHAENG_KEYS) {
    const ch = OHAENG_HANJA[key];
    const score = countOf(t, ch) * 2 + countOf(k, ch);
    if (score > bestScore) { runnerUp = bestScore; bestScore = score; best = key; }
    else if (score > runnerUp) { runnerUp = score; }
  }
  return bestScore > 0 && bestScore > runnerUp ? best : null;
}

/**
 * 오행별로 연결할 글을 찾아 { wood: "/learn/…" | null, … } 로 돌려준다.
 * 한 오행에 글이 여러 개면 최근 글을 쓴다. 없으면 null → 「더 읽기」 버튼이 나타나지 않는다.
 */
export async function getOhaengLearnLinks(): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {
    wood: null, fire: null, earth: null, metal: null, water: null,
  };
  const supabase = getSupabaseServerClient();
  if (!supabase) return out;

  const { data, error } = await supabase
    .from("learn_posts")
    .select("slug,title,keywords,published_at,created_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return out;

  type Row = { slug: string; title: string | null; keywords: string[] | null };
  const rows = data as Row[];  /* 최근 글이 앞에 오므로, 먼저 채워진 값을 유지하면 최근 글이 남는다 */

  const put = (key: OhaengKey, slug: string) => {
    if (!out[key]) out[key] = `/learn/${slug}`;
  };

  /* ① 키워드 표시 */
  for (const r of rows) {
    const tags = (r.keywords || []).map(norm);
    for (const key of OHAENG_KEYS) {
      if (OHAENG_TAGS[key].some((t) => tags.includes(norm(t)))) put(key, r.slug);
    }
  }
  /* ② 주소 약속 */
  for (const r of rows) {
    for (const key of OHAENG_KEYS) {
      if (r.slug === OHAENG_SLUGS[key]) put(key, r.slug);
    }
  }
  /* ③ 제목·키워드 자동 인식 */
  for (const r of rows) {
    const key = pickByText(r.title || "", r.keywords || []);
    if (key) put(key, r.slug);
  }
  return out;
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
