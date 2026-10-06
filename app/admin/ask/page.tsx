"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import AskReport from "@/components/AskReport";
import { emptyAnswer, mergeAnswer, missingFields, MODULE_LABEL, type AskAnswer, type AskModule, type AskRow } from "@/lib/ask-report";

/**
 * 무료 1문 1답 — 접수 목록 · 답 작성 · PNG 내보내기 (2026-10-04)
 *
 * 흐름: 목록에서 건 선택 → (선택) AI 초안 → 칸 채우기(오른쪽에 실시간 미리보기) → 저장 → PNG 저장 → 카톡 전송 → 「답변 완료」
 * PNG 는 미리보기 노드를 그대로 2배 해상도(1080px 폭)로 굽는다. 서버 렌더링이 필요 없다.
 */
const STORAGE_KEY = "aisaju_admin_password";
const STATUS_LABEL: Record<AskRow["status"], string> = { received: "접수", answered: "답변 완료", converted: "유료 전환", cancelled: "취소" };
const STATUS_COLOR: Record<AskRow["status"], string> = { received: "bg-amber-100 text-amber-800", answered: "bg-emerald-100 text-emerald-800", converted: "bg-indigo-100 text-indigo-800", cancelled: "bg-gray-100 text-gray-500" };

const input = "w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink-900 outline-none focus:border-indigo-400";
const label = "block text-[11.5px] font-semibold text-body mb-1";

