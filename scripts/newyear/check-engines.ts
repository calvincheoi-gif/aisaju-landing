/**
 * 2027 새해운 — 산출 엔진 검산.  실행: npx tsx scripts/newyear/check-engines.ts
 *
 *  ① 토정 조견표: 수표(선천수·중천수)로 만든 60갑자 값이 공개 조견표(chunun.com 「토정비결 조견표」)와 같은지
 *     — 원 표의 乙丑 태세수는 20으로 적혀 있으나 나머지 59개가 모두 따르는 규칙으로는 21이라 21로 대조한다.
 *  ② 공개 계산 예시: 음력 1976.8.26 생의 2005년(乙酉) 괘 = 212
 *  ③ 2027 월운표·사주 예시·주역 카드 칸 대응을 눈으로 확인할 수 있게 출력
 */
import { computeTojeong, iljinNum, taeseNum, wolgeonNum, monthGanji, lunarMonthDays } from "../../lib/newyear/engines/tojeong";
import { computeSaju, months2027, sajuFields } from "../../lib/newyear/engines/saju2027";
import { computeIching, ichingFields } from "../../lib/newyear/engines/iching";
import { getSpec } from "../../lib/newyear/render/spec";
import { DRAFT_HARD, draftCost, draftParts, priorDigest } from "../../lib/newyear/content/parts";

const TABLE = `甲子 20 18 18|甲戌 22 14 20|甲申 21 16 19|甲午 18 18 16|甲辰 22 14 20|甲寅 19 16 17|乙丑 21 16 19|乙亥 19 12 17|乙酉 20 14 18|乙未 21 16 19|乙巳 17 12 15|乙卯 18 14 16|丙寅 17 14 15|丙子 18 16 16|丙戌 20 12 18|丙申 19 14 17|丙午 16 16 14|丙辰 20 12 18|丁卯 16 12 14|丁丑 19 14 17|丁亥 17 10 15|丁酉 18 12 16|丁未 19 14 17|丁巳 15 10 13|戊辰 18 10 16|戊寅 15 12 13|戊子 16 14 14|戊戌 18 10 16|戊申 17 12 15|戊午 14 14 12|己巳 18 13 16|己卯 19 15 17|己丑 22 17 20|己亥 20 13 18|己酉 21 15 19|己未 22 17 20|庚午 17 17 15|庚辰 21 13 19|庚寅 18 15 16|庚子 19 17 17|庚戌 21 13 19|庚申 20 15 18|辛未 20 15 18|辛巳 16 11 14|辛卯 17 13 15|辛丑 20 15 18|辛亥 18 11 16|辛酉 19 13 17|壬申 18 13 16|壬午 15 15 13|壬辰 19 11 17|壬寅 16 13 14|壬子 17 15 15|壬戌 19 11 17|癸酉 17 11 15|癸未 18 13 16|癸巳 14 9 12|癸卯 15 11 13|癸丑 18 13 16|癸亥 16 9 14`;

let fail = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fail++; console.log("  ✗ " + msg); } };

console.log("① 토정 조견표 60갑자 대조");
for (const row of TABLE.split("|")) {
  const [g, t, w, d] = row.split(" ");
  ok(taeseNum(g) === +t && wolgeonNum(g) === +w && iljinNum(g) === +d, `${g}: 계산 ${taeseNum(g)}/${wolgeonNum(g)}/${iljinNum(g)} ≠ 표 ${t}/${w}/${d}`);
}
console.log(fail ? `  불일치 ${fail}건` : "  60/60 일치");

console.log("② 공개 계산 예시 (음력 1976.8.26 · 2005년)");
const ex = computeTojeong({ year: 1976, month: 8, day: 26, isLunar: true }, 2005);
console.log(`  나이 ${ex.age} · 태세 ${ex.taese.ganji} ${ex.taese.num} · 월건 ${ex.wolgeon.ganji} ${ex.wolgeon.num} (${ex.wolgeon.days}일) · 일진 ${ex.iljin.ganji} ${ex.iljin.num} → ${ex.gwae}`);
ok(ex.gwae === "212" && ex.taese.num === 20 && ex.wolgeon.num === 14 && ex.wolgeon.days === 29 && ex.iljin.ganji === "丙辰", "예시 괘가 212 가 아님");

console.log("③ 2027 丁未년 음력 월건·날수");
console.log("  " + Array.from({ length: 12 }, (_, i) => `${i + 1}월 ${monthGanji(2027, i + 1)} ${lunarMonthDays(2027, i + 1)}일`).join(" · "));

console.log("④ 2027 월운표 (일간 丙 기준 십성)");
for (const m of months2027("丙")) console.log(`  ${String(m.n).padStart(2, "0")}월 ${m.pillar} ${m.from}~${m.to}  ${m.stemGod}·${m.branchGod}`);

