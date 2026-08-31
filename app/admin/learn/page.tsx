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

      const res = await fetch("/api/admin/learn", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? "저장에 실패했습니다.");
        return;
      }
      setSaveOk(true);
      resetForm();
      fetchList(password);
    } catch {
      setSaveError("네트워크 오류가 발생했습니다.");
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
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                type="file"
                accept="image/*"
                className="text-[11.5px]"
                onChange={(e) => {
                  const next = [...cards];
                  next[i] = e.target.files?.[0] ?? null;
                  setCards(next);
                }}
              />
            ))}
          </div>
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
          disabled={saving || !title.trim() || !body.trim()}
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