function maskName(n: string) {
  /* 성 + ○○ 로 고정 — 카톡 미리보기 제목이 한 줄에 들어가도록 길이를 일정하게 둔다 */
  const s = (n || "").trim();
  return (s[0] || "") + "○○";
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminAskPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<AskRow[]>([]);
  const [seat, setSeat] = useState<{ cap: number; used: number; remaining: number } | null>(null);
  const [sel, setSel] = useState<AskRow | null>(null);
  const [module, setModule] = useState<AskModule>("none");
  const [a, setA] = useState<AskAnswer>(emptyAnswer());
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AskRow["status"]>("all");
  const previewRef = useRef<HTMLDivElement>(null);
  /* 만든 PNG — 화면에 띄우고 공유·복사·저장에 같이 쓴다 */
  const [png, setPng] = useState<{ blob: Blob; url: string; name: string } | null>(null);

  const H = (pw = password) => ({ "x-admin-password": pw, "Content-Type": "application/json" });

  async function load(pw: string) {
    try {
      const res = await fetch("/api/admin/ask?days=30", { headers: H(pw), cache: "no-store" });
      if (res.status === 401) { setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return; }
      const j = await res.json();
      if (!res.ok) { setAuthError(j.error ?? "불러오지 못했습니다."); return; }
      setRows(j.rows ?? []); setSeat(j.status ?? null); setAuthed(true); setAuthError(null);
    } catch { setAuthError("네트워크 오류"); }
  }
  useEffect(() => { const s = sessionStorage.getItem(STORAGE_KEY); if (s) { setPassword(s); load(s); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  function handleLogin(e: FormEvent) { e.preventDefault(); sessionStorage.setItem(STORAGE_KEY, password); load(password); }

  function pick(r: AskRow) {
    setSel(r);
    setModule(r.module ?? "none");
    const base = mergeAnswer(r.answer);
    /* 저장된 답이 없으면 계산된 명식으로 일간·세운을 미리 채운다 */
    if (!r.answer && r.saju) { base.ilgan = r.saju.dayStemKo; base.seun = r.saju.nextYear; base.timeline.t1 = "지금"; }
    setA(base); setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const miss = useMemo(() => missingFields(a, module), [a, module]);
  const set = (k: keyof AskAnswer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setA((p) => ({ ...p, [k]: e.target.value }));
  const setArr = (k: "chips" | "ans", i: number) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setA((p) => { const arr = [...p[k]] as AskAnswer["chips"]; arr[i] = e.target.value; return { ...p, [k]: arr }; });
  const setSub = <K extends "swot" | "whys" | "timeline">(k: K, f: keyof AskAnswer[K]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setA((p) => ({ ...p, [k]: { ...p[k], [f]: e.target.value } }));

  async function save(status?: AskRow["status"]) {
    if (!sel) return;
    setBusy("save");
    try {
      const res = await fetch("/api/admin/ask", { method: "PATCH", headers: H(), body: JSON.stringify({ id: sel.id, answer: a, module, status }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "저장 실패");
      setMsg(status ? `저장하고 「${STATUS_LABEL[status]}」로 바꿨습니다.` : "저장했습니다. 이제 「링크 복사 → 카톡」 또는 「PDF 저장」을 쓸 수 있습니다.");
      await load(password);
      setSel((s) => (s ? { ...s, answer: a, module, ...(status ? { status } : {}) } : s));
    } catch (e) { setMsg(e instanceof Error ? e.message : "저장 실패"); } finally { setBusy(null); }
  }

  async function draft() {
    if (!sel) return;
    if (!confirm("AI 초안을 만듭니다. Anthropic API 호출 1회(토큰 비용 수십 원)가 발생합니다. 계속할까요?")) return;
    setBusy("draft");
    try {
      const res = await fetch("/api/admin/ask", { method: "POST", headers: H(), body: JSON.stringify({ id: sel.id, action: "draft", module }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "초안 실패");
      setA(mergeAnswer(j.draft)); setMsg("AI 초안을 채웠습니다. 소장님 말로 고쳐 쓰신 뒤 저장하세요.");
    } catch (e) { setMsg(e instanceof Error ? e.message : "초안 실패"); } finally { setBusy(null); }
  }

  /* 1단계: 이미지를 먼저 만들어 둔다 (몇 초 걸림). 공유·복사는 만들어 둔 것을 쓰므로
     버튼을 누른 즉시 실행된다 — 브라우저가 공유·클립보드를 "클릭 직후"에만 허용하기 때문에 두 단계로 나눈다 */
  async function makePng() {
    if (!sel || !previewRef.current) return;
    if (miss.length > 0 && !confirm(`비어 있는 칸이 있습니다: ${miss.join(", ")}\n그대로 이미지를 만들까요?`)) return;
    setBusy("png");
    try {
      const { toBlob } = await import("html-to-image");
      if ("fonts" in document) await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      const blob = await toBlob(previewRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#EEF3FB" });
      if (!blob) throw new Error("이미지를 만들지 못했습니다.");
      setPng({ blob, url: URL.createObjectURL(blob), name: `AI사주랩_1문1답_${sel.ref_no}_${maskName(sel.name)}.png` });
      setMsg(isMobile ? "이미지가 준비됐습니다. 「카톡으로 공유」를 누르세요." : "이미지가 준비됐습니다. 「이미지 복사」 후 카카오톡 PC 대화창에 Ctrl+V 하세요.");
    } catch (e) { setMsg("이미지 생성 실패: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(null); }
  }
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  /* 2단계(폰): 공유 시트 → 카카오톡. 만들어 둔 blob 을 바로 넘긴다 */
  function sharePng() {
    if (!png) return;
    const file = new File([png.blob], png.name, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (!nav.share || (nav.canShare && !nav.canShare({ files: [file] }))) {
      setMsg("이 브라우저는 이미지 공유 창을 열 수 없습니다. PC라면 「이미지 복사」, 폰이라면 크롬·사파리로 열어 주세요."); return;
    }
    nav.share({ files: [file], title: "AI사주랩 1문 1답" })
      .then(() => setMsg("공유 창에서 카카오톡을 고르세요. 보낸 뒤 「답변 완료」를 눌러 주세요."))
      .catch((e: unknown) => { const m = e instanceof Error ? e.name : ""; if (m !== "AbortError") setMsg("공유 창을 열지 못했습니다(" + m + "). 「파일로 저장」 후 갤러리에서 카톡으로 보내 주세요."); });
  }
  /* 2단계(PC): 클립보드에 이미지로 복사 → 카카오톡 PC 대화창에 Ctrl+V. 클릭 직후 동기적으로 호출한다 */
  function copyPng() {
    if (!png) return;
    if (!("clipboard" in navigator) || typeof ClipboardItem === "undefined") {
      setMsg("이 브라우저는 이미지 복사를 지원하지 않습니다. 아래 이미지를 마우스 오른쪽 → 「이미지 복사」로 복사해 주세요."); return;
    }
    navigator.clipboard.write([new ClipboardItem({ "image/png": png.blob })])
      .then(() => setMsg("이미지를 복사했습니다. 카카오톡 PC 대화창을 열고 Ctrl+V → Enter."))
      .catch((e: unknown) => setMsg("복사가 막혔습니다(" + (e instanceof Error ? e.name : "") + "). 아래 이미지를 마우스 오른쪽 → 「이미지 복사」로 복사하거나, 일반 크롬에서 이 화면을 열어 주세요."));
  }
  /* 고객용 링크·PDF — 답을 저장한 뒤에만 열린다 (DB 함수가 answer 가 있는 건만 내준다) */
  const shareUrl = sel?.share_token ? `${typeof window !== "undefined" ? window.location.origin : "https://aisajulab.com"}/r/${sel.share_token}` : "";
  async function copyLink() {
    if (!shareUrl) return;
    if (!sel?.answer) { setMsg("먼저 「저장」을 눌러야 링크가 열립니다."); return; }
    try { await navigator.clipboard.writeText(shareUrl); setMsg("고객용 링크를 복사했습니다. 카톡 대화창에 붙여넣으면 「○○○님의 질문」 미리보기 카드와 함께 전달됩니다."); }
    catch { setMsg("복사가 막혔습니다. 링크: " + shareUrl); }
  }
  function openPdf() {
    if (!shareUrl) return;
    if (!sel?.answer) { setMsg("먼저 「저장」을 눌러야 PDF를 만들 수 있습니다."); return; }
    window.open(shareUrl + "?print=1", "_blank");
    setMsg("새 탭에서 인쇄 창이 뜨면 대상에서 「PDF로 저장」을 고르세요. 저장한 PDF 파일을 카톡으로 보내면 선명하게 전달됩니다.");
  }
  function downloadPng() {
    if (!png) return;
    const a = document.createElement("a"); a.href = png.url; a.download = png.name; a.click();
    setMsg("다운로드 폴더에 저장했습니다 (크롬 오른쪽 위 ↓ 아이콘에서 확인).");
  }
  /* 내용이 바뀌면 만들어 둔 PNG는 버린다 */
  useEffect(() => { if (png) { URL.revokeObjectURL(png.url); setPng(null); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [a, module, sel?.id]);

  const list = rows.filter((r) => filter === "all" || r.status === filter);
  const todayCount = rows.filter((r) => r.status === "received").length;

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-[24px] font-bold text-ink-900">무료 1문 1답</h1>
        <form onSubmit={handleLogin} className="mt-6">
          <label className="text-[12.5px] font-semibold text-ink-900">관리자 비밀번호</label>
          <input type="password" className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] outline-none focus:border-indigo-400" value={password} onChange={(e) => setPassword(e.target.value)} />
          {authError && <p className="mt-2 text-[13px] text-red-600">{authError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full">들어가기</button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-ink-900">무료 1문 1답</h1>
          <p className="mt-1 text-[13px] text-body">오늘 자리 {seat ? `${seat.used}/${seat.cap} 사용 · 남은 자리 ${seat.remaining}` : "—"} · 답변 대기 <b className="text-amber-700">{todayCount}</b>건</p>
        </div>
        <div className="flex gap-2">
          {(["all", "received", "answered", "converted", "cancelled"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-pill px-3 py-1 text-[12.5px] ${filter === k ? "bg-ink-900 text-white" : "bg-white text-body shadow-1"}`}>{k === "all" ? "전체" : STATUS_LABEL[k]}</button>
          ))}
          <button onClick={() => load(password)} className="text-[13px] text-body hover:text-indigo-600">새로고침</button>
        </div>
      </div>

      {/* ── 편집 영역: 왼쪽 입력 / 오른쪽 미리보기 ── */}
      {sel && (
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_560px]">
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[12px] text-body">{sel.ref_no} · {fmtTime(sel.created_at)} · <span className={`rounded px-1.5 py-0.5 ${STATUS_COLOR[sel.status]}`}>{STATUS_LABEL[sel.status]}</span></div>
                <div className="mt-1 text-[16px] font-bold text-ink-900">“{sel.question}”</div>
                <div className="mt-1 text-[12.5px] text-body">{sel.name} · {sel.birth_info} · 연락 {sel.contact} · {sel.kakao_agree ? "카톡 동의" : "카톡 미동의"} / {sel.review_agree ? "후기 동의" : "후기 미동의"}</div>
                {sel.saju && (
                  <div className="mt-1 text-[12.5px] text-ink-900">명식 <b>{sel.saju.pillars.year} {sel.saju.pillars.month} {sel.saju.pillars.day} {sel.saju.pillars.hour ?? "(시 모름)"}</b> · 일간 <b>{sel.saju.dayStemKo}</b> · 올해 {sel.saju.thisYear} · 내년 {sel.saju.nextYear}</div>
                )}
              </div>
              <button onClick={() => setSel(null)} className="text-[12.5px] text-body hover:text-ink-900">닫기 ✕</button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="text-[12.5px] font-semibold text-ink-900">분석 모듈</label>
              <select value={module} onChange={(e) => setModule(e.target.value as AskModule)} className="rounded-md border border-border bg-white px-2 py-1.5 text-[13px]">
                {(Object.keys(MODULE_LABEL) as AskModule[]).map((k) => <option key={k} value={k}>{MODULE_LABEL[k]}</option>)}
              </select>
              <button onClick={draft} disabled={!!busy} className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-[12.5px] font-semibold text-indigo-700 disabled:opacity-50">{busy === "draft" ? "초안 만드는 중…" : "AI 초안 채우기"}</button>
            </div>

            {/* ② 결론 */}
            <fieldset className="mt-5 rounded-md border border-border p-3">
              <legend className="px-1 text-[12px] font-bold text-indigo-700">② 결론부터</legend>
              <label className={label}>한 줄 결론</label>
              <textarea rows={2} className={input} value={a.one} onChange={set("one")} />
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["판단", "시기", "첫 행동"].map((k, i) => (<div key={k}><label className={label}>{k}</label><input className={input} value={a.chips[i]} onChange={setArr("chips", i)} /></div>))}
              </div>
            </fieldset>

            {/* ③ 명식 */}
            <fieldset className="mt-4 rounded-md border border-border p-3">
              <legend className="px-1 text-[12px] font-bold text-indigo-700">③ 근거 1 · 명식</legend>
              <label className={label}>행동 제목 (한 문장 결론)</label>
              <input className={input} value={a.m_action} onChange={set("m_action")} placeholder="예) 丙火가 土를 만나는 해 — 성과가 늦게 보이는 구조입니다" />
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={label}>일간</label><input className={input} value={a.ilgan} onChange={set("ilgan")} />
                  <input className={input} value={a.ilgan_sub} onChange={set("ilgan_sub")} placeholder="별칭 (한여름 햇살)" />
                  <textarea rows={2} className={input} value={a.ilgan_desc} onChange={set("ilgan_desc")} placeholder="20~30자 설명" />
                </div>
                <div className="space-y-1.5">
                  <label className={label}>흐름 (세운)</label><input className={input} value={a.seun} onChange={set("seun")} />
                  <input className={input} value={a.seun_sub} onChange={set("seun_sub")} placeholder="土가 강한 해" />
                  <textarea rows={2} className={input} value={a.seun_desc} onChange={set("seun_desc")} placeholder="20~30자 설명" />
                </div>
              </div>
              <label className={`${label} mt-2`}>이 질문에 명식이 말하는 것</label>
              <textarea rows={2} className={input} value={a.read} onChange={set("read")} />
            </fieldset>

            {/* ④ 모듈 */}
            {module !== "none" && (
              <fieldset className="mt-4 rounded-md border border-border p-3">
                <legend className="px-1 text-[12px] font-bold text-indigo-700">④ 근거 2 · {MODULE_LABEL[module].split(" — ")[0]}</legend>
                <label className={label}>행동 제목</label>
                <input className={input} value={a.mod_action} onChange={set("mod_action")} />
                {module === "swot" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["s", "w", "o", "t"] as const).map((k) => (<div key={k}><label className={label}>{{ s: "S 강점 (사주)", w: "W 약점 (사주)", o: "O 기회 (흐름)", t: "T 위협 (흐름)" }[k]}</label><textarea rows={2} className={input} value={a.swot[k]} onChange={setSub("swot", k)} /></div>))}
                    <div className="col-span-2"><label className={label}>S×O 전략 (한 줄)</label><input className={input} value={a.swot.strategy} onChange={setSub("swot", "strategy")} /></div>
                  </div>
                )}
                {module === "whys" && (
                  <div className="mt-2 space-y-2">
                    {(["w1", "w2", "w3"] as const).map((k, i) => (<div key={k}><label className={label}>왜{i + 1} · {["표면의 고민", "반복되는 행동", "명식의 뿌리"][i]}</label><textarea rows={2} className={input} value={a.whys[k]} onChange={setSub("whys", k)} /></div>))}
                    <div><label className={label}>진짜 원인 (한 줄)</label><input className={input} value={a.whys.root} onChange={setSub("whys", "root")} /></div>
                  </div>
                )}
                {module === "timeline" && (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {(["t1", "t2", "t3"] as const).map((k, i) => (
                        <div key={k} className="space-y-1">
                          <label className={label}>시점 {i + 1}</label>
                          <input className={input} value={a.timeline[k]} onChange={setSub("timeline", k)} />
                          <input className={input} value={a.timeline[`${k}s` as "t1s"]} onChange={setSub("timeline", `${k}s` as "t1s")} placeholder="부제" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div><label className={label}>지금 단계</label>
                        <select className={input} value={a.timeline.stage} onChange={setSub("timeline", "stage")}>{["P", "D", "C", "A"].map((s) => <option key={s}>{s}</option>)}</select></div>
                      <div><label className={label}>단계 설명 (한 줄)</label><input className={input} value={a.timeline.stage_note} onChange={setSub("timeline", "stage_note")} /></div>
                    </div>
                  </div>
                )}
              </fieldset>
            )}

            {/* ⑤ 답 */}
            <fieldset className="mt-4 rounded-md border border-border p-3">
              <legend className="px-1 text-[12px] font-bold text-indigo-700">⑤ 판단 · 소장의 답 세 줄</legend>
              {[0, 1, 2].map((i) => <textarea key={i} rows={2} className={`${input} ${i ? "mt-2" : ""}`} value={a.ans[i]} onChange={setArr("ans", i)} placeholder={`${i + 1}번째 줄`} />)}
            </fieldset>

            {/* ⑥ 시기 */}
            <fieldset className="mt-4 rounded-md border border-border p-3">
              <legend className="px-1 text-[12px] font-bold text-indigo-700">⑥ 시기</legend>
              <label className={label}>행동 제목</label><input className={input} value={a.t_action} onChange={set("t_action")} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div><label className={label}>움직이기 좋은 때</label><textarea rows={3} className={input} value={a.good} onChange={set("good")} /></div>
                <div><label className={label}>서두르지 않을 때</label><textarea rows={3} className={input} value={a.avoid} onChange={set("avoid")} /></div>
              </div>
              <div className="mt-2"><label className={label}>왜 이 시기인가 (세운·월운 근거 · 비우면 숨김)</label><textarea rows={2} className={input} value={a.t_why} onChange={set("t_why")} placeholder="예) 2027년은 丁未로 土가 두터워지는 해입니다. 火를 쓰는 일간에는 申·酉월에 기운이 맞물려…" /></div>
            </fieldset>

            {/* ⑦ 실행 */}
            <fieldset className="mt-4 rounded-md border border-border p-3">
              <legend className="px-1 text-[12px] font-bold text-indigo-700">⑦ 실행</legend>
              <label className={label}>행동 제목</label><input className={input} value={a.a_action} onChange={set("a_action")} />
              {(["today", "week", "month"] as const).map((k) => (<div key={k} className="mt-2"><label className={label}>{{ today: "오늘", week: "이번 주", month: "이번 달" }[k]}</label><textarea rows={2} className={input} value={a[k]} onChange={set(k)} /></div>))}
              <div className="mt-2"><label className={label}>이렇게 확인하세요 (점검 방법 · 비우면 숨김)</label><textarea rows={2} className={input} value={a.a_check} onChange={set("a_check")} placeholder="예) 한 주 뒤 통화 3건 중 2건에서 같은 반응이 나오면 방향이 맞은 것입니다." /></div>
              <div className="mt-2"><label className={label}>이럴 땐 멈추세요 (비우면 숨김)</label><textarea rows={2} className={input} value={a.stop} onChange={set("stop")} /></div>
            </fieldset>

            {/* 저장·내보내기 */}
            <div className="sticky bottom-0 mt-5 -mx-5 -mb-5 flex flex-wrap items-center gap-2 border-t border-border bg-white px-5 py-3">
              <button onClick={() => save()} disabled={!!busy} className="rounded-md border border-border px-3 py-2 text-[13px] font-semibold text-ink-900 disabled:opacity-50">{busy === "save" ? "저장 중…" : "저장"}</button>
              {!png ? (
                <button onClick={makePng} disabled={!!busy} className="btn-primary px-4 py-2 text-[13px] disabled:opacity-50">{busy === "png" ? "이미지 만드는 중…" : "① 이미지 만들기"}</button>
              ) : isMobile ? (
                <>
                  <button onClick={sharePng} className="btn-primary px-4 py-2 text-[13px]">② 카톡으로 공유</button>
                  <button onClick={copyPng} className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-[13px] font-semibold text-indigo-700">이미지 복사</button>
                </>
              ) : (
                <>
                  <button onClick={copyPng} className="btn-primary px-4 py-2 text-[13px]">② 이미지 복사 → 카톡에 Ctrl+V</button>
                  <button onClick={sharePng} className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-[13px] font-semibold text-indigo-700">공유 창</button>
                </>
              )}
              <span style={{ width: 1, height: 22, background: "#DCE4EE" }} />
              <button onClick={copyLink} disabled={!!busy} title="고객이 폰에서 선명하게 보는 웹 페이지 주소" className="rounded-md bg-[#FEE500] px-3 py-2 text-[13px] font-semibold text-[#191919] disabled:opacity-50">링크 복사 → 카톡</button>
              <button onClick={openPdf} disabled={!!busy} title="A4 PDF로 저장 (글자 선명)" className="rounded-md border border-border px-3 py-2 text-[13px] font-semibold text-ink-900 disabled:opacity-50">PDF 저장</button>
              <span style={{ width: 1, height: 22, background: "#DCE4EE" }} />
              <button onClick={() => save("answered")} disabled={!!busy} className="rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50">답변 완료</button>
              <button onClick={() => save("converted")} disabled={!!busy} className="rounded-md border border-indigo-300 px-3 py-2 text-[12.5px] text-indigo-700 disabled:opacity-50">유료 전환</button>
              <button onClick={() => { if (confirm("이 건을 취소 처리합니다. 오늘 정원에서 빠집니다.")) save("cancelled"); }} disabled={!!busy} className="rounded-md px-2 py-2 text-[12.5px] text-body hover:text-red-600">취소 처리</button>
              {miss.length > 0 && <span className="text-[12px] text-amber-700">아직 빈 칸: {miss.join(", ")}</span>}
              {msg && <span className="ml-auto text-[12.5px] text-body">{msg}</span>}
            </div>
          </div>

          <div>
            <div className="sticky top-4">
              {png ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[12.5px] text-body">
                    <b className="text-ink-900">완성 이미지</b> · 폰이면 길게 눌러 공유, PC면 오른쪽 클릭 → 이미지 복사
                    <button onClick={downloadPng} className="rounded-md border border-border px-2 py-1 text-[12px]">파일로 저장</button>
                    <button onClick={() => setPng(null)} className="text-[12px] text-body hover:text-ink-900">편집으로 돌아가기</button>
                  </div>
                  <div className="overflow-auto rounded-lg border border-border bg-[#DCE4EE] p-2" style={{ maxHeight: "calc(100vh - 80px)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={png.url} alt="1문 1답 리포트" style={{ width: 540, display: "block" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2 text-[12.5px] text-body">미리보기 (이미지는 이 모습 그대로 1080px 폭)</div>
                  <div className="overflow-auto rounded-lg border border-border bg-[#DCE4EE] p-2" style={{ maxHeight: "calc(100vh - 80px)" }}>
                    <AskReport ref={previewRef} refNo={sel.ref_no} date={fmtDate(sel.created_at)} name={maskName(sel.name)} question={sel.question} module={module} a={a} />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 목록 ── */}
      <div className="mt-8 rounded-lg border border-border bg-white">
        <div className="grid grid-cols-[110px_1fr_150px_90px_90px] gap-2 border-b border-border px-4 py-2 text-[12px] font-semibold text-body">
          <div>접수</div><div>질문</div><div>이름 · 명식</div><div>동의</div><div>상태</div>
        </div>
        {list.length === 0 && <div className="px-4 py-10 text-center text-[13.5px] text-body">해당하는 접수가 없습니다.</div>}
        {list.map((r) => (
          <button key={r.id} onClick={() => pick(r)} className={`grid w-full grid-cols-[110px_1fr_150px_90px_90px] items-center gap-2 border-b border-border px-4 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-bg-alt ${sel?.id === r.id ? "bg-indigo-50" : ""}`}>
            <div className="text-body"><div className="font-mono text-[12px] text-ink-900">{r.ref_no}</div><div className="text-[11.5px]">{fmtTime(r.created_at)}</div></div>
            <div className="truncate text-ink-900" title={r.question}>{r.question}</div>
            <div className="text-[12px] text-body"><div className="text-ink-900">{r.name}</div><div>{r.saju ? `${r.saju.dayStemKo} · ${r.saju.pillars.day}일주` : r.birth_info}</div></div>
            <div className="text-[11.5px] text-body">{r.kakao_agree ? "카톡 ✓" : "카톡 ✗"}<br />{r.review_agree ? "후기 ✓" : "후기 ✗"}</div>
            <div><span className={`rounded px-1.5 py-0.5 text-[11.5px] font-semibold ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>{r.view_count ? <div className="mt-0.5 text-[11px] text-body">열람 {r.view_count}회</div> : null}</div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-body">최근 30일. 접수 건을 누르면 위에 작성 화면이 열립니다. 「취소 처리」한 건은 오늘 정원(3명)에서 빠집니다.</p>
    </main>
  );
}
