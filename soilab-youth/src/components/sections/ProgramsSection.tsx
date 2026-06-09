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
    badge: '고립·은둔 청년',
    badgeColor: 'navy',
    title: '고립·은둔 청년 지원사업',
    description:
      '방 안에 머무는 청년들을 발견하고, 자신의 속도로 회복할 수 있도록 단계적으로 지원합니다. 심리 안정부터 사회 복귀까지 함께합니다.',
    tags: ['#발굴', '#심리상담', '#일상회복', '#부모교육', '#사회복귀'],
    note: '2025년 132명 발굴 · 이수율 100% · 25개 기관 연계',
    color: '#46549C',
    tagBg: '#ECEEF8',
    actions: [
      {
        label: '성과 사례집 보기',
        href: 'https://forms.gle/ADcNkuMBENKfyuEi8',
        external: true,
        primary: true,
      },
      {
        label: 'PDF 다운로드',
        href: '/소이랩_고립은둔청년지원사업_성과사례집.pdf',
        download: true,
      },
    ],
  },
  {
    badge: '청년 연결',
    badgeColor: 'blue',
    title: '청년 다다름 사업',
    description:
      '청년의 다양한 삶의 방식을 인정하고 연결합니다. 카드뉴스 발행, 활동 홍보, 지역 청년 네트워크를 통해 청년이 서로를 발견합니다.',
    tags: ['#카드뉴스', '#청년네트워크', '#활동홍보', '#커뮤니티'],
    color: '#248DAC',
    tagBg: '#E8F4FD',
    actions: [
      {
        label: '최신 카드뉴스 보기',
        href: '/cardnews',
        primary: true,
        internal: true,
      },
    ],
  },
  {
    badge: '지역생태계 활성화',
    badgeColor: 'green',
    title: '청년 탄탄대로',
    description:
      '대구 청년의 일상회복과 사회참여를 지역 기업·기관과 잇는 Job Bridge 과정입니다. 회복, 훈련, 일경험, 정착까지 지역 안에서 이어갑니다.',
    tags: ['#JobBridge', '#일상회복', '#사회참여', '#일경험', '#기업매칭'],
    note: '협동조합 소이랩 × (사)커뮤니티와경제 공동 운영',
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

const PROMOTION_PLANS = [
  {
    title: '전환 페이지 연결',
    description:
      '홈페이지, 카드뉴스, 뉴스레터의 주요 CTA를 브리지 페이지로 모아 참여 신청과 기업 참여 문의가 한 경로로 이어지게 합니다.',
  },
  {
    title: '파트너 배포 키트',
    description:
      '복지관, 청년센터, 대학, 기업 담당자가 바로 전달할 수 있는 짧은 소개문·이미지·문의 링크 묶음을 제공합니다.',
  },
  {
    title: '성과 기반 콘텐츠',
    description:
      '회복, 훈련, 일경험, 채용 전환 흐름을 월간 카드뉴스와 뉴스레터로 반복 노출해 신뢰와 참여 동기를 함께 높입니다.',
  },
  {
    title: '현장 채널 확장',
    description:
      '기업 설명회, 유관기관 회의, 청년 커뮤니티 모임에 연결 가능한 홍보 문구를 맞춰 배포하고 추천 유입을 추적합니다.',
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
            청년의 회복과 연결, 지역 안착까지 이어지는 소이랩의 현재 사업입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((program) => (
            <div key={program.title} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-1.5" style={{ background: program.color }} />
              <div className="p-6 flex h-full flex-col">
                <Badge label={program.badge} color={program.badgeColor} />
                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">{program.title}</h3>
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
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="p-6 sm:p-8" style={{ background: '#46549C', color: '#fff' }}>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.16)' }}>
                홍보 활성화
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-4 mb-3">
                청년 탄탄대로를 지역 네트워크의 참여 경로로 확장합니다
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
                온라인 전환 페이지와 오프라인 추천 채널을 함께 운영해 청년, 보호자, 기업,
                유관기관이 같은 메시지로 사업을 이해하고 바로 연결되도록 합니다.
              </p>
              <a
                href="https://bridge.soilab-youth.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-6 text-sm px-4 py-2 rounded-lg font-semibold bg-white"
                style={{ color: '#46549C' }}
              >
                브리지 페이지 열기
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
              {PROMOTION_PLANS.map((plan) => (
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
