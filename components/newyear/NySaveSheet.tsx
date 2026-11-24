"use client";

/**
 * 그림 띄워 저장하기 — 파일 내려받기가 막힌 인앱 브라우저용 마지막 길.
 * 만든 그림을 화면 가득 띄우고 「길게 눌러 이미지 저장」을 안내한다.
 */
export default function NySaveSheet({ images, onClose }: { images: string[]; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="이미지 저장" className="fixed inset-0 z-[90] flex flex-col bg-[#0B1430]/95">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))]">
        <p className="break-keep text-[14.5px] font-extrabold leading-snug text-white">그림을 <span className="text-[#FFE066]">길게 눌러</span> 「이미지 저장」을 고르세요</p>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full bg-white/15 px-3.5 py-2 text-[13px] font-bold text-white">닫기</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={`2027 새해운 ${i + 1}쪽`} className="mx-auto mt-3 block w-full max-w-[420px] rounded-lg bg-white" style={{ WebkitTouchCallout: "default" } as React.CSSProperties} />
        ))}
        <p className="mx-auto mt-4 max-w-[420px] break-keep text-center text-[12px] leading-relaxed text-[#9DB8F5]">저장 메뉴가 뜨지 않으면 오른쪽 위 ··· 메뉴에서 「다른 브라우저로 열기」를 고른 뒤 다시 저장해 주세요.</p>
      </div>
    </div>
  );
}
