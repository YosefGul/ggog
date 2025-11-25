import HeroSlider from "@/components/HeroSlider";
import PartnersSection from "@/components/PartnersSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <AnimateOnScroll delay={100}>
        <PartnersSection />
      </AnimateOnScroll>
      <AnimateOnScroll delay={200}>
        <AboutSection />
      </AnimateOnScroll>
      <AnimateOnScroll delay={300}>
        <EventsSection />
      </AnimateOnScroll>
      <AnimateOnScroll delay={400}>
        <AnnouncementsSection />
      </AnimateOnScroll>
    </>
  );
}
