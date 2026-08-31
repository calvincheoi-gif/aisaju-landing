import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAiClient } from "@/lib/ai-client";

export const runtime = "nodejs";
export const maxDuration = 60;

function checkPassword(provided: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return provided === expected;
}

const SYSTEM = `당신은 사주 명리학 콘텐츠 편집자입니다.
인스타그램 카드뉴스 캡션을 웹 검색과 AI 답변에 잘 잡히는 글로 다시 씁니다.

지켜야 할 것:
1. 첫 문단에서 질문에 곧바로 답한다. 결론부터 쓴다.
2. 소제목은 사람들이 실제로 검색하는 말로 쓴다.
3. 한 문단은 한 가지만 말한다. 두세 문장이 적당하다.
4. 원문에 없는 사실을 지어내지 않는다. 표현만 다듬는다.
5. 단정적 예언을 하지 않는다. 「~하는 경향이 있습니다」처럼 여지를 둔다.
6. 해시태그, 이모지, 「팔로우」「좋아요」 같은 SNS 문구는 모두 뺀다.

출력 형식 — 아래 표기만 쓴다. 다른 마크다운은 쓰지 않는다.
## 소제목
- 목록 항목
> 강조할 한 문장
※ 용어 설명이나 각주
그 외 줄은 본문 문단

구성:
- 맨 앞에 결론 문단 하나 (소제목 없이)
- 소제목 3~5개로 본문 전개
- 마지막에 "## 정리하면" 소제목과 - 목록 3~4개

JSON 하나만 출력한다. 다른 말은 붙이지 않는다.
{"title":"제목","description":"검색결과 요약 80~120자","excerpt":"목록 카드 한 줄","category":"분류","keywords":["키워드",...],"body":"본문"}

category 는 다음 중 하나: 명리학 입문, 궁합, 오행, 대운·세운, 작명, 사주 상식`;

export async function POST(req: Request) {
  let json: { password?: string; raw?: string };
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (!checkPassword(json.password ?? null)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const raw = (json.raw ?? "").trim();
  if (raw.length < 30) {
    return NextResponse.json(
      { error: "다듬을 원문이 너무 짧습니다. 카드뉴스 캡션을 붙여넣어 주세요." },
      { status: 400 }
    );
  }

  const ai = getAiClient();
  if (!ai) {
    return NextResponse.json(
      { error: "AI 설정이 완료되지 않았습니다. 원문을 그대로 쓰거나 직접 다듬어 주세요." },
      { status: 503 }
    );
  }

  try {
    const client = ai.client as Anthropic;
    const res = await client.messages.create({
      model: ai.model,
      max_tokens: 3000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `아래는 인스타그램 카드뉴스 캡션입니다. 위 규칙에 따라 웹 글로 다시 써 주세요.\n\n---\n${raw}\n---`,
        },
      ],
    });

    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    /* 모델이 앞뒤에 설명을 붙이는 경우가 있어 JSON 부분만 도려낸다 */
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) {
      return NextResponse.json(
        { error: "AI 응답을 읽지 못했습니다. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch {
      return NextResponse.json(
        { error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    const str = (k: string) => (typeof parsed[k] === "string" ? (parsed[k] as string).trim() : "");
    const keywords = Array.isArray(parsed.keywords)
      ? (parsed.keywords as unknown[]).filter((k): k is string => typeof k === "string")
      : [];

    return NextResponse.json({
      title: str("title"),
      description: str("description"),
      excerpt: str("excerpt"),
      category: str("category") || "명리학 입문",
      keywords,
      body: str("body"),
    });
  } catch (e) {
    return NextResponse.json(
      { error: `AI 호출에 실패했습니다: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 }
    );
  }
}

