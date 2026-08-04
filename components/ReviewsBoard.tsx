"use client";

import { useState, type FormEvent } from "react";
import { useT } from "./LanguageProvider";
import type { Review } from "@/lib/reviews";

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";

/** 후기가 이 개수 이상 쌓이기 전까지는 후기 유도 배너를 노출합니다. */
const REVIEW_INCENTIVE_THRESHOLD = 10;

export default function ReviewsBoard({ initialReviews }: { initialReviews: Review[] }) {
  const { t } = useT();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: json.error ?? t.reviews.errorMsg });
        return;
      }
      setReviews((prev) => [
        { id: crypto.randomUUID(), name, content, rating: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
      setName("");
      setContent("");
      setShowForm(false);
      setNotice({ type: "ok", text: t.reviews.successMsg });
    } catch {
      setNotice({ type: "error", text: t.reviews.errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="mb-8 text-center">
        <span className="eyebrow">{t.reviews.eyebrow}</span>
        <h2 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-ink-900">{t.reviews.title}</h2>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center">
          <button type="button" className="btn-ghost !py-2 !px-4 !text-[13px]" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t.reviews.cancelBtn : t.reviews.writeBtn}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-6 space-y-3">
            <input
              className={inputClass}
              placeholder={t.reviews.nameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              className={inputClass}
              rows={3}
              placeholder={t.reviews.contentPlaceholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? t.reviews.submitting : t.reviews.submitBtn}
            </button>
          </form>
        )}

        {notice && (
          <p className={`mb-4 text-center text-[13px] ${notice.type === "ok" ? "text-green-600" : "text-red-600"}`}>
            {notice.text}
          </p>
        )}

        {reviews.length < REVIEW_INCENTIVE_THRESHOLD && (
          <div className="mb-4 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3 text-center shadow-[0_0_0_4px_rgba(251,191,36,0.12)]">
            <p className="text-[14px] font-bold leading-relaxed text-amber-700">{t.reviews.incentive}</p>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-[13px] text-body">{t.reviews.empty}</p>
        ) : (
          <div className="space-y-2">
            {reviews.slice(0, 3).map((r) => (
              <p key={r.id} className="truncate rounded-md bg-bg-alt px-4 py-2.5 text-[13px] text-ink-700">
                <span className="font-semibold text-indigo-600">{r.name}</span> · {r.content}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
