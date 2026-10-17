"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { appName, inboundChannel, track } from "@/lib/worries/links";
import { talkAgo, TALK_DAILY_LIMIT, TALK_MAX_LEN, TALK_NICK_MAX, type TalkItem } from "@/lib/talk";

/**
 * /talk — 「오늘 한 줄」 작성 + 전체 누적 목록 (2026-10-17)
 *   · 위: 40자 한 줄 + 닉네임(선택) + 「남기기」. 로그인·연락처 없음, 같은 기기 하루 3개
 *   · 아래: 게시된 글 전부(최신순), 「더 보기」로 30개씩
 *   · 검사에 걸린 글은 그 자리에 "관리자 승인 후 표시됩니다" 안내 (글은 저장돼 있고 /admin/talk 에서 승인)
 * 첫 30개는 서버(page.tsx)가 넣어 준다 — 열자마자 보인다.
 */
type Saved = { status: "ok" | "held"; text: string; nick: string };

function deviceCode(): string | null {
  try {
    const ls = window.localStorage;
    let v = ls.getItem("aisaju_vid");
    if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); ls.setItem("aisaju_vid", v); }
    return v;
  } catch { return null; }
}

const REASON: Record<string, string> = {
  limit: `하루에 ${TALK_DAILY_LIMIT}개까지 남길 수 있어요. 내일 또 들러 주세요.`,
  too_long: `${TALK_MAX_LEN}자 안에서 적어 주세요.`,
  missing: "한 줄을 적어 주세요.",
  no_db: "지금은 저장할 수 없어요. 잠시 뒤 다시 시도해 주세요.",
  db: "저장 중 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.",
};

export default function TalkBoard({ initial, total: initialTotal }: { initial: TalkItem[]; total: number }) {
  const [text, setText] = useState("");
  const [nick, setNick] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [items, setItems] = useState<TalkItem[]>(initial);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { track("talk_view"); setNow(Date.now()); try { setNick(localStorage.getItem("aisaju_talk_nick") || ""); } catch {} }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.replace(/\s+/g, " ").trim();
    if (!t) { setErr(REASON.missing); return; }
    if (t.length > TALK_MAX_LEN) { setErr(REASON.too_long); return; }
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/talk", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t, nick: nick.trim() || null, deviceCode: deviceCode(), utm: inboundChannel(), app: appName() }) });
      const j = await res.json();
      if (!res.ok || !j.saved) { setErr(REASON[j.reason as string] || REASON.db); return; }
      try { localStorage.setItem("aisaju_talk_nick", nick.trim()); } catch {}
      track("talk_submit", { status: j.status, reason: j.reason || null, len: t.length });
      const n = nick.trim() || "익명";
      setSaved({ status: j.status, text: t, nick: n });
      if (j.status === "ok") { setItems((cur) => [{ id: j.id, created_at: new Date().toISOString(), text: t, nick: n }, ...cur]); setTotal((c) => c + 1); }
      setText("");
    } catch { setErr(REASON.db); } finally { setBusy(false); }
  }

  async function more() {
    setLoading(true);
    try {
      const res = await fetch(`/api/talk?offset=${items.length}&limit=30`, { cache: "no-store" });
      const j = await res.json();
      setItems((cur) => [...cur, ...((j.items as TalkItem[]) || []).filter((x) => !cur.some((c) => c.id === x.id))]);
      setTotal(j.total ?? total);
    } finally { setLoading(false); }
  }

  const left = TALK_MAX_LEN - text.length;
  const inp = "w-full rounded-lg border border-[#D6DEF0] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-[#2563EB]";

  return (
    <div className="mx-auto w-full max-w-md">
      {/* ── 작성 ── */}
      <form onSubmit={submit} className="rounded-2xl border border-[#D6DEF0] bg-[#F3F6FD] p-4">
        <label className="block text-[13px] font-bold text-[#12224A]">
          💬 오늘 한 줄 <span className="font-medium text-[#64748B]">— 지금 마음, 바라는 것, 한마디 응원. 뭐든 좋아요</span>
        </label>
        <input ref={inputRef} value={text} onChange={(e) => { setText(e.target.value.slice(0, TALK_MAX_LEN)); setErr(null); }}
          placeholder="예) 오늘은 면접 보는 날, 잘 되길!" maxLength={TALK_MAX_LEN} className={inp + " mt-2"} autoComplete="off" enterKeyHint="send" />
        <div className="mt-2 flex items-center gap-2">
          <input value={nick} onChange={(e) => setNick(e.target.value.slice(0, TALK_NICK_MAX))} placeholder="닉네임 (선택)" maxLength={TALK_NICK_MAX}
            className="w-[128px] rounded-lg border border-[#D6DEF0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2563EB]" autoComplete="off" />
          <span className={`ml-auto text-[12px] ${left <= 5 ? "text-red-600" : "text-[#64748B]"}`}>{text.length}/{TALK_MAX_LEN}</span>
          <button type="submit" disabled={busy || !text.trim()}
            className="rounded-full bg-[#2563EB] px-5 py-2 text-[14px] font-extrabold text-white disabled:opacity-40">{busy ? "남기는 중…" : "남기기"}</button>
        </div>
        {err && <p className="mt-2 text-[13px] font-semibold text-red-600">{err}</p>}
        {saved && saved.status === "ok" && (
          <p className="mt-2 text-[13px] font-semibold text-[#1D4ED8]">남겼어요! 홈 첫 화면에도 바로 올라갑니다 🙌</p>
        )}
        {saved && saved.status === "held" && (
          <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] leading-snug text-amber-900">
            <b>이 글엔 광고·개인정보·욕설 등으로 보이는 표현이 있어 관리자 승인 후 표시됩니다.</b><br />
            <span className="text-amber-800">글은 저장됐어요. 전화번호·링크·거친 말을 빼고 다시 남기면 바로 올라갑니다.</span>
          </div>
        )}
        <p className="mt-2 text-[11.5px] text-[#64748B]">로그인·연락처 없이 남길 수 있어요 · 하루 {TALK_DAILY_LIMIT}개까지 · 광고·개인정보·욕설은 자동으로 가려집니다</p>
      </form>

      {/* ── 누적 목록 ── */}
      <div className="mt-6 flex items-baseline justify-between">
        <h2 className="text-[15px] font-black text-[#12224A]">모두의 한 줄 <span className="ml-1 text-[12px] font-bold text-[#64748B]">{total}개</span></h2>
        <a href="/" className="text-[12px] font-bold text-[#2563EB]">홈으로 ›</a>
      </div>
      <ul className="mt-2 divide-y divide-[#E6ECF7] rounded-2xl border border-[#E6ECF7] bg-white">
        {items.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-[#64748B]">아직 한 줄도 없어요. 첫 한 줄을 남겨 보세요.</li>}
        {items.map((t) => (
          <li key={t.id} className="flex items-start gap-2.5 px-4 py-3">
            <span className="mt-0.5 text-[13px]">💬</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold leading-snug tracking-[-0.02em] text-[#12224A]">{t.text}</span>
              <span className="mt-0.5 block text-[11.5px] text-[#64748B]">{t.nick} · {talkAgo(t.created_at, now)}</span>
            </span>
          </li>
        ))}
      </ul>
      {items.length < total && (
        <button type="button" onClick={more} disabled={loading}
          className="mt-3 w-full rounded-full border border-[#D6DEF0] bg-white py-2.5 text-[13px] font-bold text-[#12224A] disabled:opacity-50">
          {loading ? "불러오는 중…" : `더 보기 (${total - items.length}개 더)`}
        </button>
      )}
    </div>
  );
}
