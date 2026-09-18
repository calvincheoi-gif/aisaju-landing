"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * 오행 결과 평가 — 결과 화면의 「이 결과, 얼마나 맞나요?」 별점을 유형별로 본다.
 * 평균이 낮은 유형이 위로 온다. 그 유형부터 문구를 손질하고, 한 달 뒤 다시 본다.
 */
const STORAGE_KEY = "aisaju_admin_password";

interface TypeStat {
  type: string;
  count: number;
  avg: number;
  dist: [number, number, number, number, number];
  reasons: Record<string, number>;
  notes: { score: number; note: string; at: string }[];
}
interface Summary {
  total: number;
  avg: number;
  reasons: Record<string, number>;
  types: TypeStat[];
  recentNotes: { type: string; score: number; note: string; at: string }[];
}

/* 앱의 이유 키 → 사람이 읽는 말 (public/ohaeng/index.html 의 RATE_R 과 짝) */
const REASON_LABEL: Record<string, string> = {
  diff: "성격이 나와 달라요",
  vague: "누구에게나 맞는 말 같아요",
  q: "질문이 애매했어요",
  name: "유형 이름·표현이 안 와닿아요",
  design: "카드 디자인이 별로예요",
  advice: "조언·보완 기운이 와닿지 않아요",
};
function ReasonBars({ reasons }: { reasons: Record<string, number> }) {
  const rows = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) return null;
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <ul className="space-y-1">
      {rows.map(([k, n]) => (
        <li key={k} className="flex items-center gap-2 text-[12.5px]">
          <span className="w-44 shrink-0 text-body">{REASON_LABEL[k] ?? k}</span>
          <span className="h-2 rounded-sm bg-red-300" style={{ width: `${(n / max) * 120}px` }} />
          <span className="text-ink-900">{n}</span>
        </li>
      ))}
    </ul>
  );
}

function stars(n: number) {
  return "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
}
function fmt(at: string) {
  const d = new Date(at);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminRatingsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function load(pw: string) {
    try {
      const res = await fetch("/api/admin/ratings", { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        setAuthError("비밀번호가 올바르지 않습니다.");
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error ?? "불러오지 못했습니다.");
        return;
      }
      setData(json);
      setAuthed(true);
      setAuthError(null);
    } catch {
      setAuthError("네트워크 오류");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      load(saved);
    }
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    sessionStorage.setItem(STORAGE_KEY, password);
    load(password);
  }

  const input =
    "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-400";
  const label = "text-[12.5px] font-semibold text-ink-900";

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-[24px] font-bold text-ink-900">오행 결과 평가</h1>
        <form onSubmit={handleLogin} className="mt-6">
          <label className={label}>관리자 비밀번호</label>
          <input type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {authError && <p className="mt-2 text-[13px] text-red-600">{authError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full" disabled={checking}>
            {checking ? "확인 중…" : "들어가기"}
          </button>
        </form>
      </main>
    );
  }

  const withCount = data?.types.filter((t) => t.count > 0) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-ink-900">오행 결과 평가</h1>
        <button onClick={() => load(password)} className="text-[13px] text-body hover:text-indigo-600">
          새로고침
        </button>
      </div>
      <p className="mt-2 text-[13.5px] text-body">
        결과 화면의 「이 결과, 얼마나 맞나요?」 별점입니다. 평균이 낮은 유형이 위에 옵니다 — 그 유형 문구부터 손질하시면 됩니다.
      </p>

      {/* 전체 요약 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-white p-4">
          <div className="text-[12px] text-body">응답 수</div>
          <div className="text-[26px] font-bold text-ink-900">{data?.total ?? 0}</div>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <div className="text-[12px] text-body">전체 평균</div>
          <div className="text-[26px] font-bold text-ink-900">
            {data?.avg ?? 0} <span className="text-[14px] text-amber-500">{stars(data?.avg ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* 낮은 점수의 이유 — 어느 부분을 손볼지 */}
      {data && Object.keys(data.reasons).length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-white p-4">
          <div className="mb-2 text-[12.5px] font-semibold text-ink-900">3점 이하가 고른 이유 (전체)</div>
          <ReasonBars reasons={data.reasons} />
        </div>
      )}

      {/* 유형별 표 */}
      <div className="mt-8 rounded-lg border border-border bg-white">
        <div className="grid grid-cols-[1fr_60px_70px_120px] gap-2 border-b border-border px-4 py-2 text-[12px] font-semibold text-body">
          <div>유형</div>
          <div className="text-right">응답</div>
          <div className="text-right">평균</div>
          <div>별점 분포 (1→5)</div>
        </div>
        {withCount.length === 0 && (
          <div className="px-4 py-8 text-center text-[13.5px] text-body">아직 응답이 없습니다. 결과 화면에서 별을 누르면 여기에 쌓입니다.</div>
        )}
        {withCount.map((t) => {
          const max = Math.max(1, ...t.dist);
          const isOpen = open === t.type;
          return (
            <div key={t.type} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : t.type)}
                className="grid w-full grid-cols-[1fr_60px_70px_120px] items-center gap-2 px-4 py-2.5 text-left text-[13.5px] hover:bg-bg-alt"
              >
                <div className="font-medium text-ink-900">{t.type}</div>
                <div className="text-right text-body">{t.count}</div>
                <div className={`text-right font-semibold ${t.avg < 3.5 ? "text-red-600" : t.avg < 4.2 ? "text-amber-600" : "text-emerald-600"}`}>
                  {t.avg}
                </div>
                <div className="flex items-end gap-[3px]" aria-label="분포">
                  {t.dist.map((n, i) => (
                    <div key={i} className="w-4 rounded-sm bg-indigo-200" style={{ height: `${4 + (n / max) * 16}px` }} title={`${i + 1}점 ${n}명`} />
                  ))}
                </div>
              </button>
              {isOpen && (
                <div className="bg-bg-alt px-4 py-3 text-[13px] text-body">
                  {Object.keys(t.reasons).length > 0 && (
                    <div className="mb-3">
                      <div className="mb-1 text-[12px] font-semibold text-ink-900">이 유형의 낮은 점수 이유</div>
                      <ReasonBars reasons={t.reasons} />
                    </div>
                  )}
                  {t.notes.length === 0 ? (
                    <div>남긴 한마디가 아직 없습니다.</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {t.notes.map((n, i) => (
                        <li key={i}>
                          <span className="text-amber-500">{stars(n.score)}</span> {n.note}
                          <span className="ml-2 text-[11.5px] text-body/70">{fmt(n.at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 최근 한마디 */}
      {data && data.recentNotes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[16px] font-bold text-ink-900">최근 한마디</h2>
          <ul className="mt-3 space-y-2 rounded-lg border border-border bg-white p-4 text-[13.5px]">
            {data.recentNotes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-amber-500">{stars(n.score)}</span>
                <span className="shrink-0 font-medium text-ink-900">{n.type}</span>
                <span className="text-body">{n.note}</span>
                <span className="ml-auto shrink-0 text-[11.5px] text-body/70">{fmt(n.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
