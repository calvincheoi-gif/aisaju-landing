import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getAiClient } from "@/lib/ai-client";
import { sajuBriefFromBirth } from "@/lib/ask-saju";
import { emptyAnswer, mergeAnswer, type AskAnswer, type AskModule, type SajuBrief } from "@/lib/ask-report";

/**
 * 무료 1문 1답 — 관리자 API (2026-10-04)
 *
 *   GET   /api/admin/ask?days=14          접수 목록(최근 N일) + 각 건의 명식 요약(없으면 계산해 저장)
 *   PATCH /api/admin/ask  {id, answer?, module?, status?, note?}   답·모듈·상태 저장
 *   POST  /api/admin/ask  {id, action:"draft"}                     AI 초안 (질문+명식 → 리포트 칸 전부)
 *
 * 인증은 다른 관리자 API와 같은 x-admin-password 헤더(ADMIN_PASSWORD).
 * AI 초안은 소장님이 고쳐 쓰는 '밑그림'이다 — 호출 1회당 Anthropic API 토큰 비용이 든다(대략 수십 원).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 26;   /* Netlify 동기 함수 상한. 이보다 크게 적어도 늘어나지 않는다 */

function authed(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && req.headers.get("x-admin-password") === expected;
}
const deny = () => NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });

export async function GET(req: Request) {
  if (!authed(req)) return deny();
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "서버에 Supabase 관리자 키가 없습니다." }, { status: 500 });
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days") || 14)));
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase.from("free_questions").select("*").gte("created_at", since).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  /* 명식 요약이 없는 건은 지금 계산해 채워 둔다 (한 번만) */
  const rows = data ?? [];
  const fills: Promise<unknown>[] = [];
  for (const r of rows) {
    if (!r.saju) {
      const brief = sajuBriefFromBirth(r.birth_info);
      if (brief) { r.saju = brief; fills.push(Promise.resolve(supabase.from("free_questions").update({ saju: brief }).eq("id", r.id))); }
    }
  }
  if (fills.length) await Promise.allSettled(fills);

  const { data: st } = await supabase.rpc("free_ask_status");
  return NextResponse.json({ rows, status: st ?? null }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  if (!authed(req)) return deny();
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "서버에 Supabase 관리자 키가 없습니다." }, { status: 500 });
  let b: { id?: string; answer?: Partial<AskAnswer>; module?: AskModule; status?: string; note?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (!b.id) return NextResponse.json({ error: "id 가 없습니다." }, { status: 400 });
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.answer) patch.answer = mergeAnswer(b.answer);
  if (b.module) patch.module = b.module;
  if (b.note !== undefined) patch.note = b.note;
  if (b.status) {
    if (!["received", "answered", "converted", "cancelled"].includes(b.status)) return NextResponse.json({ error: "status 값이 올바르지 않습니다." }, { status: 400 });
    patch.status = b.status;
    if (b.status === "answered") patch.answered_at = new Date().toISOString();
  }
  const { error } = await supabase.from("free_questions").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/* ── AI 초안 (2026-10-06 재설계) ───────────────────────────────────────────────
   분량을 늘리자 한 번의 호출이 Netlify 함수 제한(26초)을 넘겨 초안이 아예 안 채워졌다.
   그래서 「앞 절반(결론·근거)」과 「뒤 절반(판단·시기·실행)」을 나눠 동시에 부른다.
   각 호출이 짧아져 제한 안에 끝나고, 한쪽이 실패해도 나머지 절반은 채워진다.      */

const SYS_BASE = `당신은 「최형철 사주명리 연구소」의 보조 작성자입니다. 소장은 30년 대기업 경력의 경영지도사이자 명리 10년 연구자입니다.
고객의 질문 하나와 명식 요약을 받아, 폰으로 보는 1~3매 Key 리포트의 칸을 채우는 초안을 씁니다. 소장이 「감수만」 하면 바로 보낼 수 있을 만큼 모든 칸을 끝까지 채웁니다.

지켜야 할 것:
1. 결론부터. 확정형 예언 금지 — "~로 읽힙니다", "~가 유리해 보입니다"처럼 여지를 둔다.
2. 명식 해석은 일간(日干)의 성질과 올해·내년 세운(歲運)의 오행 관계를 근거로 한다. 주어진 간지 외의 사실을 지어내지 않는다.
3. 시기는 월 단위(예: "2027년 8~9월, 申·酉월")로 구체적으로. 근거는 세운·월운의 오행.
4. 실천 항목은 당장 할 수 있는 작은 행동으로. 추상어("노력하세요") 금지.
5. 경영 컨설팅 기법은 결과만 쓰고 전문용어 설명은 하지 않는다.
6. 존댓말. 이모지·해시태그 금지. 어떤 칸도 빈 문자열로 두지 않는다 — 리포트에 흰 공백이 남는다.
7. 설명·머리말 없이 JSON 객체 하나만 출력한다.`;

