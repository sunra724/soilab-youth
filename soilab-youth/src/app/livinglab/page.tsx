import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LivingLabHero from '@/components/livinglab/LivingLabHero';
import LivingLabAnchorNav from '@/components/livinglab/LivingLabAnchorNav';
import OverviewCards from '@/components/livinglab/OverviewCards';
import KpiDashboard from '@/components/livinglab/KpiDashboard';
import ProblemBank from '@/components/livinglab/ProblemBank';
import LivingLabProcess from '@/components/livinglab/LivingLabProcess';
import RecoveryJourney from '@/components/livinglab/RecoveryJourney';
import ExperimentCases from '@/components/livinglab/ExperimentCases';
import PartnerEcosystem from '@/components/livinglab/PartnerEcosystem';
import ServicePackages from '@/components/livinglab/ServicePackages';
import LivingLabFaq from '@/components/livinglab/LivingLabFaq';
import LivingLabCta from '@/components/livinglab/LivingLabCta';
import {
  livingLabData,
  problemCategories,
  publicExperiments,
  publicKpis,
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
      <main>
        <LivingLabHero {...livingLabData.hero} inquiryHref={institutionInquiryHref} />
        <LivingLabAnchorNav items={livingLabData.anchorItems} />
        <OverviewCards items={livingLabData.overview} />
        <KpiDashboard
          publicKpis={publicKpis}
          pendingKpis={livingLabData.kpis}
          stages={livingLabData.outcomeStages}
          dataNote={livingLabData.meta.dataNote}
          updatedAt={livingLabData.meta.updatedAt}
        />
        <ProblemBank categories={problemCategories} problems={publicProblems} />
        <LivingLabProcess steps={livingLabData.livingLabSteps} />
        <RecoveryJourney steps={livingLabData.recoverySteps} />
        <ExperimentCases cases={publicExperiments} />
        <PartnerEcosystem partners={livingLabData.partners} />
        <ServicePackages
          packages={livingLabData.packages}
          inquiryEmail={livingLabData.inquiry.institutionEmail}
          inquirySubject={livingLabData.inquiry.institutionSubject}
        />
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
