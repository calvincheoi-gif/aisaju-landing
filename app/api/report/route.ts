import { NextRequest, NextResponse } from "next/server";
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
  return NextResponse.json({ error: message }, { status: 400 });
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
    return NextResponse.json(
      {
        error:
          "AI 리포트 생성을 위한 설정이 아직 완료되지 않았습니다. Netlify 환경변수에 ANTHROPIC_API_KEY 또는 (ANTHROPIC_VERTEX_PROJECT_ID, CLOUD_ML_REGION, GCP_SERVICE_ACCOUNT_KEY)를 등록해 주세요.",
        saju,
      },
      { status: 503 }
    );
  }

  const { system, user } = buildReportPrompt(saju, {
    name,
    gender,
    consultType,
    concern,
  });

  try {
    const message = await ai.client.messages.create({
      model: ai.model,
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const reportText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n");

    return NextResponse.json({ saju, report: reportText });
  } catch (e) {
    return NextResponse.json(
      {
        error: `AI 리포트 생성 중 오류가 발생했습니다. [경로: ${ai.via}${ai.diag ? `, 진단: ${ai.diag}` : ""}] (${e instanceof Error ? e.message : "unknown error"})`,
        saju,
      },
      { status: 502 }
    );
  }
}
