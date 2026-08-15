export type CsrProgram = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  audience: string;
  duration: string;
  outcomes: string[];
  categories: string[];
  status: 'operational' | 'proposal';
  color: string;
  softColor: string;
};

export const csrPrograms: CsrProgram[] = [
  {
    slug: 'morning-challenge',
    title: '모닝챌린지',
    eyebrow: '작은 아침부터 시작하는 일상회복',
    summary:
      '고립·은둔청년이 부담이 낮은 아침 활동을 고르고, 응원과 지역 자원을 통해 자신의 속도로 다음 걸음을 이어가는 8주형 CSR 프로그램입니다.',
    audience: '일상 회복의 첫걸음이 필요한 청년',
    duration: '8주 운영형',
    outcomes: ['아침 체크인', '선택형 회복 퀘스트', '지역 쿠폰 연계'],
    categories: ['일상회복', '지역상생'],
    status: 'operational',
    color: '#2F6B57',
    softColor: '#EAF4EE',
  },
  {
    slug: 'one-step-neighborhood',
    title: '동네 한 걸음',
    eyebrow: '집 안에서 동네의 안전한 공간까지',
    summary:
      '실내 자기돌봄에서 산책, 도서관, 청년공간 방문으로 이어지는 작은 외부 활동을 설계하고 지역 활동가가 안전하게 동행하는 제안 프로그램입니다.',
    audience: '외부 활동을 천천히 준비하는 청년',
    duration: '6주 제안형',
    outcomes: ['단계별 외부 활동', '지역 공간 연결', '활동가 동행'],
    categories: ['지역연결', '일상회복'],
    status: 'proposal',
    color: '#2F7293',
    softColor: '#EAF4F8',
  },
  {
    slug: 'today-table',
    title: '오늘의 한 끼',
    eyebrow: '식사 돌봄과 골목상권을 잇는 연결',
    summary:
      '끼니를 챙기는 작은 실천을 지역 식당·카페 이용과 연결해 청년의 생활기초 회복과 지역 소상공인 상생을 함께 만드는 제안 프로그램입니다.',
    audience: '식사 리듬과 생활기초 회복이 필요한 청년',
    duration: '8주 제안형',
    outcomes: ['식사 루틴', '지역 이용권', '상권 상생'],
    categories: ['생활안정', '지역상생'],
    status: 'proposal',
    color: '#C4694F',
    softColor: '#FFF0EA',
  },
  {
    slug: 'restart-mate',
    title: '리스타트 메이트',
    eyebrow: '관계와 사회참여를 준비하는 다음 걸음',
    summary:
      '온라인 소규모 모임, 직무 맛보기, 지역 프로젝트를 선택적으로 경험하며 관계와 사회참여를 무리 없이 준비하는 제안 프로그램입니다.',
    audience: '안전한 관계와 사회참여를 준비하는 청년',
    duration: '10주 제안형',
    outcomes: ['소규모 관계 경험', '직무 맛보기', '지역 프로젝트'],
    categories: ['사회참여', '관계회복'],
    status: 'proposal',
    color: '#675A98',
    softColor: '#F0EDF8',
  },
];

export const morningQuestCategories = [
  {
    key: 'daily',
    title: '생활기초',
    description: '방 안에서 바로 시작할 수 있는 자기돌봄',
    examples: ['물 한 잔 마시기', '커튼 열기', '한 끼 챙기기'],
    color: '#E9B949',
    softColor: '#FFF8DF',
  },
  {
    key: 'health',
    title: '건강·신체',
    description: '몸의 감각을 깨우는 짧고 부담 없는 움직임',
    examples: ['3분 스트레칭', '집 앞까지 나가기', '5분 걷기'],
    color: '#2F6B57',
    softColor: '#EAF4EE',
  },
  {
    key: 'mind',
    title: '마음',
    description: '진단이 아닌 일상의 감정을 알아차리는 활동',
    examples: ['지금 감정 고르기', '호흡하기', '필요한 것 고르기'],
    color: '#675A98',
    softColor: '#F0EDF8',
  },
  {
    key: 'sharing',
    title: '일상나눔',
    description: '제한된 반응으로 안전하게 안부를 나누는 활동',
    examples: ['오늘 발견한 것', '응원 반응 남기기', '안부 보내기'],
    color: '#C4694F',
    softColor: '#FFF0EA',
  },
  {
    key: 'local',
    title: '지역연결',
    description: '동네의 안전한 공간과 자원을 만나는 활동',
    examples: ['공원 방문', '협약 카페 이용', '청년공간 체험'],
    color: '#2F7293',
    softColor: '#EAF4F8',
  },
];

export const impactDemo = {
  label: '데모 데이터',
  projectName: '모닝챌린지 1기 시범사업안',
  period: '8주',
  targetParticipants: 50,
  activeParticipants: 42,
  totalCheckins: 1680,
  completedQuests: 934,
  localUses: 126,
  localAmount: 1890000,
  weeklyParticipation: [58, 64, 71, 74, 78, 81, 79, 84],
  questMix: [
    { label: '생활기초', value: 38, color: '#E9B949' },
    { label: '건강·신체', value: 24, color: '#2F6B57' },
    { label: '마음', value: 16, color: '#675A98' },
    { label: '일상나눔', value: 10, color: '#C4694F' },
    { label: '지역연결', value: 12, color: '#2F7293' },
  ],
  journey: [
    { label: '실내 자기돌봄', value: 50 },
    { label: '짧은 외부 활동', value: 32 },
    { label: '지역공간 연결', value: 18 },
  ],
  budget: [
    { label: '청년 활동지원', amount: 9000000, ratio: 45, color: '#2F6B57' },
    { label: '프로그램 운영', amount: 5000000, ratio: 25, color: '#46549C' },
    { label: '지역 카페 연계', amount: 4000000, ratio: 20, color: '#E9B949' },
    { label: '안전·성과관리', amount: 2000000, ratio: 10, color: '#C4694F' },
  ],
};
