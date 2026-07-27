"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { QnaPost } from "@/lib/qna";

const STORAGE_KEY = "aisaju_admin_password";

export default function AdminQnaPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [posts, setPosts] = useState<QnaPost[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function fetchList(pw: string) {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/qna", { headers: { "x-admin-password": pw }, cache: "no-store" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setAuthError(null);
    sessionStorage.setItem(STORAGE_KEY, password);
    fetchList(password);
  }

  async function handleReply(id: string) {
    const reply = drafts[id]?.trim();
    if (!reply) return;
    setSavingId(id);
    await fetch(`/api/admin/qna/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ reply }),
    });
    setSavingId(null);
    fetchList(password);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 질문을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch(`/api/admin/qna/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    fetchList(password);
  }

  if (!authed) {
    return (
      <main className="section max-w-sm">
        <h1 className="mb-6 text-[22px] font-bold text-ink-900">Q&A 관리자</h1>
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

  return (
    <main className="section max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink-900">Q&A 관리자</h1>
        <Link href="/admin" className="text-[13px] text-body underline">
          ← 관리자 허브
        </Link>
      </div>

      <p className="mb-4 text-[13px] text-body">
        전체 질문 ({posts.length}) {loadingList && "· 불러오는 중..."}
      </p>

      <div className="flex flex-col gap-4">
        {posts.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{p.title}</p>
                <p className="mt-0.5 text-[12px] text-body">{p.name}</p>
              </div>
              <button onClick={() => handleDelete(p.id, p.title)} className="btn-ghost !px-3 !py-1.5 text-[12px] text-red-600">
                삭제
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-body">{p.content}</p>

            {p.reply ? (
              <div className="mt-3 rounded-md bg-bg-alt p-3 text-[13px] leading-relaxed text-ink-700">
                <span className="mb-1 block text-[11px] font-semibold text-indigo-600">답변완료</span>
                {p.reply}
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full rounded-sm border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-indigo-600"
                  rows={2}
                  placeholder="답변을 입력하세요"
                  value={drafts[p.id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                />
                <button
                  onClick={() => handleReply(p.id)}
                  disabled={savingId === p.id}
                  className="btn-primary !py-2 !px-4 text-[13px]"
                >
                  {savingId === p.id ? "저장 중..." : "답변 등록"}
                </button>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && !loadingList && <p className="text-[13px] text-body">등록된 질문이 없습니다.</p>}
      </div>
    </main>
  );
}
