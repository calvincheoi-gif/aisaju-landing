import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceMenu from "@/components/ServiceMenu";
import About from "@/components/About";
import ConsultGuide from "@/components/ConsultGuide";
import Channels from "@/components/Channels";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServiceMenu />
        <About />
        <ConsultGuide />
        <Channels />
      </main>
      <Footer />
    </>
  );
}
