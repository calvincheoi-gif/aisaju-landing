import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase";
import { mergeAnswer, type AskAnswer, type AskModule } from "@/lib/ask-report";
import ReportView from "./ReportView";

/**
 * 고객용 1매 리포트 열람 페이지 (2026-10-04)
 *   /r/<share_token>  — 카톡으로 이 링크를 보낸다. 글자가 선명한 웹 페이지로 열리고, PDF 저장도 여기서 한다.
 * 토큰은 추측 불가한 uuid 이고, 답이 저장된 건만 열린다. 검색엔진에는 노출하지 않는다.
 * 카톡 미리보기(스크래퍼)가 긁어 갈 때는 열람 수에 넣지 않는다 — 실제 사람이 연 횟수만 센다.
 */
export const dynamic = "force-dynamic";

interface PublicRow { ref_no: string; name: string; created_at: string; question: string; answer: Partial<AskAnswer> | null; module: AskModule | null }

function maskName(n: string) {
  const s = (n || "").trim();
  if (s.length <= 1) return s + "○○";
  return s[0] + "○".repeat(Math.max(1, s.length - 1));
}
const isBot = (ua: string) => /bot|crawl|spider|facebookexternalhit|kakaotalk-scrap|kakao|Yeti|preview|headless|lighthouse|Slack|Twitter|Discord|WhatsApp|Telegram/i.test(ua);

async function fetchRow(token: string, count: boolean): Promise<PublicRow | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await supabase.rpc("free_ask_public", { p_token: token, p_count: count });
  return (data as PublicRow | null) ?? null;
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const row = await fetchRow(params.token, false);
  const title = row ? `${maskName(row.name)}님의 1문 1답 리포트 | AI사주랩.com` : "1문 1답 리포트 | AI사주랩.com";
  const q = row?.question ? `“${row.question.slice(0, 70)}${row.question.length > 70 ? "…" : ""}”` : "질문 하나, 답 한 장. 최형철 소장이 직접 봅니다.";
  const description = row ? `${q} — 결론부터 · 명식 근거 · 시기 · 실행 3가지. 최형철 소장의 답을 확인하세요.` : q;
  return {
    title, description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "article", siteName: "AI사주랩.com", locale: "ko_KR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ReportPage({ params, searchParams }: { params: { token: string }; searchParams: { print?: string } }) {
  const ua = headers().get("user-agent") || "";
  const row = await fetchRow(params.token, !isBot(ua));
  if (!row) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF3FB", fontFamily: "Pretendard, sans-serif", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1E2A55" }}>리포트를 찾을 수 없습니다</div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#5B6480", lineHeight: 1.6 }}>링크가 잘못됐거나 아직 답이 준비되지 않았습니다.<br />카카오톡 채널로 문의해 주세요.</div>
          <a href="/" style={{ display: "inline-block", marginTop: 16, fontSize: 14, color: "#2F5BEA", fontWeight: 700 }}>AI사주랩.com 홈으로</a>
        </div>
      </main>
    );
  }
  const d = new Date(row.created_at);
  return (
    <ReportView
      refNo={row.ref_no}
      date={`${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`}
      name={maskName(row.name)}
      question={row.question}
      module={row.module ?? "none"}
      a={mergeAnswer(row.answer)}
      autoPrint={searchParams?.print === "1"}
    />
  );
}
