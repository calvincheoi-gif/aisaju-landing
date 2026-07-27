"use client";

import { useEffect, useState } from "react";
import { useT } from "./LanguageProvider";

/**
 * 첫 화면 하단에 표시되는 "아래로 스크롤하세요" 유도 화살표.
 * 스크롤을 조금이라도 내리면 사라지고, 맨 위로 돌아오면 다시 나타납니다.
 */
export default function ScrollHint() {
  const { t } = useT();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY < 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-5 z-40 flex flex-col items-center justify-center gap-1 transition-opacity duration-300 ${
        visible ? "opacity-70" : "opacity-0"
      }`}
    >
      <span className="text-[11px] font-medium text-body/70">{t.scrollHint.label}</span>
      <svg
        className="h-5 w-5 animate-bounce text-indigo-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
