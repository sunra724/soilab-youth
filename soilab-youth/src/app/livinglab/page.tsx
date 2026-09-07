import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LivingLabHero from '@/components/livinglab/LivingLabHero';
import LivingLabAnchorNav from '@/components/livinglab/LivingLabAnchorNav';
import OverviewCards from '@/components/livinglab/OverviewCards';
import ProblemBank from '@/components/livinglab/ProblemBank';
import LivingLabProcess from '@/components/livinglab/LivingLabProcess';
import RecoveryJourney from '@/components/livinglab/RecoveryJourney';
import ExperimentCases from '@/components/livinglab/ExperimentCases';
import PartnerEcosystem from '@/components/livinglab/PartnerEcosystem';
import LivingLabFaq from '@/components/livinglab/LivingLabFaq';
import LivingLabCta from '@/components/livinglab/LivingLabCta';
import {
  livingLabData,
  problemCategories,
  publicExperiments,
  publicProblems,
} from '@/data/livinglab';

export const metadata: Metadata = {
  title: { absolute: livingLabData.meta.title },
  description: livingLabData.meta.description,
  alternates: { canonical: livingLabData.meta.canonicalUrl },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: livingLabData.meta.canonicalUrl,
    title: livingLabData.meta.title,
    description: livingLabData.meta.description,
    siteName: '협동조합 소이랩 고립·은둔 청년 지원센터',
  },
};

const institutionInquiryHref = `mailto:${livingLabData.inquiry.institutionEmail}?subject=${encodeURIComponent(
  livingLabData.inquiry.institutionSubject,
)}`;

export default function LivingLabPage() {
  return (
    <>
      <Header />
      <main id="livinglab-main" className="[&_h1]:break-keep [&_h2]:break-keep [&_h3]:break-keep [&_p]:break-keep [&_dd]:break-keep">
        <LivingLabHero {...livingLabData.hero} />
        <LivingLabAnchorNav items={livingLabData.anchorItems} />
        <OverviewCards items={livingLabData.overview} />
        <ProblemBank categories={problemCategories} problems={publicProblems} />
        <LivingLabProcess steps={livingLabData.livingLabSteps} />
        <RecoveryJourney steps={livingLabData.recoverySteps} />
        <ExperimentCases cases={publicExperiments} />
        <PartnerEcosystem partners={livingLabData.partners} />
        <LivingLabFaq items={livingLabData.faqs} />
        <LivingLabCta
          inquiryHref={institutionInquiryHref}
          supportHref={livingLabData.inquiry.supportHref}
          phone={livingLabData.inquiry.phone}
        />
      </main>
      <Footer />
    </>
  );
}
