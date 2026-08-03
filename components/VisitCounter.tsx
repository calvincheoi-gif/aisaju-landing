"use client";

import { useEffect, useState } from "react";
import { useT } from "./LanguageProvider";

const VISITED_KEY = "aisaju_visited_session";

/**
 * 방문자 수 카운터. 브라우저 세션(sessionStorage)당 1회만 증가시키고,
 * 그 외에는 현재 누적 방문 수만 조회해 표시합니다.
 * 초기 신뢰 구축을 위해 누적 1,000회 미만일 때는 표시하지 않습니다.
 */
export default function VisitCounter() {
  const { t } = useT();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const alreadyCounted = sessionStorage.getItem(VISITED_KEY);
    const method = alreadyCounted ? "GET" : "POST";
    if (!alreadyCounted) sessionStorage.setItem(VISITED_KEY, "1");

    fetch("/api/visit", { method })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.total === "number") setCount(data.total);
      })
      .catch(() => {});
  }, []);

  if (count === null || count < 1000) return null;

  return (
    <p className="mt-0.5 text-[11px] font-medium text-body/70">
      {t.visitCounter.label} {count.toLocaleString()}
    </p>
  );
}
