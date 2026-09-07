export type PublicationStatus = 'draft' | 'approved';
export type EvidenceLevel = 'hypothesis' | 'observed' | 'validated';

export interface KpiItem {
  id: string;
  label: string;
  value: number | null;
  unit: '명' | '%' | '개' | '건';
  period: string;
  numerator?: string;
  denominator?: string;
  definition: string;
  duplicatePolicy?: string;
  updatedAt: string;
  status: PublicationStatus;
  source: string;
}

export interface ProblemCard {
  id: string;
  title: string;
  category: string;
  barrier: string;
  userNeed: string;
  hypothesis: string;
  prototype: string;
  metrics: string[];
  nextAction?: string;
  evidenceLevel: EvidenceLevel;
  status: PublicationStatus;
  reading?: { title: string; href: string };
}

export interface LivingLabStep {
  id: string;
  order: number;
  title: string;
  description: string;
  activities: string[];
  deliverables: string[];
}

export interface RecoveryStep {
  id: string;
  order: number;
  title: string;
  state: string;
  intervention: string;
  indicators: string[];
}

export interface ExperimentCase {
  id: string;
  title: string;
  problem: string;
  hypothesis: string;
  participants?: string;
  duration?: string;
  prototype: string;
  metrics: string[];
  result?: string | null;
  learning?: string;
  nextIteration?: string;
  status: 'planned' | 'running' | 'completed';
  publicationStatus: PublicationStatus;
}

export interface ServicePackage {
  id: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
  inquiryCode: string;
}

