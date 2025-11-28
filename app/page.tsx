import { Metadata } from "next";
import HeroSlider from "@/components/HeroSlider";
import PartnersSection from "@/components/PartnersSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import StructuredData from "@/components/seo/StructuredData";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateOrganizationSchema } from "@/lib/structured-data";

export const metadata: Metadata = generateSEOMetadata({
  title: "GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği",
  description: "Genç Girişimciler ve Oyun Geliştiricileri Derneği - Oyun geliştirme ve girişimcilik alanında faaliyet gösteren dernek. Etkinlikler, duyurular ve üyelik başvuruları.",
  url: "/",
});

const organizationSchema = generateOrganizationSchema({
  name: "GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  description: "Genç Girişimciler ve Oyun Geliştiricileri Derneği",
});

export default function Home() {
  return (
    <>
      <StructuredData data={organizationSchema} />
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
