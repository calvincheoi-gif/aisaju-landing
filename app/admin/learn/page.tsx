"use client";

import { useEffect, useState, type FormEvent } from "react";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  card_paths: string[];
  read_min: number;
  published: boolean;
  featured: boolean;
  published_at: string;
}

const STORAGE_KEY = "aisaju_admin_password";

/** 카드 한 장의 목표 크기 — 화면에서는 이 정도면 충분하고, 4장을 합쳐도 서버 한도에 걸리지 않는다 */
const MAX_EDGE = 1080;
const JPEG_QUALITY = 0.82;

/**
 * 올리기 전에 브라우저에서 이미지를 줄인다.
 * 폰으로 저장한 카드뉴스는 한 장에 2~4MB인 경우가 많은데,
 * 서버(Netlify)는 한 번에 약 6MB까지만 받는다. 4장이면 그대로 한도를 넘어
 * 요청이 서버에 닿기도 전에 끊기고 「네트워크 오류」로만 보인다.
 * 여기서 긴 변을 1080px로 맞추면 한 장이 대개 200KB 안쪽으로 줄어든다.
 */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file; // 줄지 않으면 원본을 쓴다
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file; // 구형 브라우저 등에서 실패하면 원본 그대로
  }
}

function kb(n: number) {
  return n < 1024 * 1024 ? `${Math.round(n / 1024)}KB` : `${(n / 1024 / 1024).toFixed(1)}MB`;
}

