"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import NyPages, { saveFiles, type NyPagesHandle } from "@/components/newyear/NyPages";
import { getProduct, won } from "@/lib/newyear/catalog";
import { draftPartCount } from "@/lib/newyear/content/parts";
import { checkContent, fieldLabel } from "@/lib/newyear/content/validate";
import { getSpec, type FieldValues, type SpecField } from "@/lib/newyear/render/spec";
import { ADMIN_PAY_LABEL, ADMIN_STATUS_LABEL } from "@/lib/newyear/status";
import type { OrderRow, OrderStatus } from "@/lib/newyear/types";

/**
 * 2027 새해운 — 주문 관리 · 상세본 감수 (2026-11)
 *
 * 상세본 흐름: 입금 확인 → AI 초안(쪽 묶음별로 차례로) → 칸 고치기(오른쪽 실시간 미리보기·넘침 표시) → 저장 → 승인 → 고객 링크 전달
 * 한 장 상품은 고객 화면에서 자동으로 만들어진다. 여기서는 입금 대조와 문구 확인·재생성만 한다.
 * 인증은 다른 관리자 화면과 같은 공용 비밀번호(x-admin-password).
 */
const STORAGE_KEY = "aisaju_admin_password";
const STATUS_COLOR: Record<OrderStatus, string> = {
  awaiting_payment: "bg-amber-100 text-amber-800", queued: "bg-sky-100 text-sky-800", generating: "bg-sky-100 text-sky-800", failed: "bg-red-100 text-red-700",
  review: "bg-violet-100 text-violet-800", ready: "bg-emerald-100 text-emerald-800", cancelled: "bg-gray-100 text-gray-500",
};
const input = "w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink-900 outline-none focus:border-indigo-400";
const fmt = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const SRC_LABEL: Record<SpecField["src"], string> = { ai: "문구", eng: "산출", in: "입력", sys: "발행" };

