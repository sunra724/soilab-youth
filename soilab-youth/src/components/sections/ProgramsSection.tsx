import Badge from '@/components/ui/Badge';
import Link from 'next/link';

type BadgeColor = 'navy' | 'blue' | 'green';

type ProgramAction = {
  label: string;
  href: string;
  primary?: boolean;
  external?: boolean;
  download?: boolean;
  internal?: boolean;
};

type Program = {
  badge: string;
  badgeColor: BadgeColor;
  title: string;
  description: string;
  tags: string[];
  note?: string;
  color: string;
  tagBg: string;
  actions: ProgramAction[];
};

const PROGRAMS: Program[] = [
  {
    badge: '2025년 공개 실적',
    badgeColor: 'navy',
    title: '2025 고립·은둔 청년 지원사업',
    description:
      '방 안에 머무는 청년들을 발견하고, 자신의 속도로 회복할 수 있도록 단계적으로 지원합니다. 심리 안정부터 사회 복귀까지 함께합니다.',
    tags: ['#발굴', '#심리상담', '#일상회복', '#부모교육', '#사회복귀'],
    note: '2025년 발굴 132명 · 등록자 125명 전원 이수 · 25개 기관 연계',
    color: '#46549C',
    tagBg: '#ECEEF8',
    actions: [
      {
        label: '성과 사례집 보기',
        href: 'https://forms.gle/ADcNkuMBENKfyuEi8',
        external: true,
        primary: true,
      },
    ],
  },
  {
    badge: '2026년 운영 중',
    badgeColor: 'blue',
    title: '청년다다름사업 대구제작소',
    description:
      '청년재단의 맞춤형 자립 지원사업입니다. 담당매니저가 청년의 상황과 속도에 맞춰 개인별 참여계획을 세우고, 일상회복·자기성장·진로 탐색과 지역 자원 연계를 함께합니다.',
    tags: ['#맞춤형자립지원', '#일상회복', '#자기성장', '#진로탐색'],
    note: '2026년 모집 마감·운영 중 · 대구제작소 실적은 종료 후 정리해 공개합니다.',
    color: '#248DAC',
    tagBg: '#E8F4FD',
    actions: [
      {
        label: '대구제작소 운영 안내',
        href: 'https://bridge.soilab-youth.kr/#youth-projects',
        primary: true,
        external: true,
      },
    ],
  },
  {
    badge: '2026년 운영 중',
    badgeColor: 'green',
    title: '청년 탄탄대로',
    description:
      '대구 청년의 일상회복과 사회참여를 지역 기업·기관과 잇는 Job Bridge 과정입니다. 기초과정, 현장체험과 직무훈련, 일경험을 단계적으로 운영하며 청년과 직무의 적합성을 살핍니다.',
    tags: ['#JobBridge', '#일상회복', '#사회참여', '#일경험', '#기업매칭'],
    note: '협동조합 소이랩 × (사)커뮤니티와경제 공동 운영 · 2026년 모집 마감·운영 중 · 실적은 종료 후 공개합니다.',
    color: '#228D7B',
    tagBg: '#E6F4F1',
    actions: [
      {
        label: '청년 탄탄대로 보기',
        href: 'https://bridge.soilab-youth.kr/',
        external: true,
        primary: true,
      },
      {
        label: '기업 참여 문의',
        href: 'mailto:tantan053@daum.net',
      },
    ],
  },
];

const PARTICIPATION_GUIDES = [
  {
    title: '청년·가족의 사업 문의',
    description:
      '현재 사업의 대상과 운영 내용을 먼저 확인해 주세요. 모집 여부와 참여 가능 범위는 사업별 담당자에게 문의할 수 있습니다.',
  },
  {
    title: '기관의 참여자 추천',
    description:
      '청년센터·복지관·대학 등은 대상 기준과 연계 절차를 먼저 협의합니다. 참여자의 의사를 확인한 뒤 필요한 범위에서 연결합니다.',
  },
  {
    title: '기업의 일경험 협력',
    description:
      '수행할 직무, 현장 지도 인력, 참여 기간과 지원 조건을 함께 확인합니다. 지원 종료 이후의 채용은 기업의 인력 수요와 채용 절차에 따라 결정됩니다.',
  },
  {
    title: '새로운 사업의 운영 협력',
    description:
      '지역과 대상, 운영 기간, 예산에 맞춰 맡길 업무를 정합니다. 활동 운영·지역 자원 연계·결과 정리 등 필요한 범위로 협의할 수 있습니다.',
  },
];

export default function ProgramsSection() {
  return (
    <section id="programs" className="py-20" style={{ background: '#F8F9FC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: '#46549C' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">주요 사업</h2>
          <p className="text-gray-500 text-sm mt-3">
            진행 중인 사업의 운영 안내와, 종료 후 정리한 공개 실적을 구분해 소개합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((program) => (
            <article key={program.title} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-1.5" style={{ background: program.color }} />
              <div className="p-6 flex flex-1 flex-col">
                <Badge label={program.badge} color={program.badgeColor} />
                <h3 className="break-keep text-lg font-bold text-gray-900 mt-3 mb-2">{program.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{program.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: program.tagBg, color: program.color }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {program.note && (
                  <p className="text-xs text-gray-500 mb-5">{program.note}</p>
                )}
                <div className="mt-auto flex gap-2 flex-wrap">
                  {program.actions.map((action) => {
                    const className = action.primary
                      ? 'text-sm px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 text-white'
                      : 'text-sm px-4 py-2 rounded-lg font-semibold border transition-colors';
                    const style = action.primary
                      ? { background: program.color }
                      : { borderColor: program.color, color: program.color };

                    if (action.internal) {
                      return (
                        <Link key={action.href} href={action.href} className={className} style={style}>
                          {action.label}
                        </Link>
                      );
                    }

                    return (
                      <a
                        key={action.href}
                        href={action.href}
                        target={action.external ? '_blank' : undefined}
                        rel={action.external ? 'noopener noreferrer' : undefined}
                        download={action.download}
                        className={className}
                        style={style}
                      >
                        {action.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="p-6 sm:p-8" style={{ background: '#46549C', color: '#fff' }}>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.16)' }}>
                참여·추천·협력 안내
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-4 mb-3">
                필요한 연결부터 확인해 주세요
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
                청년·가족의 사업 문의, 기관의 추천, 기업의 일경험 협력은 확인할 내용이 다릅니다.
                현재 운영 안내를 살펴보고 필요한 경로로 문의해 주세요.
              </p>
              <a
                href="https://bridge.soilab-youth.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-6 text-sm px-4 py-2 rounded-lg font-semibold bg-white"
                style={{ color: '#46549C' }}
              >
                현재 사업 운영 안내
              </a>
              <Link href="/partnership" className="mt-4 block text-sm font-semibold text-white underline underline-offset-4">기관 협력 범위와 절차 보기 →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
              {PARTICIPATION_GUIDES.map((plan) => (
                <div key={plan.title} className="bg-white p-6">
                  <h4 className="font-bold text-gray-900 mb-2">{plan.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
