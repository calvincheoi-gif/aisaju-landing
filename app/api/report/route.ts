import { NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { calculateSaju } from "@/lib/saju";
import { buildReportPrompt } from "@/lib/prompt";
import { getAiClient } from "@/lib/ai-client";

export const runtime = "nodejs";

interface ReportRequestBody {
  name: string;
  gender: "male" | "female";
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  isLunar?: boolean;
  isLeapMonth?: boolean;
  timeUnknown?: boolean;
  consultType: string;
  concern: string;
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  let body: ReportRequestBody;
  try {
    body = await req.json();
  } catch {
    return badRequest("요청 형식이 올바르지 않습니다.");
  }

  const { name, gender, year, month, day, consultType, concern } = body;

  if (!name || !gender || !year || !month || !day || !consultType || !concern) {
    return badRequest("필수 항목이 누락되었습니다. (이름, 성별, 생년월일, 상담 종류, 고민 내용)");
  }
  if (gender !== "male" && gender !== "female") {
    return badRequest("성별 값이 올바르지 않습니다.");
  }

  let saju;
  try {
    saju = calculateSaju({
      year,
      month,
      day,
      hour: body.hour,
      minute: body.minute,
      isLunar: body.isLunar,
      isLeapMonth: body.isLeapMonth,
      gender,
      timeUnknown: body.timeUnknown,
    });
  } catch (e) {
    return badRequest(
      `사주 계산에 실패했습니다. 생년월일을 다시 확인해 주세요. (${e instanceof Error ? e.message : "unknown error"})`
    );
  }

  const ai = getAiClient();
  if (!ai) {
    return new Response(
      JSON.stringify({
        error:
          "AI 리포트 생성을 위한 설정이 아직 완료되지 않았습니다. Netlify 환경변수에 ANTHROPIC_API_KEY 또는 (ANTHROPIC_VERTEX_PROJECT_ID, CLOUD_ML_REGION, GCP_SERVICE_ACCOUNT_KEY)를 등록해 주세요.",
        saju,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { system, user } = buildReportPrompt(saju, {
    name,
    gender,
    consultType,
    concern,
  });

  // 스트리밍 응답: AI가 생성하는 동안 계속 데이터를 흘려보내야
  // Netlify/AWS 인프라의 inactivity timeout(무응답 타임아웃, 약 25~29초)에
  // 걸리지 않습니다. 응답 없이 오래 기다리면 프록시가 연결을 강제로 끊어버립니다.
  //
  // client.messages.stream() 헬퍼는 model이 리터럴 타입이 아니면(string으로
  // 넓혀지면) 반환 타입이 MessageStream<null>로 추론되어 textStream 프로퍼티가
  // 타입 에러를 일으킵니다. 그래서 저수준 create({ stream: true }) API로
  // 원시 이벤트를 직접 순회하는 방식을 사용합니다.
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      }

      send({ type: "saju", saju });

      try {
        const client = ai.client as Anthropic;
        const rawStream = await client.messages.create({
          model: ai.model,
          max_tokens: 1500,
          system,
          messages: [{ role: "user", content: user }],
          stream: true,
        });

        for await (const event of rawStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "delta", text: event.delta.text });
          }
        }

        send({ type: "done" });
      } catch (e) {
        send({
          type: "error",
          error: `AI 리포트 생성 중 오류가 발생했습니다. [경로: ${ai.via}${ai.diag ? `, 진단: ${ai.diag}` : ""}] (${e instanceof Error ? e.message : "unknown error"})`,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
