export const RESEARCH_REVIEW_DATE = '2026-09-07';

export type Evidence = {
  id: string;
  title: string;
  publisher: string;
  country: '한국' | '일본' | '영국';
  kind: '법령' | '정책·조사' | '연구' | '실무 지침' | '정책체계' | '보도자료';
  year: string;
  url: string;
  summary: string;
  application: string;
  limitation: string;
  reviewScope: string;
  topics: string[];
  reviewedAt?: string;
  scope?: 'youth' | 'all_ages';
  publishedAt?: string | null;
  effectiveAt?: string | null;
};

export const researchTopics = [
  { id: 'outreach', name: '발굴과 첫 연결', question: '도움을 요청하기 어려운 청년과 어떻게 연결할까요?', description: '온라인 접촉, 초기상담, 기관 의뢰와 연결이 끊기는 지점을 함께 살펴봅니다.', action: '청년이 처음 연락하는 경로와 상담까지 걸리는 과정을 그려보고, 중단되는 지점을 기록합니다.' },
  { id: 'recovery', name: '일상과 관계회복', question: '작은 일상의 변화가 지속적인 관계로 이어지려면?', description: '일상 활동, 편하게 머물 공간, 동료 관계와 자기결정의 조건을 검토합니다.', action: '참여 횟수와 함께 본인이 원하는 변화, 활동 부담, 관계 유지 경험을 확인할 질문을 설계합니다.' },
  { id: 'family', name: '가족지원', question: '청년과 가족이 함께 지지받으려면 무엇이 필요할까요?', description: '가족의 이해, 소통, 돌봄 부담과 가족 자신을 위한 지원을 연결합니다.', action: '부모교육 전후에 가족이 이해한 내용과 관계에서 시도한 변화를 구분해 기록합니다.' },
  { id: 'work', name: '일경험과 사회참여', question: '일경험의 시작과 속도를 어떻게 정할까요?', description: '참여 의사, 업무 강도, 현장 동료와의 관계, 중단 후 재연결을 검토합니다.', action: '청년 탄탄대로의 참여 준비, 업무 조정, 동행 지원, 중단 후 연락 기준을 점검합니다.' },
  { id: 'evaluation', name: '회복성과와 평가', question: '청년이 원하는 회복을 어떻게 기록할까요?', description: '취업과 참여 실적에 더해 일상, 관계, 자기결정의 변화를 살펴봅니다.', action: '지표마다 측정 시점·분모·정의와 당사자가 중요하게 여기는 변화를 적어봅니다.' },
  { id: 'policy', name: '정책과 지역 연결', question: '대구의 지원 공백을 어떤 협력으로 채울까요?', description: '법령, 전달체계, 민관협력과 해외 정책을 지역의 질문에 연결합니다.', action: '기관별 지원대상과 의뢰 조건을 비교해 연령·지역·지원단계 사이의 공백을 찾습니다.' },
] as const;

