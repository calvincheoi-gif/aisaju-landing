"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import {
  SIMPLE_PACKAGES,
  DETAIL_PURPOSES,
  DETAIL_ADDONS,
  MEMBER_DISCOUNT_RATE,
  applyMemberDiscount,
  formatKrw,
  type CustomerType,
  type ApplicationMode,
} from "@/lib/pricing";

/**
 * 상담 신청 4갈래 위저드: (일반 | 단골) x (간편 | 디테일)
 *
 * 가격/할인 로직은 현재 하드코딩(lib/pricing.ts) 상태이며,
 * Supabase 연동 이후 관리자가 설정한 실제 기준가격·등급 배수로 대체됩니다.
 * 신청 접수는 별도 백엔드/DB가 아직 없어 mailto로 연구소에 전달하는 임시 방식입니다.
 */

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-700";

type Step = "customerType" | "mode" | "form" | "done";

export default function ConsultWizard() {
  const [step, setStep] = useState<Step>("customerType");
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [mode, setMode] = useState<ApplicationMode | null>(null);

  // 공통 입력
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [birth, setBirth] = useState("");
  const [contact, setContact] = useState("");
  const [concern, setConcern] = useState("");

  // 간편 버전
  const [selectedPackage, setSelectedPackage] = useState<string>(SIMPLE_PACKAGES[0].key);

  // 디테일 버전
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [submittedSummary, setSubmittedSummary] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const total = useMemo(() => {
    if (!customerType) return 0;
    if (mode === "simple") {
      const pkg = SIMPLE_PACKAGES.find((p) => p.key === selectedPackage);
      return applyMemberDiscount(pkg?.price ?? 0, customerType);
    }
    if (mode === "detail") {
      const purposeSum = DETAIL_PURPOSES.filter((p) => selectedPurposes.includes(p.key)).reduce(
        (sum, p) => sum + p.price,
        0
      );
      const addonSum = DETAIL_ADDONS.filter((a) => selectedAddons.includes(a.key)).reduce(
        (sum, a) => sum + a.price,
        0
      );
      return applyMemberDiscount(purposeSum + addonSum, customerType);
    }
    return 0;
  }, [customerType, mode, selectedPackage, selectedPurposes, selectedAddons]);

  function togglePurpose(key: string) {
    setSelectedPurposes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function toggleAddon(key: string) {
    setSelectedAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const typeLabel = customerType === "member" ? "단골(멤버십)" : "일반";
    const modeLabel = mode === "detail" ? "디테일" : "간편";
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
      `예상 금액: ${formatKrw(total)}${customerType === "member" ? ` (단골 ${MEMBER_DISCOUNT_RATE * 100}% 할인 적용)` : ""}`,
      "",
      `고민 내용: ${concern}`,
    ].join("\n");

    // Supabase DB 저장 시도 (연동 전이면 서버가 안내 메시지만 반환)
    // 네트워크가 응답 없이 멈추는 경우를 대비해 10초 후 자동 취소합니다.
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
    setStep("done");

    const mailtoHref = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
      `[상담 신청] ${name}님 - ${typeLabel}/${modeLabel}`
    )}&body=${encodeURIComponent(summary)}`;
    window.open(mailtoHref, "_blank");
  }

  // ---- Step 1: 고객 유형 ----
  if (step === "customerType") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-[20px] font-semibold text-ink-900">먼저, 고객 유형을 선택해 주세요</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setCustomerType("general");
              setStep("mode");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">일반 고객</p>
            <p className="mt-2 text-[13px] text-body">처음 방문하셨거나 정가로 이용하시는 경우</p>
          </button>
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setCustomerType("member");
              setStep("mode");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">단골(멤버십) 고객</p>
            <p className="mt-2 text-[13px] text-body">
              기존 상담 이력이 있으신 분 · 등급별 할인 적용
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ---- Step 2: 간편/디테일 ----
  if (step === "mode") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <button className="mb-6 text-[13px] text-body underline" onClick={() => setStep("customerType")}>
          ← 고객 유형 다시 선택
        </button>
        <h2 className="text-[20px] font-semibold text-ink-900">
          신청서 방식을 선택해 주세요 ({customerType === "member" ? "단골" : "일반"} 고객)
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setMode("simple");
              setStep("form");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">간편 신청</p>
            <p className="mt-2 text-[13px] text-body">
              3가지 패키지 중 선택 (리포트만 / +톡·전화 / +대면)
            </p>
          </button>
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setMode("detail");
              setStep("form");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">디테일 신청</p>
            <p className="mt-2 text-[13px] text-body">10개 상담 목적 + 옵션을 직접 조합</p>
          </button>
        </div>
      </div>
    );
  }

  // ---- Step 4: 완료 ----
  if (step === "done") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card">
          <p className="text-[18px] font-semibold text-ink-900">신청이 접수되었습니다</p>
          {saveNotice && (
            <p className="mt-2 text-[13px] font-medium text-indigo-600">{saveNotice}</p>
          )}
          <p className="mt-2 text-[13px] text-body">
            이메일 클라이언트가 열리지 않았다면 아래 내용을 직접 {siteConfig.contactEmail} 로 보내주세요.
            빠른 시일 내 {siteConfig.org}에서 연락드립니다.
          </p>
          <pre className="mt-4 whitespace-pre-wrap rounded-sm bg-bg-alt p-4 text-[12px] leading-relaxed text-ink-700">
            {submittedSummary}
          </pre>
        </div>
      </div>
    );
  }

  // ---- Step 3: 폼 (간편 / 디테일 분기) ----
  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <button
        type="button"
        className="text-[13px] text-body underline"
        onClick={() => setStep("mode")}
      >
        ← 신청 방식 다시 선택
      </button>

      <div className="rounded-md bg-indigo-50 px-4 py-2 text-[12px] font-medium text-indigo-600">
        {customerType === "member" ? "단골(멤버십)" : "일반"} 고객 · {mode === "detail" ? "디테일" : "간편"} 신청서
      </div>

      {mode === "simple" ? (
        <div className="space-y-3">
          <label className={labelClass}>패키지 선택</label>
          {SIMPLE_PACKAGES.map((pkg) => (
            <label
              key={pkg.key}
              className={`flex cursor-pointer items-start justify-between gap-3 rounded-md border p-4 text-left ${
                selectedPackage === pkg.key ? "border-indigo-600 bg-indigo-50" : "border-border"
              }`}
            >
              <div className="flex gap-3">
                <input
                  type="radio"
                  name="package"
                  className="mt-1"
                  checked={selectedPackage === pkg.key}
                  onChange={() => setSelectedPackage(pkg.key)}
                />
                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{pkg.label}</p>
                  <p className="mt-0.5 text-[12px] text-body">{pkg.desc}</p>
                </div>
              </div>
              <p className="shrink-0 text-[14px] font-semibold text-ink-900">
                {formatKrw(applyMemberDiscount(pkg.price, customerType!))}
              </p>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>상담 목적 (복수 선택 가능)</label>
            <div className="grid grid-cols-2 gap-2">
              {DETAIL_PURPOSES.map((p) => (
                <label
                  key={p.key}
                  className={`flex cursor-pointer items-center justify-between rounded-sm border p-2.5 text-[13px] ${
                    selectedPurposes.includes(p.key) ? "border-indigo-600 bg-indigo-50" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPurposes.includes(p.key)}
                      onChange={() => togglePurpose(p.key)}
                    />
                    {p.label}
                  </span>
                  <span className="text-body">{formatKrw(p.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>추가 옵션</label>
            <div className="space-y-2">
              {DETAIL_ADDONS.map((a) => (
                <label
                  key={a.key}
                  className={`flex cursor-pointer items-center justify-between rounded-sm border p-2.5 text-[13px] ${
                    selectedAddons.includes(a.key) ? "border-indigo-600 bg-indigo-50" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(a.key)}
                      onChange={() => toggleAddon(a.key)}
                    />
                    {a.label}
                  </span>
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
      {customerType === "member" && (
        <p className="text-right text-[12px] text-indigo-600">
          단골 할인 {MEMBER_DISCOUNT_RATE * 100}% 적용 (실제 등급별 할인율은 관리자 설정 예정)
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>이름</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>성별</label>
          <select
            className={inputClass}
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
          >
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>생년월일시 (예: 1990-05-15 15시, 음력 여부 포함)</label>
        <input
          className={inputClass}
          placeholder="1990-05-15 15시 (양력)"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>연락처</label>
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>고민 내용</label>
        <textarea
          className={inputClass}
          rows={4}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full justify-center">
        신청하기
      </button>
    </form>
  );
}
