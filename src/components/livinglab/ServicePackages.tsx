import type { ServicePackage } from '@/data/livinglab';
import SectionHeading from './SectionHeading';

interface ServicePackagesProps {
  packages: ServicePackage[];
  inquiryEmail: string;
  inquirySubject: string;
}

function buildInquiryHref(email: string, subjectPrefix: string, item: ServicePackage) {
  const subject = `${subjectPrefix} ${item.title}`;
  const body = [
    '안녕하세요. 소이랩 리빙랩 실증사업 협의를 요청드립니다.',
    '',
    `관심 패키지: ${item.title} (${item.inquiryCode})`,
    '기관명:',
    '담당자:',
    '회신받을 연락처:',
    '협의하고 싶은 내용:',
  ].join('\n');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ServicePackages({ packages, inquiryEmail, inquirySubject }: ServicePackagesProps) {
  return (
    <section id="packages" aria-labelledby="packages-title" className="scroll-mt-32 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="packages-title"
          eyebrow="SERVICE PACKAGES"
          title="지역 도입 패키지"
          description="지역의 현재 조건과 필요한 실행 범위에 맞춰 진단부터 현장 실증, 정책화까지 조합할 수 있습니다."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item, index) => (
            <article key={item.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold tracking-wider text-navy">PACKAGE {String(index + 1).padStart(2, '0')}</span>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-gray-600">{item.duration}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">{item.description}</p>
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-800">대표 산출물</p>
                <p className="mt-2 text-sm text-gray-600">{item.deliverables.join(' · ')}</p>
              </div>
              <a
                href={buildInquiryHref(inquiryEmail, inquirySubject, item)}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-navy px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                {item.title} 협의하기
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
