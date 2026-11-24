/**
 * 결제 전 미리보기 한 줄 — 엔진이 이미 계산한 값만 보여 준다(AI 호출 없음, 비용 0).
 * 벤치마킹(2026-11-24): 큰 운세 서비스들은 결제 전에 「내 결과의 일부」를 먼저 보여 준다.
 * 내용(해석)은 결제 뒤에 열리고, 여기서는 「계산은 이미 끝났다」는 확신만 준다.
 */
import { STEM_EL, STEM_IMAGE } from "./engines/ganji";
import { TOJEONG_144 } from "./content/tojeong-144";

export interface Teaser { label: string; value: string; note: string }

export function teaserOf(productKey: string, computed: Record<string, unknown> | null | undefined): Teaser | null {
  if (!computed) return null;
  if (productKey === "tojeong-card" || productKey === "tojeong-detail") {
    const c = computed as { gwae?: string; base?: { name: string }; changed?: { name: string } };
    if (!c.gwae || !c.base) return null;
    const t = TOJEONG_144[Number(c.gwae)];
    return { label: "나의 2027 토정 괘", value: `${c.gwae}괘${t ? ` · ${t.title}` : ""}`, note: `${c.base.name} → ${c.changed?.name ?? ""} · 음력 열두 달 풀이가 이어집니다` };
  }
  if (productKey === "saju-card" || productKey === "saju-premium") {
    const c = computed as { dayStem?: string; season?: string; monthBranch?: string };
    if (!c.dayStem) return null;
    const el = STEM_EL[c.dayStem] ?? "";
    const img = STEM_IMAGE[c.dayStem] ?? "";
    return { label: "나의 기질(일간)", value: `${c.dayStem}${el ? el : ""} · ${c.season ?? ""}생`, note: `${img ? `「${img}」의 기질 · ` : ""}절기 열두 달 풀이가 이어집니다` };
  }
  return null;
}
