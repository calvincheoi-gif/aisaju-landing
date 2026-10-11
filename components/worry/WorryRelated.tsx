import { getWorry } from "@/lib/worries/data";

/** 블록 ⑦ 이런 고민도 — 다른 고민 페이지로 (체류 연장) */
export default function WorryRelated({ slugs }: { slugs: string[] }) {
  const items = slugs.map(getWorry).filter(Boolean);
  if (!items.length) return null;
  return (
    <section className="mx-[18px] mt-7">
      <h2 className="text-[15px] font-extrabold text-[#12224A]">이런 고민도 많이 봐요</h2>
      <div className="mt-3 space-y-2">
        {items.map((r) => (
          <a
            key={r!.slug}
            href={`/q/${r!.slug}`}
            className="flex items-center gap-3 rounded-xl border border-[#DCE7F8] bg-white px-4 py-3 text-[14px] font-bold text-[#16233F] hover:bg-[#F5F9FF]"
          >
            <span className="text-[18px]">{r!.emoji}</span>
            <span className="flex-1">{r!.title}</span>
            <span className="text-[#2563EB]">›</span>
          </a>
        ))}
      </div>
    </section>
  );
}
