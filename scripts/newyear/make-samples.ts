/**
 * 2027 새해운 — 표본 값 만들기.  실행: npx tsx scripts/newyear/make-samples.ts <출력 폴더>
 * 가상 인물(SAMPLE_INPUT)로 엔진을 돌리고 표본 문구를 합쳐, 양식에 넣을 값(JSON)을 상품별로 쓴다.
 * 이어서 scripts/newyear 의 하네스로 PNG·PDF 를 만들어 한글·한자, 월 순서, 정렬, 줄바꿈, 넘침을 눈으로 확인한다.
 */
import fs from "fs";
import path from "path";
import { PRODUCTS } from "../../lib/newyear/catalog";
import { checkContent } from "../../lib/newyear/content/validate";
import { SAMPLE_INPUT, sampleValues } from "../../lib/newyear/content/sample";
import { compute } from "../../lib/newyear/engines";
import { tossSix } from "../../lib/newyear/engines/iching";

const out = process.argv[2] || "./ny-samples";
fs.mkdirSync(out, { recursive: true });
let seed = 20270101;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
for (const p of PRODUCTS) {
  const input = p.key === "iching-card" ? { category: "career", question: "올해 자리를 옮겨도 될까?", lines: tossSix(rand) } : SAMPLE_INPUT;
  const eng = compute(p.key, input);
  const s = sampleValues(p.key);
  const values: Record<string, string> = { ...eng.fields, ...s.values };
  if (p.review) Object.assign(values, { "sys.issued": "2026.12.01", "sys.reviewer": "최형철", "sys.pubWho": "AI 초안 · 감수 최형철 · 2026.12.01", "sys.pubNo": "NY-261201-0001 · 2026.12.01" });
  const c = checkContent(p.key, values);
  fs.writeFileSync(path.join(out, `${p.key}.json`), JSON.stringify(values, null, 1));
  console.log(`${p.key}: 칸 ${Object.keys(values).length} · 빈 칸 ${c.empty.length} ${c.empty.slice(0, 8).join(",")} · 대괄호 ${c.bracket.length} · 길이 초과 ${c.long.length} ${c.long.slice(0, 6).join(",")} · 표본 누락 ${s.missing.length} ${s.missing.slice(0, 6).join(" ")}`);
}
