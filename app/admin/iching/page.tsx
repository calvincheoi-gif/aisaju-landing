"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * 오늘의 주역 한 줄 — 관리자 검수 화면.
 * 흐름: 뼈대(엔진이 고른 괘·효) → 16:00 예약 작업이 문장 초안 → 여기서 손보고 승인 → 그날 공개.
 * 승인하지 않은 날은 사이트에 나가지 않는다.
 */
const STORAGE_KEY = "aisaju_admin_password";
const OHAENG = ["木", "火", "土", "金", "水"] as const;
const WEEK = "일월화수목금토";

interface Line { pos: number; name: string; yang: boolean; dangwi: boolean; jung: boolean; eung: boolean; text_classic: string }
interface Selection {
  dayGanji: string; monthGanji: string; isJeolip: boolean; energyState: string; tone: string; reason: string; engineVersion: string;
  hexagram: { no: number; hanja: string; ko: string; full_ko: string; full_hanja: string; upper: string; lower: string; bits: string; meaning: string; action_kw: string; judgment_classic: string };
  line: Line;
}
interface Row {
  date: string; status: "draft" | "approved" | "hidden";
  energy_text: string | null; hexagram_text: string | null; line_text: string | null; action_text: string | null;
  ohaeng_tips: Record<string, string> | null; question_text: string | null; review_note: string | null; approved_at: string | null;
}
interface Item { date: string; selection: Selection; row: Row | null; mismatch: boolean }
type Draft = Omit<Row, "date" | "status" | "approved_at" | "ohaeng_tips"> & { ohaeng_tips: Record<string, string> };

function kstToday() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}
function weekday(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
function toDraft(r: Row | null): Draft {
  return {
    energy_text: r?.energy_text ?? "", hexagram_text: r?.hexagram_text ?? "", line_text: r?.line_text ?? "",
    action_text: r?.action_text ?? "", question_text: r?.question_text ?? "", review_note: r?.review_note ?? "",
    ohaeng_tips: { ...(r?.ohaeng_tips ?? {}) },
  };
}

const STATUS_LABEL: Record<string, string> = { draft: "초안", approved: "승인", hidden: "숨김" };
const STATUS_CLASS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", hidden: "bg-gray-200 text-gray-600",
};

