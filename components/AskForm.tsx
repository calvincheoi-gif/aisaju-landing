"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";

/**
 * 선착순 Daily 3명 무료 1문 1답 신청서 (2026-10-04)
 *
 * 홈 첫 화면의 「질문 보내고 무료 답 받기」가 여기로 온다.
 * 입력은 최소(이름·생년월일시·연락처·질문 한 줄)로 두고, 교환 조건은 두 가지뿐이다.
 *   ① 카카오톡 채널 추가 — 답을 받는 통로이자 재방문 고리
 *   ② 짧은 후기 한 줄 동의 — 신뢰 자산을 쌓는 유일한 길
 * 정원 확인·저장은 /api/ask → DB 함수가 한다. 화면은 결과만 보여 준다.
 *
 * 상담 위저드(ConsultWizard)와 섞지 않은 이유: 저쪽은 결제·등급·접수번호 흐름이 길다.
 * 무료 1문 1답은 "30초 안에 보내기"가 목적이라 따로 가볍게 둔다.
 */

const CAP = 3;
const Q_MAX = 300;

const inputClass =
  "w-full rounded-xl border border-[#DCE7F8] bg-white px-3.5 py-3 text-[15px] text-[#16233F] outline-none focus:border-[#3B6CF5] focus:ring-2 focus:ring-[#3B6CF5]/15";
const labelClass = "mb-1.5 block text-[13px] font-bold text-[#334155]";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Status = { cap: number; used: number; remaining: number; live?: boolean };

function readTracking() {
  if (typeof window === "undefined") return { utm: null as string | null, referrer: null as string | null, deviceCode: null as string | null };
  const qs = new URLSearchParams(window.location.search);
  const paramUtm = qs.get("utm");
  if (paramUtm) { try { window.localStorage.setItem("sp_utm", paramUtm); } catch {} }
  let savedUtm: string | null = null;
  try { savedUtm = window.localStorage.getItem("sp_utm"); } catch {}
  const m = document.cookie.match(/(?:^|; )sp_device=([^;]*)/);
  return { utm: paramUtm || savedUtm || null, referrer: document.referrer || null, deviceCode: m ? decodeURIComponent(m[1]) : null };
}

