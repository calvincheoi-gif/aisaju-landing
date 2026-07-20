import fs from "fs";
import os from "os";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicVertex } from "@anthropic-ai/vertex-sdk";

/**
 * AI 리포트 생성용 클라이언트 선택기.
 *
 * 우선순위:
 * 1) GCP Vertex AI 경로 (ANTHROPIC_VERTEX_PROJECT_ID, CLOUD_ML_REGION,
 *    GCP_SERVICE_ACCOUNT_KEY 가 모두 설정된 경우) — Anthropic Console 결제와
 *    무관하게 동작하는 우회 경로.
 * 2) Anthropic 직접 API (ANTHROPIC_API_KEY) — 기존 경로. Console 결제 문제가
 *    해결되면 이쪽이 그대로 다시 쓰입니다.
 *
 * 둘 다 설정되어 있지 않으면 null을 반환합니다.
 */

type AiClientResult = {
  client: Anthropic | AnthropicVertex;
  model: string;
  via: "vertex" | "direct";
};

let cachedKeyPath: string | null = null;

function ensureGoogleCredentialsFile(serviceAccountJson: string): string {
  if (cachedKeyPath && fs.existsSync(cachedKeyPath)) return cachedKeyPath;
  const keyPath = path.join(os.tmpdir(), "aisaju-gcp-sa.json");
  fs.writeFileSync(keyPath, serviceAccountJson, { encoding: "utf-8" });
  cachedKeyPath = keyPath;
  return keyPath;
}

export function getAiClient(): AiClientResult | null {
  const gcpProjectId = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
  const gcpRegion = process.env.CLOUD_ML_REGION;
  const gcpServiceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (gcpProjectId && gcpRegion && gcpServiceAccountKey) {
    try {
      const keyPath = ensureGoogleCredentialsFile(gcpServiceAccountKey);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

      const client = new AnthropicVertex({
        projectId: gcpProjectId,
        region: gcpRegion,
      });

      // Model Garden에서 확인한 실제 활성화된 모델 ID입니다.
      // 필요하면 Netlify 환경변수 ANTHROPIC_VERTEX_MODEL로 덮어쓸 수 있습니다.
      const model = process.env.ANTHROPIC_VERTEX_MODEL || "claude-sonnet-5";

      return { client, model, via: "vertex" };
    } catch {
      // Vertex 설정에 문제가 있으면 아래 직접 API 경로로 폴백합니다.
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
    return { client, model, via: "direct" };
  }

  return null;
}
