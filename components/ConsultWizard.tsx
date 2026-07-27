"use client";

import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import {
  DEFAULT_SIMPLE_PACKAGES,
  DEFAULT_DETAIL_PURPOSES,
  DEFAULT_DETAIL_ADDONS,
  DEFAULT_MEMBER_DISCOUNT_RATE,
  applyMemberDiscount,
  type CustomerType,
  type ApplicationMode,
  type SimplePackage,
  type PricedItem,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/i18n";
import { useT } from "./LanguageProvider";

/**
 * 상담 신청 4갈래 위저드: (일반 | 단골) x (간편 | 디테일)
 *
 * 가격은 /api/pricing 에서 불러오며, 관리자가 /admin/pricing 에서 수정한 값이
 * 반영됩니다. Supabase 연동 전이거나 요청 실패 시 lib/pricing.ts의 기본값을 사용합니다.
 * 신청 접수는 별도 백엔드/DB가 아직 없어 mailto로 연구소에 전달하는 임시 방식도 함께 사용합니다.
 */

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-700";

type Step = "customerType" | "mode" | "form" | "done";

export default function ConsultWizard() {
  const { lang, t } = useT();
  const [step, setStep] = useState<Step>("customerType");
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [mode, setMode] = useState<ApplicationMode | null>(null);

  const [simplePackages, setSimplePackages] = useState<SimplePackage[]>(DEFAULT_SIMPLE_PACKAGES);
  const [detailPurposes, setDetailPurposes] = useState<PricedItem[]>(DEFAULT_DETAIL_PURPOSES);
  const [detailAddons, setDetailAddons] = useState<PricedItem[]>(DEFAULT_DETAIL_ADDONS);
  const [memberDiscountRate, setMemberDiscountRate] = useState(DEFAULT_MEMBER_DISCOUNT_RATE);

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.simplePackages)) setSimplePackages(data.simplePackages);
        if (Array.isArray(data.detailPurposes)) setDetailPurposes(data.detailPurposes);
        if (Array.isArray(data.detailAddons)) setDetailAddons(data.detailAddons);
        if (typeof data.memberDiscountRate === "number") setMemberDiscountRate(data.memberDiscountRate);
      })
      .catch(() => {});
  }, []);

  // 공통 입력
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [birth, setBirth] = useState("");
  const [contact, setContact] = useState("");
  const [concern, setConcern] = useState("");

  // 간편 버전
  const [selectedPackage, setSelectedPackage] = useState<string>(simplePackages[0]?.key ?? "");

  useEffect(() => {
    if (simplePackages.length > 0 && !simplePackages.some((p) => p.key === selectedPackage)) {
      setSelectedPackage(simplePackages[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simplePackages]);

  // 디테일 버전
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [submittedSummary, setSubmittedSummary] = useState("");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const fmt = (v: number) => formatPrice(v, lang);

  const total = useMemo(() => {
    if (!customerType) return 0;
    if (mode === "simple") {
      const pkg = simplePackages.find((p) => p.key === selectedPackage);
      return applyMemberDiscount(pkg?.price ?? 0, customerType, memberDiscountRate);
    }
    if (mode === "detail") {
      const purposeSum = detailPurposes
        .filter((p) => selectedPurposes.includes(p.key))
        .reduce((sum, p) => sum + p.price, 0);
      const addonSum = detailAddons
        .filter((a) => selectedAddons.includes(a.key))
        .reduce((sum, a) => sum + a.price, 0);
      return applyMemberDiscount(purposeSum + addonSum, customerType, memberDiscountRate);
    }
    return 0;
  }, [customerType, mode, selectedPackage, selectedPurposes, selectedAddons, simplePackages, detailPurposes, detailAddons, memberDiscountRate]);

  function togglePurpose(key: string) {
    setSelectedPurposes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function toggleAddon(key: string) {
    setSelectedAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const typeLabel = customerType === "member" ? t.consultWizard.badgeMember : t.consultWizard.badgeGeneral;
    const modeLabel = mode === "detail" ? t.consultWizard.badgeDetail : t.consultWizard.badgeSimple;
    const itemLines =
      mode === "simple"
        ? [simplePackages.find((p) => p.key === selectedPackage)?.label ?? ""]
        : [
            ...detailPurposes.filter((p) => selectedPurposes.includes(p.key)).map((p) => p.label),
            ...detailAddons.filter((a) => selectedAddons.includes(a.key)).map((a) => `+ ${a.label}`),
          ];

    const summary = [
      `${typeLabel} / ${modeLabel}`,
      `${t.consultWizard.nameLabel}: ${name}`,
      `${t.consultWizard.genderLabel}: ${gender === "female" ? t.consultWizard.female : t.consultWizard.male}`,
      `${t.consultWizard.birthLabel}: ${birth}`,
      `${t.consultWizard.contactLabel}: ${contact}`,
      `${itemLines.join(", ")}`,
      `${t.consultWizard.totalLabel}: ${fmt(total)}`,
      "",
      `${t.consultWizard.concernLabel}: ${concern}`,
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
        }),
      });
      const result = await res.json();
      setSaveNotice(result.saved ? null : result.message || result.error || null);
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
        <h2 className="text-[20px] font-semibold text-ink-900">{t.consultWizard.step1Title}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setCustomerType("general");
              setStep("mode");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">{t.consultWizard.generalTitle}</p>
            <p className="mt-2 text-[13px] text-body">{t.consultWizard.generalDesc}</p>
          </button>
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setCustomerType("member");
              setStep("mode");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">{t.consultWizard.memberTitle}</p>
            <p className="mt-2 text-[13px] text-body">{t.consultWizard.memberDesc}</p>
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
          {t.consultWizard.backToType}
        </button>
        <h2 className="text-[20px] font-semibold text-ink-900">
          {t.consultWizard.step2Title} ({customerType === "member" ? t.consultWizard.badgeMember : t.consultWizard.badgeGeneral})
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setMode("simple");
              setStep("form");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">{t.consultWizard.simpleTitle}</p>
            <p className="mt-2 text-[13px] text-body">{t.consultWizard.simpleDesc}</p>
          </button>
          <button
            className="card text-left hover:border-indigo-600"
            onClick={() => {
              setMode("detail");
              setStep("form");
            }}
          >
            <p className="text-[17px] font-semibold text-ink-900">{t.consultWizard.detailTitle}</p>
            <p className="mt-2 text-[13px] text-body">{t.consultWizard.detailDesc}</p>
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
          <p className="text-[18px] font-semibold text-ink-900">{t.consultWizard.doneTitle}</p>
          {saveNotice && <p className="mt-2 text-[13px] font-medium text-indigo-600">{saveNotice}</p>}
          <p className="mt-2 text-[13px] text-body">
            {t.consultWizard.doneDesc} ({siteConfig.contactEmail})
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
      <button type="button" className="text-[13px] text-body underline" onClick={() => setStep("mode")}>
        {t.consultWizard.backToMode}
      </button>

      <div className="rounded-md bg-indigo-50 px-4 py-2 text-[12px] font-medium text-indigo-600">
        {customerType === "member" ? t.consultWizard.badgeMember : t.consultWizard.badgeGeneral} ·{" "}
        {mode === "detail" ? t.consultWizard.badgeDetail : t.consultWizard.badgeSimple}
      </div>

      {mode === "simple" ? (
        <div className="space-y-3">
          <label className={labelClass}>{t.consultWizard.packageLabel}</label>
          {simplePackages.map((pkg) => (
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
                {fmt(applyMemberDiscount(pkg.price, customerType!, memberDiscountRate))}
              </p>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t.consultWizard.purposeLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {detailPurposes.map((p) => (
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
                  <span className="text-body">{fmt(p.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.consultWizard.addonLabel}</label>
            <div className="space-y-2">
              {detailAddons.map((a) => (
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
                  <span className="text-body">+{fmt(a.price)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-md bg-ink-900 px-4 py-3 text-white">
        <span className="text-[13px]">{t.consultWizard.totalLabel}</span>
        <span className="text-[18px] font-bold">{fmt(total)}</span>
      </div>
      {customerType === "member" && (
        <p className="text-right text-[12px] text-indigo-600">{t.consultWizard.memberDiscountNote}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t.consultWizard.nameLabel}</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>{t.consultWizard.genderLabel}</label>
          <select
            className={inputClass}
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
          >
            <option value="female">{t.consultWizard.female}</option>
            <option value="male">{t.consultWizard.male}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.consultWizard.birthLabel}</label>
        <input
          className={inputClass}
          placeholder={t.consultWizard.birthPlaceholder}
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>{t.consultWizard.contactLabel}</label>
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} required />
      </div>

      <div>
        <label className={labelClass}>{t.consultWizard.concernLabel}</label>
        <textarea
          className={inputClass}
          rows={4}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full justify-center">
        {t.consultWizard.submitBtn}
      </button>
    </form>
  );
}