/* 앞 절반 — 결론 · 근거 1(명식) · 근거 2(모듈) */
const SYS_A = `${SYS_BASE}

분량 기준(공백 포함): one 50~70자 / ilgan_desc·seun_desc 각 30~45자 / read 70~100자 /
m_action·mod_action 각 18~30자의 "행동 제목"(한 문장 결론).
SWOT 각 칸 60~90자(특성 + 이 질문에서 어떻게 작용하는지), strategy 50~70자.
whys 각 70~100자, root 50~70자.
timeline 시점(t1·t2·t3) 각 6~14자, 부제(t1s·t2s·t3s) 각 10~18자, stage_note 60~90자.
지정된 모듈의 칸만 채우고 나머지 모듈은 빈 문자열로 둔다. module=none 이면 셋 다 빈 문자열.

출력 JSON(이 키만):
{"one":"","chips":["판단 6자 이내","시기 8자 이내","첫 행동 8자 이내"],
 "m_action":"","ilgan_sub":"4~6자 별칭","ilgan_desc":"","seun_sub":"4~8자","seun_desc":"","read":"",
 "mod_action":"",
 "swot":{"s":"","w":"","o":"","t":"","strategy":""},
 "whys":{"w1":"","w2":"","w3":"","root":""},
 "timeline":{"t1":"지금","t1s":"","t2":"","t2s":"","t3":"","t3s":"","stage":"P","stage_note":""}}`;

/* 뒤 절반 — 판단 3줄 · 시기 · 실행 */
const SYS_B = `${SYS_BASE}

분량 기준(공백 포함): ans 각 80~110자(근거 + 판단이 한 문장에 함께) /
good·avoid 각 80~110자(시기 + 그때 무엇이 유리·불리한지 + 이유) / t_why 70~100자(왜 그 시기인지 세운·월운 오행 근거) /
today·week·month 각 50~75자(행동 + 끝났는지 알 수 있는 확인 기준) — 오늘·이번 주·이번 달 각 1개 /
a_check 70~100자(한 주·한 달 뒤 무엇을 보면 되는지) / stop 70~100자(감정·상황 신호 + 왜 그때 멈춰야 하는지) /
t_action·a_action 각 18~30자의 "행동 제목".
같은 표현을 두 칸에 반복하지 않는다 — 판단 → 시기 → 실행은 서로 다른 층위의 말이어야 한다.

출력 JSON(이 키만):
{"ans":["","",""],
 "t_action":"","good":"","avoid":"","t_why":"",
 "a_action":"","today":"","week":"","month":"","stop":"","a_check":""}`;

function pickJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as Record<string, unknown>; } catch { return null; }
}

export async function POST(req: Request) {
  if (!authed(req)) return deny();
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "서버에 Supabase 관리자 키가 없습니다." }, { status: 500 });
  let b: { id?: string; action?: string; module?: AskModule };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  if (b.action !== "draft" || !b.id) return NextResponse.json({ error: "지원하지 않는 요청" }, { status: 400 });

  const { data: row, error } = await supabase.from("free_questions").select("*").eq("id", b.id).single();
  if (error || !row) return NextResponse.json({ error: "접수 건을 찾지 못했습니다." }, { status: 404 });
  const saju: SajuBrief | null = row.saju ?? sajuBriefFromBirth(row.birth_info);

  const ai = getAiClient();
  if (!ai) return NextResponse.json({ error: "AI 설정이 없어 초안을 만들 수 없습니다. 직접 작성해 주세요." }, { status: 503 });

  const module: AskModule = b.module || row.module || "none";
  const user = `[질문] ${row.question}
[고객] ${row.name} · ${row.birth_info}
[명식] 년 ${saju?.pillars.year ?? "?"} / 월 ${saju?.pillars.month ?? "?"} / 일 ${saju?.pillars.day ?? "?"} / 시 ${saju?.pillars.hour ?? "모름"}
[일간] ${saju?.dayStemKo ?? "?"} · 올해 ${saju?.thisYear ?? "?"} · 내년 ${saju?.nextYear ?? "?"}
[사용할 모듈] ${module}
오늘 날짜: ${new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
위 규칙대로 JSON 초안을 작성하세요.`;

  const client = ai.client as Anthropic;
  const ask = async (system: string) => {
    const res = await client.messages.create({ model: ai.model, max_tokens: 2200, system, messages: [{ role: "user", content: user }] });
    const text = res.content.map((c) => ("text" in c ? c.text : "")).join("");
    if (res.stop_reason === "max_tokens") throw new Error("답이 길어 중간에 끊겼습니다");
    const json = pickJson(text);
    if (!json) throw new Error("AI 응답을 읽지 못했습니다");
    return json;
  };

  /* 두 덩어리를 동시에 — 한쪽이 실패해도 나머지는 살린다 */
  const [ra, rb] = await Promise.allSettled([ask(SYS_A), ask(SYS_B)]);
  const partial: Record<string, unknown> = {};
  const fails: string[] = [];
  if (ra.status === "fulfilled") Object.assign(partial, ra.value); else fails.push(`앞부분(결론·근거): ${ra.reason instanceof Error ? ra.reason.message : String(ra.reason)}`);
  if (rb.status === "fulfilled") Object.assign(partial, rb.value); else fails.push(`뒷부분(판단·시기·실행): ${rb.reason instanceof Error ? rb.reason.message : String(rb.reason)}`);

  if (fails.length === 2) {
    return NextResponse.json({ error: `AI 초안 실패 — ${fails.join(" / ")}. 잠시 뒤 다시 눌러 주세요.`, fallback: emptyAnswer() }, { status: 502 });
  }

  const draft = mergeAnswer(partial as Partial<AskAnswer>);
  /* 일간·세운은 계산값으로 덮어쓴다 — AI가 틀리게 적는 일을 막는다 */
  if (saju) { draft.ilgan = saju.dayStemKo; draft.seun = saju.nextYear; }
  return NextResponse.json({ draft, module, via: ai.via, partial: fails.length ? fails.join(" / ") : undefined });
}
