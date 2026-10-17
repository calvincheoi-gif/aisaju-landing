"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * 「오늘 한 줄」 관리 (2026-10-17)
 *   · 대기(held): 검사에 걸린 글 — 「승인」하면 홈·/talk 에 바로 보이고, 「숨김」이면 그대로 안 보임
 *   · 게시(ok): 올라간 글 — 문제가 보이면 「숨김」
 *   · 필터: 욕설·광고·개인정보 패턴을 여기서 추가·삭제 (코드 수정 없이). 정규식, 단어 하나면 그냥 단어
 */
const STORAGE_KEY = "aisaju_admin_password";
type Post = { id: string; created_at: string; text: string; nick: string | null; status: string; reason: string | null; device_code: string | null; utm: string | null; app: string | null; admin_note: string | null };
type Filter = { id: string; kind: "abuse" | "ad" | "pii"; pattern: string; note: string | null };
const KIND: Record<string, string> = { abuse: "욕설", ad: "광고", pii: "개인정보" };
const STATUS: Record<string, string> = { held: "승인 대기", ok: "게시 중", hidden: "숨김", all: "전체" };
const inp = "rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-600";

export default function AdminTalkPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<"held" | "ok" | "hidden" | "all">("held");
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ held: 0, ok: 0, hidden: 0 });
  const [filters, setFilters] = useState<Filter[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [fk, setFk] = useState<"abuse" | "ad" | "pii">("ad");
  const [fp, setFp] = useState("");
  const [fn, setFn] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function load(pw: string, t = tab) {
    try {
      const res = await fetch(`/api/admin/talk?status=${t}&limit=200`, { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) { setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return; }
      const j = await res.json();
      if (!res.ok) { setAuthed(true); setNotice(j.error + (j.hint ? " — " + j.hint : "")); setPosts([]); return; }
      setPosts(j.posts ?? []); setCounts(j.counts ?? counts); setFilters(j.filters ?? []); setAuthed(true); setAuthError(null);
    } catch { setAuthError("네트워크 오류가 발생했습니다."); }
  }
  useEffect(() => { const s = sessionStorage.getItem(STORAGE_KEY); if (s) { setPassword(s); load(s); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function login(e: FormEvent) { e.preventDefault(); sessionStorage.setItem(STORAGE_KEY, password); load(password); }
  const hdr = { "Content-Type": "application/json", "x-admin-password": password };

  async function setStatus(id: string, status: "ok" | "hidden") {
    const res = await fetch("/api/admin/talk", { method: "PATCH", headers: hdr, body: JSON.stringify({ id, status }) });
    if (!res.ok) { setNotice("처리 실패"); return; }
    setNotice(status === "ok" ? "승인 — 홈에 바로 보입니다." : "숨김 처리했습니다.");
    await load(password);
  }
  async function remove(id: string) {
    if (!confirm("이 글을 완전히 지울까요? (되돌릴 수 없음)")) return;
    await fetch("/api/admin/talk", { method: "DELETE", headers: hdr, body: JSON.stringify({ id }) });
    await load(password);
  }
  async function addFilter(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/talk", { method: "PUT", headers: hdr, body: JSON.stringify({ filter: { kind: fk, pattern: fp, note: fn } }) });
    const j = await res.json();
    if (!res.ok) { setNotice("필터 추가 실패: " + (j.error ?? res.status)); return; }
    setFp(""); setFn(""); setNotice("필터를 추가했습니다 — 다음 글부터 적용됩니다."); await load(password);
  }
  async function delFilter(id: string) {
    if (!confirm("이 필터를 지울까요?")) return;
    await fetch("/api/admin/talk", { method: "DELETE", headers: hdr, body: JSON.stringify({ filterId: id }) });
    await load(password);
  }
  const fmt = (s: string) => new Date(s).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });
  const reasonLabel = (r: string | null) => (r || "").split(",").filter(Boolean).map((k) => KIND[k] || k).join(" · ");

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-[20px] font-bold">오늘 한 줄 · 승인·필터</h1>
        <form onSubmit={login} className="mt-5 space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="관리자 비밀번호" className={inp + " w-full py-2.5"} autoFocus />
          {authError && <p className="text-[13px] text-red-600">{authError}</p>}
          <button className="btn-primary w-full" type="submit">들어가기</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-[22px] font-bold">오늘 한 줄 · 승인·필터</h1>
      <p className="mt-1 text-[13px] text-body">검사에 걸린 글만 여기서 「승인」하면 됩니다. 안 걸린 글은 이미 홈에 올라가 있고, 문제가 보이면 「숨김」. 홈에는 최신 10개가 돌아가고 <a className="text-indigo-600 underline" href="/talk" target="_blank" rel="noopener">/talk</a> 에 전부 쌓입니다.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
        {(["held", "ok", "hidden", "all"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setTab(t); load(password, t); }}
            className={`rounded-pill px-3 py-1 font-semibold ${t === tab ? "bg-indigo-600 text-white" : "bg-white text-body shadow-1"}`}>
            {STATUS[t]}{t !== "all" && <span className={`ml-1 ${t === "held" && counts.held ? "text-amber-300" : "opacity-70"}`}>{counts[t] ?? 0}</span>}
          </button>
        ))}
        <button type="button" onClick={() => setShowFilters((v) => !v)} className="ml-auto rounded-pill border border-border bg-white px-3 py-1 font-semibold text-body">
          필터 {filters.length}개 {showFilters ? "닫기" : "보기·추가"}
        </button>
      </div>
      {notice && <p className="mt-2 text-[13px] text-indigo-700">{notice}</p>}

      {showFilters && (
        <section className="mt-4 rounded-md border border-border bg-bg-alt p-4">
          <form onSubmit={addFilter} className="grid gap-2 md:grid-cols-[110px_1fr_200px_90px]">
            <select value={fk} onChange={(e) => setFk(e.target.value as Filter["kind"])} className={inp}>
              <option value="abuse">욕설</option><option value="ad">광고</option><option value="pii">개인정보</option>
            </select>
            <input value={fp} onChange={(e) => setFp(e.target.value)} placeholder="패턴 — 단어 하나(예: 도배) 또는 정규식(예: 대출|고수익)" className={inp} required />
            <input value={fn} onChange={(e) => setFn(e.target.value)} placeholder="메모 (선택)" className={inp} />
            <button type="submit" className="btn-primary py-1.5 text-[13px]">추가</button>
          </form>
          <ul className="mt-3 divide-y divide-border/60 text-[12.5px]">
            {filters.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-1.5">
                <span className="w-16 font-semibold">{KIND[f.kind]}</span>
                <code className="flex-1 break-all text-[12px]">{f.pattern}</code>
                <span className="text-body">{f.note}</span>
                <button type="button" onClick={() => delFilter(f.id)} className="text-red-600">삭제</button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-body">대소문자 구분 없음. 글과 닉네임 모두 검사. 지금 올라와 있는 글에는 소급하지 않습니다.</p>
        </section>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-border text-left text-[12px] text-body">
            <th className="py-2 pr-3">시각</th><th className="pr-3">글</th><th className="pr-3">닉네임</th><th className="pr-3">걸린 이유</th><th className="pr-3">유입·앱</th><th className="pr-3">상태</th><th></th>
          </tr></thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-body">{tab === "held" ? "승인 대기 글이 없습니다 👍" : "글이 없습니다."}</td></tr>}
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">{fmt(p.created_at)}</td>
                <td className="pr-3 font-semibold">{p.text}</td>
                <td className="pr-3 whitespace-nowrap">{p.nick || <span className="text-body">익명</span>}</td>
                <td className="pr-3 whitespace-nowrap text-amber-700">{reasonLabel(p.reason) || "—"}</td>
                <td className="pr-3 whitespace-nowrap text-[12px] text-body">{[p.utm, p.app].filter((v) => v && v !== "browser").join(" · ") || "—"}</td>
                <td className="pr-3 whitespace-nowrap">{STATUS[p.status] || p.status}</td>
                <td className="whitespace-nowrap">
                  {p.status !== "ok" && <button type="button" onClick={() => setStatus(p.id, "ok")} className="mr-2 rounded-pill bg-indigo-600 px-3 py-1 text-[12px] font-semibold text-white">승인</button>}
                  {p.status !== "hidden" && <button type="button" onClick={() => setStatus(p.id, "hidden")} className="mr-2 rounded-pill border border-border bg-white px-3 py-1 text-[12px] font-semibold text-body">숨김</button>}
                  <button type="button" onClick={() => remove(p.id)} className="text-[12px] text-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