export const evidenceLibrary: Evidence[] = [
  {
    id: 'fki-2026-youth-connection-seminar',
    title: '(내 일이 있는 청년 시리즈 ③) 「고립·은둔 청년, 우리 사회에 연결을 묻다 : 고립·은둔 청년을 위한 과제」 세미나 개최',
    publisher: '한국경제인협회', country: '한국', kind: '보도자료', year: '2026',
    url: 'https://www.fki.or.kr/kor/news/statement_detail.do?bbs_id=00037396&category=ST',
    publishedAt: '2026-09-14', reviewedAt: '2026-09-15', scope: 'youth',
    summary: '2026년 9월 14일 열린 세미나의 발제와 토론을 전한 보도자료입니다. 조기 지원부터 회복과 자립까지 이어지는 지원체계, 이해하기 쉬운 지원 안내, 안전한 관계망, 부담이 적은 일 경험, 회복 경험을 활용한 동료지원과 민관협력이 논의됐습니다. 행사일과 온라인 게시일은 9월 14일이며, 첨부 HWP에 적힌 9월 15일은 조간 보도일입니다.',
    application: '청년이 처음 문의하는 경로, 활동 중단 후 다시 연결되는 방법, 일 경험의 참여 시간과 부담을 조정할 조건을 검토합니다. 동료지원 활동은 참여자의 선택, 교육, 보상과 활동 중 지원체계를 함께 논의할 과제로 활용합니다.',
    limitation: '세미나에서 나온 의견과 정책 제안을 정리한 자료이며, 개별 지원 방식의 효과를 검증한 연구나 현재 모집 중인 사업 공고가 아닙니다. 약 53.8만 명과 연간 약 5.3조 원은 보도자료가 인용한 한경협의 2026년 2월 연구에 제시된 2024년 기준 추정치입니다. 해당 연구의 전문·추정 방법은 이번에 검토하지 않았으므로 새로운 실태조사 결과나 대구의 규모로 해석하지 않습니다.',
    reviewScope: '공식 보도자료 본문·주석과 사용자 제공 첨부 HWP 본문·세미나 개요 확인. 발표자료 전문 및 인용 연구 전체는 미검토. HWP는 텍스트로 추출해 확인했으며 쪽수는 대조하지 않았습니다.',
    topics: ['outreach', 'recovery', 'work', 'policy'],
  },
  {
    id: 'youth-crisis-support-act', title: '가족돌봄 등 위기아동·청년 지원에 관한 법률', publisher: '국가법령정보센터', country: '한국', kind: '법령', year: '2026',
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=&chrClsCd=010202&efYd=20260326&lsiSeq=270215&urlMode=lsInfoP',
    summary: '2026년 3월 26일 시행된 법률입니다. 위기아동·청년의 정의, 지원대상 선정, 사례관리와 맞춤형 프로그램의 제도적 기반을 확인할 수 있습니다.',
    application: '센터의 대상자 안내와 기관 간 의뢰 절차를 검토할 출발점으로 활용합니다.',
    limitation: '조문별 시행 시점이 다를 수 있습니다. 실제 지원요건은 현행 하위법령과 사업지침을 함께 확인해야 합니다.', reviewScope: '법률 본문·시행일 확인', topics: ['policy', 'outreach', 'evaluation'],
  },
  {
    id: 'mohw-2023-survey', title: '2023 고립·은둔 청년 실태조사와 지원방안', publisher: '보건복지부', country: '한국', kind: '정책·조사', year: '2023',
    url: 'https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1479278&mid=a10503000000',
    summary: '전국 온라인 심층조사 결과와 발굴·전담지원·예방·제도화의 지원방안을 함께 공개한 자료입니다. 게시문에서 조사 결과와 지원방안 첨부파일로 이동할 수 있습니다.',
    application: '발굴부터 일상·가족·일경험 지원까지 센터의 지원 경로를 비교합니다.',
    limitation: '2023년 발표 자료이며 현재 사업 안내를 대신하지 않습니다. 조사 표본의 결과를 전국 청년의 비율로 단순 환산하지 않습니다.', reviewScope: '공식 게시문 검토 · 첨부 전문 추가 검토 필요', topics: ['outreach', 'recovery', 'family', 'work', 'policy'],
  },
  {
    id: 'seoul-2022-survey', title: '서울시 고립·은둔 청년 실태조사 결과', publisher: '서울특별시', country: '한국', kind: '정책·조사', year: '2023',
    url: 'https://news.seoul.go.kr/gov/archives/544738',
    summary: '2022년에 실시한 가구·청년 조사와 심층 인터뷰 결과를 2023년에 발표했습니다. 고립·은둔의 정의, 생활조건과 지원 욕구를 살펴볼 수 있습니다.',
    application: '지역 조사 설계 시 정의·대상 연령·모집 방식과 질문을 비교합니다.',
    limitation: '서울의 결과를 대구의 규모나 특성으로 바로 적용할 수 없습니다. 조사연도와 발표연도를 구분해야 합니다.', reviewScope: '공식 결과 게시문 검토', topics: ['recovery', 'family', 'evaluation', 'policy'],
  },
  {
    id: 'kihasa-2023-support', title: '고립·은둔 청년 현황과 지원방안', publisher: '한국보건사회연구원 · 김성아', country: '한국', kind: '연구', year: '2023',
    url: 'https://repository.kihasa.re.kr/bitstream/201002/42528/1/2023.05.No.319.02.pdf',
    summary: '보건복지포럼 2023년 5월호에 실린 글입니다. 고립·은둔 청년의 생활상과 지원 방향을 다루며, 2021년 범위 연구와 2022년 지원사업 모형 연구를 연결합니다.',
    application: '센터 사업계획의 배경 근거와 후속으로 읽을 연구 목록을 구성합니다.',
    limitation: '초록과 서두를 확인한 자료입니다. 구체적인 수치나 효과를 인용하기 전에 해당 페이지와 원 연구의 방법을 추가 검토해야 합니다.', reviewScope: '초록·서두 확인 · 전문 검토 대기', topics: ['recovery', 'evaluation', 'policy'],
  },
  {
    id: 'japan-support-handbook', title: '일본 히키코모리 지원 핸드북과 지자체 사례', publisher: '일본 후생노동성', country: '일본', kind: '실무 지침', year: '2025',
    url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/hikikomori/index.html',
    summary: '2025년 1월 지원 핸드북의 전체판·요약판·장별 파일과 연도별 지자체 지원사례를 공개합니다. 지원의 가치와 윤리, 대상자, 실무와 사례를 다룹니다.',
    application: '첫 접촉과 관계 형성, 당사자 의사 존중, 가족지원의 실무 질문을 정리합니다.',
    limitation: '제2장 본문 14~15쪽과 제4장 27·29·36~38쪽을 부분 검토했습니다. 가족 상담·첫 접촉·자기결정에 관한 실무 지침이며 효과 검증 연구는 아닙니다. 여러 연령을 다루므로 국내 청년지원의 대상·동의 절차에 맞춘 검토가 필요합니다.', reviewScope: '공식 목록 및 제2·4장 핵심 부분 확인 · 소이랩 요약', reviewedAt: '2026-09-07', scope: 'all_ages', topics: ['outreach', 'recovery', 'family', 'evaluation'],
  },
  {
    id: 'japan-loneliness-policy', title: '일본 고독·고립 대책: 법·계획·예산·조사', publisher: '일본 내각부', country: '일본', kind: '정책체계', year: '상시 갱신',
    url: 'https://www.cao.go.jp/kodoku_koritsu/torikumi.html',
    summary: '고독·고립대책추진법, 중점계획, 예산, 전문가 회의, 모델조사, 전국조사와 민관협력 자료로 연결되는 공식 목록입니다.',
    application: '정책의 설계·집행·평가를 하나의 주제 묶음으로 추적하고 대구의 협력 구조와 비교합니다.',
    limitation: '전 연령의 고독·고립 정책을 포함합니다. 개별 문서의 연도와 청년 관련성을 별도로 확인해야 합니다.', reviewScope: '공식 정책자료 목록 확인', topics: ['policy', 'evaluation'],
  },
];

export function filterEvidence(query = '', kind = '', topic = '', library: Evidence[] = evidenceLibrary) {
  const normalized = query.trim().toLocaleLowerCase('ko-KR');
  return library.filter(item => (!kind || item.kind === kind)
    && (!topic || item.topics.includes(topic))
    && (!normalized || [item.title, item.publisher, item.country, item.summary].join(' ').toLocaleLowerCase('ko-KR').includes(normalized)));
}
