import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceMenu from "@/components/ServiceMenu";
import About from "@/components/About";
import ConsultGuide from "@/components/ConsultGuide";
import Reviews from "@/components/Reviews";
import Channels from "@/components/Channels";
import Footer from "@/components/Footer";

// 후기(리뷰) 섹션이 최신 데이터를 항상 반영하도록 정적 캐싱을 끕니다.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServiceMenu />
        <About />
        <ConsultGuide />
        <Reviews />
        <Channels />
      </main>
      <Footer />
    </>
  );
}
