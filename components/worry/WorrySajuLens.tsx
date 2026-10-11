/** 블록 ⑤ 사주로 더 보면 — 체크는 '상황', 사주는 '나'. 전문가 1문 1답으로 넘어갈 이유 */
export default function WorrySajuLens({ text }: { text: string }) {
  return (
    <section className="mx-[18px] mt-5 rounded-2xl bg-gradient-to-br from-[#12224A] to-[#1E3A8A] p-5 text-white shadow-[0_10px_26px_rgba(18,34,74,.22)]">
      <div className="text-center text-[12px] font-bold tracking-[.12em] text-[#93B4F5]">SAJU LENS</div>
      <h3 className="mt-1.5 text-center text-[18px] font-black leading-snug">
        체크는 <span className="text-[#FDE68A]">&lsquo;상황&rsquo;</span>을,<br />사주는 <span className="text-[#FDE68A]">&lsquo;나&rsquo;</span>를 봅니다
      </h3>
      <p className="mt-3 text-[13.5px] leading-relaxed text-[#DCE7F8]">{text}</p>
    </section>
  );
}
