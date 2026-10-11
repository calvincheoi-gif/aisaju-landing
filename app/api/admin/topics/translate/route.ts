import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAiClient } from "@/lib/ai-client";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 홈 고민 주제 자동 번역 (2026-10-11)
 * POST { category, title }  →  { en:{category,title}, ja:…, zh:…, fr:… }
 * 관리자 화면의 「AI 번역」 버튼이 부른다. 결과는 칸에 채워질 뿐, 저장은 「저장」 버튼으로 따로 한다.
 * 사이트의 읽을거리 다듬기(/api/admin/learn/polish)와 같은 AI 설정(Vertex 또는 API 키)을 쓴다.
 */

const SYSTEM = `You translate short Korean headlines for a Korean saju (Four Pillars) counseling site's home screen.
Each item has a 1~3 word category label and a one-line hook title (a worry phrased as a question).
Rules: keep it short enough for one line on a phone (title ≤ 40 chars for en/fr, ≤ 20 chars for ja/zh); natural, conversational, same emotional tone; no added facts; keep "…" and "?" feel.
Output JSON only: {"en":{"category":"","title":""},"ja":{"category":"","title":""},"zh":{"category":"","title":""},"fr":{"category":"","title":""}} (zh = Simplified Chinese).`;

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || req.headers.get("x-admin-password") !== expected) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });

  let body: { category?: string; title?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "잘못된 요청" }, { status: 400 }); }
  const category = String(body.category ?? "").trim(), title = String(body.title ?? "").trim();
  if (!category || !title) return NextResponse.json({ error: "분야와 제목을 먼저 적어 주세요." }, { status: 400 });

  const ai = getAiClient();
  if (!ai) return NextResponse.json({ error: "AI 설정이 없습니다(ANTHROPIC_API_KEY 또는 Vertex). 번역 칸에 직접 적어 주세요." }, { status: 503 });

  try {
    const client = ai.client as Anthropic;
    const res = await client.messages.create({
      model: ai.model, max_tokens: 600, system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify({ category, title }) }],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const a = text.indexOf("{"), z = text.lastIndexOf("}");
    const json = JSON.parse(text.slice(a, z + 1));
    return NextResponse.json({ i18n: json });
  } catch (e) {
    return NextResponse.json({ error: "번역에 실패했습니다: " + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
}
