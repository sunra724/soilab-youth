import { kasw2026YouthEvidence } from './kasw-2026-youth-welfare.ts';
import { bdiEvidence } from './bdi-research.ts';
import { incheonEvidence } from './incheon-research.ts';
import { incheonExtraEvidence } from './incheon-extra-research.ts';
import { daejeonEvidence } from './daejeon-research.ts';
import { daeguGyeongbukEvidence } from './daegu-gyeongbuk-research.ts';

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
  ...kasw2026YouthEvidence,
  ...daeguGyeongbukEvidence,
  ...daejeonEvidence,
  ...incheonExtraEvidence,
  ...incheonEvidence,
  ...bdiEvidence,
  {
    id: 'krei-2025-rural-youth-economic-activity',
    title: '청년 관계인구의 농촌지역 진입 및 정착 확대를 위한 경제활동 지원방안 연구',
    publisher: '한국농촌경제연구원 · 권인혜·이진', country: '한국', kind: '연구', year: '2025',
    url: 'https://repository.krei.re.kr/handle/2018.oak/32872',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '농촌 탐색·교류 단계와 현지 경제활동 단계의 필요를 구분하고 동료 학습, 작은 사업 실험, 공익 활동과 소득의 연결을 제안합니다. 판권은 2025년 10월, 저장소 발행일은 2025-10-31, 홈페이지 등록일은 2026-04-17입니다.',
    application: '청년이 원하는 관계 방식을 듣고 유급 지역 프로젝트, 동료 모임, 전문 지원으로 이어가는 운영을 검토합니다. 협동조합의 연결 역할과 함께 운영인력·보상·공간·재원의 책임을 구체화합니다.',
    limitation: '19~39세 450명의 조사이며 고관여 200명은 눈덩이 표집입니다. 집단 차이는 개인의 성장 경로나 사업 효과를 입증하지 않습니다. 고립·은둔 청년 전용 연구가 아니며 제안을 현재 모집사업으로 소개하지 않습니다. 본문에 발행 표기 이후 시점 자료도 포함됩니다.',
    reviewScope: '공식 PDF 판권, 조사 81~84쪽, 시사점 127쪽, 제안 131~148쪽 중 관련 부분 및 핵심 이미지 확인. PDF 순번=인쇄 쪽수+19. 원자료·인용 사례 전체 미검증.',
    topics: ['work', 'recovery', 'evaluation', 'policy'],
  },
  {
    id: 'nypi-2025-local-talent-jobs-ii',
    title: '청년 친화적인 지역인재양성 및 일자리 창출 방안Ⅱ',
    publisher: '한국청소년정책연구원 · 최용환·임지연·좌동훈·박윤수·이동성', country: '한국', kind: '연구', year: '2025',
    url: 'https://www.nypi.re.kr/repository/handle/2022.oak/6594',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '기업의 청년 채용 수요와 지역별 고용 여건을 분석한 2차년도 연구입니다. 협업·소통을 익히는 실습과 교육·현장 경험의 연결, 지역 생활기반에 관한 제안을 중심으로 읽었습니다. 판권 발행일은 2025-12-31입니다.',
    application: '일경험의 공동 과제와 멘토링, 역할 조정, 다음 기회로의 연결을 설계할 근거로 활용합니다. 청년의 학습 목표와 사업장의 지원 조건을 함께 확인합니다.',
    limitation: '2025년 기업 조사는 상시근로자 30인 이상 351개 기업 대상입니다. 소규모 협동조합과 전체 청년을 대표하지 않으며 기업의 선호를 교육 효과나 채용 확률로 바꾸어 읽지 않습니다. 정책 제안의 지원제도가 현재 시행 중인지 별도 확인이 필요합니다.',
    reviewScope: '공식 PDF 65~67·74~75·179~182쪽 중 관련 본문·표·판권 및 핵심 이미지 부분 검토. PDF 순번=인쇄 쪽수+26. AHP·모든 통계·현행 법제는 미검증.',
    topics: ['work', 'evaluation', 'policy'],
  },
  {
    id: 'nypi-2025-regional-youth-employment-evaluation',
    title: '지역 청년고용정책에 대한 효과성 분석과 전략수립 연구',
    publisher: '한국청소년정책연구원 · 최용환·임지연·좌동훈', country: '한국', kind: '연구', year: '2025',
    url: 'https://www.nypi.re.kr/repository/handle/2022.oak/6598',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '17개 시도의 청년고용정책을 형성·집행·성과로 나누어 서면평가하고 지역 전략을 제안합니다. 계획의 근거, 협업·자원, 모니터링과 환류를 연결하는 평가 질문을 검토했습니다. 발행일은 2025-12-31입니다.',
    application: '리빙랩과 일경험 사업에서 청년 의견, 역할·예산, 운영 변경, 참여 실적과 참여자의 변화를 구분해 기록하는 평가안을 논의합니다.',
    limitation: '전문가 3인의 정책 서면평가이며 사업의 인과적 고용 효과를 추정한 연구가 아닙니다. 별도 전문가 조사는 376명·528개 지역별 응답입니다. 본문의 평가 연도와 분야별 배점 표기가 일치하지 않아 순위·점수·배점을 재인용하지 않았습니다.',
    reviewScope: '공식 PDF 3~4·35~41·81쪽 및 판권, 핵심 이미지 부분 검토. PDF 순번=인쇄 쪽수+22. 4쪽/41쪽의 평가연도, 40쪽/41쪽의 배점 차이 원인은 미확인.',
    topics: ['work', 'evaluation', 'policy'],
  },
  {
    id: 'auri-2026-living-hubs-operation',
    title: '인구감소지역 생활인구의 체류와 정주를 잇는 생활거점 조성 및 운영 방향',
    publisher: '건축공간연구원 · 장민영·방보람·김영하', country: '한국', kind: '연구', year: '2026',
    url: 'https://www.auri.re.kr/publication/view.es?mid=a10313000000&publication_id=2300&publication_type=brief',
    publishedAt: '2026-10-07', reviewedAt: '2026-10-20', scope: 'all_ages',
    summary: '2025년 생활거점 연구의 일부를 정리한 auri brief 제314호입니다. 체류·업무·생활편의·교류를 연결하고 조성 단계부터 운영주체·재원·프로그램과 협력의 책임을 정하는 방향을 제안합니다.',
    application: '청년공간을 검토할 때 시설과 함께 운영인력·유지비·프로그램, 이용자와 주민의 의견을 반영할 절차를 설계합니다.',
    limitation: '청년 전용 연구가 아닙니다. 설문은 2025년 인구감소지역 체류 경험자 500명의 온라인 조사입니다. 생활인구 유형을 청년의 회복 단계로 쓰지 않으며, 제안과 사례를 현재 지원금·특례 이용 안내로 제시하지 않습니다.',
    reviewScope: '2026-10-07 공식 게시문과 PDF 5·8~9·13쪽 이미지 대조. PDF 순번과 인쇄 쪽수 동일. 원 연구 전문·모든 통계·법제 현행성은 미검증.',
    topics: ['recovery', 'evaluation', 'policy'],
  },
  {
    id: 'krei-2023-rural-youth-sustainability',
    title: '농촌과 청년: 청년세대를 통한 농촌의 지속가능성 제고 방안 (2/2차년도)',
    publisher: '한국농촌경제연구원 · 마상진 외', country: '한국', kind: '연구', year: '2023',
    url: 'https://repository.krei.re.kr/handle/2018.oak/30824',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '농촌 청년의 역할과 요구, 참여를 통한 지역 활성화를 다룬 2차년도 연구입니다. 청년 공간, 공동체 활동과 생활권의 중간지원조직에 관한 부분을 보완 근거로 읽었습니다.',
    application: '청년과 주민이 문제를 고르는 리빙랩, 세대 간 교류, 여러 지원을 연결할 조직의 역할과 운영 기반을 검토합니다.',
    limitation: '2023년 농촌 청년 1,074명·주민 540명의 할당 표본 조사와 사례·워크숍을 포함합니다. 모든 청년이나 대구의 현재 상황으로 일반화하지 않으며, 협동조합 사례를 운영 수익성이나 효과의 증거로 보지 않습니다.',
    reviewScope: '공식 PDF 연구방법 20~21쪽, 제언 158~162쪽 중 관련 부분과 핵심 이미지 확인. PDF 순번=인쇄 쪽수+27. 부속 보고서·모든 통계·사례 전체는 미검토.',
    topics: ['work', 'recovery', 'evaluation', 'policy'],
  },
  {
    id: 'nypi-2023-youth-citizenship-participation',
    title: '청년 사회 첫 출발 실태 및 정책방안 연구Ⅲ: 시민권과 참여 — 총괄보고서',
    publisher: '한국청소년정책연구원 · 김기헌·장근영·신인철·임성근', country: '한국', kind: '연구', year: '2023',
    url: 'https://www.nypi.re.kr/repository/handle/2022.oak/6259',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '청년의 시민권과 참여를 분석한 연구로, 서로 다른 청년의 요구와 참여기구 대표성, 제안 이후 결정·실행·평가에 참여할 역할을 논의합니다. 판권 발행일은 2023-12-31입니다.',
    application: '리빙랩의 의제·결정 범위, 다양한 의견 접수 방식, 반영 여부와 이유의 회신, 참여자가 함께하는 운영 점검을 설계합니다.',
    limitation: '2023년 조사이며 고립·은둔 청년 전용 표본이 아닙니다. 조사 연령은 18~34세, 본문의 주요 분석은 19~34세 1,938명에 가중치를 적용한 결과입니다. 과거 정책과 법 개정 제언을 현행 제도로 소개하지 않습니다.',
    reviewScope: '공식 PDF 25~27·33~34·220·244~247쪽 및 판권, 핵심 이미지 부분 검토. PDF 순번=인쇄 쪽수+22. 표지·도서관 서지로 저자 4명 확인. 원자료 재분석 미실시.',
    topics: ['outreach', 'recovery', 'evaluation', 'policy'],
  },
  {
    id: 'nrc-2023-vulnerable-local-youth',
    title: '청년정책 지원대상연구: 취약 청년과 지역 청년을 중심으로',
    publisher: '경제·인문사회연구회 · 김성아 연구책임', country: '한국', kind: '연구', year: '2023',
    url: 'https://www.nkis.re.kr/subject_view1.do?eoSeq=0&otpId=OTP_0000000000012351&otpSeq=0',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '공식 초록에서 청년의 다중 취약성에 대한 종합적 접근과 지역별 삶의 선택지 격차를 확인한 보완 읽기입니다.',
    application: '참여의 장벽과 복합적인 생활 부담을 함께 듣고, 동의한 지원과 연결하는 초기 문의·리빙랩 질문을 검토합니다.',
    limitation: '서지·초록·목차만 확인했습니다. 전문과 표집·통계·원자료를 검토하지 않아 취약성 비율이나 효과를 재인용하지 않습니다. 제시한 적용 방향은 소이랩의 운영 검토안입니다.',
    reviewScope: 'NKIS 국가정책연구포털 공식 서지·국문 초록·목차 확인. 본문 PDF 전문 검토 대기, 쪽수 미대조.',
    topics: ['outreach', 'recovery', 'policy'],
  },
  {
    id: 'nrc-2022-youth-policy-paradigm',
    title: '청년정책의 패러다임과 전략과제 연구',
    publisher: '경제·인문사회연구회 · 김문길 연구책임', country: '한국', kind: '연구', year: '2022',
    url: 'https://www.nkis.re.kr/subject_view1.do?eoSeq=0&otpId=OTP_0000000000010650&otpSeq=0',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '공식 초록에서 청년의 불안정한 이행 경로, 정책 공백, 중앙·지역과 공공·민간을 잇는 정책 인프라의 문제 설정을 확인했습니다.',
    application: '활동 중단·이동 뒤 다시 연결할 담당자와 경로, 기관 간 전달과 실제 이용 확인의 책임을 검토하는 보완 자료로 활용합니다.',
    limitation: '2022년 총괄 연구의 서지·초록·목차만 확인했습니다. 같은 이름의 세부 보고서와 구분하며 정책 전달체계·법제의 현재 상태나 사업 효과를 검증한 것으로 소개하지 않습니다.',
    reviewScope: 'NKIS 국가정책연구포털 공식 서지·국문 초록·목차 확인. 전문 검토 대기, 본문 PDF 쪽수 미대조.',
    topics: ['outreach', 'evaluation', 'policy'],
  },
  {
    id: 'krihs-2022-local-youth-entrepreneurship',
    title: '지방 중소도시의 활력 증진을 위한 청년 로컬창업 지원방안 연구',
    publisher: '국토연구원 · 최예술·조은주·정우성', country: '한국', kind: '연구', year: '2022',
    url: 'https://library.krihs.re.kr/dl_image/10110/contents/6163064',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '공식 소개에서 경북·충북 중소도시의 청년 로컬창업 사례와 단기·초기 지원 편중, 공간·전문 지원의 공백을 확인했습니다. 원 연구 발행일은 2022-12-31입니다.',
    application: '지역 프로젝트 뒤의 공간·동료 학습·전문 지원과 협업을 이어갈 조건을 검토하는 보완 읽기로 활용합니다.',
    limitation: '서지·소개·목차만 확인했으며 전문·수치·효과는 검토하지 않았습니다. 지역 사례를 전체 창업자의 성과로 일반화하지 않습니다. 2023년 국토정책 Brief 제915호와 원 보고서의 연도를 구분합니다.',
    reviewScope: '국토연구원 공식 연구 소개 및 NKIS 서지 대조. 본문 PDF 전문 검토 대기, 쪽수 미대조.',
    topics: ['work', 'evaluation', 'policy'],
  },
  {
    id: 'kiet-2025-youth-local-settlement',
    title: '청년의 지역 이동과 정착: 일-삶-락-연 기반의 청년친화지수와 정책방향',
    publisher: '산업연구원 · 김지수·허문구·유이선',
    country: '한국', kind: '연구', year: '2025',
    url: 'https://www.kiet.re.kr/research/reportView?report_no=1178',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '청년의 지역 이동과 정착을 분석하고 일·삶·락·연의 네 영역을 연결하는 청년친화지수와 정책 방향을 제안한 연구입니다. 지역 관계망에 기반한 생활 지원, 청년 참여와 지역문제 해결, 상황에 따른 성장경로와 복합성과 평가를 중심으로 검토했습니다. 판권 발행일은 2025년 12월 31일입니다.',
    application: '탄탄대로·N.E.S.T. 등에서 일경험 이후의 생활·문화·관계 지원이 어떻게 이어지는지 점검합니다. 청년공간의 이용 장벽을 찾는 리빙랩, 청년·주민의 지역문제 해결 프로젝트, 영역별 변화와 실제 지원 연결을 함께 기록하는 평가안을 검토할 근거로 활용합니다.',
    limitation: '고립·은둔 청년 전용 조사나 개별 프로그램의 효과 검증이 아닙니다. 이동 분석은 2016~2022년, 지수는 여러 연도의 자료를 사용합니다. 설문은 최종학력 졸업 뒤 거주지를 두 번 이상 이동한 청년 800명 대상입니다. 지수·가중치를 개인의 회복 점수나 정책 예산 비율로 옮기지 않습니다. 정책 제언을 현재 모집사업으로 소개하지 않으며 적용 방향은 소이랩의 운영 검토안입니다.',
    reviewScope: 'PDF의 목차·요약·판권, 자료·표본 56~58쪽, 개념·방법 100~108·120~124쪽, 대구 관련 부분 140~145쪽, 조사 개요 153~155쪽, 지원기관 경험 186~188쪽, 제언 217~224·229~242쪽 중 관련 부분 검토. 핵심 페이지 이미지 및 발행기관 서지 대조. 본문 PDF 순번=인쇄 쪽수+2, 판권=PDF 287쪽.',
    topics: ['outreach', 'recovery', 'work', 'evaluation', 'policy'],
  },
  {
    id: 'nypi-2025-global-youth-policy',
    title: '전 세계 청년정책 현황 분석 연구',
    publisher: '한국청소년정책연구원 · 김기헌·유민상·신동훈·한지형',
    country: '한국', kind: '연구', year: '2025',
    url: 'https://www.nypi.re.kr/lib/10210/contents/7683633',
    reviewedAt: '2026-10-20', scope: 'youth',
    summary: '전 세계 청년정책의 법·행정·대상 연령을 비교하고 미국·일본·독일·프랑스·핀란드를 심층 분석한 연구입니다. 이번 검토는 핀란드의 통합 상담과 작업·코칭, 프랑스의 동행, 일본의 가족지원·청년 의견 반영, 문화 참여 접근을 중심으로 읽었습니다. 판권 발행일은 2025년 12월 31일입니다.',
    application: '첫 문의부터 기관 의뢰와 첫 상담까지의 연결 책임, 청년 탄탄대로의 회복·일경험·정착을 잇는 담당자와 코칭, 가족지원 리빙랩의 의견 반영과 피드백을 검토합니다. 문화공간과의 협력에서는 비용·예약·이동·동행의 장벽을 함께 살피는 시범안을 논의할 수 있습니다.',
    limitation: '해외 제도와 전달체계의 비교·문헌 연구이며 국내 고립·은둔 청년 대상 효과 검증이나 현재 모집 공고가 아닙니다. 사례별 대상 연령·지원 범위와 자료 시점이 다릅니다. 방법론의 2024년 기준 설명과 본문의 2025년 자료를 구분해야 합니다. 모든 국가의 법령·인용 문헌을 전부 검증하지 않았고 시설 수·예산·성과 비율도 재인용하지 않았습니다. 적용 방향은 소이랩의 운영 검토 제안입니다.',
    reviewScope: '사용자 제공 PDF의 목차·방법론·판권과 일본 71~82쪽, 프랑스 121~125쪽, 핀란드 141~151쪽, 종합·제언 151~152·158~161쪽 중심 검토. 핵심 본문·도식은 이미지 대조. 본문 PDF 순번=인쇄 쪽수+14, 판권=PDF 215쪽. 발행기관 서지 확인.',
    topics: ['outreach', 'recovery', 'family', 'work', 'evaluation', 'policy'],
  },
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
