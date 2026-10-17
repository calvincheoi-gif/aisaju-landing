import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TalkBoard from "@/components/TalkBoard";
import { getTalkList } from "@/lib/talk/server";

/**
 * /talk — 「오늘 한 줄」 작성 + 전체 누적 목록 (2026-10-17)
 * 홈 1줄 롤링의 「+ 한 줄」이 여기로 온다. 첫 30개는 서버가 넣어 주고, 그 뒤는 「더 보기」.
 * 글이 올라오면 /api/talk 가 revalidatePath 로 갈아 끼우므로 캐시는 안전망(60초)만 둔다.
 */
export const metadata = {
  title: "오늘 한 줄 | AI사주랩.com",
  alternates: { canonical: "/talk" },
  description: "지금 마음, 바라는 것, 한마디 응원 — 로그인 없이 40자 한 줄을 남겨 보세요.",
};
export const revalidate = 60;

export default async function TalkPage() {
  const { items, total } = await getTalkList(0, 30);
  return (
    <>
      <Header />
      <main className="section">
        <div className="mb-5 text-center">
          <span className="eyebrow">TODAY · ONE LINE</span>
          <h1 className="mt-3 text-[24px] font-black leading-snug tracking-[-0.03em] text-[#12224A]">오늘 한 줄</h1>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#64748B]">
            한 줄이면 충분합니다. 남긴 글은 홈 첫 화면에 돌아가며 보입니다.
          </p>
        </div>
        <TalkBoard initial={items} total={total} />
      </main>
      <Footer />
    </>
  );
}
