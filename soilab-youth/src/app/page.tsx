import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProgramsSection from '@/components/sections/ProgramsSection';
import FamilyLivingLabPreview from '@/components/livinglab/FamilyLivingLabPreview';
import CsrPreviewSection from '@/components/csr/CsrPreviewSection';
import StatsSection from '@/components/sections/StatsSection';
import CardNewsPreviewSection from '@/components/sections/CardNewsPreviewSection';
import NewsletterPreviewSection from '@/components/sections/NewsletterPreviewSection';
import ContactSection from '@/components/sections/ContactSection';
import InstitutionServicesSection from '@/components/sections/InstitutionServicesSection';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <InstitutionServicesSection />
        <AboutSection />
        <ProgramsSection />
        <FamilyLivingLabPreview />
        <CsrPreviewSection />
        <StatsSection />
        <CardNewsPreviewSection />
        <NewsletterPreviewSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
