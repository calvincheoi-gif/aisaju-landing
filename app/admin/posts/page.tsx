"use client";

import { useEffect, useState, type FormEvent } from "react";

/**
 * 게시 기록 + 게시 후 유입 (2026-10-17)
 * 카드뉴스·릴스·쇼츠·당근처럼 링크를 못 거는 콘텐츠는 "올린 시각" 뒤 몇 시간의 유입으로 효과를 가늠한다.
 * 올릴 때 버튼 한 번 → 아래 표에 "3시간 내 방문·출처·랜딩 조회·1문 1답" 이 자동으로 채워진다.
 */
const STORAGE_KEY = "aisaju_admin_password";
const CH: Record<string, string> = { insta_card: "인스타 카드", insta_reel: "인스타 릴스", youtube: "유튜브 쇼츠", daangn: "당근", kakao: "카톡 채널", blog: "블로그", cafe: "카페", threads: "스레드", facebook: "페이스북" };
type Post = { post_id: string; posted_at: string; channel: string; title: string | null; slug: string | null; visitors: number; by_source: string | null; landing_views: number; asks: number };
const inp = "rounded-sm border border-border bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-600";

export default function AdminPostsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hours, setHours] = useState(3);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [when, setWhen] = useState("");   // 비우면 지금
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load(pw: string, h = hours) {
    try {
      const res = await fetch(`/api/admin/posts?hours=${h}&days=30`, { headers: { "x-admin-password": pw }, cache: "no-store" });
      if (res.status === 401) { setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return; }
      const j = await res.json();
      if (!res.ok) { setAuthed(true); setNotice(j.error + (j.hint ? " — " + j.hint : "")); setPosts([]); return; }
      setPosts(j.posts ?? []); setAuthed(true); setAuthError(null);
    } catch { setAuthError("네트워크 오류가 발생했습니다."); }
  }
  useEffect(() => { const s = sessionStorage.getItem(STORAGE_KEY); if (s) { setPassword(s); load(s); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function login(e: FormEvent) { e.preventDefault(); sessionStorage.setItem(STORAGE_KEY, password); load(password); }

  async function add(channel: string) {
    setBusy(channel); setNotice(null);
    try {
      const res = await fetch("/api/admin/posts", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ channel, title: title || null, slug: slug || null, posted_at: when ? new Date(when).toISOString() : null }) });
      const j = await res.json();
      if (!res.ok) { setNotice("기록 실패: " + (j.error ?? res.status)); return; }
      setNotice(`${CH[channel]} 게시 기록됨 — ${hours}시간 뒤부터 유입이 채워집니다.`); setTitle(""); setSlug(""); setWhen("");
      await load(password);
    } finally { setBusy(null); }
  }
  async function remove(id: string) {
    if (!confirm("이 게시 기록을 지울까요?")) return;
    await fetch("/api/admin/posts", { method: "DELETE", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ id }) });
    await load(password);
  }
  const fmt = (s: string) => new Date(s).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-[20px] font-bold">게시 기록 · 게시 후 유입</h1>
        <form onSubmit={login} className="mt-5 space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="관리자 비밀번호" className={inp + " w-full py-2.5"} autoFocus />
          {authError && <p className="text-[13px] text-red-600">{authError}</p>}
          <button className="btn-primary w-full" type="submit">들어가기</button>
        </form>
      </main>
    );
  }

  const tot = posts.reduce((a, p) => ({ v: a.v + p.visitors, l: a.l + p.landing_views, q: a.q + p.asks }), { v: 0, l: 0, q: 0 });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-[22px] font-bold">게시 기록 · 게시 후 유입</h1>
      <p className="mt-1 text-[13px] text-body">콘텐츠를 올린 직후 버튼 한 번. 그 뒤 <b>{hours}시간</b> 안에 들어온 외부 방문을 그 게시물 효과로 봅니다(겹치는 시간대는 양쪽에 셉니다 — 비교용).</p>

      <section className="mt-6 rounded-md border border-border bg-bg-alt p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_180px_190px]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="회차·주제 (선택) 예: 오행 ep12 · 퇴사 고민" className={inp} maxLength={120} />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="연결 랜딩 slug (선택) 예: quit" className={inp} maxLength={60} />
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inp} title="비우면 지금 시각" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(CH).map(([k, label]) => (
            <button key={k} type="button" disabled={!!busy} onClick={() => add(k)}
              className="rounded-pill border border-indigo-600 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50">
              {busy === k ? "기록 중…" : `＋ ${label} 게시`}
            </button>
          ))}
        </div>
        {notice && <p className="mt-2 text-[13px] text-body">{notice}</p>}
      </section>

      <div className="mt-6 flex items-center gap-3 text-[13px]">
        <span className="text-body">집계 창</span>
        {[1, 3, 6, 12, 24].map((h) => (
          <button key={h} type="button" onClick={() => { setHours(h); load(password, h); }}
            className={`rounded-pill px-3 py-1 font-semibold ${h === hours ? "bg-indigo-600 text-white" : "bg-white text-body shadow-1"}`}>{h}시간</button>
        ))}
        <span className="ml-auto text-body">최근 30일 합계 — 방문 {tot.v} · 랜딩 조회 {tot.l} · 1문 1답 {tot.q}</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-border text-left text-[12px] text-body">
            <th className="py-2 pr-3">게시 시각</th><th className="pr-3">채널</th><th className="pr-3">주제 · 랜딩</th><th className="pr-3 text-right">방문</th><th className="pr-3">출처</th><th className="pr-3 text-right">랜딩 조회</th><th className="pr-3 text-right">1문 1답</th><th></th>
          </tr></thead>
          <tbody>
            {posts.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-body">아직 기록이 없습니다. 위 버튼으로 첫 게시를 기록해 보세요.</td></tr>}
            {posts.map((p) => (
              <tr key={p.post_id} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">{fmt(p.posted_at)}</td>
                <td className="pr-3 whitespace-nowrap font-semibold">{CH[p.channel] || p.channel}</td>
                <td className="pr-3">{p.title || <span className="text-body">—</span>}{p.slug && <a className="ml-1 text-indigo-600 underline" href={`/q/${p.slug}`} target="_blank" rel="noopener">/q/{p.slug}</a>}</td>
                <td className={`pr-3 text-right font-bold ${p.visitors ? "text-ink-900" : "text-body"}`}>{p.visitors}</td>
                <td className="pr-3 text-[12px] text-body">{p.by_source || "—"}</td>
                <td className="pr-3 text-right">{p.landing_views}</td>
                <td className="pr-3 text-right">{p.asks}</td>
                <td><button type="button" onClick={() => remove(p.post_id)} className="text-[12px] text-red-600">삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-[12px] leading-relaxed text-body">
        · 출처 표기: <code>utm:</code> 링크 꼬리표 · <code>app:</code> 인스타/카톡 등 앱 안에서 열림 · <code>ref:</code> 검색·다른 사이트 · <code>direct</code> 그 외<br />
        · 링크 없는 콘텐츠 끝에는 짧은 주소를 넣어 주세요: 인스타 <b>aisajulab.com/i</b> · 쇼츠 <b>/y</b> · 당근 <b>/d</b> · 명함 <b>/c</b> · 카톡 <b>/k</b> · 블로그 <b>/b</b>
      </p>
    </main>
  );
}