export interface PartnerType {
  title: string;
  role: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const problemCategories = [
  '전체',
  '비대면 초기접촉',
  '일상생활 회복',
  '심리적 안정',
  '가족관계',
  '사회적 관계',
  '주거·경제',
  '교육·일경험',
  '지역 서비스 접근',
  '기관 간 연계',
] as const;

const kpis: KpiItem[] = [
  {
    id: 'youth-discovered',
    label: '발굴 청년 수',
    value: null,
    unit: '명',
    period: '공개 승인 후 입력',
    definition: '정의된 발굴 기준에 따라 접점이 확인된 청년의 익명 집계',
    duplicatePolicy: '중복 기준 확인 필요',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '내부 집계표 검증 예정',
  },
  {
    id: 'youth-registered',
    label: '등록 청년 수',
    value: null,
    unit: '명',
    period: '공개 승인 후 입력',
    definition: '등록 기준을 충족한 청년의 익명 집계',
    duplicatePolicy: '개인 단위 중복 제거 기준 확인 필요',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '내부 집계표 검증 예정',
  },
  {
    id: 'continued-participation',
    label: '프로그램 지속 참여율',
    value: null,
    unit: '%',
    period: '공개 승인 후 입력',
    numerator: '지속 참여 기준을 충족한 인원',
    denominator: '프로그램 참여 시작 인원',
    definition: '합의된 기간과 회차 기준에 따른 지속 참여 비율',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '프로그램 운영 집계표 검증 예정',
  },
  {
    id: 'service-connections',
    label: '서비스 연계 건수',
    value: null,
    unit: '건',
    period: '공개 승인 후 입력',
    definition: '실제 접수 여부가 확인된 지역 서비스 연계 건수',
    duplicatePolicy: '동일인 복수 서비스 연계는 건별 집계 여부 확인 필요',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '기관 연계 집계표 검증 예정',
  },
  {
    id: 'social-participation',
    label: '사회참여 전환율',
    value: null,
    unit: '%',
    period: '공개 승인 후 입력',
    numerator: '합의된 사회참여 기준을 충족한 인원',
    denominator: '전환 평가 대상 인원',
    definition: '교육·훈련·일경험 등 공개 승인된 사회참여 정의에 따른 비율',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '성과 집계표 검증 예정',
  },
  {
    id: 'partner-organizations',
    label: '협력기관 수',
    value: null,
    unit: '개',
    period: '공개 승인 후 입력',
    definition: '단순 접촉이 아닌 실무 협력 기준을 충족한 기관 수',
    duplicatePolicy: '기관 단위 중복 제거',
    updatedAt: '공개 승인 후 입력',
    status: 'draft',
    source: '협력기관 목록 검증 예정',
  },
];

const problems: ProblemCard[] = [
  {
    id: 'low-contact-entry',
    title: '첫 문의를 더 편하게 시작하려면?',
    category: '비대면 초기접촉',
    barrier: '전화통화, 방문상담, 긴 신청서와 신분 공개가 첫 접촉에 부담이 될 수 있습니다.',
    userNeed: '별칭·문자·온라인 등 부담이 낮은 방식으로 시작할 선택권이 필요합니다.',
    hypothesis: '접촉 방식 선택권을 제공하면 초기상담 전환이 높아질 수 있습니다.',
    prototype: '간편 문의, 응답방식 선택, 기관 추천경로',
    metrics: ['문의 수', '첫 응답률', '상담 전환율', '재접촉률'],
    nextAction: '기관별 초기응대 시간과 채널 선택 범위를 함께 정의합니다.',
    reading: { title: '첫 연결을 이어가는 연구노트', href: '/research/notes/outreach-to-first-connection' },
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'daily-life-foundation',
    title: '일상의 작은 활동부터 시작할 수 있을까?',
    category: '일상생활 회복',
    barrier: '수면·식사·외출 등 일상의 어려움이 정해진 시간의 프로그램 참여에 부담이 될 수 있습니다.',
    userNeed: '취업교육보다 먼저 선택할 수 있는 작은 일상활동이 필요합니다.',
    hypothesis: '저강도 개인활동이 참여 지속에 도움을 줄 수 있습니다.',
    prototype: '오늘의 체크인, 선택형 활동카드',
    metrics: ['활동 참여일수', '7일·28일 유지율', '자기평가 변화'],
    nextAction: '활동의 난이도와 반복·중단·재시작 기준을 함께 설계합니다.',
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'consistent-contact-person',
    title: '믿고 연락할 담당자를 꾸준히 만날 수 있을까?',
    category: '사회적 관계',
    barrier: '기관마다 초기상담을 반복하고 담당자가 바뀌면서 관계 형성의 부담이 커집니다.',
    userNeed: '믿고 연락할 수 있는 한 명의 지속적인 접점이 필요합니다.',
    hypothesis: '전담 접점이 중도이탈을 낮출 수 있습니다.',
    prototype: '전담매니저, 선호 연락방식·빈도 기록',
    metrics: ['첫 연결 유지율', '중도이탈률', '도움 요청 가능 여부'],
    nextAction: '기관 간 인계 시 접점 연속성을 지키는 최소 절차를 정리합니다.',
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'family-guidance',
    title: '가족이 도움을 구할 경로는 충분할까?',
    category: '가족관계',
    barrier: '과잉개입, 갈등, 소진과 정보 부족이 당사자와 가족 모두의 부담을 키웁니다.',
    userNeed: '당사자 지원과 구분되는 가족 안내와 상담이 필요합니다.',
    hypothesis: '가족지원을 병행하면 관계 악화와 돌봄 소진을 줄일 수 있습니다.',
    prototype: '가족교육, 별도상담, 행동 가이드',
    metrics: ['가족 프로그램 참여', '갈등 체감 변화', '서비스 연계'],
    nextAction: '당사자의 선택과 개인정보를 보호하는 가족지원 원칙을 구체화합니다.',
    reading: { title: '가족의 첫 문의를 다룬 연구노트', href: '/research/notes/family-first-inquiry' },
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'fragmented-services',
    title: '기관을 옮겨도 지원이 이어지려면?',
    category: '기관 간 연계',
    barrier: '심리·주거·채무·고용 서비스를 각각 찾아야 하고 연계 이후 상태 확인이 어렵습니다.',
    userNeed: '한 번의 초기접촉 뒤 필요한 기관으로 끊김 없이 연결되어야 합니다.',
    hypothesis: '표준 의뢰·회송 체계가 실제 서비스 이용률을 높일 수 있습니다.',
    prototype: '지역자원표, 표준 의뢰서, 회송 상태관리',
    metrics: ['의뢰 건수', '접수율', '실제 이용률', '회송 완료율'],
    nextAction: '개인정보를 최소화한 기관 간 의뢰·회송 항목을 합의합니다.',
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'housing-and-finance',
    title: '생활의 어려움과 회복 지원을 함께 살피려면?',
    category: '주거·경제',
    barrier: '임시거처, 주소 불일치, 채무와 생계 불안이 참여를 지속하기 어렵게 합니다.',
    userNeed: '회복 프로그램과 기본생활 지원이 함께 연결되어야 합니다.',
    hypothesis: '생활안정 지원이 회복 프로그램의 지속률을 높일 수 있습니다.',
    prototype: '주거·채무·식사·생활지원 연결',
    metrics: ['연계 완료율', '참여 지속률', '긴급지원 소요시간'],
    nextAction: '지역별 생활안정 자원의 이용 조건과 연결 시간을 점검합니다.',
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'first-step-outside',
    title: '집 밖 첫 활동의 부담을 낮추려면?',
    category: '사회적 관계',
    barrier: '단체 프로그램, 낯선 장소와 장시간 활동이 첫 외출의 부담을 높입니다.',
    userNeed: '짧고 반복 가능하며 선택할 수 있는 외부활동이 필요합니다.',
    hypothesis: '낮은 강도의 단계형 활동이 외출 부담을 낮출 수 있습니다.',
    prototype: '현관문 열기, 근거리 산책, 공간 사전보기, 소규모 체험',
    metrics: ['본인 설정 목표 달성', '재시도 의향', '부담감 변화'],
    nextAction: '당사자가 직접 활동의 강도와 다음 시점을 선택하도록 설계합니다.',
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
  {
    id: 'multidimensional-outcomes',
    title: '일상과 관계의 변화를 어떻게 기록할까?',
    category: '교육·일경험',
    barrier: '취업 중심 평가는 일상과 관계에서 생긴 작은 변화를 누락합니다.',
    userNeed: '일상·신뢰·도움요청·참여의 변화도 성과로 인정되어야 합니다.',
    hypothesis: '단계별 성과체계가 장기 지원의 효과를 더 정확히 보여줄 수 있습니다.',
    prototype: '다차원 성과지표와 변화기록',
    metrics: ['일상회복', '관계회복', '서비스 이용', '교육·일경험 전환'],
    nextAction: '성과 정의와 측정 시점을 당사자·기관과 공동설계합니다.',
    reading: { title: '회복 기록을 검토하는 연구노트', href: '/research/notes/everyday-recovery-outcomes' },
    evidenceLevel: 'hypothesis',
    status: 'approved',
  },
];

const livingLabSteps: LivingLabStep[] = [
  {
    id: 'discover',
    order: 1,
    title: '경험 듣기',
    description: '청년이 편한 방식으로 필요한 도움과 일상에서 겪는 어려움을 이야기할 수 있게 합니다.',
    activities: ['편한 대화 방식 정하기', '청년·가족·실무자의 경험 듣기'],
    deliverables: ['경험과 접점 기록'],
  },
  {
    id: 'define',
    order: 2,
    title: '질문 정리하기',
    description: '도움을 구하고 이용하는 과정에서 어디가 어려웠는지 함께 살펴봅니다.',
    activities: ['지원 이용 과정 살펴보기', '먼저 바꾸고 싶은 일 찾기'],
    deliverables: ['함께 해결할 질문'],
  },
  {
    id: 'codesign',
    order: 3,
    title: '함께 설계하기',
    description: '무엇을 시도할지, 어떤 변화를 살펴볼지 청년과 현장기관이 함께 정합니다.',
    activities: ['참여 방식과 범위 정하기', '예상 변화와 확인 방법 정하기'],
    deliverables: ['함께 정한 실험 계획'],
  },
  {
    id: 'prototype',
    order: 4,
    title: '작게 시도하기',
    description: '연락 방법이나 짧은 활동처럼 부담이 적은 시도부터 시작합니다.',
    activities: ['작은 활동·서비스 시안 만들기', '참여자의 경험 듣기'],
    deliverables: ['시도한 방법과 참여 경험'],
  },
  {
    id: 'field-test',
    order: 5,
    title: '함께 살펴보기',
    description: '편해진 점과 어려웠던 점을 듣고, 계속할지 바꿀지 함께 판단합니다.',
    activities: ['정한 기간 동안 변화 기록', '중간에 돌아보고 방법 조정'],
    deliverables: ['변화와 개선 기록'],
  },
  {
    id: 'evaluate',
    order: 6,
    title: '배운 점 나누기',
    description: '확인한 변화와 한계를 정리하고 다음에 시도할 방법을 남깁니다.',
    activities: ['청년·실무자와 함께 돌아보기', '다음 실험과 지역 적용 검토'],
    deliverables: ['배운 점', '다음 시도'],
  },
];

const recoverySteps: RecoveryStep[] = [
  {
    id: 'contact',
    order: 0,
    title: '발견·접촉',
    state: '지원과 연결되는 첫 접점을 선택합니다.',
    intervention: '별칭·문자·온라인 문의, 추천경로',
    indicators: ['첫 응답', '상담 전환'],
  },
  {
    id: 'daily-safety',
    order: 1,
    title: '안전·일상',
    state: '생활의 기본 리듬을 살피고 작은 활동부터 시작합니다.',
    intervention: '수면·식사·위생·생활상태 확인',
    indicators: ['일상 체크', '참여 지속'],
  },
  {
    id: 'trust',
    order: 2,
    title: '신뢰·관계',
    state: '한 명의 안정적인 접점과 관계를 이어갑니다.',
    intervention: '전담매니저와 안정적 관계 형성',
    indicators: ['연락 유지', '도움 요청'],
  },
  {
    id: 'activity',
    order: 3,
    title: '활동·연결',
    state: '부담이 낮은 활동과 지역공간을 직접 선택합니다.',
    intervention: '소규모 활동, 짧은 외출, 지역공간 체험',
    indicators: ['활동 참여', '부담감 변화'],
  },
  {
    id: 'transition',
    order: 4,
    title: '전환·자립',
    state: '원하는 삶의 방향에 맞는 지역자원과 연결합니다.',
    intervention: '교육·일경험·주거·건강·고용 연계',
    indicators: ['서비스 이용', '사회참여'],
  },
];

const experiments: ExperimentCase[] = [
  {
    id: 'remote-first-contact',
    title: '비대면 초기접촉 실험',
    problem: '전화·방문상담 부담으로 문의가 중단됩니다.',
    hypothesis: '문자·온라인 접점과 응답방식 선택권이 첫 상담 전환을 높일 수 있습니다.',
    prototype: '간편 문의, 선호 연락방식, 예상 응답시간 안내',
    metrics: ['문의 수', '첫 응답률', '상담 전환율', '재접촉률'],
    result: null,
    status: 'planned',
    publicationStatus: 'draft',
  },
  {
    id: 'small-daily-actions',
    title: '작은 일상회복 활동 실험',
    problem: '정규 프로그램 참여 전 수면·식사·외출이 불안정합니다.',
    hypothesis: '개인이 선택하는 작은 활동이 참여 지속에 도움을 줄 수 있습니다.',
    prototype: '일상 체크인, 선택형 활동카드, 반복 허용',
    metrics: ['7일·28일 참여', '본인 평가', '다음 활동 선택률'],
    result: null,
    status: 'planned',
    publicationStatus: 'draft',
  },
  {
    id: 'referral-feedback-loop',
    title: '지역기관 의뢰·회송 실험',
    problem: '기관 간 연계 후 실제 이용 여부를 확인하기 어렵습니다.',
    hypothesis: '표준 의뢰·회송 절차가 연결 완료율을 높일 수 있습니다.',
    prototype: '기관역할표, 의뢰 상태, 회송 확인',
    metrics: ['의뢰 수', '접수율', '이용률', '회송 완료율'],
    result: null,
    status: 'planned',
    publicationStatus: 'draft',
  },
];

const packages: ServicePackage[] = [
  {
    id: 'regional-diagnosis',
    title: '지역 문제진단',
    duration: '4~8주',
    description: '현황조사와 당사자·가족·실무자 인터뷰를 통해 서비스 공백을 구조화합니다.',
    deliverables: ['문제지도', '우선과제'],
    inquiryCode: 'regional-diagnosis',
  },
  {
    id: 'remote-outreach',
    title: '비대면 발굴체계 구축',
    duration: '6~10주',
    description: '온라인 접점, 추천경로와 초기응대 원칙을 지역 여건에 맞게 설계합니다.',
    deliverables: ['발굴 프로토콜', '접점 MVP'],
    inquiryCode: 'remote-outreach',
  },
  {
    id: 'daily-recovery-lab',
    title: '일상회복 리빙랩 실증',
    duration: '8~12주',
    description: '공동설계부터 현장 운영, 중간개선과 변화측정까지 한 흐름으로 실행합니다.',
    deliverables: ['실증모델', '성과대시보드'],
    inquiryCode: 'daily-recovery-lab',
  },
  {
    id: 'regional-referral',
    title: '지역 연계모델 구축',
    duration: '3~6개월',
    description: '기관 역할과 의뢰·회송 절차를 정리해 실제 이용까지 이어지는 연결망을 만듭니다.',
    deliverables: ['지역 협력체계', '운영 매뉴얼'],
    inquiryCode: 'regional-referral',
  },
  {
    id: 'evaluation-policy',
    title: '성과평가·정책화',
    duration: '사업 종료 후',
    description: '정량·정성 학습을 함께 분석해 정책과제와 확산 방향을 제안합니다.',
    deliverables: ['성과보고서', '정책제안'],
    inquiryCode: 'evaluation-policy',
  },
];

export const livingLabData = {
  meta: {
    title: '청년과 함께 일상회복의 방법을 찾는 리빙랩 | 협동조합 소이랩',
    description:
      '청년의 경험과 현장의 질문에서 시작해 작은 실험을 함께 설계하고, 일상과 관계의 변화에서 배운 점을 기록하는 소이랩의 리빙랩을 소개합니다.',
    canonicalUrl: 'https://www.soilab-youth.kr/livinglab',
    updatedAt: '공개 데이터 승인 후 입력',
    dataNote:
      '공개 성과는 내부 원자료 검토와 승인 후 반영합니다. 현재 미승인 수치는 표시하지 않습니다.',
  },
  hero: {
    eyebrow: 'SOILAB YOUTH LIVING LAB',
    title: '청년과 함께,\n일상회복의 방법을\n찾고 실험합니다',
    description:
      '처음 도움을 구하는 순간부터 일상의 작은 변화까지. 청년이 겪는 어려움을 함께 듣고, 부담이 적은 시도를 통해 지원 방법을 다듬습니다.',
    audience: '청년의 경험에서 질문을 찾고, 현장과 함께 방법을 만듭니다.',
  },
  overview: [
    { label: '함께하는 사람', text: '청년·가족·현장 실무자와 지역기관' },
    { label: '출발점', text: '청년이 경험한 어려움과 바꾸고 싶은 일' },
    { label: '진행 방식', text: '경험 듣기 → 공동설계 → 작은 시도 → 돌아보기' },
    { label: '남기는 기록', text: '시도한 방법, 확인한 변화, 배운 점과 다음 질문' },
  ],
  anchorItems: [
    { label: '리빙랩 소개', href: '#overview' },
    { label: '현장의 질문', href: '#problem-bank' },
    { label: '함께하는 과정', href: '#method' },
    { label: '회복의 변화', href: '#recovery' },
    { label: '기록과 배움', href: '#experiments' },
    { label: '연결·문의', href: '#contact' },
  ],
  kpis,
  outcomeStages: ['발굴', '등록', '지속참여', '서비스 연계', '사회참여'],
  problems,
  livingLabSteps,
  recoverySteps,
  experiments,
  partners: [
    { title: '지자체', role: '사업기획, 행정협력, 지역자원 연계' },
    { title: '청년지원기관', role: '발굴, 프로그램, 교육·활동 연결' },
    { title: '정신건강·보건기관', role: '전문상담·의료·위기대응 연계' },
    { title: '복지기관', role: '생활·가족·긴급지원 연계' },
    { title: '주거·채무기관', role: '주거안정, 금융·채무상담' },
    { title: '고용·교육기관', role: '직업훈련, 일경험, 취업 지원' },
    { title: '대학·연구기관', role: '조사, 평가, 공동연구' },
    { title: '기업·재단', role: 'ESG 후원, 공간, 일경험, 생활지원' },
  ] satisfies PartnerType[],
  packages,
  faqs: [
    {
      id: 'counseling-treatment',
      question: '리빙랩에서는 무엇을 하나요?',
      answer:
        '청년이 지원을 이용하며 겪는 어려움을 듣고, 청년·가족·실무자가 함께 개선할 방법을 설계합니다. 작은 시도를 통해 확인한 변화와 참여 경험을 다음 지원 방식에 반영하는 과정입니다.',
    },
    {
      id: 'regional-context',
      question: '청년은 어떤 방식으로 함께하나요?',
      answer:
        '경험을 이야기하거나 아이디어를 나누고, 직접 시도한 방법을 평가하는 등 여러 참여 방식을 검토할 수 있습니다. 실제 참여 방식·기간·모집 여부는 개별 실험을 안내할 때 확인합니다.',
    },
    {
      id: 'privacy',
      question: '어떤 내용을 기록하고 공개하나요?',
      answer: '함께 정한 질문, 시도한 방법, 확인한 변화와 배운 점을 기록합니다. 개인을 알아볼 수 있는 상담 내용은 공개하지 않고, 동의와 공개 범위를 확인한 기록을 공유합니다.',
    },
    {
      id: 'duration',
      question: '지원 프로그램이나 상담은 어디서 알아보나요?',
      answer: '이 페이지는 리빙랩의 진행 방식을 소개합니다. 지원 프로그램은 상단 사업 메뉴에서, 대구 지역의 상담 문의처와 신청 전 확인사항은 정책·연구의 지원 안내에서 볼 수 있습니다.',
    },
    {
      id: 'corporate-participation',
      question: '기업이나 재단도 참여할 수 있나요?',
      answer: '생활지원, 공간, 일경험, 교육, 후원 등 지역 실증의 협력 파트너로 참여할 수 있습니다.',
    },
  ] satisfies FaqItem[],
  inquiry: {
    institutionEmail: 'soilabcoop@gmail.com',
    institutionSubject: '[리빙랩 실증사업 문의]',
    supportHref: '/research/support',
    phone: '053-941-9003',
  },
};

export function filterPublicKpis(items: KpiItem[]): KpiItem[] {
  return items.filter((item) => item.status === 'approved' && item.value !== null);
}

export function filterPublicProblems(items: ProblemCard[]): ProblemCard[] {
  return items.filter((item) => item.status === 'approved');
}

export function filterPublicExperiments(items: ExperimentCase[]): ExperimentCase[] {
  return items.filter((item) => item.publicationStatus === 'approved');
}

export const publicKpis = filterPublicKpis(kpis);
export const publicProblems = filterPublicProblems(problems);
export const publicExperiments = filterPublicExperiments(experiments);