export default function AdminLearnPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [posts, setPosts] = useState<PostRow[]>([]);

  /* 필수 세 가지 */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [cards, setCards] = useState<(File | null)[]>([null, null, null, null]);
  const [cardInfo, setCardInfo] = useState<string[]>(["", "", "", ""]);
  const [shrinking, setShrinking] = useState(false);
  const [featured, setFeatured] = useState(true);

  /* 접어두는 항목 — 비워두면 자동으로 채워진다 */
  const [more, setMore] = useState(false);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");

  const [polishing, setPolishing] = useState(false);
  const [polishMsg, setPolishMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  async function fetchList(pw: string) {
    try {
      const res = await fetch("/api/admin/learn", {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthed(false);
        setAuthError("비밀번호가 올바르지 않습니다.");
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error ?? "목록을 불러오지 못했습니다.");
        return;
      }
      setPosts(json.posts ?? []);
      setAuthed(true);
      setAuthError(null);
    } catch {
      setAuthError("네트워크 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      fetchList(saved);
    }
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    sessionStorage.setItem(STORAGE_KEY, password);
    fetchList(password);
  }

  /* 카드뉴스 캡션을 웹 글로 다시 써 준다 */
  async function polish() {
    setPolishing(true);
    setPolishMsg(null);
    try {
      const res = await fetch("/api/admin/learn/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, raw: body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPolishMsg(json.error ?? "다듬기에 실패했습니다.");
        return;
      }
      if (json.body) setBody(json.body);
      if (json.title && !title) setTitle(json.title);
      if (json.description) setDescription(json.description);
      if (json.excerpt) setExcerpt(json.excerpt);
      if (json.category) setCategory(json.category);
      if (Array.isArray(json.keywords) && json.keywords.length)
        setKeywords(json.keywords.join(", "));
      setPolishMsg("다듬었습니다. 내용을 확인하고 고쳐 주세요.");
    } catch {
      setPolishMsg("네트워크 오류가 발생했습니다.");
    } finally {
      setPolishing(false);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setBody("");
    setSlug("");
    setExcerpt("");
    setCategory("");
    setKeywords("");
    setCards([null, null, null, null]);
    setPolishMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("body", body);
      fd.append("slug", slug);
      fd.append("excerpt", excerpt);
      fd.append("category", category);
      fd.append("keywords", keywords);
      fd.append("featured", featured ? "true" : "false");
      cards.forEach((f, i) => {
        if (f) fd.append(`card${i + 1}`, f);
      });

      const total = cards.reduce((sum, f) => sum + (f?.size ?? 0), 0);
      if (total > 4.5 * 1024 * 1024) {
        setSaveError(
          `이미지 용량이 ${kb(total)}로 너무 큽니다. 장수를 줄이거나 더 작은 이미지를 써 주세요.`
        );
        return;
      }

      const res = await fetch("/api/admin/learn", { method: "POST", body: fd });
      if (!res.ok && res.status === 413) {
        setSaveError("이미지 용량이 너무 큽니다. 장수를 줄여서 다시 시도해 주세요.");
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? "저장에 실패했습니다.");
        return;
      }
      setSaveOk(true);
      resetForm();
      fetchList(password);
    } catch {
      setSaveError(
        "전송에 실패했습니다. 이미지 용량이 크거나 연결이 끊겼을 수 있습니다. 장수를 줄여 다시 시도해 주세요."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, field: "published" | "featured", value: boolean) {
    await fetch("/api/admin/learn", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id, [field]: value }),
    });
    fetchList(password);
  }

  async function remove(id: string, t: string) {
    if (!confirm(`「${t}」 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch("/api/admin/learn", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    fetchList(password);
  }

  const input =
    "mt-1 w-full rounded-md border border-border px-3 py-2 text-[14px] outline-none focus:border-indigo-600";
  const label = "text-[12.5px] font-semibold text-ink-900";

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-[24px] font-bold text-ink-900">읽을거리 관리</h1>
        <form onSubmit={handleLogin} className="mt-6">
          <label className={label}>관리자 비밀번호</label>
          <input
            type="password"
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {authError && <p className="mt-2 text-[13px] text-red-600">{authError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full" disabled={checking}>
            {checking ? "확인 중…" : "들어가기"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-ink-900">읽을거리 관리</h1>
        <a href="/admin" className="text-[13px] text-body hover:text-indigo-600">
          ← 관리자 허브
        </a>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-border bg-white p-6">
        <h2 className="text-[17px] font-bold text-ink-900">새 글 올리기</h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">
          인스타 카드뉴스 캡션을 아래 본문에 그대로 붙여넣고 <b>「AI로 다듬기」</b>를 누르면
          제목·요약·키워드까지 한 번에 채워집니다.
        </p>

        {/* ── 1. 본문(캡션) ── */}
        <div className="mt-6">
          <label className={label}>① 카드뉴스 캡션 붙여넣기 *</label>
          <textarea
            className={`${input} min-h-[220px] leading-relaxed`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"인스타그램에 올린 캡션을 그대로 붙여넣으세요.\n해시태그가 섞여 있어도 괜찮습니다."}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={polish}
              disabled={polishing || body.trim().length < 30}
              className="rounded-pill bg-indigo-100 px-4 py-2 text-[13px] font-semibold text-indigo-600 disabled:opacity-40"
            >
              {polishing ? "다듬는 중…" : "✨ AI로 다듬기"}
            </button>
            {polishMsg && <span className="text-[12.5px] text-body">{polishMsg}</span>}
          </div>
        </div>

        {/* ── 2. 제목 · 요약 ── */}
        <div className="mt-6">
          <label className={label}>② 제목 *</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className={label}>③ 검색결과 요약</label>
          <input
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="비워두면 본문 첫 문단을 씁니다"
          />
        </div>

        {/* ── 3. 카드 이미지 ── */}
        <div className="mt-4">
          <label className={label}>④ 카드뉴스 이미지 (최대 4장)</label>
          <p className="mt-0.5 text-[11.5px] text-body">
            올리기 전에 자동으로 줄입니다. 큰 사진도 그대로 고르시면 됩니다.
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
              <input
                type="file"
                accept="image/*"
                className="w-full text-[11.5px]"
                onChange={async (e) => {
                  const raw = e.target.files?.[0] ?? null;
                  if (!raw) {
                    const nc = [...cards]; nc[i] = null; setCards(nc);
                    const ni = [...cardInfo]; ni[i] = ""; setCardInfo(ni);
                    return;
                  }
                  setShrinking(true);
                  const small = await shrinkImage(raw);
                  const nc = [...cards]; nc[i] = small; setCards(nc);
                  const ni = [...cardInfo];
                  ni[i] = raw.size === small.size ? kb(small.size) : `${kb(raw.size)} → ${kb(small.size)}`;
                  setCardInfo(ni);
                  setShrinking(false);
                }}
              />
              {cardInfo[i] && (
                <p className="mt-0.5 text-[10.5px] text-body/70">{cardInfo[i]}</p>
              )}
              </div>
            ))}
          </div>
          {shrinking && <p className="mt-1 text-[12px] text-indigo-600">이미지 줄이는 중…</p>}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-2 text-[13px] text-ink-900">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          홈에 「이번 주 읽을거리」로 띄우기
        </label>

        {/* ── 접어두는 항목 ── */}
        <button
          type="button"
          onClick={() => setMore(!more)}
          className="mt-5 text-[12.5px] font-semibold text-body hover:text-indigo-600"
        >
          {more ? "▾" : "▸"} 자세히 설정 (비워두면 자동으로 채워집니다)
        </button>

        {more && (
          <div className="mt-3 space-y-4 rounded-md bg-bg-alt p-4">
            <div>
              <label className={label}>주소(영문)</label>
              <input
                className={input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="예: ilgan → aisajulab.com/learn/ilgan"
              />
            </div>
            <div>
              <label className={label}>목록 카드 한 줄</label>
              <input
                className={input}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>분류</label>
                <input
                  className={input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="명리학 입문"
                />
              </div>
              <div>
                <label className={label}>검색 키워드 (쉼표로 구분)</label>
                <input
                  className={input}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-[11.5px] leading-relaxed text-body">
{`본문 표기법 — 직접 쓰실 때만 참고하세요
## 소제목   → 소제목 (목차 자동)
- 항목      → 점 목록
> 문장      → 강조
※ 문장      → 각주
그 외 줄    → 본문 문단`}
            </pre>
          </div>
        )}

        {saveError && <p className="mt-4 text-[13px] text-red-600">{saveError}</p>}
        {saveOk && <p className="mt-4 text-[13px] text-indigo-600">올라갔습니다.</p>}

        <button
          type="submit"
          className="btn-primary mt-6"
          disabled={saving || shrinking || !title.trim() || !body.trim()}
        >
          {saving ? "올리는 중…" : "글 올리기"}
        </button>
      </form>

      {/* ── 목록 ── */}
      <div className="mt-10">
        <h2 className="text-[17px] font-bold text-ink-900">올라간 글 ({posts.length})</h2>
        <div className="mt-4 space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white px-4 py-3"
            >
              <span className="text-[20px]">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-bold text-ink-900">{p.title}</p>
                <p className="text-[11.5px] text-body">
                  /learn/{p.slug} · {p.category} · {p.published_at} · 카드{" "}
                  {p.card_paths?.length ?? 0}장
                </p>
              </div>
              <label className="flex items-center gap-1.5 text-[12px] text-body">
                <input
                  type="checkbox"
                  checked={p.published}
                  onChange={(e) => toggle(p.id, "published", e.target.checked)}
                />
                공개
              </label>
              <label className="flex items-center gap-1.5 text-[12px] text-body">
                <input
                  type="checkbox"
                  checked={p.featured}
                  onChange={(e) => toggle(p.id, "featured", e.target.checked)}
                />
                홈 노출
              </label>
              <button
                type="button"
                onClick={() => remove(p.id, p.title)}
                className="text-[12px] text-red-600 hover:underline"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

