"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { isProdHost, productOpen, startLabel } from "@/lib/newyear/season";
import { NEWYEAR, won, type Product } from "@/lib/newyear/catalog";
import { apiCreate, rememberOrder } from "@/lib/newyear/client";
import { IC_CATEGORIES } from "@/lib/newyear/content/iching-bank";
import IchingDraw from "./IchingDraw";
import type { OrderInput } from "@/lib/newyear/types";
import NyPages from "./NyPages";

/**
 * 2027 새해운 — 신청서. 상품에 필요한 칸(needs)만 보여 준다.
 *   주역: 관심 분야·질문 → 괘 뽑기(깜빡이는 버튼, 값은 척전법 6번)        토정비결: 생년월일(양/음·윤달)
 *   사주명리: 생년월일시·성별 (+ 프리미엄: 출생지·고민)        상세본: 이름·연락처
 * 간지·괘는 브라우저가 계산하지 않는다 — 입력만 보내고 서버 엔진이 산출한다.
 */
const inputCls = "w-full rounded-xl border border-[#DCE7F8] bg-white px-3.5 py-3 text-[15px] text-[#16233F] outline-none focus:border-[#3B6CF5] focus:ring-2 focus:ring-[#3B6CF5]/15";
const labelCls = "mb-1.5 block text-[13px] font-bold text-[#334155]";
const chip = (on: boolean) => `rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition ${on ? "border-[#3B6CF5] bg-[#3B6CF5] text-white" : "border-[#DCE7F8] bg-white text-[#334155]"}`;

/* 출생지 — 경도 보정에 쓴다. 모르면 기준 경도(표준시 −30분)로 계산한다 */
const PLACES: [string, number][] = [["서울", 126.98], ["인천", 126.71], ["대전", 127.38], ["광주", 126.85], ["대구", 128.6], ["부산", 129.08], ["울산", 129.31], ["강릉", 128.88], ["제주", 126.53]];
const YEARS = Array.from({ length: 2026 - 1930 + 1 }, (_, i) => 2026 - i);

