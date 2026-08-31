import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "learn";

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // 비밀번호 미설정 시 항상 거부(안전 기본값)
  return provided === expected;
}

function noAdmin() {
  return NextResponse.json(
    { error: "Supabase 관리자 설정이 완료되지 않았습니다 (SUPABASE_SERVICE_ROLE_KEY 확인 필요)." },
    { status: 503 }
  );
}

/** 슬러그 정리 — 영문 소문자·숫자·하이픈만 남긴다 */
function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 관리자용: 모든 글 목록 (비공개 포함) */
export async function GET(req: Request) {
  if (!checkPassword(req.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) return noAdmin();

  const { data, error } = await supabase
    .from("learn_posts")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

/** 관리자용: 글 등록. 카드 이미지는 최대 4장까지 함께 올린다. */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const password = form.get("password");
  if (!checkPassword(typeof password === "string" ? password : null)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim() : "";
  };

  const title = str("title");
  const body = str("body");
  if (!title) return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  if (!body) return NextResponse.json({ error: "본문을 입력해 주세요." }, { status: 400 });

  const slug = normalizeSlug(str("slug") || title);
  if (!slug) {
    return NextResponse.json(
      { error: "주소(slug)를 영문으로 입력해 주세요. 예: ilgan" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return noAdmin();

  const { data: dup } = await supabase
    .from("learn_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (dup) {
    return NextResponse.json(
      { error: `이미 같은 주소(${slug})의 글이 있습니다. 다른 주소를 써 주세요.` },
      { status: 409 }
    );
  }

  const id = crypto.randomUUID();

  /* 카드 이미지 업로드 — 실패한 장은 건너뛰고 나머지는 살린다 */
  const cardPaths: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const file = form.get(`card${i}`);
    if (!(file instanceof File) || file.size === 0) continue;
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `cards/${id}-${i}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: file.type || "image/jpeg", upsert: false });
    if (!error) cardPaths.push(path);
  }

  const keywords = str("keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const readMinRaw = Number(str("readMin"));
  const readMin =
    Number.isFinite(readMinRaw) && readMinRaw > 0
      ? Math.round(readMinRaw)
      : Math.max(2, Math.round(body.replace(/\s/g, "").length / 500));

  const { data, error } = await supabase
    .from("learn_posts")
    .insert({
      id,
      slug,
      title,
      description: str("description") || title,
      excerpt: str("excerpt") || str("description") || title,
      category: str("category") || "명리학 입문",
      emoji: str("emoji") || "📖",
      body,
      card_paths: cardPaths,
      keywords,
      read_min: readMin,
      published: str("published") !== "false",
      featured: str("featured") === "true",
      published_at: str("publishedAt") || new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: `저장 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ post: data });
}

/** 관리자용: 공개 여부·대표글 토글 */
export async function PATCH(req: Request) {
  let json: { password?: string; id?: string; published?: boolean; featured?: boolean };
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }
  if (!checkPassword(json.password ?? null)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  if (!json.id) return NextResponse.json({ error: "대상이 없습니다." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return noAdmin();

  const patch: Record<string, boolean> = {};
  if (typeof json.published === "boolean") patch.published = json.published;
  if (typeof json.featured === "boolean") patch.featured = json.featured;
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "변경할 내용이 없습니다." }, { status: 400 });
  }

  const { error } = await supabase.from("learn_posts").update(patch).eq("id", json.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** 관리자용: 글 삭제 */
export async function DELETE(req: Request) {
  let json: { password?: string; id?: string };
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }
  if (!checkPassword(json.password ?? null)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  if (!json.id) return NextResponse.json({ error: "대상이 없습니다." }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return noAdmin();

  /* 이미지도 함께 지운다 — 남겨두면 Storage 가 계속 불어난다 */
  const { data: row } = await supabase
    .from("learn_posts")
    .select("card_paths")
    .eq("id", json.id)
    .maybeSingle();
  const paths = (row?.card_paths as string[] | undefined) ?? [];
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

  const { error } = await supabase.from("learn_posts").delete().eq("id", json.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