export default function AdminNewYearPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [store, setStore] = useState("");
  const [sel, setSel] = useState<OrderRow | null>(null);
  const [vals, setVals] = useState<FieldValues>({});
  const [dirty, setDirty] = useState(false);
  const [page, setPage] = useState(1);
  const [over, setOver] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  /** AI 초안이 중간에 멈춘 자리 — 다음에 그 묶음부터 이어서 만든다 */
  const [resume, setResume] = useState<{ id: string; at: number } | null>(null);
  const [filter, setFilter] = useState<"todo" | "all" | OrderStatus>("todo");
  const pagesRef = useRef<NyPagesHandle>(null);
  const H = (pw = password) => ({ "x-admin-password": pw, "Content-Type": "application/json" });

  async function load(pw: string) {
    try {
      const res = await fetch("/api/admin/newyear?days=60", { headers: H(pw), cache: "no-store" });
      if (res.status === 401) { setAuthed(false); setAuthError("비밀번호가 올바르지 않습니다."); sessionStorage.removeItem(STORAGE_KEY); return; }
      const j = await res.json();
      if (!res.ok) { setAuthError(j.error ?? "불러오지 못했습니다."); return; }
      setRows(j.rows ?? []); setStore(j.store ?? ""); setAuthed(true); setAuthError(null);
    } catch { setAuthError("네트워크 오류"); }
  }
  useEffect(() => { const s = sessionStorage.getItem(STORAGE_KEY); if (s) { setPassword(s); void load(s); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  function handleLogin(e: FormEvent) { e.preventDefault(); sessionStorage.setItem(STORAGE_KEY, password); void load(password); }

  function pick(r: OrderRow) { setSel(r); setVals({ ...(r.content ?? {}) }); setDirty(false); setPage(1); setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function apply(order: OrderRow, keepEdits = false) {
    setRows((list) => list.map((x) => (x.id === order.id ? order : x)));
    setSel(order);
    setVals((cur) => (keepEdits ? { ...(order.content ?? {}), ...cur } : { ...(order.content ?? {}) }));
    if (!keepEdits) setDirty(false);
  }
  async function patch(body: Record<string, unknown>, okMsg: string): Promise<boolean> {
    if (!sel) return false;
    try {
      const res = await fetch("/api/admin/newyear", { method: "PATCH", headers: H(), body: JSON.stringify({ id: sel.id, ...body }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "실패");
      apply(j.order); setMsg(okMsg); return true;
    } catch (e) { setMsg(e instanceof Error ? e.message : "실패"); return false; }
  }

  const p = sel ? getProduct(sel.product_key) : undefined;
  const spec = sel ? getSpec(sel.product_key) : null;
  const check = useMemo(() => (sel ? checkContent(sel.product_key, vals) : null), [sel, vals]);
  const overSet = useMemo(() => new Set(over.flatMap((k) => k.split(" "))), [over]);
  const partCount = sel ? draftPartCount(sel.product_key) : 0;

  async function save() { setBusy("save"); await patch({ action: "save", values: vals }, "저장했습니다."); setBusy(null); }
  /** 초안 한 묶음을 부른다. 실패하면 Error 를 던진다. */
  async function draftOne(id: string, part: number): Promise<{ missing: string[]; tin: number; tout: number }> {
    const res = await fetch("/api/admin/newyear", { method: "POST", headers: H(), body: JSON.stringify({ id, action: "draft", part }) });
    const raw = await res.text();
    let j: { order?: OrderRow; error?: string; missing?: string[]; usage?: { input: number; output: number } } | null = null;
    try { j = JSON.parse(raw); } catch { j = null; }
    if (!j) throw new Error(`서버가 제때 답하지 못했습니다(${res.status})`);
    if (!res.ok || !j.order) throw new Error(j.error || "초안 실패");
    apply(j.order);
    return { missing: j.missing ?? [], tin: j.usage?.input ?? 0, tout: j.usage?.output ?? 0 };
  }
  async function draft() {
    if (!sel || !partCount) return;
    const from = resume && resume.id === sel.id && resume.at < partCount ? resume.at : 0;
    const ask = from > 0
      ? `멈춘 곳(${from + 1}/${partCount})부터 이어서 만듭니다. Anthropic API 호출 ${partCount - from}회(토큰 비용 발생)가 일어납니다. 계속할까요?`
      : `AI 초안을 만듭니다. Anthropic API 호출 ${partCount}회(토큰 비용 발생)가 일어나고, 지금 적힌 문구 칸을 초안으로 덮어씁니다. 계속할까요?`;
    if (!confirm(ask)) return;
    setBusy("draft");
    let tin = 0, tout = 0;
    const miss: string[] = [];
    for (let i = from; i < partCount; i++) {
      setMsg(`초안 작성 중… ${i + 1}/${partCount} (묶음마다 10~20초)`);
      try {
        /* 한 묶음이 실패하면 한 번만 더 불러 본다 — 그래도 안 되면 멈추고, 다음에 이 묶음부터 이어서 만든다 */
        const r = await draftOne(sel.id, i).catch(() => draftOne(sel.id, i));
        miss.push(...r.missing); tin += r.tin; tout += r.tout;
      } catch (e) {
        setResume({ id: sel.id, at: i });
        setMsg(`초안 ${i + 1}/${partCount}에서 멈췄습니다 — ${e instanceof Error ? e.message : "오류"}. 「AI 초안 이어서」를 누르면 이 묶음부터 다시 만듭니다(앞 묶음은 저장되어 있습니다).`);
        setBusy(null);
        return;
      }
    }
    setResume(null);
    setMsg(`초안을 채웠습니다${miss.length ? ` (빈 칸 ${miss.length}개)` : ""}. 토큰 입력 ${tin.toLocaleString()} · 출력 ${tout.toLocaleString()}. 고쳐 쓰신 뒤 저장 → 승인하세요.`);
    setBusy(null);
  }
  async function approve() {
    if (!sel) return;
    if (dirty && !(await (async () => { setBusy("save"); const ok = await patch({ action: "save", values: vals }, "저장했습니다."); setBusy(null); return ok; })())) return;
    if (over.length && !confirm(`칸을 넘친 곳이 ${over.length}군데 있습니다(미리보기의 빨간 점선). 그대로 승인할까요?`)) return;
    if (!confirm("승인하면 고객이 결과 주소에서 바로 열람·저장할 수 있습니다. 승인할까요?")) return;
    setBusy("approve"); await patch({ action: "approve" }, "승인했습니다. 「고객 링크 복사」로 카톡에 전달하세요."); setBusy(null);
  }
  const shareUrl = sel ? `${typeof window !== "undefined" ? window.location.origin : "https://aisajulab.com"}/2027/o/${sel.share_token}` : "";
  async function exportFiles(kind: "png" | "pdf") {
    if (!pagesRef.current) return;
    setBusy(kind);
    try { await saveFiles(kind === "png" ? await pagesRef.current.toPng() : [await pagesRef.current.toPdf()]); setMsg("파일을 저장했습니다(다운로드 폴더)."); }
    catch (e) { setMsg("파일 생성 실패: " + (e instanceof Error ? e.message : String(e))); }
    setBusy(null);
  }

  const list = rows.filter((r) => filter === "all" ? true : filter === "todo" ? (r.payment_status === "claimed" || ["queued", "generating", "failed", "review"].includes(r.status)) : r.status === filter);
  const todo = rows.filter((r) => r.payment_status === "claimed" || ["queued", "failed", "review"].includes(r.status)).length;

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-[24px] font-bold text-ink-900">2027 새해운</h1>
        <form onSubmit={handleLogin} className="mt-6">
          <label className="text-[12.5px] font-semibold text-ink-900">관리자 비밀번호</label>
          <input type="password" className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] outline-none focus:border-indigo-400" value={password} onChange={(e) => setPassword(e.target.value)} />
          {authError && <p className="mt-2 text-[13px] text-red-600">{authError}</p>}
          <button type="submit" className="btn-primary mt-4 w-full">들어가기</button>
        </form>
      </main>
    );
  }

  const pageFields = spec ? spec.fields.filter((f) => f.page === page) : [];
  const textFields = pageFields.filter((f) => f.src === "ai");
  const fixedFields = pageFields.filter((f) => f.src !== "ai");
  const fieldRow = (f: SpecField) => {
    const v = vals[f.key] ?? "";
    const bad = !v.trim() || /[\[\]]/.test(v);
    const isOver = overSet.has(f.key);
    return (
      <div key={f.key}>
        <label className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-semibold text-body">
          <span className="min-w-0 truncate"><span className={`mr-1.5 rounded px-1 py-0.5 text-[10.5px] ${f.src === "ai" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>{SRC_LABEL[f.src]}</span>{fieldLabel(f)}</span>
          <span className={`shrink-0 ${v.length > f.max ? "text-amber-700" : ""}`}>{v.length}/{f.max}{isOver ? " · 넘침" : ""}</span>
        </label>
        <textarea rows={v.length > 44 ? 2 : 1} className={`${input} ${isOver ? "border-red-400" : bad ? "border-amber-400" : ""}`} value={v}
          onChange={(e) => { setVals((cur) => ({ ...cur, [f.key]: e.target.value })); setDirty(true); }} />
      </div>
    );
  };
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-ink-900">2027 새해운 · 주문과 감수</h1>
          <p className="mt-1 text-[13px] text-body">할 일 <b className="text-amber-700">{todo}</b>건 (입금 신고 · 생성 실패 · 감수 대기){store === "memory" ? " · ⚠ 개발용 메모리 저장소" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["todo", "all", "awaiting_payment", "review", "ready", "failed", "cancelled"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-pill px-3 py-1 text-[12.5px] ${filter === k ? "bg-ink-900 text-white" : "bg-white text-body shadow-1"}`}>{k === "todo" ? "할 일" : k === "all" ? "전체" : ADMIN_STATUS_LABEL[k]}</button>
          ))}
          <button onClick={() => void load(password)} className="text-[13px] text-body hover:text-indigo-600">새로고침</button>
        </div>
      </div>

      {sel && p && spec && check && (
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[12px] text-body">{sel.ref_no} · {fmt(sel.created_at)} · <span className={`rounded px-1.5 py-0.5 ${STATUS_COLOR[sel.status]}`}>{ADMIN_STATUS_LABEL[sel.status]}</span> · {ADMIN_PAY_LABEL[sel.payment_status]}{sel.payer_name ? ` (입금자 ${sel.payer_name})` : ""}</div>
                <div className="mt-1 text-[16px] font-bold text-ink-900">{p.no} {p.name} · {won(sel.price)}</div>
                <div className="mt-1 text-[12.5px] text-body">{sel.name ?? "이름 없음"} · {sel.contact ?? "연락처 없음"} · 유입 {sel.utm || "-"} · 열람 {sel.view_count}회{sel.reviewed_at ? ` · 승인 ${fmt(sel.reviewed_at)}` : ""}</div>
                {sel.input.concern && <div className="mt-1 text-[12.5px] text-ink-900">고민: “{sel.input.concern}”</div>}
              </div>
              <button onClick={() => setSel(null)} className="text-[12.5px] text-body hover:text-ink-900">닫기 ✕</button>
            </div>
            <details className="mt-3 rounded-md bg-bg-alt px-3 py-2">
              <summary className="cursor-pointer text-[12.5px] font-semibold text-ink-900">산출값 보기 (엔진이 계산한 값 — AI 초안의 근거)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-ink-700">{String((sel.computed as { brief?: string } | null)?.brief || JSON.stringify(sel.computed, null, 1))}</pre>
            </details>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {sel.payment_status === "claimed" && <button onClick={() => patch({ action: "payment", to: "confirmed" }, "입금을 확인했습니다.")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-[12.5px] font-semibold text-white">입금 확인</button>}
              {(sel.payment_status === "claimed" || sel.payment_status === "pending") && <button onClick={() => { if (confirm("미입금으로 처리합니다. 고객 화면에서 결과가 닫힙니다.")) void patch({ action: "payment", to: "rejected" }, "미입금으로 처리했습니다."); }} className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-body">미입금 처리</button>}
              {sel.payment_status === "pending" && p.review && <button onClick={() => patch({ action: "payment", to: "confirmed" }, "입금을 확인했습니다.")} className="rounded-md border border-emerald-300 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700">입금 확인(신고 없이)</button>}
              {partCount > 0 && <button onClick={draft} disabled={!!busy} className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-[12.5px] font-semibold text-indigo-700 disabled:opacity-50">{busy === "draft" ? "초안 만드는 중…" : resume && resume.id === sel.id ? `AI 초안 이어서 (${resume.at + 1}/${partCount}부터)` : `AI 초안 채우기 (${partCount}묶음)`}</button>}
              {sel.status === "failed" && !p.review && <button onClick={() => patch({ action: "status", to: "requeue" }, "다시 생성 대기로 돌렸습니다. 고객 화면에서 다시 만들어집니다.")} className="rounded-md border border-border px-3 py-1.5 text-[12.5px] text-ink-900">생성 대기로 되돌리기</button>}
            </div>

            {/* 쪽 고르기 */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[12.5px] font-semibold text-ink-900">쪽</span>
              {spec.pages.map((_, i) => {
                const bad = spec.fields.some((f) => f.page === i + 1 && (check.empty.includes(f.key) || check.bracket.includes(f.key) || overSet.has(f.key)));
                return <button key={i} onClick={() => setPage(i + 1)} className={`h-7 min-w-[28px] rounded px-1.5 text-[12.5px] font-semibold ${page === i + 1 ? "bg-ink-900 text-white" : bad ? "bg-amber-100 text-amber-800" : "bg-bg-alt text-body"}`}>{i + 1}</button>;
              })}
              <span className="ml-2 text-[12px] text-body">빈 칸 <b className={check.empty.length ? "text-amber-700" : ""}>{check.empty.length}</b> · 대괄호 <b className={check.bracket.length ? "text-red-600" : ""}>{check.bracket.length}</b> · 넘침 <b className={over.length ? "text-red-600" : ""}>{over.length}</b>(이 쪽)</span>
            </div>

            {/* 감수자가 고치는 것은 주로 문구(AI 초안)다 — 문구 칸을 먼저 보여 주고, 계산값·입력값은 접어 둔다(빈 칸이 있으면 펼쳐 둔다) */}
            <div className="mt-3 space-y-2.5">
              {pageFields.length === 0 && <p className="text-[13px] text-body">이 쪽에는 채울 칸이 없습니다.</p>}
              {textFields.map(fieldRow)}
              {fixedFields.length > 0 && (
                <details key={`fx-${page}`} open={textFields.length === 0 || fixedFields.some((f) => !(vals[f.key] ?? "").trim())} className="rounded-lg border border-border bg-bg-alt/50 px-3 py-2">
                  <summary className="cursor-pointer text-[12px] font-semibold text-body">산출·입력·발행 값 {fixedFields.length}칸 <span className="font-normal">— 엔진이 계산했거나 고객이 적은 값입니다. 틀린 곳이 있을 때만 고칩니다.</span></summary>
                  <div className="mt-2.5 space-y-2.5">{fixedFields.map(fieldRow)}</div>
                </details>
              )}
            </div>

            <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex flex-wrap items-center gap-2 border-t border-border bg-white px-5 py-3">
              <button onClick={save} disabled={!!busy || !dirty} className="rounded-md border border-border px-3 py-2 text-[13px] font-semibold text-ink-900 disabled:opacity-40">{busy === "save" ? "저장 중…" : dirty ? "저장" : "저장됨"}</button>
              {p.review && sel.status !== "ready" && <button onClick={approve} disabled={!!busy} className="rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-50">{busy === "approve" ? "승인 중…" : "승인 (고객 열람 시작)"}</button>}
              {sel.status === "ready" && <button onClick={() => { void navigator.clipboard.writeText(shareUrl); setMsg("고객용 주소를 복사했습니다. 카카오톡 대화창에 붙여 넣어 전달하세요."); }} className="rounded-md bg-[#FEE500] px-3 py-2 text-[13px] font-semibold text-[#191919]">고객 링크 복사 → 카톡</button>}
              {sel.status === "ready" && p.review && !sel.delivered_at && <button onClick={() => patch({ action: "status", to: "delivered" }, "전달 완료로 기록했습니다.")} className="rounded-md border border-border px-3 py-2 text-[12.5px] text-ink-900">전달 완료 기록</button>}
              {sel.status === "ready" && p.review && <button onClick={() => patch({ action: "status", to: "reopen" }, "다시 감수 상태로 돌렸습니다. 고객 화면은 닫힙니다.")} className="rounded-md px-2 py-2 text-[12.5px] text-body hover:text-ink-900">다시 감수로</button>}
              <span style={{ width: 1, height: 22, background: "#DCE4EE" }} />
              <button onClick={() => exportFiles("png")} disabled={!!busy} className="rounded-md border border-border px-3 py-2 text-[12.5px] text-ink-900 disabled:opacity-50">{busy === "png" ? "굽는 중…" : "PNG"}</button>
              <button onClick={() => exportFiles("pdf")} disabled={!!busy} className="rounded-md border border-border px-3 py-2 text-[12.5px] text-ink-900 disabled:opacity-50">{busy === "pdf" ? "굽는 중…" : "PDF"}</button>
              <button onClick={() => void pagesRef.current?.print()} className="rounded-md border border-border px-3 py-2 text-[12.5px] text-ink-900">인쇄 창(글자 선명 PDF)</button>
              {msg && <span className="ml-auto max-w-[420px] text-[12.5px] text-body">{msg}</span>}
            </div>
          </div>

          <div>
            <div className="sticky top-4">
              <div className="mb-2 text-[12.5px] text-body">미리보기 · {page}쪽 <span className="text-[11.5px]">(빨간 점선 = 칸을 넘친 곳 · 주황 점선 = 글자를 줄여 맞춘 곳 · 옅은 [대괄호] = 빈 칸)</span></div>
              <div className="overflow-auto rounded-lg border border-border bg-[#DCE4EE] p-3" style={{ maxHeight: "calc(100vh - 90px)" }}>
                <NyPages template={sel.product_key} values={vals} mode="preview" only={[page - 1]} onFit={setOver} />
              </div>
              {/* 내보내기용: 전체 쪽을 화면 밖에 그려 둔다 (보이는 미리보기는 한 쪽씩이라 가볍다) */}
              <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, width: spec.w, pointerEvents: "none" }}>
                <NyPages ref={pagesRef} template={sel.product_key} values={vals} fileBase={`AI사주랩_2027_${p.name.replace(/\s+/g, "")}_${sel.ref_no}`} />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 rounded-lg border border-border bg-white">
        <div className="grid grid-cols-[120px_1fr_170px_110px_100px] gap-2 border-b border-border px-4 py-2 text-[12px] font-semibold text-body"><div>접수</div><div>상품</div><div>이름 · 연락처</div><div>결제</div><div>상태</div></div>
        {list.length === 0 && <div className="px-4 py-10 text-center text-[13.5px] text-body">해당하는 주문이 없습니다.</div>}
        {list.map((r) => {
          const rp = getProduct(r.product_key);
          return (
            <button key={r.id} onClick={() => pick(r)} className={`grid w-full grid-cols-[120px_1fr_170px_110px_100px] items-center gap-2 border-b border-border px-4 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-bg-alt ${sel?.id === r.id ? "bg-indigo-50/60" : ""}`}>
              <div className="text-body"><div className="font-semibold text-ink-900">{r.ref_no}</div><div className="text-[11.5px]">{fmt(r.created_at)}</div></div>
              <div className="min-w-0 truncate text-ink-900">{rp?.no} {rp?.name} <span className="text-body">· {won(r.price)}</span></div>
              <div className="min-w-0 truncate text-body">{r.name ?? "-"} · {r.contact ?? "-"}</div>
              <div className={r.payment_status === "claimed" ? "font-semibold text-amber-700" : "text-body"}>{ADMIN_PAY_LABEL[r.payment_status]}</div>
              <div><span className={`rounded px-1.5 py-0.5 text-[12px] ${STATUS_COLOR[r.status]}`}>{ADMIN_STATUS_LABEL[r.status]}</span></div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
