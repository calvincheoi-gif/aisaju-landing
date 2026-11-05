import type { Worry } from "./types";
import { LOVE } from "./data/love";
import { MATCH } from "./data/match";
import { JOB } from "./data/job";
import { CAREER } from "./data/career";
import { BIZ } from "./data/biz";
import { APTITUDE } from "./data/aptitude";
import { MONEY } from "./data/money";
import { LIFE } from "./data/life";

/**
 * 고민 랜딩 데이터 모음 — v2.0 (2026-10-12): 7개 분야 × 4개 = 28개 (+1 적성 부모용)
 *                        v3.0 (2026-11-05): 홈 24개 키워드에 맞춰 8개 추가 — 썸·이별(연애), 이혼(궁합·결혼), 삶 5개 → 37개
 * 내용은 data/<분야>.ts 에서 고친다. 분야를 더하려면 파일을 만들고 여기 한 줄 추가.
 * 원칙: 취업·합격·재회 확률이나 시점을 단정하지 않는다. 상황 정리 → 실천 → 사주로 '나' 맞춤.
 */
export const WORRY_GROUPS: { category: string; items: Worry[] }[] = [
  { category: "연애", items: LOVE },
  { category: "궁합·결혼", items: MATCH },
  { category: "취업", items: JOB },
  { category: "이직·직장", items: CAREER },
  { category: "사업", items: BIZ },
  { category: "적성·진로", items: APTITUDE },
  { category: "재물", items: MONEY },
  { category: "삶", items: LIFE },
];

export const WORRIES: Worry[] = WORRY_GROUPS.flatMap((g) => g.items);

export const LIVE_WORRIES = WORRIES.filter((w) => w.live);

export function getWorry(slug: string): Worry | undefined {
  return LIVE_WORRIES.find((w) => w.slug === slug);
}
