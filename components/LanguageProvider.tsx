"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getDict, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "aisaju_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ko",
  setLang: () => {},
});

/**
 * 전체 사이트 공통 언어 상태.
 * 첫 화면(Hero)의 언어 선택 버튼에서 설정하면 localStorage에 저장되어
 * 다른 페이지(상담 신청, AI 리포트, 상담 사례, Q&A 등)로 이동해도 유지됩니다.
 */
export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  /* 오행 앱(public/ohaeng)과 정적 legal 페이지는 JSON 문자열 형태의
     ohaeng_lang 키를 쓴다. 어느 쪽에서 바꾸든 사이트 전체가 따라오도록
     읽을 때는 두 키를 모두 보고, 쓸 때는 두 키에 모두 기록한다. */
  const LEGACY_KEY = "ohaeng_lang";
  const VALID: Lang[] = ["ko", "en", "ja", "zh", "fr"];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && VALID.includes(saved)) { setLangState(saved); return; }
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const v = JSON.parse(raw) as Lang;
        if (VALID.includes(v)) { setLangState(v); localStorage.setItem(STORAGE_KEY, v); }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    try { localStorage.setItem(LEGACY_KEY, JSON.stringify(next)); } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** 편의 훅: 언어 상태 + 현재 언어의 번역 사전을 함께 반환 */
export function useT() {
  const { lang, setLang } = useLanguage();
  return { lang, setLang, t: getDict(lang) };
}