console.log("⑤ 사주 예시 (양력 1990.5.15 15:30 여)");
const birth = { year: 1990, month: 5, day: 15, hour: 15, minute: 30, gender: "female" as const };
const sj = computeSaju(birth);
console.log(`  명식 ${sj.pillars.year} ${sj.pillars.month} ${sj.pillars.day} ${sj.pillars.hour} · 일간 ${sj.dayStem} · 계절 ${sj.season} · 음력 ${sj.lunar.year}.${sj.lunar.month}.${sj.lunar.day}`);
console.log(`  대운 ${sj.luck?.forward ? "순행" : "역행"} ${sj.luck?.startAge} · ${sj.luck?.rows.slice(0, 6).map((r) => `${r.pillar}(${r.fromYear}~)`).join(" ")} · 현재 ${sj.luck?.rows[sj.luck.current]?.pillar}`);
console.log(`  유의 ${JSON.stringify(sj.notes)}`);
const sf = sajuFields(sj, birth);
for (const key of ["saju-card", "saju-premium"] as const) {
  const miss = getSpec(key).fields.filter((f) => f.src === "eng" && !(f.key in sf)).map((f) => f.key);
  ok(miss.length === 0, `${key}: 엔진이 채우지 못한 칸 ${miss.join(", ")}`);
}

console.log("⑥ 주역 카드 칸 대응");
const ic = computeIching({ category: "career", question: "지금 하는 일을 계속 밀고 가도 될까?", lines: [7, 8, 8, 7, 8, 9] });
const icf = ichingFields(ic, { category: "career", question: "지금 하는 일을 계속 밀고 가도 될까?", lines: ic.lines });
console.log(`  ${ic.bits} → ${ic.no} ${ic.name} ${ic.hanja} · 변효 ${ic.movingLines.join(",") || "없음"}`);
const want: Record<string, string> = { "p1.3": "괘가 건네는 상징", "p1.4": "질문에 연결한 한 문장", "p1.5": "세 가지(줄바꿈)", "p1.6": "세 가지(줄바꿈)", "p1.8": "한 해를 여는 핵심 문장", "p1.9": "올해의 방향을 담은 짧은 요약", "p1.10": "A·B 두 가지(줄바꿈)" };
for (const f of getSpec("iching-card").fields) {
  ok(f.key in icf, `iching-card: 채우지 못한 칸 ${f.key}`);
  if (want[f.key]) ok(want[f.key] === f.hint, `iching-card: ${f.key} 의 뜻이 달라짐(${f.hint})`);
}
const tj = getSpec("tojeong-detail").fields.filter((f) => f.src === "eng").map((f) => f.key);
console.log(`  토정 상세 엔진 칸: ${tj.join(", ")}`);
console.log("⑦ AI 초안 묶음 (양식에서 자동 계산 — 묶음마다 AI 호출 1회)");
for (const key of ["tojeong-card", "saju-card", "tojeong-detail", "saju-premium"] as const) {
  const parts = draftParts(key);
  const ai = getSpec(key).fields.filter((f) => f.src === "ai").map((f) => f.key);
  const got = parts.flat().map((f) => f.key);
  ok(got.length === ai.length && new Set(got).size === ai.length && ai.every((k) => got.includes(k)), `${key}: 문구 칸이 묶음에 정확히 한 번씩 들어가지 않음`);
  const sizes = parts.map((fs) => fs.reduce((n, f) => n + draftCost(f), 0));
  ok(Math.max(...sizes) <= DRAFT_HARD, `${key}: 묶음이 상한을 넘음 (${Math.max(...sizes)} > ${DRAFT_HARD})`);
  console.log(`  ${key}: ${parts.length}묶음 · ${parts.map((fs, i) => `${Array.from(new Set(fs.map((f) => f.page))).join("·")}쪽 ${fs.length}칸/${sizes[i]}`).join(" | ")}`);
}
const last = draftParts("saju-premium").length - 1;
const dg = priorDigest("saju-premium", last, Object.fromEntries(getSpec("saju-premium").fields.map((f) => [f.key, /^단어/.test(f.hint) ? `낱말${f.key}` : "앞에서 쓴 문장입니다."])));
ok(dg.includes("핵심 문장") && dg.includes("이미 쓴 키워드"), "앞 묶음 간추림이 비어 있음");
console.log(`  앞 묶음 간추림(프리미엄 마지막 묶음 기준): ${dg.length}자`);

console.log(fail ? `\n검산 실패 ${fail}건` : "\n검산 통과");
process.exit(fail ? 1 : 0);
