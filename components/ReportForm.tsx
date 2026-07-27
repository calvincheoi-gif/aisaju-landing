"use client";

import { useState } from "react";
import MarkdownReport from "./MarkdownReport";
import { siteConfig } from "@/lib/site-config";
import { useT } from "./LanguageProvider";

interface SajuDisplay {
  pillars: { year: string; month: string; day: string; hour: string | null };
  voidBranches: string[];
}

interface ApiResponse {
  report?: string;
  saju?: SajuDisplay;
  error?: string;
}

interface StreamEvent {
  type: "saju" | "delta" | "done" | "error";
  saju?: SajuDisplay;
  text?: string;
  error?: string;
}

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-700";

export default function ReportForm() {
  const { t } = useT();
  const CONSULT_TYPES = t.reportForm.consultTypes;

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("0");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [consultType, setConsultType] = useState(CONSULT_TYPES[0]);
  const [contact, setContact] = useState("");
  const [concern, setConcern] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!name || !year || !month || !day || (!timeUnknown && !hour) || !concern) {
      setFormError(t.reportForm.requiredError);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          year: Number(year),
          month: Number(month),
          day: Number(day),
          isLunar,
          isLeapMonth,
          hour: timeUnknown ? undefined : Number(hour),
          minute: timeUnknown ? undefined : Number(minute),
          timeUnknown,
          consultType,
          concern,
          contact,
        }),
      });

      if (!res.ok) {
        let errMsg = "AI 리포트 생성 중 오류가 발생했습니다.";
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch {
          // 응답 본문이 JSON이 아닌 경우 기본 메시지 사용
        }
        setResult({ error: errMsg });
        return;
      }

      if (!res.body) {
        setResult({ error: "서버 응답을 읽을 수 없습니다." });
        return;
      }

      // 스트리밍 응답(NDJSON)을 순서대로 읽어서 화면에 반영합니다.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sajuData: SajuDisplay | undefined;
      let reportText = "";
      let streamError = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: StreamEvent;
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.type === "saju" && evt.saju) {
            sajuData = evt.saju;
            setResult({ saju: sajuData, report: reportText });
          } else if (evt.type === "delta" && evt.text) {
            reportText += evt.text;
            setResult({ saju: sajuData, report: reportText });
          } else if (evt.type === "error") {
            streamError = evt.error || "AI 리포트 생성 중 오류가 발생했습니다.";
          }
        }
      }

      if (streamError) {
        setResult({ error: streamError, saju: sajuData });
      } else {
        setResult({ saju: sajuData, report: reportText });
      }
    } catch {
      setResult({ error: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.report) {
    const mailBody = [
      `${t.reportForm.nameLabel}: ${name}`,
      `${t.reportForm.birthLabel}: ${year}-${month}-${day} (${isLunar ? t.reportForm.lunar : ""})`,
      `${t.reportForm.consultTypeLabel}: ${consultType}`,
      `${t.reportForm.contactLabel}: ${contact || "-"}`,
      "",
      `${t.reportForm.concernLabel}: ${concern}`,
      "",
      "--- AI Report ---",
      result.report,
    ].join("\n");
    const mailtoHref = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
      `[전문가 확인 요청] ${name}님 AI 리포트`
    )}&body=${encodeURIComponent(mailBody)}`;

    return (
      <div className="mx-auto max-w-2xl">
        <div className="card">
          {result.saju && (
            <div className="mb-6 grid grid-cols-4 gap-2 rounded-md bg-ink-900 p-4">
              {(["year", "month", "day", "hour"] as const).map((key) => (
                <div key={key} className="rounded-sm bg-white/10 py-3 text-center">
                  <p className="text-[16px] font-bold text-white">
                    {result.saju!.pillars[key] ?? t.reportForm.pillars.unknown}
                  </p>
                  <p className="mt-1 text-[10px] text-white/60">{t.reportForm.pillars[key]}</p>
                </div>
              ))}
            </div>
          )}
          <MarkdownReport text={result.report} />
        </div>

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-800">
          ⚠️ {t.reportForm.resultDisclaimer}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a href={mailtoHref} className="btn-secondary">
            {t.reportForm.expertBtn}
          </a>
          <button
            className="btn-ghost"
            onClick={() => {
              setResult(null);
            }}
          >
            {t.reportForm.retryBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-800">
        ⚠️ {t.reportForm.disclaimer}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t.reportForm.nameLabel}</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>{t.reportForm.genderLabel}</label>
          <select
            className={inputClass}
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
          >
            <option value="female">{t.reportForm.female}</option>
            <option value="male">{t.reportForm.male}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.reportForm.birthLabel}</label>
        <div className="flex items-center gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder={t.reportForm.yearPh}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder={t.reportForm.monthPh}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder={t.reportForm.dayPh}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        <div className="mt-2 flex gap-4 text-[13px] text-body">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={isLunar} onChange={(e) => setIsLunar(e.target.checked)} />
            {t.reportForm.lunar}
          </label>
          {isLunar && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
              />
              {t.reportForm.leapMonth}
            </label>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.reportForm.timeLabel}</label>
        <div className="flex items-center gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder={t.reportForm.hourPh}
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={timeUnknown}
          />
          <input
            className={inputClass}
            type="number"
            placeholder={t.reportForm.minutePh}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            disabled={timeUnknown}
          />
          <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-body">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
            />
            {t.reportForm.timeUnknown}
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.reportForm.consultTypeLabel}</label>
        <select className={inputClass} value={consultType} onChange={(e) => setConsultType(e.target.value)}>
          {CONSULT_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{t.reportForm.contactLabel}</label>
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>{t.reportForm.concernLabel}</label>
        <textarea
          className={inputClass}
          rows={4}
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
        />
      </div>

      {formError && <p className="text-[13px] text-red-600">{formError}</p>}
      {result?.error && <p className="text-[13px] text-red-600">{result.error}</p>}

      <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? t.reportForm.loadingBtn : t.reportForm.submitBtn}
      </button>
    </form>
  );
}
