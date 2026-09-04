"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const STORAGE_KEY = "aisaju_admin_password";

interface AdminReview {
  id: string;
  name: string;
  content: string;
  rating: number | null;
  is_published: boolean;
  created_at: string;
}

/**
 * 후기 승인 화면.
 *
 * 홈의 후기 폼으로 들어온 글은 전부 「대기」 상태로 저장된다.
 * 여기서 「게시」로 바꾼 것만 홈페이지 후기 섹션에 나타난다.
 */
export default function AdminReviewsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function fetchList(pw: string) {
    setLoadingList(true);
    try {
      const res = await fetch("/api/reviews", { headers: { "x-admin-password": pw }, cache: "no-store" });
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
      setReviews(json.reviews ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setAuthError(null);
    sessionStorage.setItem(STORAGE_KEY, password);
    fetchList(password);
  }

  async function togglePublish(r: AdminReview) {
    setSavingId(r.id);
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: r.id, is_published: !r.is_published }),
    });
    setSavingId(null);
    fetchList(password);
  }

  async function handleDelete(r: AdminReview) {
    if (!confirm(`${r.name}님의 후기를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch(`/api/reviews?id=${encodeURIComponent(r.id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    fetchList(password);
  }

  if (!authed) {
    return (
      <main className="section max-w-sm">
        <h1 className="mb-6 text-[22px] font-bold text-ink-900">후기 관리자</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border px-4 py-3 text-[14px]"
            autoFocus
          />
          <button type="submit" disabled={checking} className="btn-primary">
            {checking ? "확인 중..." : "확인"}
          </button>
          {authError && <p className="text-[13px] text-red-600">{authError}</p>}
        </form>
      </main>
    );
  }

  const waiting = reviews.filter((r) => !r.is_published);
  const live = reviews.filter((r) => r.is_published);

  const card = (r: AdminReview) => (
    <div key={r.id} className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-ink-900">
            {r.name}
            {r.rating ? <span className="ml-2 text-amber-500">{"★".repeat(r.rating)}</span> : null}
          </p>
          <p className="mt-0.5 text-[12px] text-body">{(r.created_at || "").slice(0, 10)}</p>
        </div>
        <button
          onClick={() => handleDelete(r)}
          className="btn-ghost !px-3 !py-1.5 text-[12px] text-red-600"
        >
          삭제
        </button>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-body">{r.content}</p>

      <button
        onClick={() => togglePublish(r)}
        disabled={savingId === r.id}
        className={r.is_published ? "btn-ghost mt-3 !py-2 !px-4 text-[13px]" : "btn-primary mt-3 !py-2 !px-4 text-[13px]"}
      >
        {savingId === r.id ? "저장 중..." : r.is_published ? "홈에서 내리기" : "홈에 게시하기"}
      </button>
    </div>
  );

  return (
    <main className="section max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink-900">후기 관리자</h1>
        <Link href="/admin" className="text-[13px] text-body underline">
          ← 관리자 허브
        </Link>
      </div>

      <p className="mb-6 rounded-lg bg-bg-alt px-4 py-3 text-[13px] leading-relaxed text-body">
        홈 후기 폼으로 들어온 글은 전부 <b>대기</b> 상태로 저장됩니다. <b>「홈에 게시하기」</b>를 누른 후기만
        홈페이지에 나타납니다. {loadingList && "· 불러오는 중..."}
      </p>

      <h2 className="mb-3 text-[15px] font-bold text-ink-900">
        확인 대기 <span className="text-red-600">{waiting.length}</span>
      </h2>
      <div className="mb-10 flex flex-col gap-4">
        {waiting.map(card)}
        {waiting.length === 0 && !loadingList && (
          <p className="text-[13px] text-body">대기 중인 후기가 없습니다.</p>
        )}
      </div>

      <h2 className="mb-3 text-[15px] font-bold text-ink-900">홈에 게시 중 {live.length}</h2>
      <div className="flex flex-col gap-4">
        {live.map(card)}
        {live.length === 0 && !loadingList && (
          <p className="text-[13px] text-body">아직 게시된 후기가 없습니다. 게시된 후기가 없으면 홈에는 기존 예시 후기가 표시됩니다.</p>
        )}
      </div>
    </main>
  );
}
