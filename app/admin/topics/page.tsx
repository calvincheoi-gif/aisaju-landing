"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * 홈 첫 화면 「고민 주제 롤링」 관리 (2026-10-11)
 * 줄 추가·수정·삭제·위아래 이동·게시 켜고 끄기 → 「저장」 한 번에 반영. 홈에는 게시 중인 것만 순서대로 돈다.
 * 비밀번호는 다른 관리자 화면과 같다(세션에 기억).
 */

const STORAGE_KEY = "aisaju_admin_password";
type Text = { category: string; title: string };
type I18n = Partial<Record<"en" | "ja" | "zh" | "fr", Text>>;
type Row = { id?: string; sort: number; category: string; title: string; slug: string; i18n?: I18n; live: boolean };
const LANGS: { k: keyof I18n; name: string }[] = [{ k: "en", name: "English" }, { k: "ja", name: "日本語" }, { k: "zh", name: "中文" }, { k: "fr", name: "Français" }];
type Landing = { slug: string; category: string; title: string };

const inp = "w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-600";

export default function AdminTopicsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [landings, setLandings] = useState<Landing[]>([]);
  const [warn, setWarn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [tr, setTr] = useState<Record<number, boolean>>({});

  async function load(pw: string) {
    try {
      const res = await fetch("/api/admin/topics", { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) { setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return; }
      const j = await res.json();
      if (!res.ok) { setAuthError(j.error ?? "불러오지 못했습니다."); return; }
      setRows(j.topics ?? []); setLandings(j.landings ?? []); setWarn(j.warn ?? null);
      setAuthed(true); setAuthError(null);
    } catch { setAuthError("네트워크 오류가 발생했습니다."); }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) { setPassword(saved); load(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(e: FormEvent) { e.preventDefault(); sessionStorage.setItem(STORAGE_KEY, password); load(password); }

  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => setRows((rs) => { const j = i + d; if (j < 0 || j >= rs.length) return rs; const c = [...rs]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const remove = (i: number) => { if (confirm("이 줄을 지울까요?")) setRows((rs) => rs.filter((_, k) => k !== i)); };
  const add = () => setRows((rs) => [...rs, { sort: rs.length + 1, category: "", title: "", slug: landings[0]?.slug ?? "", i18n: {}, live: true }]);
  const setL = (i: number, l: keyof I18n, patch: Partial<Text>) =>
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, i18n: { ...(r.i18n ?? {}), [l]: { category: "", title: "", ...(r.i18n?.[l] ?? {}), ...patch } } } : r)));
  const missing = (r: Row) => LANGS.filter((l) => !(r.i18n?.[l.k]?.title)).length;

  /* AI 번역 — 한국어 분야·제목을 보내 4개 국어 초안을 받아 칸에 채운다 (저장은 따로) */
  async function translate(i: number) {
    const r = rows[i]; if (!r.category || !r.title) { setNotice("분야와 제목을 먼저 적어 주세요."); return; }
    setTr((t) => ({ ...t, [i]: true })); setNotice(null);
    try {
      const res = await fetch("/api/admin/topics/translate", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ category: r.category, title: r.title }) });
      const j = await res.json();
      if (!res.ok) { setNotice(j.error ?? "번역 실패"); return; }
      setRows((rs) => rs.map((x, k) => (k === i ? { ...x, i18n: j.i18n } : x)));
      setOpen((o) => ({ ...o, [i]: true }));
    } catch { setNotice("네트워크 오류로 번역하지 못했습니다."); }
    finally { setTr((t) => ({ ...t, [i]: false })); }
  }
  const pickLanding = (i: number, slug: string) => {
    const l = landings.find((x) => x.slug === slug);
    set(i, { slug, ...(l && !rows[i].category ? { category: l.category } : {}), ...(l && !rows[i].title ? { title: l.title } : {}) });
  };

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const res = await fetch("/api/admin/topics", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ topics: rows }) });
      const j = await res.json();
      if (!res.ok) { setNotice("저장 실패: " + (j.error ?? res.status)); return; }
      setRows(j.topics ?? rows); setNotice("저장했습니다. 홈에 바로 반영됩니다.");
    } catch { setNotice("네트워크 오류로 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-[20px] font-bold">홈 고민 주제 관리</h1>
        <form onSubmit={login} className="mt-5 space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="관리자 비밀번호" className={inp + " py-2.5"} autoFocus />
          {authError && <p className="text-[13px] text-red-600">{authError}</p>}
          <button className="btn-primary w-full" type="submit">들어가기</button>
        </form>
      </main>
    );
  }

  const liveCount = rows.filter((r) => r.live && r.category && r.title && r.slug).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-[22px] font-bold">홈 고민 주제 롤링</h1>
      <p className="mt-1 text-[13px] text-body">
        홈 첫 화면 제목 아래에 <b>2줄씩</b> 보이며 3초마다 한 줄씩 위로 돕니다. 게시 중 {liveCount}개
        {liveCount < 3 && " — 3개 이상이어야 돌아가고, 2개 이하면 고정으로 보입니다"}.
      </p>
      {warn && <p className="mt-3 rounded-md bg-amber-50 p-3 text-[13px] text-amber-800">{warn}</p>}

      <div className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <div key={r.id ?? `new-${i}`} className={`rounded-md border p-3 ${r.live ? "border-border bg-white" : "border-dashed border-border bg-bg-alt opacity-70"}`}>
            <div className="grid grid-cols-[72px_1fr] gap-2 md:grid-cols-[32px_90px_1fr_190px] md:items-center">
              <div className="flex gap-1 md:flex-col">
                <button type="button" onClick={() => move(i, -1)} className="rounded-sm border border-border px-2 text-[12px]" title="위로">▲</button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-sm border border-border px-2 text-[12px]" title="아래로">▼</button>
              </div>
              <input value={r.category} onChange={(e) => set(i, { category: e.target.value })} placeholder="분야 (연애)" className={inp} maxLength={12} />
              <input value={r.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="홈용 짧은 제목 — 한 줄에 보이게 18자 안팎" className={inp} maxLength={60} />
              <select value={r.slug} onChange={(e) => pickLanding(i, e.target.value)} className={inp}>
                {!landings.some((l) => l.slug === r.slug) && r.slug && <option value={r.slug}>{r.slug} (랜딩 없음)</option>}
                {landings.map((l) => <option key={l.slug} value={l.slug}>/q/{l.slug} · {l.category}</option>)}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
              <label className="flex items-center gap-1.5"><input type="checkbox" checked={r.live} onChange={(e) => set(i, { live: e.target.checked })} /> 홈에 게시</label>
              <span className="text-body">{r.title.length}자 · <a className="underline" href={`/q/${r.slug}`} target="_blank" rel="noopener">랜딩 미리보기</a></span>
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} className={missing(r) ? "font-semibold text-amber-700" : "text-indigo-600"}>
                {open[i] ? "번역 접기 ▴" : missing(r) ? `번역 ${4 - missing(r)}/4 ▾` : "번역 4/4 ▾"}
              </button>
              <button type="button" onClick={() => translate(i)} disabled={!!tr[i]} className="rounded-pill bg-indigo-100 px-2.5 py-0.5 font-semibold text-indigo-600 disabled:opacity-50">{tr[i] ? "번역 중…" : "AI 번역"}</button>
              <button type="button" onClick={() => remove(i)} className="ml-auto text-red-600">삭제</button>
            </div>
            {open[i] && (
              <div className="mt-2 grid gap-1.5 border-t border-border pt-2">
                {LANGS.map((l) => (
                  <div key={l.k} className="grid grid-cols-[64px_90px_1fr] items-center gap-2">
                    <span className="text-[12px] font-semibold text-body">{l.name}</span>
                    <input value={r.i18n?.[l.k]?.category ?? ""} onChange={(e) => setL(i, l.k, { category: e.target.value })} placeholder="분야" className={inp} maxLength={16} />
                    <input value={r.i18n?.[l.k]?.title ?? ""} onChange={(e) => setL(i, l.k, { title: e.target.value })} placeholder="제목 (비우면 한국어가 보입니다)" className={inp} maxLength={80} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={add} className="btn-ghost">＋ 줄 추가</button>
        <button type="button" onClick={save} disabled={saving} className="btn-primary">{saving ? "저장 중…" : "저장 (홈에 반영)"}</button>
        {notice && <span className="text-[13px] text-body">{notice}</span>}
      </div>

      <p className="mt-8 text-[12px] leading-relaxed text-body">
        · 새 고민 랜딩(/q/…)을 늘리려면 <code>lib/worries/data.ts</code>에 추가해야 선택 목록에 뜹니다.<br />
        · 제목이 길면 홈에서 끝이 … 으로 잘립니다. 위 글자 수를 보며 18자 안팎으로 줄여 주세요.<br />
        · 「AI 번역」은 초안입니다. 영어·일어·중국어·프랑스어 칸을 확인한 뒤 「저장」을 눌러야 반영됩니다. 번역이 빈 언어에서는 한국어가 그대로 보입니다.
      </p>
    </main>
  );
}
