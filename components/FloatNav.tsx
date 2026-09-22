"use client";

/**
 * 떠 있는 이동 버튼 (뒤로 · 목록 · 오행 · 홈) — 사이트 공통 모듈.
 * 오행 앱(/ohaeng/)의 navfab 과 같은 모양·위치로 맞춰, 어느 화면에서든 같은 손길로 돌아다니게 한다.
 *  · 홈("/")은 하단 탭바가 있고, 관리자(/admin)는 필요 없으므로 숨긴다
 *  · 카톡 등에서 링크로 바로 들어와 이전 페이지가 없으면 「뒤로」는 목록(또는 홈)으로 보낸다
 *  · 읽을거리 글 안에서는 「목록」 버튼을 하나 더 보여 준다
 */
import { usePathname, useRouter } from "next/navigation";

const HIDE = (p: string) => p === "/" || p.startsWith("/admin");

export default function FloatNav() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  if (HIDE(pathname)) return null;

  const inPost = pathname.startsWith("/learn/");
  const fallback = inPost ? "/learn" : "/";

  const goBack = () => {
    let sameSite = false;
    try { sameSite = !!document.referrer && new URL(document.referrer).host === location.host; } catch {}
    if (sameSite && window.history.length > 1) router.back();
    else router.push(fallback);
  };

  const btn =
    "flex h-[46px] w-[46px] flex-col items-center justify-center gap-[1px] rounded-full border border-[#DCE7F8] " +
    "bg-white/95 shadow-[0_4px_14px_rgba(20,50,110,.16)] backdrop-blur transition active:scale-95 hover:bg-[#EEF5FF]";
  const ic = "text-[16px] leading-none text-[#1D4FA8]";
  const tx = "text-[8.5px] font-bold leading-none text-[#1D4FA8]";

  return (
    <nav
      aria-label="빠른 이동"
      className="fixed right-[14px] z-50 flex flex-col gap-2"
      style={{ bottom: "calc(16px + env(safe-area-inset-bottom))" }}
    >
      <button type="button" className={btn} onClick={goBack} aria-label="뒤로 가기">
        <span className={ic}>‹</span><span className={tx}>뒤로</span>
      </button>
      {inPost && (
        <a className={btn} href="/learn" aria-label="읽을거리 목록">
          <span className={ic}>☰</span><span className={tx}>목록</span>
        </a>
      )}
      <a className={btn} href="/ohaeng/" aria-label="오행 진단">
        <span className={ic}>☯</span><span className={tx}>오행</span>
      </a>
      <a
        className={btn + " !border-transparent !bg-gradient-to-br from-[#2A8BFF] to-[#1D4FD1]"}
        href="/"
        aria-label="AI사주랩 홈으로"
      >
        <span className="text-[16px] leading-none text-white">⌂</span>
        <span className="text-[8.5px] font-bold leading-none text-white">홈</span>
      </a>
    </nav>
  );
}
