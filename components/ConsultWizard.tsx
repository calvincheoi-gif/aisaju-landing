"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  SIMPLE_PACKAGES,
  DETAIL_PURPOSES,
  DETAIL_ADDONS,
  applyDiscount,
  formatKrw,
  type CustomerType,
  type ApplicationMode,
} from "@/lib/pricing";

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-700";

type Step = "customerType" | "mode" | "form" | "payment" | "done";
type PaymentMethod = "bank" | "kakaopay";
type DiscountSource = "auto" | "manual" | "none";
type LookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

export default function ConsultWizard() {
  const [step, setStep] = useState<Step>("customerType");
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [mode, setMode] = useState<ApplicationMode | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [birth, setBirth] = useState("");
  const [contact, setContact] = useState("");
  const [concern, setConcern] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>(SIMPLE_PACKAGES[0].key);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [autoDiscountRate, setAutoDiscountRate] = useState(0);
  const [autoTierName, setAutoTierName] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualRateInput, setManualRateInput] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [discountSource, setDiscountSource] = useState<DiscountSource>("none");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const effectiveRate = customerType === "member" ? discountRate : 0;

  const total = useMemo(() => {
    if (!customerType) return 0;
    if (mode === "simple") {
      const pkg = SIMPLE_PACKAGES.find((p) => p.key === selectedPackage);
      return applyDiscount(pkg?.price ?? 0, effectiveRate);
    }
    if (mode === "detail") {
      const purposeSum = DETAIL_PURPOSES.filter((p) => selectedPurposes.includes(p.key)).reduce((sum, p) => sum + p.price, 0);
      const addonSum = DETAIL_ADDONS.filter((a) => selectedAddons.includes(a.key)).reduce((sum, a) => sum + a.price, 0);
      return applyDiscount(purposeSum + addonSum, effectiveRate);
    }
    return 0;
  }, [customerType, mode, selectedPackage, selectedPurposes, selectedAddons, effectiveRate]);

  function togglePurpose(key: string) {
    setSelectedPurposes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function toggleAddon(key: string) {
    setSelectedAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleLookupDiscount() {
    if (customerType !== "member") return;
    const phone = contact.trim();
    if (!phone) return;
    setLookupStatus("loading");
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("lookup_member_discount", { p_phone: phone });
      if (error) throw error;
      if (data && data.length > 0) {
        const rate = Number(data[0].discount_rate) || 0;
        const tier = data[0].tier_name as string;
        setAutoDiscountRate(rate);
        setAutoTierName(tier);
        setLookupStatus("found");
        if (!manualMode) {
          setDiscountRate(rate);
          setDiscountSource("auto");
        }
      } else {
        setAutoDiscountRate(0);
        setAutoTierName(null);
        setLookupStatus("not_found");
        setManualMode(true);
        setDiscountRate(0);
        setDiscountSource("none");
      }
    } catch {
      setAutoDiscountRate(0);
      setAutoTierName(null);
      setLookupStatus("error");
      setManualMode(true);
      setDiscountRate(0);
      setDiscountSource("none");
    }
  }

  function handleManualRateChange(value: string) {
    setManualRateInput(value);
    const num = Number(value);
    if (value === "") {
      setDiscountRate(0);
      setDiscountSource("none");
      return;
    }
    if (!Number.isNaN(num)) {
      setDiscountRate(Math.min(Math.max(num, 0), 100) / 100);
      setDiscountSource("manual");
    }
  }

  function useAutoResult() {
    setManualMode(false);
    setDiscountRate(autoDiscountRate);
    setDiscountSource("auto");
  }

  function handleGoToPayment(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  async function handleCopyAccount() {
    const { bankName, accountNumber, accountHolder } = siteConfig.payment.bank;
    const text = `${bankName} ${accountNumber} (예금주: ${accountHolder})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice("계좌번호를 복사했습니다.");
    } catch {
      setCopyNotice(text);
    }
    setTimeout(() => setCopyNotice(null), 3000);
  }

  async function handleFinalSubmit() {
    if (!paymentMethod) return;
    setSubmitting(true);
    const typeLabel = customerType === "member" ? "단골(멤버십)" : "일반";
    const modeLabel = mode === "detail" ? "디테일" : "간편";
    const paymentLabel = paymentMethod === "bank" ? "계좌이체" : "카카오페이 송금";
    const discountLabel =
      customerType === "member"
        ? discountSource === "auto"
          ? `${autoTierName ?? ""} 등급 자동확인 ${Math.round(discountRate * 100)}% 할인`
          : discountSource === "manual"
            ? `직접입력 ${Math.round(discountRate * 100)}% 할인(상담사 확인 필요)`
            : "할인 미확정(접수 후 관리자 확인)"
        : null;
    const itemLines =
      mode === "simple"
        ? [SIMPLE_PACKAGES.find((p) => p.key === selectedPackage)?.label ?? ""]
        : [
            ...DETAIL_PURPOSES.filter((p) => selectedPurposes.includes(p.key)).map((p) => p.label),
            ...DETAIL_ADDONS.filter((a) => selectedAddons.includes(a.key)).map((a) => `+ ${a.label}`),
          ];
    const summary = [
      `고객 유형: ${typeLabel} / ${modeLabel} 신청서`,
      `이름: ${name}`,
      `성별: ${gender === "female" ? "여성" : "남성"}`,
      `생년월일시: ${birth}`,
      `연락처: ${contact}`,
      `신청 항목: ${itemLines.join(", ")}`,
      `예상 금액: ${formatKrw(total)}${discountLabel ? ` (${discountLabel})` : ""}`,
      `결제 방법: ${paymentLabel}`,
      "",
      `고민 내용: ${concern}`,
    ].join("\n");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          birthInfo: birth,
          contact,
          customerType,
          applicationMode: mode,
          packageKey: mode === "simple" ? selectedPackage : undefined,
          purposes: mode === "detail" ? selectedPurposes : undefined,
          addons: mode === "detail" ? selectedAddons : undefined,
          concern,
          estimatedPrice: total,
          paymentMethod,
          discountRate: customerType === "member" ? discountRate : 0,
          discountSource: customerType === "member" ? discountSource : "none",
        }),
      });
      const result = await res.json();
      setSaveNotice(
        result.saved
          ? "신청 내용이 시스템에 정상 저장되었습니다."
          : result.message || result.error || "저장 중 안내: 이메일로 접수됩니다."
      );
    } catch (e) {
      setSaveNotice(
        e instanceof DOMException && e.name === "AbortError"
          ? "DB 응답이 지연되어 자동 저장은 확인되지 않았습니다. 이메일로 접수된 내용을 확인해 연락드리겠습니다."
          : "DB 저장 요청에 실패했습니다. 이메일로 접수된 내용을 확인해 연락드리겠습니다."
      );
    } finally {
      clearTimeout(timeoutId);
    }
    setSubmittedSummary(summary);
    setSubmitting(false);
    setStep("done");
    const mailtoHref = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`[상담 신청] ${name}님 - ${typeLabel}/${modeLabel} (${paymentLabel})`)}&body=${encodeURIComponent(summary)}`;
    window.open(mailtoHref, "_blank");
  }

  if (step === "customerType") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-[20px] font-semibold text-ink-900">먼저, 고객 유형을 선택해 주세요</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button className="card text-left hover:border-indigo-600" onClick={() => { setCustomerType("general"); setStep("mode"); }}>
            <p className="text-[17px] font-semibold text-ink-900">일반 고객</p>
            <p className="mt-2 text-[13px] text-body">처음 방문하셨거나 정가로 이용하시는 경우</p>
          </button>
          <button className="card text-left hover:border-indigo-600" onClick={() => { setCustomerType("member"); setStep("mode"); }}>
            <p className="text-[17px] font-semibold text-ink-900">단골(멤버십) 고객</p>
            <p className="mt-2 text-[13px] text-body">기존 상담 이력이 있으신 분 · 등급별 할인 적용</p>
          </button>
        </div>
      </div>
    );
  }

  if (step === "mode") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <button className="mb-6 text-[13px] text-body underline" onClick={() => setStep("customerType")}>← 고객 유형 다시 선택</button>
        <h2 className="text-[20px] font-semibold text-ink-900">신청서 방식을 선택해 주세요 ({customerType === "member" ? "단골" : "일반"} 고객)</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button className="card text-left hover:border-indigo-600" onClick={() => { setMode("simple"); setStep("form"); }}>
            <p className="text-[17px] font-semibold text-ink-900">간편 신청</p>
            <p className="mt-2 text-[13px] text-body">3가지 패키지 중 선택 (리포트만 / +톡·전화 / +대면)</p>
          </button>
          <button className="card text-left hover:border-indigo-600" onClick={() => { setMode("detail"); setStep("form"); }}>
            <p className="text-[17px] font-semibold text-ink-900">디테일 신청</p>
            <p className="mt-2 text-[13px] text-body">10개 상담 목적 + 옵션을 직접 조합</p>
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card">
          <p className="text-[18px] font-semibold text-ink-900">신청이 접수되었습니다</p>
          {saveNotice && <p className="mt-2 text-[13px] font-medium text-indigo-600">{saveNotice}</p>}
          <p className="mt-2 text-[13px] text-body">이메일 클라이언트가 열리지 않았다면 아래 내용을 직접 {siteConfig.contactEmail} 로 보내주세요. 입금/송금 확인 후 빠른 시일 내 {siteConfig.org}에서 연락드립니다.</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-sm bg-bg-alt p-4 text-[12px] leading-relaxed text-ink-700">{submittedSummary}</pre>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    const { bankName, accountNumber, accountHolder } = siteConfig.payment.bank;
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <button type="button" className="text-[13px] text-body underline" onClick={() => setStep("form")}>← 신청 내용 다시 확인</button>
        <div className="flex items-center justify-between rounded-md bg-ink-900 px-4 py-3 text-white">
          <span className="text-[13px]">결제하실 금액</span>
          <span className="text-[18px] font-bold">{formatKrw(total)}</span>
        </div>
        <div className="space-y-3">
          <label className={labelClass}>결제 방법을 선택해 주세요</label>
          <button type="button" className={`w-full rounded-md border p-4 text-left ${paymentMethod === "bank" ? "border-indigo-600 bg-indigo-50" : "border-border"}`} onClick={() => setPaymentMethod("bank")}>
            <p className="text-[14px] font-semibold text-ink-900">계좌이체</p>
            <p className="mt-1 text-[12px] text-body">아래 계좌로 입금 후 신청 완료 버튼을 눌러주세요</p>
            {paymentMethod === "bank" && (
              <div className="mt-3 rounded-sm bg-white p-3 text-[13px] text-ink-900">
                <p>{bankName} {accountNumber}</p>
                <p className="mt-0.5 text-body">예금주: {accountHolder}</p>
                <button type="button" className="mt-2 rounded-sm border border-border px-3 py-1.5 text-[12px] text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); handleCopyAccount(); }}>계좌번호 복사</button>
                {copyNotice && <p className="mt-2 text-[12px] text-indigo-600">{copyNotice}</p>}
              </div>
            )}
          </button>
          <button type="button" className={`w-full rounded-md border p-4 text-left ${paymentMethod === "kakaopay" ? "border-indigo-600 bg-indigo-50" : "border-border"}`} onClick={() => setPaymentMethod("kakaopay")}>
            <p className="text-[14px] font-semibold text-ink-900">카카오페이 송금</p>
            <p className="mt-1 text-[12px] text-body">아래 링크로 송금 후 신청 완료 버튼을 눌러주세요</p>
            {paymentMethod === "kakaopay" && (
              <div className="mt-3">
                <a href={siteConfig.payment.kakaopayLink} target="_blank" rel="noopener noreferrer" className="inline-block rounded-sm bg-[#FEE500] px-4 py-2 text-[13px] font-semibold text-ink-900" onClick={(e) => e.stopPropagation()}>카카오페이로 송금하기</a>
              </div>
            )}
          </button>
        </div>
        <button type="button" className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50" disabled={!paymentMethod || submitting} onClick={handleFinalSubmit}>{submitting ? "접수 중..." : "입금/송금 완료, 신청 완료하기"}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleGoToPayment} className="mx-auto max-w-xl space-y-6">
      <button type="button" className="text-[13px] text-body underline" onClick={() => setStep("mode")}>← 신청 방식 다시 선택</button>
      <div className="rounded-md bg-indigo-50 px-4 py-2 text-[12px] font-medium text-indigo-600">{customerType === "member" ? "단골(멤버십)" : "일반"} 고객 · {mode === "detail" ? "디테일" : "간편"} 신청서</div>
      {mode === "simple" ? (
        <div className="space-y-3">
          <label className={labelClass}>패키지 선택</label>
          {SIMPLE_PACKAGES.map((pkg) => (
            <label key={pkg.key} className={`flex cursor-pointer items-start justify-between gap-3 rounded-md border p-4 text-left ${selectedPackage === pkg.key ? "border-indigo-600 bg-indigo-50" : "border-border"}`}>
              <div className="flex gap-3">
                <input type="radio" name="package" className="mt-1" checked={selectedPackage === pkg.key} onChange={() => setSelectedPackage(pkg.key)} />
                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{pkg.label}</p>
                  <p className="mt-0.5 text-[12px] text-body">{pkg.desc}</p>
                </div>
              </div>
              <p className="shrink-0 text-[14px] font-semibold text-ink-900">{formatKrw(applyDiscount(pkg.price, effectiveRate))}</p>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>상담 목적 (복수 선택 가능)</label>
            <div className="grid grid-cols-2 gap-2">
              {DETAIL_PURPOSES.map((p) => (
                <label key={p.key} className={`flex cursor-pointer items-center justify-between rounded-sm border p-2.5 text-[13px] ${selectedPurposes.includes(p.key) ? "border-indigo-600 bg-indigo-50" : "border-border"}`}>
                  <span className="flex items-center gap-2"><input type="checkbox" checked={selectedPurposes.includes(p.key)} onChange={() => togglePurpose(p.key)} />{p.label}</span>
                  <span className="text-body">{formatKrw(p.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>추가 옵션</label>
            <div className="space-y-2">
              {DETAIL_ADDONS.map((a) => (
                <label key={a.key} className={`flex cursor-pointer items-center justify-between rounded-sm border p-2.5 text-[13px] ${selectedAddons.includes(a.key) ? "border-indigo-600 bg-indigo-50" : "border-border"}`}>
                  <span className="flex items-center gap-2"><input type="checkbox" checked={selectedAddons.includes(a.key)} onChange={() => toggleAddon(a.key)} />{a.label}</span>
                  <span className="text-body">+{formatKrw(a.price)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between rounded-md bg-ink-900 px-4 py-3 text-white">
        <span className="text-[13px]">예상 결제 금액</span>
        <span className="text-[18px] font-bold">{formatKrw(total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>이름</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>성별</label>
          <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>생년월일시 (예: 1990-05-15 15시, 음력 여부 포함)</label>
        <input className={inputClass} placeholder="1990-05-15 15시 (양력)" value={birth} onChange={(e) => setBirth(e.target.value)} required />
      </div>
      <div>
        <label className={labelClass}>연락처</label>
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} onBlur={handleLookupDiscount} required />
      </div>
      {customerType === "member" && (
        <div className="rounded-md border border-border bg-bg-alt p-3">
          <p className="text-[12px] font-medium text-ink-700">회원 할인 확인</p>
          {lookupStatus === "loading" && <p className="mt-1 text-[12px] text-body">조회 중...</p>}
          {lookupStatus === "found" && !manualMode && (
            <p className="mt-1 text-[13px] text-indigo-600">✓ {autoTierName} 등급 확인 · {Math.round(autoDiscountRate * 100)}% 할인 적용
              <button type="button" className="ml-2 text-[12px] text-body underline" onClick={() => setManualMode(true)}>직접 입력하기</button>
            </p>
          )}
          {(lookupStatus === "not_found" || lookupStatus === "error") && (
            <p className="mt-1 text-[12px] text-body">
              {lookupStatus === "error" ? "할인율 조회 중 오류가 발생했습니다. 협의된 할인율이 있다면 아래에 입력해 주세요." : "등록된 회원 정보를 찾을 수 없습니다. 상담사와 협의된 할인율이 있다면 아래에 입력해 주세요."}{" "}(없으면 0%로 접수되며, 접수 후 관리자가 확인해 최종 조정합니다.)
            </p>
          )}
          {manualMode && (
            <div className="mt-2 flex items-center gap-2">
              <input type="number" min={0} max={100} className={inputClass + " w-24"} placeholder="0" value={manualRateInput} onChange={(e) => handleManualRateChange(e.target.value)} />
              <span className="text-[13px] text-body">% 할인 직접 입력</span>
              {lookupStatus === "found" && <button type="button" className="text-[12px] text-indigo-600 underline" onClick={useAutoResult}>자동조회 결과({Math.round(autoDiscountRate * 100)}%) 사용</button>}
            </div>
          )}
          {customerType === "member" && (
            <p className="mt-2 text-right text-[12px] text-indigo-600">현재 적용 할인: {Math.round(discountRate * 100)}%{discountSource === "auto" && " (회원 등급 자동확인)"}{discountSource === "manual" && " (직접입력, 상담사 확인 필요)"}{discountSource === "none" && " (미확정, 접수 후 관리자 확인)"}</p>
          )}
        </div>
      )}
      <div>
        <label className={labelClass}>고민 내용</label>
        <textarea className={inputClass} rows={4} value={concern} onChange={(e) => setConcern(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">결제 방법 선택하기</button>
    </form>
  );
}