export default function AskForm() {
  const [status, setStatus] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [birth, setBirth] = useState("");          // YYYY-MM-DD
  const [hour, setHour] = useState("");            // "" = 모름
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [kakaoAgree, setKakaoAgree] = useState(true);
  const [reviewAgree, setReviewAgree] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ refNo: string; remaining: number } | null>(null);

  useEffect(() => {
    fetch("/api/ask", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d))
      .catch(() => setStatus({ cap: CAP, used: 0, remaining: CAP, live: false }));
  }, []);

  const full = status ? status.remaining <= 0 : false;

  const birthInfo = useMemo(() => {
    if (!birth) return "";
    const h = hour === "" ? "시간 모름" : `${hour.padStart(2, "0")}시`;
    return `${birth} ${h} (${calendar === "solar" ? "양력" : "음력"}, ${gender === "female" ? "여" : "남"})`;
  }, [birth, hour, calendar, gender]);

  const canSend = !!name.trim() && !!birth && !!contact.trim() && question.trim().length >= 5 && kakaoAgree && !full && !sending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true); setErr(null);
    try {
      const t = readTracking();
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), gender, birthInfo, contact: contact.trim(), question: question.trim(), kakaoAgree, reviewAgree, ...t }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.saved) {
        setDone({ refNo: d.refNo, remaining: d.remaining ?? 0 });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (d.reason === "full") {
        setStatus((s) => (s ? { ...s, remaining: 0, used: s.cap } : { cap: CAP, used: CAP, remaining: 0 }));
        setErr("아쉽게도 오늘 자리가 방금 마감되었습니다. 내일 다시 열립니다.");
      } else if (d.reason === "too_long") {
        setErr(`질문은 ${Q_MAX}자 안으로 적어 주세요.`);
      } else {
        setErr("잠시 후 다시 시도해 주세요. 계속 안 되면 카카오톡 채널로 질문을 보내 주셔도 됩니다.");
      }
    } catch {
      setErr("네트워크가 불안정합니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  }

  /* ── 접수 완료 ── */
  if (done) {
    return (
      <div className="mx-auto max-w-[430px] rounded-2xl border border-[#DCE7F8] bg-white p-6 text-center shadow-[0_6px_20px_rgba(18,34,74,.06)]">
        <div className="text-[13px] font-extrabold tracking-wide text-[#3B6CF5]">접수되었습니다</div>
        <h2 className="mt-2 text-[22px] font-black leading-snug text-[#12224A]">질문 잘 받았습니다.<br />24시간 안에 답을 보내 드립니다.</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#64748B]">
          접수번호 <b className="text-[#12224A]">{done.refNo}</b><br />
          답(폰으로 보는 1장 리포트)은 <b>카카오톡 채널</b>로 보내 드려요.
        </p>
        <a
          href={siteConfig.channels.kakaoChannelAdd}
          target="_blank" rel="noopener"
          className="mt-5 flex h-[52px] items-center justify-center rounded-2xl bg-[#FEE500] text-[16px] font-black text-[#191919] shadow-[0_8px_18px_rgba(254,229,0,.35)]"
        >
          카카오톡 채널 추가하고 답 받기 ›
        </a>
        <p className="mt-3 text-[12px] leading-relaxed text-[#64748B]">
          채널을 추가한 뒤 대화창에 접수번호 <b>{done.refNo}</b>를 보내 주시면 바로 확인됩니다.
        </p>
        <a href="/" className="mt-5 inline-block text-[13px] font-bold text-[#3B6CF5]">홈으로 돌아가기</a>
      </div>
    );
  }

  /* ── 신청서 ── */
  return (
    <form onSubmit={submit} className="mx-auto max-w-[430px]">
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="rounded-full border-[1.5px] border-[#12224A] bg-white px-3 py-1 text-[12px] font-bold text-[#12224A]">선착순 Daily {CAP}명 무료</span>
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold text-white ${full ? "bg-[#94A3B8]" : "bg-[#E8542E]"}`}>
          {status ? (full ? "오늘 마감 · 내일 다시" : `오늘 남은 자리 ${status.remaining}/${status.cap}`) : "자리 확인 중…"}
        </span>
      </div>

      {full && (
        <div className="mb-4 rounded-xl border border-[#F3D9D2] bg-[#FFF7F5] p-4 text-center text-[13px] leading-relaxed text-[#7C2D12]">
          오늘 {CAP}명이 모두 찼습니다. 내일 다시 열립니다.<br />
          기다리기 어려우시면 <a className="font-bold underline" href="/consult?mode=simple&item=reportOnly&utm=ask_full">개인 종합 리포트 9,900원</a>으로 바로 받으실 수 있어요.
        </div>
      )}

      <div className="rounded-2xl border border-[#DCE7F8] bg-white p-5 shadow-[0_6px_20px_rgba(18,34,74,.06)]">
        <label className={labelClass} htmlFor="q">지금 가장 궁금한 것 한 가지</label>
        <textarea
          id="q" value={question} onChange={(e) => setQuestion(e.target.value.slice(0, Q_MAX))}
          rows={3} className={inputClass + " resize-none"}
          placeholder="예) 내년에 이직해도 괜찮을까요? / 지금 시작하려는 가게, 시기가 맞나요?"
          disabled={full}
        />
        <div className="mt-1 text-right text-[11px] text-[#94A3B8]">{question.length}/{Q_MAX}</div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label className={labelClass} htmlFor="nm">이름 또는 별명</label>
            <input id="nm" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="홍길동" disabled={full} />
          </div>
          <div>
            <label className={labelClass}>성별</label>
            <div className="flex h-[48px] overflow-hidden rounded-xl border border-[#DCE7F8]">
              {(["female", "male"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)} disabled={full}
                  className={`px-4 text-[14px] font-bold ${gender === g ? "bg-[#12224A] text-white" : "bg-white text-[#64748B]"}`}>
                  {g === "female" ? "여" : "남"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="bd">생년월일</label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input id="bd" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className={inputClass} max="2026-12-31" min="1930-01-01" disabled={full} />
            <div className="flex overflow-hidden rounded-xl border border-[#DCE7F8]">
              {(["solar", "lunar"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setCalendar(c)} disabled={full}
                  className={`px-3 text-[13px] font-bold ${calendar === c ? "bg-[#3B6CF5] text-white" : "bg-white text-[#64748B]"}`}>
                  {c === "solar" ? "양력" : "음력"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="hr">태어난 시</label>
          <select id="hr" value={hour} onChange={(e) => setHour(e.target.value)} className={inputClass} disabled={full}>
            <option value="">모름 (몰라도 진행됩니다)</option>
            {HOURS.map((h) => <option key={h} value={String(h)}>{h}시 ~ {h}시 59분</option>)}
          </select>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="ct">카카오톡 이름 또는 휴대폰 번호</label>
          <input id="ct" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} placeholder="답을 보낼 때 확인하는 용도로만 씁니다" disabled={full} />
        </div>

        <div className="mt-5 space-y-2.5 rounded-xl bg-[#F5F9FF] p-3.5">
          <label className="flex items-start gap-2.5 text-[13px] leading-snug text-[#334155]">
            <input type="checkbox" checked={kakaoAgree} onChange={(e) => setKakaoAgree(e.target.checked)} className="mt-0.5 h-4 w-4" disabled={full} />
            <span><b>카카오톡 채널 추가</b>로 답을 받겠습니다. (무료 조건 ①)</span>
          </label>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug text-[#334155]">
            <input type="checkbox" checked={reviewAgree} onChange={(e) => setReviewAgree(e.target.checked)} className="mt-0.5 h-4 w-4" disabled={full} />
            <span>답을 받은 뒤 <b>짧은 후기 한 줄</b>을 남기겠습니다. (무료 조건 ②, 별명으로 게시)</span>
          </label>
        </div>

        {err && <div className="mt-3 rounded-lg bg-[#FFF7F5] p-3 text-[13px] text-[#B42318]">{err}</div>}

        <button
          type="submit" disabled={!canSend}
          className="mt-5 h-[54px] w-full rounded-2xl text-[17px] font-black text-white shadow-[0_10px_22px_rgba(59,108,245,.30)] disabled:opacity-45"
          style={{ background: "linear-gradient(180deg,#6896FF 0%,#3B6CF5 100%)" }}
        >
          {sending ? "보내는 중…" : full ? "오늘 마감" : "질문 보내기 ›"}
        </button>
        <p className="mt-3 text-center text-[11.5px] leading-relaxed text-[#94A3B8]">
          입력하신 정보는 답을 드리는 데만 쓰고 공개하지 않습니다.<br />
          답은 명리학에 기반한 참고 의견이며 결과를 보장하지 않습니다.
        </p>
      </div>
    </form>
  );
}
