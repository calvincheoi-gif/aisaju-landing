"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getProduct, NEWYEAR, won } from "@/lib/newyear/catalog";
import { apiClaim, apiGenerate, apiGet, rememberOrder } from "@/lib/newyear/client";
import { statusView } from "@/lib/newyear/status";
import type { PublicOrder } from "@/lib/newyear/types";
import { siteConfig } from "@/lib/site-config";
import NyPages, { saveFiles, type NyPagesHandle } from "./NyPages";
import NySaveSheet from "./NySaveSheet";
import { inAppKind, openExternal, withSaveHint, type InAppKind } from "@/lib/newyear/inapp";

/**
 * 2027 새해운 — 주문 한 건의 화면 (상태 안내 → 결제 → 생성/감수 대기 → 결과 저장).
 * 주소(/2027/o/<토큰>)가 곧 열쇠다. 이 주소로 다시 들어오면 언제든 결과를 다시 받을 수 있다.
 */
/* 990원 고정 금액 송금 링크 — 오행 앱의 990원 결제와 같은 것. 그 밖의 금액은 금액을 직접 적는 링크를 쓴다 */
const KAKAOPAY_990 = "https://qr.kakaopay.com/2810060111525252010020951ef07460";

export default function NyOrderView({ token }: { token: string }) {
  const [o, setO] = useState<PublicOrder | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [payer, setPayer] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [over, setOver] = useState<string[]>([]);
  const pagesRef = useRef<NyPagesHandle>(null);
  const kicked = useRef(false);
  /* 인앱 브라우저(카카오톡 등) 여부 · 기본 브라우저로 넘어온 뒤 강조할 저장 단추 · 그림 띄워 저장하기 */
  const [inapp, setInapp] = useState<InAppKind>(null);
  const [hint, setHint] = useState<"png" | "pdf" | null>(null);
  const [sheet, setSheet] = useState<string[] | null>(null);
  useEffect(() => {
    setInapp(inAppKind());
    const s = new URLSearchParams(window.location.search).get("save");
    if (s === "png" || s === "pdf") setHint(s);
  }, []);

  const load = useCallback(async (count = false) => {
    const r = await apiGet(token, count);
    if (!r.ok || !r.order) { setErr(r.error || "신청 내역을 찾지 못했습니다."); return null; }
    setErr(null); setO(r.order);
    return r.order;
  }, [token]);

  useEffect(() => {
    void load(true).then((order) => {
      if (order) { rememberOrder({ token, refNo: order.refNo, productKey: order.productKey, at: order.createdAt }); setPayer((v) => v || order.name || ""); }
    });
  }, [load, token]);

  const p = o ? getProduct(o.productKey) : undefined;
  const view = o && p ? statusView(p, o.status, o.paymentStatus) : null;

  /* 한 장 상품: 생성 대기면 스스로 생성을 건다(서버가 한 번만 돌게 막아 둔다) */
  useEffect(() => {
    if (!o || !p || p.review) return;
    if (o.status === "queued" && !kicked.current) {
      kicked.current = true;
      void apiGenerate(token).then((r) => { if (r.order) setO(r.order); else void load(); });
    }
  }, [o, p, token, load]);

  /* 기다리는 상태에서는 정해진 간격으로 다시 확인한다 */
  useEffect(() => {
    if (!view || !view.poll) return;
    const id = setInterval(() => void load(), view.poll * 1000);
    return () => clearInterval(id);
  }, [view, load]);

  async function claim() {
    if (!payer.trim()) { setMsg("입금하신 분의 이름을 적어 주세요."); return; }
    setBusy("claim"); setMsg(null);
    const r = await apiClaim(token, payer.trim());
    setBusy(null);
    if (!r.ok || !r.order) { setMsg(r.error || "처리하지 못했습니다."); return; }
    kicked.current = false; setO(r.order);
  }
  async function retry() {
    setBusy("retry"); setMsg(null);
    const r = await apiGenerate(token);
    setBusy(null);
    if (r.order) setO(r.order); else setMsg(r.error || "다시 시도하지 못했습니다.");
  }
  async function save(kind: "png" | "pdf") {
    if (!pagesRef.current) return;
    setMsg(null); setHint(null);
    /* 인앱 브라우저: 파일 내려받기가 막혀 있으니 기본 브라우저로 같은 주소를 연다 */
    if (inapp && openExternal(withSaveHint(window.location.href, kind))) {
      setMsg(`크롬·사파리 같은 기본 브라우저로 이 결과를 엽니다. 열린 화면에서 「${kind === "png" ? "이미지 저장" : "PDF 저장"}」을 한 번 더 눌러 주세요.`);
      return;
    }
    if (inapp) {
      /* 아이폰의 인스타·네이버 등: 기본 브라우저로 넘길 방법이 없다 → 공유 창, 안 되면 그림을 띄운다 */
      if (kind === "pdf") { setMsg("이 앱 안에서는 PDF 저장이 막혀 있습니다. 오른쪽 위 ··· 메뉴에서 「Safari로 열기」를 고른 뒤 다시 눌러 주세요. 이미지는 「이미지 저장」으로 바로 받을 수 있습니다."); return; }
      await showSheet(true);
      return;
    }
    setBusy(kind);
    try {
      const files = kind === "png" ? await pagesRef.current.toPng() : [await pagesRef.current.toPdf()];
      const r = await saveFiles(files);
      setMsg(r === "failed" ? "저장이 막혔습니다. 아래 「그림으로 띄워 저장」을 눌러 그림을 길게 눌러 저장해 주세요." : r === "shared" ? "공유 창에서 「이미지 저장」 또는 보낼 곳을 고르세요." : kind === "png" ? "이미지를 저장했습니다. 사진첩·다운로드 폴더에서 확인하세요." : "PDF를 저장했습니다. 다운로드 폴더에서 확인하세요.");
    } catch { setMsg("파일을 만들지 못했습니다. 잠시 뒤 다시 눌러 주세요."); }
    setBusy(null);
  }
  /** 그림을 화면에 띄워 길게 눌러 저장하게 한다(내려받기가 막힌 곳의 마지막 길) */
  async function showSheet(tryShare = false) {
    if (!pagesRef.current) return;
    setBusy("png"); setMsg(null);
    try {
      const files = await pagesRef.current.toPng();
      if (tryShare) {
        const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
        if (nav.share && nav.canShare?.({ files })) {
          try { await nav.share({ files, title: "AI사주랩 2027 새해운" }); setBusy(null); return; } catch { /* 그림 띄우기로 */ }
        }
      }
      const urls = await Promise.all(files.map((f) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); })));
      setSheet(urls);
    } catch { setMsg("그림을 만들지 못했습니다. 잠시 뒤 다시 눌러 주세요."); }
    setBusy(null);
  }
  function printPdf() {
    if (inapp && openExternal(withSaveHint(window.location.href, "pdf"))) {
      setMsg("기본 브라우저로 이 결과를 엽니다. 열린 화면에서 「글자 선명한 PDF」를 다시 눌러 주세요.");
      return;
    }
    void pagesRef.current?.print();
  }
  /** 이벤트 주소 공유 — 공유 창(카카오톡 등)이 있으면 열고, 없으면 주소를 복사한다 */
  async function shareEvent() {
    const link = `${window.location.origin}${NEWYEAR.path}?utm=share`;
    const text = "2027 정미년, 내 새해운 1장 — 주역 카드는 무료예요. 설 연휴(2/9)까지만 열려요.";
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try { if (nav.share) { await nav.share({ title: "AI사주랩 2027 새해운", text, url: link }); return; } } catch { return; }
    copy(`${text}\n${link}`, "공유 문구와 주소를 복사했습니다. 카카오톡 대화창에 붙여 넣어 보내 주세요.");
  }
  function copy(text: string, done: string) {
    try { void navigator.clipboard.writeText(text); setMsg(done); } catch { setMsg(text); }
  }

  if (err) return <Shell><div className="rounded-2xl border border-[#DCE7F8] bg-white px-5 py-10 text-center"><p className="text-[16px] font-extrabold text-[#12224A]">신청 내역을 찾을 수 없습니다</p><p className="mt-2 break-keep text-[13.5px] text-[#64748B]">{err}</p><a href={NEWYEAR.path} className="mt-4 inline-block text-[14px] font-bold text-[#3B6CF5]">2027 새해운 보러 가기</a></div></Shell>;
  if (!o || !p || !view) return <Shell><p className="py-16 text-center text-[14px] text-[#64748B]">불러오는 중…</p></Shell>;

  const tone = { wait: ["#FFFBEA", "#F1E3A8", "#7A5B00"], work: ["#EEF3FF", "#C9D7F3", "#1E3A8A"], done: ["#ECFDF5", "#A7E3C7", "#065F46"], warn: ["#FEF2F2", "#F5C2C2", "#B91C1C"] }[view.tone];
  const needPay = o.status === "awaiting_payment" && o.paymentStatus === "pending";
  const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
  const next = p.next ? getProduct(p.next) : undefined;

  return (
    <Shell>
      {/* 한 줄 소개는 폭 전체를 쓰고(가운뎃점에서 줄이 끊기지 않게), 접수번호는 이름 줄 오른쪽에 둔다 */}
      <p className="text-[12.5px] font-bold text-[#3B6CF5]">{p.no} {p.tagline}</p>
      <div className="mt-0.5 flex items-end justify-between gap-3">
        <h1 className="min-w-0 break-keep text-[20px] font-black leading-snug text-[#12224A]">{p.name}</h1>
        <div className="shrink-0 text-right"><p className="text-[11.5px] leading-tight text-[#94A3B8]">접수번호</p><p className="whitespace-nowrap text-[14px] font-extrabold tracking-wide text-[#12224A]">{o.refNo}</p></div>
      </div>

      {/* 진행 단계 */}
      <ol className="mt-4 flex items-center gap-1.5">
        {view.steps.map((s, i) => (
          <li key={s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`h-1.5 w-full rounded-full ${i + 1 <= view.step ? "bg-[#3B6CF5]" : "bg-[#E2E8F0]"}`} />
            <span className={`text-[11.5px] font-bold ${i + 1 === view.step ? "text-[#12224A]" : "text-[#94A3B8]"}`}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-3 rounded-2xl border px-4 py-3.5" style={{ background: tone[0], borderColor: tone[1] }}>
        <p className="text-[15px] font-extrabold" style={{ color: tone[2] }}>{view.title}</p>
        <p className="mt-1 break-keep text-[13.5px] leading-relaxed text-[#475569]">{view.desc}</p>
        {o.status === "failed" && <button onClick={retry} disabled={!!busy} className="mt-3 rounded-full bg-[#12224A] px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60">{busy === "retry" ? "다시 만드는 중…" : "다시 시도"}</button>}
        {(o.status === "queued" || o.status === "generating") && !p.review && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#3B6CF5]" /></div>}
      </div>

      {/* 결제 전·기다리는 동안: 엔진이 이미 계산한 값 한 줄 (해석은 결제·감수 뒤에 열린다) */}
      {o.teaser && o.status !== "ready" && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#12224A] px-4 py-3.5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#F3D37A]/60 text-[18px] font-black text-[#F3D37A]">✓</span>
          <span className="min-w-0">
            <span className="block text-[11.5px] font-bold text-[#9DB8F5]">{o.teaser.label} · 계산 완료</span>
            <span className="block break-keep text-[16px] font-extrabold">{o.teaser.value}</span>
            <span className="block break-keep text-[12px] text-[#B9C5E6]">{o.teaser.note}</span>
          </span>
        </div>
      )}

      {/* 결제 안내 */}
      {needPay && (
        <div className="mt-4 rounded-2xl border border-[#DCE7F8] bg-white px-4 py-4">
          <div className="flex items-baseline justify-between border-b border-[#EEF2F7] pb-3"><span className="text-[13px] text-[#64748B]">결제 금액 <span className="text-[11.5px]">(부가세 포함)</span></span><span className="text-[22px] font-black text-[#3B6CF5]">{won(o.price)}</span></div>
          <ol className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-[#334155]">
            <li className="break-keep">1. 아래 버튼으로 <b>{won(o.price)}</b>을 송금합니다.</li>
            <li className="break-keep">2. 입금하신 분의 이름을 적고 <b className="whitespace-nowrap">「입금 완료」</b> 버튼을 누릅니다.</li>
            <li className="break-keep">3. {p.review ? `입금을 확인한 뒤 초안·감수를 거쳐 영업일 ${siteConfig.payment.leadTimeDays}일 안에 전달합니다.` : "그 자리에서 결과가 만들어집니다."}</li>
          </ol>
          <a href={o.price === 990 ? KAKAOPAY_990 : siteConfig.payment.kakaoPayUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl bg-[#FEE500] px-4 py-3.5 text-center text-[15px] font-extrabold text-[#3C1E1E]">카카오페이로 송금하기{o.price === 990 ? " (990원)" : ""}</a>
          {siteConfig.payment.account && (
            <div className="mt-2.5 rounded-xl bg-[#F7FAFF] px-3.5 py-3">
              <p className="text-[12px] font-bold text-[#334155]">계좌이체</p>
              <p className="mt-0.5 text-[14.5px] font-extrabold text-[#12224A]">{siteConfig.payment.bank} {siteConfig.payment.account}</p>
              <p className="text-[12px] text-[#64748B]">예금주 {siteConfig.payment.holder}</p>
              <button type="button" onClick={() => copy(siteConfig.payment.account, "계좌번호를 복사했습니다.")} className="mt-1 text-[12.5px] font-bold text-[#3B6CF5]">계좌번호 복사</button>
            </div>
          )}
          <label className="mt-4 block text-[13px] font-bold text-[#334155]">입금하신 분 이름</label>
          <input value={payer} onChange={(e) => setPayer(e.target.value)} maxLength={20} placeholder="입금자명" className="mt-1.5 w-full rounded-xl border border-[#DCE7F8] bg-white px-3.5 py-3 text-[15px] outline-none focus:border-[#3B6CF5]" />
          <button onClick={claim} disabled={!!busy} className="mt-2.5 block w-full rounded-full bg-gradient-to-b from-[#6896FF] to-[#3B6CF5] px-5 py-3.5 text-[15.5px] font-extrabold text-white disabled:opacity-60">{busy === "claim" ? "확인 중…" : "입금 완료"}</button>
          <p className="mt-2.5 break-keep text-[11.5px] leading-relaxed text-[#94A3B8]">개인 맞춤으로 제작하는 디지털 콘텐츠로, 제작이 시작된 뒤에는 청약철회가 제한될 수 있습니다. <a href="/legal/#t3" target="_blank" className="font-semibold text-[#3B6CF5] underline">환불 기준 보기</a></p>
        </div>
      )}

      {/* 상세본: 입금 신고 뒤 기다리는 동안 */}
      {(p.review || (o.status === "awaiting_payment" && o.paymentStatus === "claimed")) && o.status !== "ready" && !needPay && o.status !== "cancelled" && (
        <div className="mt-4 rounded-2xl border border-[#DCE7F8] bg-white px-4 py-4">
          <p className="break-keep text-[13.5px] leading-relaxed text-[#334155]">카카오톡 채널로 접수번호를 보내 두시면, 같은 대화창에서 입금 확인과 전달 안내를 받으실 수 있습니다.</p>
          <button type="button" onClick={() => { copy(`접수번호 ${o.refNo} · ${o.name ?? ""}`, "접수번호를 복사했습니다. 카카오톡 대화창에 붙여 넣어 보내 주세요."); window.open(siteConfig.channels.kakaoIntake, "_blank", "noopener"); }} className="mt-3 block w-full rounded-xl bg-[#FEE500] px-4 py-3 text-[14.5px] font-extrabold text-[#3C1E1E]">카카오톡으로 접수번호 보내기</button>
          <button type="button" onClick={() => copy(url, "이 화면의 주소를 복사했습니다. 이 주소로 다시 들어오면 진행 상황과 결과를 볼 수 있습니다.")} className="mt-2 block w-full rounded-xl border border-[#DCE7F8] px-4 py-3 text-[14px] font-bold text-[#12224A]">이 화면 주소 복사</button>
        </div>
      )}

      {/* 결과 */}
      {o.status === "ready" && o.content && (
        <>
          <style>{`@keyframes nyHint{0%,100%{box-shadow:0 0 0 0 rgba(255,224,102,.0)}50%{box-shadow:0 0 0 6px rgba(255,224,102,.75)}}.ny-hint{animation:nyHint 1.1s ease-in-out 5}`}</style>
          {inapp === "kakao" && <p className="mt-4 break-keep rounded-xl bg-[#FFF8D6] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#6B5200]">카카오톡 안에서는 파일 저장이 막혀 있어, 저장 단추를 누르면 <b>크롬·사파리로 열린 뒤</b> 저장됩니다.</p>}
          {hint && !inapp && <p className="mt-4 break-keep rounded-xl bg-[#ECFDF5] px-3.5 py-2.5 text-[13px] font-bold leading-relaxed text-[#065F46]">기본 브라우저로 열렸습니다. 아래 「{hint === "png" ? "이미지 저장" : "PDF 저장"}」을 눌러 주세요.</p>}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => save("png")} disabled={!!busy} className={`rounded-full bg-[#12224A]${hint === "png" ? " ny-hint" : ""} px-4 py-3.5 text-[14.5px] font-extrabold text-white disabled:opacity-60`}>{busy === "png" ? "만드는 중…" : p.pages > 1 ? `이미지 ${p.pages}장 저장` : "이미지 저장"}</button>
            <button onClick={() => save("pdf")} disabled={!!busy} className={`rounded-full border-2 border-[#12224A] bg-white px-4 py-3.5 text-[14.5px] font-extrabold text-[#12224A] disabled:opacity-60${hint === "pdf" ? " ny-hint" : ""}`}>{busy === "pdf" ? "만드는 중…" : "PDF 저장"}</button>
          </div>
          <div className="mt-1.5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12.5px] font-bold text-[#3B6CF5]">
            <button type="button" onClick={printPdf}>글자 선명한 PDF(인쇄 창 · PC 권장)</button>
            <button type="button" onClick={() => void showSheet()}>그림으로 띄워 저장</button>
            <button type="button" onClick={() => copy(url, "주소를 복사했습니다. 이 주소로 언제든 다시 받을 수 있습니다.")}>이 결과 주소 복사</button>
          </div>
          {/* 결과 화면에서는 안내 문구를 저장 단추 바로 밑에 — 폰에서 카드 아래까지 내려가야 보이던 문제(2026-11-24) */}
          {msg && <p role="status" className="mt-2.5 break-keep rounded-xl bg-[#F1F5F9] px-3.5 py-3 text-[13px] leading-relaxed text-[#334155]">{msg}</p>}
          <div className={`mx-auto mt-4 ${p.kind === "card" ? "max-w-[420px]" : ""}`}>
            <NyPages ref={pagesRef} template={o.productKey} values={o.content} fileBase={`AI사주랩_2027_${p.name.replace(/\s+/g, "")}_${o.refNo}`} onFit={setOver} />
          </div>
          {p.kind === "card" && <p className="mt-3 break-keep text-center text-[12.5px] leading-relaxed text-[#64748B]">사진첩에서 전체 화면으로 보거나 배경화면으로 써 보세요. 기기마다 시계·위젯 위치가 달라 화면 맞춤이 필요할 수 있습니다.</p>}
          {over.length > 0 && <p className="mt-2 text-center text-[11.5px] text-[#94A3B8]">일부 문장은 칸에 맞춰 글자를 줄였습니다.</p>}
          {/* 벤치마킹 반영(2026-11-24): 결과 뒤에는 「나누기」와 「가족·친구 것도」를 바로 잇는다. 공유는 개인 결과가 아니라 이벤트 주소만 보낸다 */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void shareEvent()} className="rounded-2xl bg-[#FEE500] px-3 py-3.5 text-[13.5px] font-extrabold text-[#191919]">새해운 이벤트 공유하기</button>
            <a href={`${NEWYEAR.path}/${p.key}?utm=again`} className="grid place-items-center rounded-2xl border border-[#DCE7F8] bg-white px-3 py-3.5 text-center text-[13.5px] font-extrabold text-[#12224A]">가족·친구 것도 받기</a>
          </div>
          {p.pay === "free" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["tojeong-card", "saju-card"] as const).map((k) => { const q = getProduct(k)!; return (
                <a key={k} href={`${NEWYEAR.path}/${k}?utm=after_free`} className="rounded-2xl bg-[#12224A] px-3.5 py-3.5 text-white">
                  <span className="block text-[11.5px] font-bold text-[#9DB8F5]">{k === "tojeong-card" ? "음력 열두 달 신수" : "나의 기질로 읽는 한 해"}</span>
                  <span className="mt-0.5 block break-keep text-[14.5px] font-extrabold">{q.name}</span>
                  <span className="mt-1.5 inline-block rounded-full bg-[#FFE066] px-2.5 py-0.5 text-[12.5px] font-black text-[#12224A]">{won(q.price)}</span>
                </a>
              ); })}
            </div>
          )}
          {next && p.pay !== "free" && (
            <a href={`${NEWYEAR.path}/${next.key}`} className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#12224A] px-4 py-4 text-white">
              <span className="min-w-0"><span className="block text-[12px] font-bold text-[#9DB8F5]">더 깊이 보고 싶다면</span><span className="block break-keep text-[15.5px] font-extrabold">{next.name}</span><span className="block break-keep text-[12.5px] text-[#DCE7F8]">{next.format}</span></span>
              <span className="shrink-0 rounded-full bg-[#FFE066] px-3 py-1.5 text-[13.5px] font-black text-[#12224A]">{won(next.price)}</span>
            </a>
          )}
          <a href={siteConfig.channels.kakaoChannelAdd} target="_blank" rel="noopener" className="mt-2.5 block rounded-2xl border border-[#DCE7F8] bg-white px-4 py-3.5 text-center text-[13.5px] font-bold text-[#12224A]">카카오톡 채널 추가 — 월·목 읽을거리 받아 보기</a>
        </>
      )}

      {sheet && <NySaveSheet images={sheet} onClose={() => setSheet(null)} />}
      {msg && !(o.status === "ready" && o.content) && <p className="mt-3 break-keep rounded-xl bg-[#F1F5F9] px-3.5 py-3 text-[13px] leading-relaxed text-[#334155]">{msg}</p>}
      <p className="mt-6 text-center text-[12.5px]"><a href={NEWYEAR.path} className="font-bold text-[#64748B]">← 2027 새해운 전체 보기</a></p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-6">{children}</div>;
}
