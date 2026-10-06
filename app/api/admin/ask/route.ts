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
export const maxDuration = 60;

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

const DRAFT_SYSTEM = `당신은 「최형철 사주명리 연구소」의 보조 작성자입니다. 소장은 30년 대기업 경력의 경영지도사이자 명리 10년 연구자입니다.
고객의 질문 하나와 명식 요약을 받아, 폰으로 보는 1~3매 Key 리포트의 각 칸을 채우는 초안을 씁니다. 소장이 「감수만」 하면 바로 보낼 수 있을 만큼, 모든 칸을 끝까지 채워 씁니다.

지켜야 할 것:
1. 결론부터. 확정형 예언 금지 — "~로 읽힙니다", "~가 유리해 보입니다"처럼 여지를 둔다.
2. 명식 해석은 일간(日干)의 성질과 올해·내년 세운(歲運)의 오행 관계를 근거로 한다. 주어진 간지 외의 사실을 지어내지 않는다.
3. 시기는 월 단위(예: "2027년 8~9월, 申·酉월")로 구체적으로. 근거는 세운·월운의 오행.
4. 실천 항목은 오늘·이번 주·이번 달 각 1개, 당장 할 수 있는 작은 행동으로. 추상어("노력하세요") 금지.
5. 경영 컨설팅 기법은 결과만 쓰고 전문용어 설명은 하지 않는다. SWOT의 S·W는 사주(안), O·T는 세운·시장(밖).
6. 존댓말. 이모지·해시태그 금지. 분량 기준(공백 포함) — 리포트 칸에 흰 공백이 남지 않게 아래 분량을 반드시 채운다:
   one 50~70자 / read 70~100자 / ans 각 80~110자(근거+판단이 한 문장에 함께)
   good·avoid 각 80~110자(시기 + 그때 무엇이 유리/불리한지 + 이유) / t_why 70~100자(왜 그 시기인지 세운·월운 오행 근거)
   today·week·month 각 50~75자(행동 + 끝났는지 알 수 있는 확인 기준) / a_check 70~100자(한 주·한 달 뒤 무엇을 보면 되는지) / stop 70~100자(감정·상황 신호 + 왜 그때 멈춰야 하는지)
   SWOT 각 칸 60~90자: 특성 한 줄 + 이 질문에서 어떻게 작용하는지 한 줄. strategy 50~70자. whys 각 70~100자, root 50~70자.
   timeline 시점(t1·t2·t3) 각 6~14자, 부제(t1s·t2s·t3s) 각 10~18자(한 줄로 끊어 읽히게), stage_note 60~90자.
   m_action·mod_action·t_action·a_action 은 각 18~30자의 "행동 제목"(한 문장 결론)으로 반드시 채운다. 어떤 칸도 빈 문자열로 두지 않는다 — 모듈이 없는 경우(module=none)만 swot·whys·timeline 을 빈 문자열로 둔다.
7. 모듈(module)이 주어지면 그 모듈 칸만 채우고 다른 모듈 칸은 빈 문자열로 둔다.
8. 같은 문장·같은 표현을 두 칸에 반복하지 않는다. 결론(one) → 판단(ans) → 시기(good·avoid) → 실행(today·week·month)은 서로 다른 층위의 말이어야 한다.

출력은 JSON 하나만. 키와 형식은 다음과 같다(모두 문자열, 배열은 정확히 3개):
{"one":"","chips":["판단 6자 이내","시기 8자 이내","첫 행동 8자 이내"],
 "m_action":"","ilgan":"丙火 형식","ilgan_sub":"4~6자 별칭","ilgan_desc":"30~45자 (성질 + 이 질문과의 관계)","seun":"丁未 형식","seun_sub":"4~8자","seun_desc":"30~45자 (해의 성질 + 이 일간에 미치는 영향)","read":"40~60자",
 "mod_action":"",
 "swot":{"s":"","w":"","o":"","t":"","strategy":""},
 "whys":{"w1":"","w2":"","w3":"","root":""},
 "timeline":{"t1":"지금 · 2026 가을","t1s":"","t2":"","t2s":"","t3":"","t3s":"","stage":"P","stage_note":""},
 "ans":["","",""],
 "t_action":"","good":"","avoid":"","t_why":"",
 "a_action":"","today":"","week":"","month":"","stop":"","a_check":""}`;

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

  try {
    const client = ai.client as Anthropic;
    const res = await client.messages.create({ model: ai.model, max_tokens: 4000, system: DRAFT_SYSTEM, messages: [{ role: "user", content: user }] });
    const text = res.content.map((c) => ("text" in c ? c.text : "")).join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return NextResponse.json({ error: "AI 응답을 읽지 못했습니다. 다시 시도해 주세요." }, { status: 502 });
    const draft = mergeAnswer(JSON.parse(m[0]) as Partial<AskAnswer>);
    /* 일간·세운은 계산값으로 덮어쓴다 — AI가 틀리게 적는 일을 막는다 */
    if (saju) { draft.ilgan = saju.dayStemKo; draft.seun = saju.nextYear; }
    return NextResponse.json({ draft, module, via: ai.via });
  } catch (e) {
    return NextResponse.json({ error: `AI 호출 실패: ${e instanceof Error ? e.message : String(e)}`, fallback: emptyAnswer() }, { status: 502 });
  }
}