/** ③ 괘 구조 — 위에서부터 上→初, 핵심 효 강조 */
function HexagramFigure({ bits, core }: { bits: string; core: number }) {
  return (
    <div className="flex w-24 flex-col gap-[5px]" aria-label="괘 구조">
      {[5, 4, 3, 2, 1, 0].map((i) => {
        const yang = bits[i] === "1";
        const color = i + 1 === core ? "bg-red-500" : "bg-ink-900";
        return (
          <div key={i} className="flex h-[9px] items-center gap-2">
            {yang ? <div className={`h-full flex-1 rounded-sm ${color}`} /> : (
              <>
                <div className={`h-full flex-1 rounded-sm ${color}`} />
                <div className={`h-full flex-1 rounded-sm ${color}`} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminIchingPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [from, setFrom] = useState(kstToday());
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(pw: string, start = from) {
    try {
      const res = await fetch(`/api/admin/iching?from=${start}&days=7`, { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return;
      }
      const json = await res.json();
      if (!res.ok) { setAuthError(json.error ?? "불러오지 못했습니다."); return; }
      setItems(json.items); setNotice(json.notice); setAuthed(true); setAuthError(null);
    } catch {
      setAuthError("네트워크 오류");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) { setPassword(saved); load(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault(); setChecking(true); sessionStorage.setItem(STORAGE_KEY, password); load(password);
  }

  async function call(method: "POST" | "PATCH", body: object) {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/iching", {
        method, headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setMsg(json.error ?? "실패했습니다."); return null; }
      return json;
    } catch {
      setMsg("네트워크 오류"); return null;
    } finally {
      setBusy(false);
    }
  }

  async function makeSkeleton() {
    const json = await call("POST", { action: "skeleton", from, days: 30 });
    if (json) { setMsg(`뼈대 ${json.created}일 새로 만듦 (요청 ${json.requested}일, 이미 있는 날은 그대로)`); load(password); }
  }

  async function save(date: string, status?: Row["status"]) {
    if (!draft) return;
    const json = await call("PATCH", { date, ...draft, ...(status ? { status } : {}) });
    if (json) { setMsg(status ? `${date} ${STATUS_LABEL[status]} 처리했습니다.` : `${date} 저장했습니다.`); load(password); }
  }

  function toggle(it: Item) {
    if (open === it.date) { setOpen(null); setDraft(null); return; }
    setOpen(it.date); setDraft(toDraft(it.row)); setMsg(null);
  }

  function shift(n: number) {
    const [y, m, d] = from.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
    setFrom(next); setOpen(null); load(password, next);
  }

  const input = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-400";
  const label = "text-[12.5px] font-semibold text-ink-900";

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-[24px] font-bold text-ink-900">오늘의 주역 한 줄</h1>
        <form onSubmit={handleLogin} className="mt-6">
          <label className={label}>관리자 비밀번호</label>
          <input type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {authError && <p className="mt-2 text-[13px] text-red-600">{authError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full" disabled={checking}>{checking ? "확인 중…" : "들어가기"}</button>
        </form>
      </main>
    );
  }

  const field = (key: keyof Omit<Draft, "ohaeng_tips">, title: string, rows = 2) => (
    <div>
      <label className={label}>{title}</label>
      <textarea rows={rows} className={input} value={draft?.[key] ?? ""}
        onChange={(e) => setDraft((d) => (d ? { ...d, [key]: e.target.value } : d))} />
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-ink-900">오늘의 주역 한 줄</h1>
        <button onClick={() => load(password)} className="text-[13px] text-body hover:text-indigo-600">새로고침</button>
      </div>
      <p className="mt-2 text-[13.5px] text-body">
        엔진이 고른 괘·효를 확인하고 문장을 손본 뒤 <b>승인</b>하세요. 승인한 날만 그날 사이트에 나갑니다.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
        <button onClick={() => shift(-7)} className="rounded-md border border-border bg-white px-3 py-1.5">← 이전 7일</button>
        <span className="font-semibold text-ink-900">{from} ~</span>
        <button onClick={() => shift(7)} className="rounded-md border border-border bg-white px-3 py-1.5">다음 7일 →</button>
        <button onClick={makeSkeleton} disabled={busy} className="ml-auto rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white disabled:opacity-50">
          {from}부터 30일 뼈대 만들기
        </button>
      </div>
      {msg && <p className="mt-3 rounded-md bg-bg-alt px-3 py-2 text-[13px] text-ink-900">{msg}</p>}

      <div className="mt-6 space-y-3">
        {items.map((it) => {
          const s = it.selection;
          const st = it.row?.status;
          const isOpen = open === it.date;
          return (
            <div key={it.date} className="rounded-lg border border-border bg-white">
              <button type="button" onClick={() => toggle(it)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-bg-alt">
                <HexagramFigure bits={s.hexagram.bits} core={s.line.pos} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-body">
                    <span className="font-semibold text-ink-900">{it.date} ({weekday(it.date)})</span>
                    <span>{s.dayGanji}일 · {s.monthGanji}월</span>
                    {s.isJeolip && <span className="rounded bg-indigo-100 px-1.5 text-indigo-700">절입일</span>}
                    <span className={`rounded px-1.5 ${st ? STATUS_CLASS[st] : "bg-gray-100 text-gray-500"}`}>{st ? STATUS_LABEL[st] : "뼈대 없음"}</span>
                    {it.mismatch && <span className="rounded bg-red-100 px-1.5 text-red-700">엔진 결과와 다름</span>}
                  </div>
                  <div className="mt-1 text-[16px] font-bold text-ink-900">
                    {s.hexagram.no}. {s.hexagram.full_hanja} <span className="font-medium">{s.hexagram.full_ko}</span>
                    <span className="ml-2 text-[14px] text-red-600">{s.line.name}</span>
                  </div>
                  <div className="text-[12.5px] text-body">{s.hexagram.meaning} · {s.energyState} {s.tone}</div>
                  {it.row?.action_text && <div className="mt-1 truncate text-[13px] text-ink-900">⑤ {it.row.action_text}</div>}
                </div>
              </button>

              {isOpen && draft && (
                <div className="space-y-3 border-t border-border bg-bg-alt px-4 py-4">
                  <div className="text-[12px] text-body">
                    선정 근거: {s.reason} · 엔진 {s.engineVersion}<br />
                    괘사 원문: {s.hexagram.judgment_classic || "(미입력)"} · {s.line.name} 효사 원문: {s.line.text_classic || "(미입력)"}<br />
                    효 성격: {s.line.yang ? "양효" : "음효"} · {s.line.dangwi ? "당위" : "부당위"}{s.line.jung ? " · 득중" : ""}{s.line.eung ? " · 응" : ""}
                  </div>
                  {!it.row && <p className="text-[13px] text-red-600">이 날은 뼈대가 없습니다. 위의 「30일 뼈대 만들기」를 먼저 누르세요.</p>}
                  {field("energy_text", "① 오늘의 간지와 기운")}
                  {field("hexagram_text", "② 오늘의 괘 풀이")}
                  {field("line_text", "④ 오늘의 핵심 효 풀이")}
                  {field("action_text", "⑤ 행동 지침 (한 문장, 승인 필수)", 1)}
                  <div>
                    <label className={label}>⑥ 오행별 활용법</label>
                    {OHAENG.map((k) => (
                      <div key={k} className="mt-1 flex items-center gap-2">
                        <span className="w-6 text-center font-semibold text-ink-900">{k}</span>
                        <input className={`${input} mt-0`} value={draft.ohaeng_tips[k] ?? ""}
                          onChange={(e) => setDraft((d) => (d ? { ...d, ohaeng_tips: { ...d.ohaeng_tips, [k]: e.target.value } } : d))} />
                      </div>
                    ))}
                  </div>
                  {field("question_text", "⑦ 성찰 질문", 1)}
                  {field("review_note", "검수 메모 (공개 안 됨)", 1)}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button disabled={busy || !it.row} onClick={() => save(it.date)} className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] disabled:opacity-50">저장</button>
                    <button disabled={busy || !it.row} onClick={() => save(it.date, "approved")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50">저장하고 승인</button>
                    <button disabled={busy || !it.row} onClick={() => save(it.date, "draft")} className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] disabled:opacity-50">초안으로 되돌리기</button>
                    <button disabled={busy || !it.row} onClick={() => save(it.date, "hidden")} className="rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-gray-600 disabled:opacity-50">숨김</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {notice && (
        <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-[12.5px] text-body">
          <div className="mb-1 font-semibold text-ink-900">공개 화면 하단 안내문</div>
          {notice}
        </div>
      )}
    </main>
  );
}
