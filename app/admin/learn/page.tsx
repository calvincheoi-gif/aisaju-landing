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

/* 본문 표기법 안내 — 화면에서 바로 보이게 둔다 */
const BODY_HINT = `## 소제목        → 소제목 (목차에 자동으로 잡힙니다)
- 항목           → 점 목록
> 문장           → 강조 인용
※ 문장           → 각주 · 용어 설명
그 외 줄         → 본문 문단

첫 문단에서 질문에 곧바로 답해 주세요.
검색과 AI 인용에 가장 크게 작용합니다.`;

export default function AdminLearnPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("명리학 입문");
  const [emoji, setEmoji] = useState("📖");
  const [keywords, setKeywords] = useState("");
  const [body, setBody] = useState("");
  const [featured, setFeatured] = useState(true);
  const [cards, setCards] = useState<(File | null)[]>([null, null, null, null]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  async function fetchList(pw: string) {
    setLoadingList(true);
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
      setLoadingList(false);
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

  function resetForm() {
    setSlug("");
    setTitle("");
    setDescription("");
    setExcerpt("");
    setKeywords("");
    setBody("");
    setCards([null, null, null, null]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("slug", slug);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("excerpt", excerpt);
      fd.append("category", category);
      fd.append("emoji", emoji);
      fd.append("keywords", keywords);
      fd.append("body", body);
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

  async function remove(id: string, title: string) {
    if (!confirm(`「${title}」 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
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
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-ink-900">읽을거리 관리</h1>
        <a href="/admin" className="text-[13px] text-body hover:text-indigo-600">
          ← 관리자 허브
        </a>
      </div>

      {/* ── 새 글 ── */}
      <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-border bg-white p-6">
        <h2 className="text-[17px] font-bold text-ink-900">새 글 올리기</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>제목 *</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={label}>주소(영문) *</label>
            <input
              className={input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: ilgan → /learn/ilgan"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>검색결과 요약 (80~120자 권장)</label>
          <input
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 글이 답하는 내용을 한 문장으로"
          />
        </div>

        <div className="mt-4">
          <label className={label}>목록 카드 한 줄</label>
          <input className={input} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            <label className={label}>아이콘</label>
            <input className={input} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-[13px] text-ink-900">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              홈에 「이번 주 읽을거리」로 띄우기
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>검색 키워드 (쉼표로 구분)</label>
          <input
            className={input}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="일간, 일간이란, 사주 일간"
          />
        </div>

        <div className="mt-4">
          <label className={label}>카드뉴스 이미지 (최대 4장)</label>
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

        <div className="mt-4">
          <label className={label}>본문 *</label>
          <textarea
            className={`${input} min-h-[280px] font-mono text-[13px] leading-relaxed`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={BODY_HINT}
          />
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-bg-alt px-4 py-3 text-[11.5px] leading-relaxed text-body">
            {BODY_HINT}
          </pre>
        </div>

        {saveError && <p className="mt-4 text-[13px] text-red-600">{saveError}</p>}
        {saveOk && <p className="mt-4 text-[13px] text-indigo-600">올라갔습니다.</p>}

        <button type="submit" className="btn-primary mt-5" disabled={saving}>
          {saving ? "올리는 중…" : "글 올리기"}
        </button>
      </form>

      {/* ── 목록 ── */}
      <div className="mt-10">
        <h2 className="text-[17px] font-bold text-ink-900">
          올라간 글 {loadingList ? "" : `(${posts.length})`}
        </h2>
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

