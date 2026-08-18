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

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const BIRTH_INFO_STORAGE_KEY = "aisajulab_birth_info";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 101 }, (_, i) => CURRENT_YEAR - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** "1990년 5월 15일 15시", "1990-05-15 오후 3시" 같은 자유 서술형 입력에서 연/월/일/시를 최대한 추출합니다. */
function parseBirthManualText(text: string): {
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  unknown?: boolean;
} {
  const result: { year?: string; month?: string; day?: string; hour?: string; unknown?: boolean } = {};
  if (/시간\s*모름|시간\s*불명|시간\s*미상/.test(text)) {
    result.unknown = true;
  }
  const dateMatch = text.match(/(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?/);
  if (dateMatch) {
    result.year = dateMatch[1];
    result.month = dateMatch[2].padStart(2, "0");
    result.day = dateMatch[3].padStart(2, "0");
  }
  const rest = dateMatch ? text.slice((dateMatch.index ?? 0) + dateMatch[0].length) : text;
  const hourMatch =
    rest.match(/(오전|오후|AM|PM|am|pm)?\s*(\d{1,2})\s*시(?!간)/) || rest.match(/(\d{1,2})\s*:\s*\d{2}/);
  if (hourMatch) {
    const ampm = hourMatch[1] && /시/.test(hourMatch[0]) ? hourMatch[1] : undefined;
    let hourVal = parseInt(hourMatch[2] ?? hourMatch[1], 10);
    if (ampm && /오후|PM|pm/.test(ampm) && hourVal < 12) hourVal += 12;
    if (ampm && /오전|AM|am/.test(ampm) && hourVal === 12) hourVal = 0;
    if (!Number.isNaN(hourVal) && hourVal >= 0 && hourVal <= 23) {
      result.hour = String(hourVal);
    }
  }
  return result;
}

type Step = "customerType" | "mode" | "form" | "done";

/** 유입 추적 — 공용 쿠키(sp_device)와 URL 파라미터(utm/code/rate)를 읽는다 */
function readTracking() {
  if (typeof window === "undefined") return {};
  const qs = new URLSearchParams(window.location.search);
  const paramUtm = qs.get("utm");
  if (paramUtm) {
    try { window.localStorage.setItem("sp_utm", paramUtm); } catch {}
  }
  let savedUtm: string | null = null;
  try { savedUtm = window.localStorage.getItem("sp_utm"); } catch {}
  const m = document.cookie.match(/(?:^|; )sp_device=([^;]*)/);
  const code = qs.get("code");
  const rate = Number(qs.get("rate"));
  return {
    utm: paramUtm || savedUtm || null,
    deviceCode: m ? decodeURIComponent(m[1]) : null,
    referrer: document.referrer || null,
    couponCode: code || null,
    discountRate: code && rate > 0 ? rate : undefined,
    discountSource: code ? "popup_wheel" : undefined,
  };
}

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

  // 생년월일시 입력 (구조화된 필드: 연/월/일 선택 또는 직접 입력 + 시간 선택/모름 + 음력·양력 + 윤달)
  const [birthYear, setBirthYear] = useState("");
  const [birthMonthNum, setBirthMonthNum] = useState("");
  const [birthDayNum, setBirthDayNum] = useState("");
  const [birthInputMode, setBirthInputMode] = useState<"select" | "manual">("select");
  const [birthManualText, setBirthManualText] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthError, setBirthError] = useState<string | null>(null);

  const birthDate = useMemo(() => {
    if (birthYear && birthMonthNum && birthDayNum) {
      return `${birthYear}-${birthMonthNum}-${birthDayNum}`;
    }
    return "";
  }, [birthYear, birthMonthNum, birthDayNum]);

  const dayOptions = useMemo(() => {
    const count =
      birthYear && birthMonthNum ? daysInMonth(parseInt(birthYear, 10), parseInt(birthMonthNum, 10)) : 31;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [birthYear, birthMonthNum]);

  useEffect(() => {
    if (birthDayNum && parseInt(birthDayNum, 10) > dayOptions.length) {
      setBirthDayNum(String(dayOptions.length).padStart(2, "0"));
    }
  }, [dayOptions, birthDayNum]);

  function applyManualBirthText(text: string) {
    setBirthManualText(text);
    const parsed = parseBirthManualText(text);
    if (parsed.year && parsed.month && parsed.day) {
      setBirthYear(parsed.year);
      setBirthMonthNum(parsed.month);
      setBirthDayNum(parsed.day);
    }
    if (parsed.unknown) {
      setBirthTimeUnknown(true);
      setBirthHour("");
    } else if (parsed.hour !== undefined) {
      setBirthHour(parsed.hour);
      setBirthTimeUnknown(false);
    }
  }

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

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 사람이 읽기 쉬운 생년월일시 요약 (예: "1990-05-15 15:00 (양력)")
  const birthSummary = useMemo(() => {
    if (!birthDate) return "";
    const [y, m, d] = birthDate.split("-");
    if (!y || !m || !d) return "";
    const hourText = birthTimeUnknown
      ? t.consultWizard.birthTimeUnknownLabel
      : birthHour !== ""
        ? `${birthHour.padStart(2, "0")}:00`
        : "";
    const calendarText =
      calendarType === "lunar"
        ? `${t.consultWizard.lunarLabel}${isLeapMonth ? ` · ${t.consultWizard.leapMonthLabel}` : ""}`
        : t.consultWizard.solarLabel;
    return `${y}-${m}-${d}${hourText ? ` ${hourText}` : ""} (${calendarText})`;
  }, [birthDate, birthHour, birthTimeUnknown, calendarType, isLeapMonth, t]);

  // 최근에 입력한 생년월일시를 기억해뒀다가 재방문 시 자동으로 불러옵니다.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BIRTH_INFO_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        birthYear?: string;
        birthMonthNum?: string;
        birthDayNum?: string;
        birthHour?: string;
        birthTimeUnknown?: boolean;
        calendarType?: "solar" | "lunar";
        isLeapMonth?: boolean;
      };
      if (parsed.birthYear) setBirthYear(parsed.birthYear);
      if (parsed.birthMonthNum) setBirthMonthNum(parsed.birthMonthNum);
      if (parsed.birthDayNum) setBirthDayNum(parsed.birthDayNum);
      if (parsed.birthHour !== undefined) setBirthHour(parsed.birthHour);
      if (parsed.birthTimeUnknown !== undefined) setBirthTimeUnknown(parsed.birthTimeUnknown);
      if (parsed.calendarType) setCalendarType(parsed.calendarType);
      if (parsed.isLeapMonth !== undefined) setIsLeapMonth(parsed.isLeapMonth);
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) 시 조용히 무시
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        BIRTH_INFO_STORAGE_KEY,
        JSON.stringify({ birthYear, birthMonthNum, birthDayNum, birthHour, birthTimeUnknown, calendarType, isLeapMonth })
      );
    } catch {
      // ignore
    }
  }, [birthYear, birthMonthNum, birthDayNum, birthHour, birthTimeUnknown, calendarType, isLeapMonth]);

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

    if (!birthDate) {
      setBirthError(t.consultWizard.birthDateRequired);
      return;
    }
    if (birthDate > todayStr) {
      setBirthError(t.consultWizard.birthDateFuture);
      return;
    }
    if (!birthTimeUnknown && birthHour === "") {
      setBirthError(t.consultWizard.birthTimeRequired);
      return;
    }
    setBirthError(null);

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
      `${t.consultWizard.birthDateLabel}: ${birthSummary}`,
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
          birthInfo: birthSummary,
          contact,
          customerType,
          applicationMode: mode,
          packageKey: mode === "simple" ? selectedPackage : undefined,
          purposes: mode === "detail" ? selectedPurposes : undefined,
          addons: mode === "detail" ? selectedAddons : undefined,
          concern,
          estimatedPrice: total,
          ...readTracking(),
        }),
      });
      const result = await res.json();
      setSaveNotice(result.saved ? null : result.message || result.error || null);
    } catch (e) {
      setSaveNotice(
        e instanceof DOMException && e.name === "AbortError"
          ? t.consultWizard.saveDelayed
          : t.consultWizard.saveFailed
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
            className="card text-left relative border-2 border-indigo-500 bg-indigo-50/70 shadow-[0_6px_18px_-6px_rgba(79,70,229,.45)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(79,70,229,.5)] hover:bg-indigo-50"
            onClick={() => {
              setCustomerType("general");
              setStep("mode");
            }}
          >
            <span className="absolute -top-2.5 left-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {t.consultWizard.mostBadge}
            </span>
            <p className="text-[17px] font-semibold text-indigo-600">{t.consultWizard.generalTitle}</p>
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
            className="card text-left relative border-2 border-indigo-500 bg-indigo-50/70 shadow-[0_6px_18px_-6px_rgba(79,70,229,.45)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(79,70,229,.5)] hover:bg-indigo-50"
            onClick={() => {
              setMode("simple");
              setStep("form");
            }}
          >
            <span className="absolute -top-2.5 left-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {t.consultWizard.fastestBadge}
            </span>
            <p className="text-[17px] font-semibold text-indigo-600">{t.consultWizard.simpleTitle}</p>
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

      <div className="space-y-3 rounded-md border border-border p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={`${labelClass} mb-0`}>{t.consultWizard.birthDateLabel}</label>
            <button
              type="button"
              className="text-[12px] font-medium text-indigo-600 underline"
              onClick={() => setBirthInputMode(birthInputMode === "select" ? "manual" : "select")}
            >
              {birthInputMode === "select" ? t.consultWizard.manualEntryToggle : t.consultWizard.manualEntryBack}
            </button>
          </div>

          {birthInputMode === "select" ? (
            <div className="grid grid-cols-3 gap-2">
              <select
                className={`${inputClass} text-[15px] font-semibold`}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
              >
                <option value="">{t.consultWizard.yearPlaceholder}</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                value={birthMonthNum}
                onChange={(e) => setBirthMonthNum(e.target.value)}
                required
              >
                <option value="">{t.consultWizard.monthPlaceholder}</option>
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={String(m).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                value={birthDayNum}
                onChange={(e) => setBirthDayNum(e.target.value)}
                required
              >
                <option value="">{t.consultWizard.dayPlaceholder}</option>
                {dayOptions.map((d) => (
                  <option key={d} value={String(d).padStart(2, "0")}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <input
                className={inputClass}
                value={birthManualText}
                onChange={(e) => applyManualBirthText(e.target.value)}
                placeholder={t.consultWizard.manualEntryPlaceholder}
              />
              <p className="mt-1 text-[11px] text-body">{t.consultWizard.manualEntryHint}</p>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>{t.consultWizard.birthHourLabel}</label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${inputClass} w-auto min-w-[110px]`}
              value={birthHour}
              onChange={(e) => setBirthHour(e.target.value)}
              disabled={birthTimeUnknown}
            >
              <option value="">{t.consultWizard.birthHourPlaceholder}</option>
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-body">
              <input
                type="checkbox"
                checked={birthTimeUnknown}
                onChange={(e) => {
                  setBirthTimeUnknown(e.target.checked);
                  if (e.target.checked) setBirthHour("");
                }}
              />
              {t.consultWizard.birthTimeUnknownLabel}
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.consultWizard.calendarTypeLabel}</label>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-body">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="calendarType"
                checked={calendarType === "solar"}
                onChange={() => setCalendarType("solar")}
              />
              {t.consultWizard.solarLabel}
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="calendarType"
                checked={calendarType === "lunar"}
                onChange={() => setCalendarType("lunar")}
              />
              {t.consultWizard.lunarLabel}
            </label>
            {calendarType === "lunar" && (
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={isLeapMonth}
                  onChange={(e) => setIsLeapMonth(e.target.checked)}
                />
                {t.consultWizard.leapMonthLabel}
              </label>
            )}
          </div>
        </div>

        {birthSummary && (
          <p className="rounded-sm bg-bg-alt px-3 py-2 text-[12px] text-indigo-600">
            {t.consultWizard.birthPreviewPrefix}
            {birthSummary}
          </p>
        )}
        {birthError && <p className="text-[12px] text-red-600">{birthError}</p>}
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
