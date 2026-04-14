import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProgramsSection from '@/components/sections/ProgramsSection';
import StatsSection from '@/components/sections/StatsSection';
import CardNewsPreviewSection from '@/components/sections/CardNewsPreviewSection';
import NewsletterPreviewSection from '@/components/sections/NewsletterPreviewSection';
import ContactSection from '@/components/sections/ContactSection';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProgramsSection />
        <StatsSection />
        <CardNewsPreviewSection />
        <NewsletterPreviewSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
