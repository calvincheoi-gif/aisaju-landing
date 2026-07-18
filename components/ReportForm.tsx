"use client";

import { useState } from "react";
import MarkdownReport from "./MarkdownReport";

const CONSULT_TYPES = [
  "개인사주",
  "궁합",
  "직업·진로",
  "사업운",
  "재물운",
  "대운·세운",
  "작명",
  "종합 분석",
];

interface SajuDisplay {
  pillars: { year: string; month: string; day: string; hour: string | null };
  voidBranches: string[];
}

interface ApiResponse {
  report?: string;
  saju?: SajuDisplay;
  error?: string;
}

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-[14px] text-ink-900 outline-none focus:border-indigo-600";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-700";

export default function ReportForm() {
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
      setFormError("필수 항목을 모두 입력해 주세요.");
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
      const data: ApiResponse = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  if (result?.report) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card">
          {result.saju && (
            <div className="mb-6 grid grid-cols-4 gap-2 rounded-md bg-ink-900 p-4">
              {(["year", "month", "day", "hour"] as const).map((key) => (
                <div key={key} className="rounded-sm bg-white/10 py-3 text-center">
                  <p className="text-[16px] font-bold text-white">
                    {result.saju!.pillars[key] ?? "미상"}
                  </p>
                  <p className="mt-1 text-[10px] text-white/60">
                    {{ year: "년주", month: "월주", day: "일주", hour: "시주" }[key]}
                  </p>
                </div>
              ))}
            </div>
          )}
          <MarkdownReport text={result.report} />
        </div>
        <button
          className="btn-ghost mt-6"
          onClick={() => {
            setResult(null);
          }}
        >
          다시 작성하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>이름</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
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
        <label className={labelClass}>생년월일</label>
        <div className="flex items-center gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder="년(YYYY)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="월"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="일"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        <div className="mt-2 flex gap-4 text-[13px] text-body">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={isLunar} onChange={(e) => setIsLunar(e.target.checked)} />
            음력
          </label>
          {isLunar && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
              />
              윤달
            </label>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>태어난 시간</label>
        <div className="flex items-center gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder="시(0-23)"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            disabled={timeUnknown}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="분"
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
            시간 모름
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass}>상담 종류</label>
        <select className={inputClass} value={consultType} onChange={(e) => setConsultType(e.target.value)}>
          {CONSULT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>연락처 (선택)</label>
        <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>고민 내용</label>
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
        {loading ? "AI가 사주를 분석하고 있습니다..." : "AI 리포트 생성하기"}
      </button>
    </form>
  );
}
