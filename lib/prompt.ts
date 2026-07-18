import type { SajuResult } from "./saju";

export interface ReportRequestContext {
  name: string;
  gender: "male" | "female";
  consultType: string;
  concern: string;
}

const SYSTEM_PROMPT = `당신은 '최형철 사주명리 연구소'의 전문 명리학자를 보조하는 AI사주 Lab의 리포트 작성 AI입니다.

원칙:
- 입력으로 주어진 사주팔자(연주·월주·일주·시주), 오행, 십신, 공망, 대운 데이터를 근거로 분석합니다. 데이터에 없는 내용을 지어내지 않습니다.
- 전통 명리학 개념(오행, 십신, 대운 등)을 사용하되, 현대적이고 명료한 언어로 풀어 씁니다. 지나치게 신비적이거나 막연한 표현은 피합니다.
- 단정적 예언("반드시 ~한다", "100% ~된다")이 아니라 경향과 가능성으로 표현합니다.
- 재물·건강·법률과 관련된 조언은 참고용 통찰로 제시하고, 중요한 재정적·법적·의료적 결정은 반드시 전문가와 상담하도록 안내합니다.
- 출생시간이 없는 경우, 시주 기반 분석(예: 자녀운, 말년운의 세부 내용)은 생략하고 그 사실을 리포트 서두에 짧게 안내합니다.
- 결과는 한국어로, 아래 형식의 마크다운으로 작성합니다.

출력 형식:
## 사주 개요
(일간과 오행 분포를 중심으로 이 사람의 타고난 기질을 2~3문장으로)

## {상담종류} 분석
(상담 종류에 맞춰 사주 데이터를 근거로 3~5문장)

## 고민에 대한 조언
(사용자가 입력한 고민에 대해 사주 데이터와 연결지어 구체적인 조언 3~5문장)

## 앞으로의 흐름
(대운 데이터가 있으면 현재~향후 대운 흐름을 근거로 2~3문장, 없으면 이 섹션 생략)

## 한 줄 요약
(전체 리포트를 한 문장으로)`;

function formatSajuForPrompt(saju: SajuResult): string {
  const lines: string[] = [];
  lines.push(
    `사주팔자: 연주 ${saju.pillars.year}, 월주 ${saju.pillars.month}, 일주 ${saju.pillars.day}${
      saju.pillars.hour ? `, 시주 ${saju.pillars.hour}` : " (시주 정보 없음 — 출생시간 미상)"
    }`
  );
  lines.push(`일간(본인) 오행: ${saju.dayElement.stem}, 음양: ${saju.dayYinYang.stem}`);
  lines.push(`공망: ${saju.voidBranches.join(", ")}`);

  if (saju.tenGods) {
    const parts = Object.entries(saju.tenGods)
      .filter(([key]) => key !== "day")
      .map(([key, v]) => `${key}주 천간 ${v.stem}/지지 ${v.branch}`);
    lines.push(`십신: ${parts.join(", ")}`);
  }

  if (saju.luckPillars) {
    const upcoming = saju.luckPillars.pillars.slice(0, 4).map((p) => `${p.age}세 ${p.pillar}`);
    lines.push(
      `대운: ${saju.luckPillars.forward ? "순행" : "역행"}, 시작 나이 ${saju.luckPillars.startAge}세, 흐름: ${upcoming.join(" → ")}`
    );
  }

  return lines.join("\n");
}

export function buildReportPrompt(
  saju: SajuResult,
  ctx: ReportRequestContext
): { system: string; user: string } {
  const user = `[의뢰인 정보]
이름: ${ctx.name}
성별: ${ctx.gender === "male" ? "남성" : "여성"}
상담 종류: ${ctx.consultType}

[사주 데이터]
${formatSajuForPrompt(saju)}

[고민 내용]
${ctx.concern}

위 데이터를 바탕으로 "${ctx.consultType}" 관점의 AI 사주 리포트를 작성해 주세요.`;

  return { system: SYSTEM_PROMPT, user };
}
