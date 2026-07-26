"use client";

import { useEffect, useState, type FormEvent } from "react";

interface CaseRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pdf_path: string;
  thumbnail_path: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

const STORAGE_KEY = "aisaju_admin_password";

export default function AdminCasesPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function fetchList(pw: string) {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/cases", {
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
      setCases(json.cases ?? []);
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

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      setUploadError("PDF 파일을 선택해 주세요.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const form = new FormData();
    form.append("password", password);
    form.append("title", title);
    form.append("subtitle", subtitle);
    form.append("description", description);
    form.append("pdf", pdfFile);
    if (thumbFile) form.append("thumbnail", thumbFile);

    try {
      const res = await fetch("/api/admin/cases", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? "업로드에 실패했습니다.");
        return;
      }
      setUploadSuccess(true);
      setTitle("");
      setSubtitle("");
      setDescription("");
      setPdfFile(null);
      setThumbFile(null);
      (document.getElementById("pdf-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("pdf-input") as HTMLInputElement).value = "");
      (document.getElementById("thumb-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("thumb-input") as HTMLInputElement).value = "");
      fetchList(password);
    } catch {
      setUploadError("네트워크 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  async function togglePublished(row: CaseRow) {
    await fetch(`/api/admin/cases/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ published: !row.published }),
    });
    fetchList(password);
  }

  async function handleDelete(row: CaseRow) {
    if (!confirm(`"${row.title}" 사례를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch(`/api/admin/cases/${row.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    fetchList(password);
  }

  if (!authed) {
    return (
      <main className="section max-w-sm">
        <h1 className="mb-6 text-[22px] font-bold text-ink-900">상담 사례 관리자</h1>
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
      <h1 className="mb-8 text-[22px] font-bold text-ink-900">상담 사례 관리자</h1>

      <section className="card mb-10">
        <h2 className="mb-4 text-[16px] font-bold text-ink-900">새 사례 업로드</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="제목 (예: 60대 전환기, 결실로 이어지는 흐름)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-lg border border-border px-4 py-3 text-[14px]"
          />
          <input
            type="text"
            placeholder="부제 (선택, 예: 넘치는 물이 나무를 키우는 시기)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="rounded-lg border border-border px-4 py-3 text-[14px]"
          />
          <textarea
            placeholder="짧은 설명 (선택, 카드에 2~3줄로 표시됩니다)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-border px-4 py-3 text-[14px]"
          />
          <label className="text-[13px] font-medium text-body">
            PDF 리포트 (필수)
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-[13px]"
            />
          </label>
          <label className="text-[13px] font-medium text-body">
            썸네일 이미지 (선택, 카드 대표 이미지 — 없으면 기본 디자인으로 표시)
            <input
              id="thumb-input"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-[13px]"
            />
          </label>
          <button type="submit" disabled={uploading} className="btn-primary mt-2">
            {uploading ? "업로드 중..." : "업로드"}
          </button>
          {uploadError && <p className="text-[13px] text-red-600">{uploadError}</p>}
          {uploadSuccess && (
            <p className="text-[13px] text-green-600">업로드되었습니다. 사이트에 바로 반영됩니다.</p>
          )}
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-[16px] font-bold text-ink-900">
          등록된 사례 ({cases.length}) {loadingList && "· 불러오는 중..."}
        </h2>
        <div className="flex flex-col gap-3">
          {cases.map((row) => (
            <div key={row.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold text-ink-900">
                  {row.title}{" "}
                  {!row.published && (
                    <span className="ml-2 rounded-pill bg-bg-alt px-2 py-0.5 text-[11px] text-body">
                      비공개
                    </span>
                  )}
                </p>
                {row.subtitle && <p className="text-[12px] text-body">{row.subtitle}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => togglePublished(row)} className="btn-ghost !px-4 !py-2 text-[12px]">
                  {row.published ? "비공개로" : "공개로"}
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="btn-ghost !px-4 !py-2 text-[12px] text-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {cases.length === 0 && !loadingList && (
            <p className="text-[13px] text-body">등록된 사례가 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}