export default function NyOrderForm({ product: p }: { product: Product }) {
  const router = useRouter();
  const need = (k: string) => p.needs.includes(k as never);
  const [name, setName] = useState(""), [contact, setContact] = useState(""), [gender, setGender] = useState<"female" | "male" | "">("");
  const [y, setY] = useState(""), [m, setM] = useState(""), [d, setD] = useState("");
  const [lunar, setLunar] = useState(false), [leap, setLeap] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(false), [hh, setHh] = useState(""), [mm, setMm] = useState("0");
  const [place, setPlace] = useState(""), [concern, setConcern] = useState("");
  const [cat, setCat] = useState(IC_CATEGORIES[0].key), [preset, setPreset] = useState(IC_CATEGORIES[0].questions[0]), [custom, setCustom] = useState("");
  const question = custom.trim() || preset;      // 직접 적으면 그 질문을, 아니면 고른 질문을 쓴다
  const [lines, setLines] = useState<number[]>([]);
  const [agree, setAgree] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState<string | null>(null);
  const category = useMemo(() => IC_CATEGORIES.find((c) => c.key === cat) ?? IC_CATEGORIES[0], [cat]);
  const personal = need("birth") || need("contact");
  /* 사전 오픈 기간의 상세본: 내용·양식은 보여 주되 신청은 잠근다(운영 주소에서만 — 미리보기는 시험 가능) */
  const [locked, setLocked] = useState(false);
  useEffect(() => { setLocked(!productOpen(p.review) && isProdHost(window.location.host)); }, [p.review]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (personal && !agree) { setErr("개인정보 수집·이용에 동의해 주세요."); return; }
    const input: OrderInput = {};
    if (need("question")) { input.category = cat; input.question = question.trim(); input.lines = lines; if (lines.length !== 6) { setErr("먼저 빛나는 버튼을 눌러 괘를 열어 주세요."); return; } }
    if (need("birth")) {
      if (!y || !m || !d) { setErr("생년월일을 모두 골라 주세요."); return; }
      input.birth = { year: +y, month: +m, day: +d, isLunar: lunar, isLeapMonth: lunar && leap };
    }
    if (need("time")) { if (!timeUnknown && hh === "") { setErr("태어난 시각을 고르거나 「모름」을 눌러 주세요."); return; } input.time = timeUnknown ? null : { hour: +hh, minute: +mm }; }
    if (need("gender")) { if (!gender) { setErr("성별을 골라 주세요."); return; } input.gender = gender; }
    if (need("name")) input.name = name.trim();
    if (need("contact")) input.contact = contact.trim();
    if (need("place") && place) { input.place = place; input.longitude = PLACES.find((x) => x[0] === place)?.[1] ?? null; }
    if (need("concern")) input.concern = concern.trim();
    setBusy(true);
    const r = await apiCreate(p.key, input);
    setBusy(false);
    if (!r.ok || !r.token) { setErr(r.error || "신청을 처리하지 못했습니다."); return; }
    rememberOrder({ token: r.token, refNo: r.refNo || "", productKey: p.key, at: new Date().toISOString() });
    router.push(`${NEWYEAR.path}/o/${r.token}`);
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-5">
      <a href={NEWYEAR.path} className="text-[13px] font-semibold text-[#64748B]">← 2027 새해운 전체 보기</a>
      <div className="mt-3 rounded-[22px] bg-[#12224A] px-5 py-5 text-white">
        {/* 한 줄 소개는 폭 전체를 쓰고(가운뎃점에서 줄이 끊기지 않게), 가격은 이름 줄 오른쪽에 둔다 */}
        <p className="text-[12.5px] font-bold text-[#9DB8F5]">{p.no} {p.tagline}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="min-w-0 break-keep text-[22px] font-black leading-snug tracking-[-0.02em]">{p.name}</h1>
          <span className="mt-0.5 shrink-0 whitespace-nowrap rounded-full bg-[#FFE066] px-3.5 py-1.5 text-[15px] font-black text-[#12224A]">{won(p.price)}</span>
        </div>
        <ul className="mt-3 space-y-1 text-[13.5px] text-[#DCE7F8]">{p.points.map((t) => <li key={t} className="break-keep">· {t}</li>)}</ul>
        <p className="mt-3 break-keep text-[12.5px] text-[#9DB8F5]">{p.format} · {p.review ? "초안 작성 후 최형철 소장이 감수해 전달합니다" : p.pay === "free" ? "신청 즉시 화면에서 받습니다" : "송금이 확인되면 자동으로 바로 만들어집니다"}</p>
      </div>

      <details className="mt-3 rounded-2xl border border-[#DCE7F8] bg-white px-4 py-3">
        <summary className="cursor-pointer text-[13.5px] font-bold text-[#12224A]">양식 미리보기 {p.pages > 1 ? `(1쪽 / 전체 ${p.pages}쪽)` : ""}</summary>
        <div className="mx-auto mt-3 max-w-[300px]"><NyPages template={p.key} values={{}} mode="preview" only={[0]} /></div>
        <p className="mt-2 break-keep text-center text-[12px] text-[#94A3B8]">대괄호 자리에 나의 내용이 들어갑니다.</p>
      </details>

      {locked && (
        <div className="mt-3 rounded-2xl border border-[#F1E3A8] bg-[#FFFBEA] px-4 py-4">
          <p className="break-keep text-[14.5px] font-extrabold text-[#7A5B00]">{startLabel()}에 열립니다</p>
          <p className="mt-1 break-keep text-[13px] leading-relaxed text-[#6B5200]">지금은 사전 오픈 기간이라 <b>한 장 요약</b>을 먼저 받을 수 있어요. 상세본은 {startLabel(true)}부터 신청받습니다.</p>
          <a href={`${NEWYEAR.path}/${p.key === "tojeong-detail" ? "tojeong-card" : "saju-card"}?utm=pre_${p.key}`} className="mt-3 block rounded-xl bg-gradient-to-b from-[#FFE58A] to-[#F2C94C] px-4 py-3 text-center text-[14.5px] font-extrabold text-[#12224A]">{p.key === "tojeong-detail" ? "토정비결 한 장 먼저 받기 · 990원" : "사주명리 한 장 먼저 받기 · 990원"}</a>
        </div>
      )}
      <form onSubmit={submit} className="mt-5 space-y-5">
        {need("question") && (
          <>
            <div>
              <span className={labelCls}>1. 무엇이 궁금하세요?</span>
              <div className="flex flex-wrap gap-2">{IC_CATEGORIES.map((c) => <button type="button" key={c.key} className={chip(cat === c.key)} onClick={() => { setCat(c.key); setPreset(c.questions[0]); }}>{c.label}</button>)}</div>
            </div>
            <div>
              <span className={labelCls}>2. 올해 품을 질문 하나</span>
              <div className="space-y-2">{category.questions.map((q) => <button type="button" key={q} onClick={() => { setPreset(q); setCustom(""); }} className={`block w-full break-keep rounded-xl border px-3.5 py-3 text-left text-[14.5px] font-semibold ${!custom.trim() && preset === q ? "border-[#3B6CF5] bg-[#EEF3FF] text-[#12224A]" : "border-[#DCE7F8] bg-white text-[#334155]"}`}>{q}</button>)}</div>
              <input className={`${inputCls} mt-2`} maxLength={40} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="또는 직접 적기 (40자 이내)" />
            </div>
            <IchingDraw onDone={setLines} />
          </>
        )}

        {need("name") && <div><label className={labelCls}>이름</label><input className={inputCls} maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="리포트에 적힐 이름" required /></div>}

        {need("birth") && (
          <div>
            <span className={labelCls}>생년월일</span>
            <div className="mb-2 flex gap-2">
              <button type="button" className={chip(!lunar)} onClick={() => { setLunar(false); setLeap(false); }}>양력</button>
              <button type="button" className={chip(lunar)} onClick={() => setLunar(true)}>음력</button>
              {lunar && <label className="ml-1 flex items-center gap-1.5 text-[13px] font-semibold text-[#334155]"><input type="checkbox" checked={leap} onChange={(e) => setLeap(e.target.checked)} />윤달</label>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select className={inputCls} value={y} onChange={(e) => setY(e.target.value)} aria-label="태어난 해"><option value="">년</option>{YEARS.map((v) => <option key={v} value={v}>{v}년</option>)}</select>
              <select className={inputCls} value={m} onChange={(e) => setM(e.target.value)} aria-label="태어난 달"><option value="">월</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}</select>
              <select className={inputCls} value={d} onChange={(e) => setD(e.target.value)} aria-label="태어난 날"><option value="">일</option>{Array.from({ length: lunar ? 30 : 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}일</option>)}</select>
            </div>
            {p.family === "tojeong" && <p className="mt-1.5 break-keep text-[12px] text-[#94A3B8]">토정비결은 음력 생일로 봅니다. 양력으로 적으면 음력으로 바꿔 계산합니다.</p>}
          </div>
        )}

        {need("time") && (
          <div>
            <span className={labelCls}>태어난 시각</span>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <select className={inputCls} value={hh} disabled={timeUnknown} onChange={(e) => setHh(e.target.value)} aria-label="시"><option value="">시</option>{Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}시</option>)}</select>
              <select className={inputCls} value={mm} disabled={timeUnknown} onChange={(e) => setMm(e.target.value)} aria-label="분">{Array.from({ length: 12 }, (_, i) => <option key={i} value={i * 5}>{String(i * 5).padStart(2, "0")}분</option>)}</select>
              <button type="button" className={chip(timeUnknown)} onClick={() => setTimeUnknown((v) => !v)}>모름</button>
            </div>
            <p className="mt-1.5 break-keep text-[12px] text-[#94A3B8]">모르면 「모름」 — 시주를 빼고 풀이하며, 그 사실을 결과에 적습니다.</p>
          </div>
        )}

        {need("gender") && <div><span className={labelCls}>성별</span><div className="flex gap-2"><button type="button" className={chip(gender === "female")} onClick={() => setGender("female")}>여성</button><button type="button" className={chip(gender === "male")} onClick={() => setGender("male")}>남성</button></div></div>}

        {need("place") && (
          <div>
            <span className={labelCls}>태어난 곳 <span className="font-medium text-[#94A3B8]">(선택 · 시각 보정에 씁니다)</span></span>
            <div className="flex flex-wrap gap-2">{PLACES.map(([n]) => <button type="button" key={n} className={chip(place === n)} onClick={() => setPlace(place === n ? "" : n)}>{n}</button>)}</div>
          </div>
        )}

        {need("concern") && <div><label className={labelCls}>올해 가장 궁금한 것 <span className="font-medium text-[#94A3B8]">(선택)</span></label><textarea className={inputCls} rows={3} maxLength={300} value={concern} onChange={(e) => setConcern(e.target.value)} placeholder="예) 올해 자리를 옮겨도 될지 궁금합니다." /></div>}

        {need("contact") && <div><label className={labelCls}>연락처</label><input className={inputCls} maxLength={40} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="휴대폰 번호 또는 카카오톡 ID" required /><p className="mt-1.5 break-keep text-[12px] text-[#94A3B8]">감수가 끝나면 이 연락처로 결과 주소를 알려 드립니다.</p></div>}

        {personal && (
          <label className="flex items-start gap-2.5 rounded-xl bg-[#F7FAFF] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#475569]">
            <input type="checkbox" className="mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="break-keep">입력한 정보({need("contact") ? "이름·연락처·" : ""}생년월일시)를 결과물 제작과 전달에만 쓰는 데 동의합니다. <a href="/legal/" target="_blank" className="font-semibold text-[#3B6CF5] underline">개인정보처리방침</a></span>
          </label>
        )}

        {err && <p className="break-keep rounded-xl bg-[#FEF2F2] px-3.5 py-3 text-[13.5px] font-semibold text-[#B91C1C]">{err}</p>}
        <button type="submit" disabled={busy || locked} className="block w-full rounded-full bg-gradient-to-b from-[#6896FF] to-[#3B6CF5] px-5 py-4 text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgba(59,108,245,.28)] disabled:opacity-60">
          {locked ? `${startLabel(true)} 오픈 — 지금은 미리 보기만` : busy ? "처리 중…" : p.pay === "free" ? "무료로 카드 받기" : `신청하고 결제 안내 보기 · ${won(p.price)}`}
        </button>
      </form>
    </div>
  );
}
