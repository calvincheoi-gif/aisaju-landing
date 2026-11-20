"use client";

import { useEffect } from "react";
import { track } from "@/lib/worries/links";

/**
 * 읽을거리 조회 기록 (2026-11-20)
 *
 * 그동안 /learn 은 방문 기록이 전혀 없어서, 홈에서 「글 읽기」를 누르고 넘어간 사람이
 * 통계에서는 "아무것도 안 하고 나간 사람"으로 잡혔다. 화면에는 아무것도 그리지 않는다.
 *   · 글 한 편(/learn/슬러그) → learn_view { slug }
 *   · 목록(/learn)            → learn_list_view
 *   · data-track="이벤트명" 이 붙은 링크를 누르면 그 이름으로 기록 (글 끝의 「카톡으로 받기」 등)
 */
export default function LearnView({ slug }: { slug?: string }) {
  useEffect(() => {
    track(slug ? "learn_view" : "learn_list_view", slug ? { slug } : {});
    const onClick = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-track]") as HTMLElement | null;
      if (el?.dataset.track) track(el.dataset.track, { from: "learn", ...(slug ? { slug } : {}) });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);
  return null;
}
