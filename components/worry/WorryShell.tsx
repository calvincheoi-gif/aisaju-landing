/**
 * 고민 랜딩 공통 틀 — 홈과 같은 폰 폭(430px)·하늘색 바탕·흰 카드 톤.
 * 상단 브랜드 바 + 본문 + 하단 사업자 한 줄. (떠 있는 뒤로·홈 버튼은 FloatNav 가 자동으로 붙는다)
 */
export default function WorryShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-[#EAF2FF]">
      <div className="w-full max-w-[430px] bg-[#F5F9FF] pb-28">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#DCE7F8] bg-white/95 px-[18px] py-2.5 backdrop-blur">
          <a href="/" className="flex items-baseline gap-[3px] text-[17px] font-extrabold tracking-[-0.04em] text-[#12224A]">
            AI사주랩<span className="text-[#2563EB]">.com</span>
          </a>
          {/* v3.0(2026-11-05): 테두리형 「고민 모아보기」 → 채움 청색 「고민 전체 List」 — 홈 4줄에서 놓친 고민을 바로 찾게 주목도 ↑ */}
          <a
            href="/q?utm=q_header"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-extrabold text-white shadow-[0_4px_12px_rgba(37,99,235,.28)]"
            style={{ background: "linear-gradient(180deg,#5B8CFF 0%,#2563EB 100%)" }}
          >
            <span aria-hidden>☰</span> 고민 전체 List
          </a>
        </header>
        {children}
        <footer className="mt-10 px-[18px] text-center text-[11px] leading-relaxed text-[#94A3B8]">
          최형철 사주명리 연구소 · 라이프앤비즈(Life &amp; Biz) 성장 연구소<br />
          명리학에 기반한 참고 의견이며 결과를 보장하지 않습니다.
        </footer>
      </div>
    </div>
  );
}
