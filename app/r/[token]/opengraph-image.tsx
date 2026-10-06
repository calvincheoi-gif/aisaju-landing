import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * 카톡·문자로 리포트 링크를 보낼 때 뜨는 미리보기 그림 (1200×630)
 *   의뢰자 이름(가림) · 질문 · 「AI사주랩 1문 1답 리포트」 · 로고 띠
 * 글꼴은 public/fonts 의 Noto Sans KR Bold 하나만 쓴다. 서버 함수에서는 public/ 을 fs 로 읽을 수 없고(Netlify 는 CDN 에만 둔다)
 * import.meta.url 경로도 외부에 서빙되지 않으므로, 현재 호스트의 /fonts/… 를 HTTPS 로 한 번 받아 메모리에 둔다.
 */
export const runtime = "nodejs";
export const alt = "AI사주랩 1문 1답 리포트";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

let fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "aisajulab.com";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const res = await fetch(`${proto}://${host}/fonts/NotoSansKR_700Bold.ttf`, { cache: "force-cache" });
  if (!res.ok) throw new Error("font " + res.status);
  fontCache = await res.arrayBuffer();
  return fontCache;
}

function maskName(n: string) {
  /* 성 + ○○ 로 고정 — 카톡 미리보기 제목이 한 줄에 들어가도록 길이를 일정하게 둔다 */
  const s = (n || "").trim();
  return (s[0] || "") + "○○";
}
function clip(t: string, n: number) { return t.length > n ? t.slice(0, n - 1) + "…" : t; }

export default async function OG({ params }: { params: { token: string } }) {
  let name = "", question = "", ref = "";
  const supabase = getSupabaseServerClient();
  if (supabase && /^[0-9a-f-]{36}$/i.test(params.token)) {
    const { data } = await supabase.rpc("free_ask_public", { p_token: params.token, p_count: false });
    const r = data as { name?: string; question?: string; ref_no?: string } | null;
    if (r) { name = maskName(r.name || ""); question = r.question || ""; ref = r.ref_no || ""; }
  }
  const font = await loadFont();
  const title = name ? `${name}님의 질문` : "AI사주랩 1문 1답";
  const q = question ? `“${clip(question, 60)}”` : "질문 하나, 답은 핵심만.";

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: "#EEF3FB", fontFamily: "NotoKR", color: "#1B2140" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 56px", background: "#1E2A55", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: 40 }}>AI사주랩<span style={{ color: "#F2C94C" }}>.com</span></span>
            <span style={{ fontSize: 22, color: "#B9C4E6" }}>무료 1문 1답 리포트</span>
          </div>
          <span style={{ fontSize: 20, color: "#C9D2EA" }}>{ref}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px", textAlign: "center" }}>
          <div style={{ fontSize: 26, color: "#2F5BEA", letterSpacing: 2 }}>{title}</div>
          <div style={{ marginTop: 18, fontSize: 48, lineHeight: 1.35, maxWidth: 1000 }}>{q}</div>
          <div style={{ marginTop: 34, display: "flex", gap: 14 }}>
            {["결론부터", "명식 근거", "시기", "실행 3가지"].map((t) => (
              <div key={t} style={{ padding: "10px 22px", borderRadius: 999, background: "#fff", border: "2px solid #C9D7F3", fontSize: 22, color: "#1E2A55" }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "22px 56px", background: "#fff", borderTop: "2px solid #DCE4EE", fontSize: 24, color: "#5B6480" }}>
          <span style={{ color: "#1E2A55" }}>최형철 · 사주보는 경영지도사</span>
          <span>·</span>
          <span>AI는 분석하고, 방향은 사람이 찾습니다</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "NotoKR", data: font, weight: 700, style: "normal" }] },
  );
}
