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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
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
