"use client";

import { useState, useRef, useEffect } from "react";
import { PRIMARY_LANGUAGES, OTHER_LANGUAGES, type LanguageCode } from "@/lib/site-config";

interface LanguageSwitcherProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
}

/**
 * 첫 화면 언어 선택 UI.
 * 한국어 / English 버튼 + "기타" 드롭다운(중국어/일본어/프랑스어/독일어/스페인어).
 * 현재는 Hero 섹션 카피만 실제 번역이 적용되며, 나머지 페이지 전체 번역은
 * 추후 i18n(next-intl 등) 도입 시 확장 예정입니다.
 */
export default function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isOtherActive = OTHER_LANGUAGES.some((l) => l.code === value);
  const activeOtherLabel = OTHER_LANGUAGES.find((l) => l.code === value)?.label;

  return (
    <div className="flex items-center justify-center gap-2 text-[13px]">
      {PRIMARY_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => {
            onChange(lang.code);
            setOpen(false);
          }}
          className={`rounded-pill px-3 py-1.5 font-medium transition-colors ${
            value === lang.code
              ? "bg-indigo-600 text-white"
              : "bg-bg-alt text-body hover:bg-indigo-100 hover:text-indigo-600"
          }`}
        >
          {lang.label}
        </button>
      ))}

      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`rounded-pill px-3 py-1.5 font-medium transition-colors ${
            isOtherActive
              ? "bg-indigo-600 text-white"
              : "bg-bg-alt text-body hover:bg-indigo-100 hover:text-indigo-600"
          }`}
        >
          {isOtherActive ? activeOtherLabel : "기타"} ▾
        </button>

        {open && (
          <div className="absolute left-1/2 top-full z-10 mt-2 w-36 -translate-x-1/2 rounded-md border border-border bg-white p-1.5 shadow-2">
            {OTHER_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                className={`block w-full rounded-sm px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  value === lang.code
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-ink-700 hover:bg-bg-alt"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
