"use client";

import { useState, type FormEvent } from "react";
import { useT } from "./LanguageProvider";
import type { QnaPost } from "@/lib/qna";

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";

/**
 * 공개 Q&A 게시판. 질문 목록 표시 + 누구나 작성 가능한 질문 등록 폼.
 * 답변은 관리자(/admin/qna)에서만 등록할 수 있습니다.
 */
export default function QnaBoard({ initialPosts }: { initialPosts: QnaPost[] }) {
  const { t } = useT();
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, content }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: json.error ?? t.qnaPage.errorMsg });
        return;
      }
      setPosts((prev) => [
        {
          id: crypto.randomUUID(),
          name,
          title,
          content,
          reply: null,
          replied_at: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setName("");
      setTitle("");
      setContent("");
      setShowForm(false);
      setNotice({ type: "ok", text: t.qnaPage.successMsg });
    } catch {
      setNotice({ type: "error", text: t.qnaPage.errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] text-body">{posts.length}</p>
        <button type="button" className="btn-primary !py-2 !px-4 !text-[13px]" onClick={() => setShowForm((v) => !v)}>
          {showForm ? t.qnaPage.cancelBtn : t.qnaPage.askBtn}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8 space-y-3">
          <input
            className={inputClass}
            placeholder={t.qnaPage.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={inputClass}
            placeholder={t.qnaPage.titleLabel}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className={inputClass}
            rows={4}
            placeholder={t.qnaPage.contentLabel}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? t.qnaPage.submitting : t.qnaPage.submitBtn}
          </button>
        </form>
      )}

      {notice && (
        <p className={`mb-6 text-[13px] ${notice.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {notice.text}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="card text-center text-[14px] text-body">{t.qnaPage.empty}</div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{p.title}</p>
                  <p className="mt-0.5 text-[12px] text-body">{p.name}</p>
                </div>
                <span
                  className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-medium ${
                    p.reply ? "bg-indigo-100 text-indigo-600" : "bg-bg-alt text-body"
                  }`}
                >
                  {p.reply ? t.qnaPage.repliedBadge : t.qnaPage.waitingBadge}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-body">{p.content}</p>
              {p.reply && (
                <div className="mt-3 rounded-md bg-bg-alt p-3 text-[13px] leading-relaxed text-ink-700">
                  {p.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
