import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import QnaBoard from "@/components/QnaBoard";
import { getQnaPosts } from "@/lib/qna";

export const metadata = {
  title: "Q&A | AI사주 Lab",
  description: "AI사주 Lab에 궁금한 점을 질문하고 답변을 받아보세요.",
};

export const revalidate = 0;

export default async function QnaPage() {
  const posts = await getQnaPosts();

  return (
    <>
      <Header />
      <main className="section">
        <PageIntro section="qnaPage" />
        <QnaBoard initialPosts={posts} />
      </main>
      <Footer />
    </>
  );
}
