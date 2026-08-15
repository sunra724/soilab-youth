# 협동조합 소이랩 고립·은둔 청년 지원센터
## Next.js 14 + Notion API 바이브코딩 가이드
> Cursor 또는 Claude Code에서 단계별로 실행하세요.
> 완성 후 주소: soilab-youth.kr

---

# ━━━ 사전 준비 (코딩 전) ━━━

## 1. 노션 DB 3개 만들기

### DB 1: 소이랩_카드뉴스
노션에서 새 페이지 → "테이블" 생성 → 아래 속성 추가:

| 속성명 | 타입 | 설명 |
|--------|------|------|
| 제목 | Title | 카드뉴스 제목 |
| 카테고리 | Select | 카드뉴스 / 활동소식 / 공지 |
| 사업 | Select | 고립은둔청년 / 청년다다름 |
| 발행일 | Date | 발행 날짜 |
| 썸네일색상 | Select | blue / green / navy |
| 요약 | Text | 2~3줄 설명 |
| 외부링크 | URL | SNS 또는 원본 링크 (선택) |
| 공개 | Checkbox | 체크 시 사이트에 노출 |

### DB 2: 소이랩_뉴스레터
| 속성명 | 타입 | 설명 |
|--------|------|------|
| 제목 | Title | 뉴스레터 제목 |
| 발행호수 | Number | 1, 2, 3... |
| 발행일 | Date | |
| 요약 | Text | 이번 호 주요 내용 |
| PDF링크 | URL | 구글드라이브 공유링크 |
| 공개 | Checkbox | 체크 시 사이트 노출 |

### DB 3: 소이랩_실적지표
| 속성명 | 타입 | 설명 |
|--------|------|------|
| 지표명 | Title | 예) 총 발굴 쉼청년 |
| 수치 | Number | 예) 132 |
| 단위 | Select | 명 / % / 개 / 조원 |
| 설명 | Text | 부연 설명 |
| 순서 | Number | 표시 순서 |
| 활성 | Checkbox | 체크 시 노출 |

## 2. 노션 API 키 발급
```
1. notion.so/my-integrations 접속
2. "New integration" 클릭
3. 이름: soilab-website
4. Submit → Internal Integration Token 복사 (secret_xxx...)
5. 각 DB 페이지에서 ··· → Connections → soilab-website 연결
6. 각 DB URL에서 ID 복사:
   notion.so/[워크스페이스]/[DB_ID]?v=...
   → DB_ID = 32자리 영숫자
```

## 3. 필요한 값 메모해두기
```
NOTION_TOKEN=secret_xxxxx
NOTION_CARDNEWS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_NEWSLETTER_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_STATS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

# ━━━ PHASE 1: 프로젝트 초기 세팅 ━━━
> Cursor/Claude Code 새 채팅에 붙여넣기

```
Next.js 14 프로젝트를 생성하고 초기 세팅해줘.

=== 프로젝트 기본 정보 ===
프로젝트명: soilab-youth
사이트: 협동조합 소이랩 고립·은둔 청년 지원센터 홈페이지
배포: Vercel, 도메인 soilab-youth.kr

=== 실행할 명령어 순서 ===
1. npx create-next-app@latest soilab-youth \
   --typescript \
   --tailwind \
   --eslint \
   --app \
   --src-dir \
   --import-alias "@/*"

2. cd soilab-youth

3. 아래 패키지 설치:
   npm install @notionhq/client notion-to-md date-fns

4. .env.local 파일 생성:
   NOTION_TOKEN=여기에_토큰_입력
   NOTION_CARDNEWS_DB=여기에_DB_ID_입력
   NOTION_NEWSLETTER_DB=여기에_DB_ID_입력
   NOTION_STATS_DB=여기에_DB_ID_입력
   NEXT_PUBLIC_SITE_URL=https://soilab-youth.kr

5. .gitignore에 .env.local 포함 확인

6. next.config.js 수정:
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.notion.so', 'notion.so', 's3.us-west-2.amazonaws.com'],
  },
}
module.exports = nextConfig

=== 브랜드 색상 (tailwind.config.ts에 추가) ===
colors: {
  navy: '#46549C',
  'navy-dark': '#363F7A',
  blue: '#248DAC',
  'blue-dark': '#1A6B84',
  green: '#228D7B',
  'green-dark': '#1A6B5D',
  cream: '#F8F9FC',
}

=== 폰트 설정 (src/app/layout.tsx) ===
import { Noto_Sans_KR } from 'next/font/google'
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})
```

✅ 확인:
- [ ] soilab-youth 폴더 생성됨
- [ ] npm run dev 실행 시 localhost:3000 접속됨
- [ ] .env.local 파일에 노션 키 입력됨

---

# ━━━ PHASE 2: 노션 API 연동 레이어 ━━━
> Phase 1 완료 후 붙여넣기

```
노션 API 연동을 위한 유틸리티 파일들을 만들어줘.

=== 파일 1: src/lib/notion.ts ===
@notionhq/client를 사용해서 아래 함수들을 만들어줘:

1. getCardNewsList()
   - NOTION_CARDNEWS_DB에서 데이터 가져오기
   - filter: 공개 checkbox = true
   - sort: 발행일 descending
   - 반환: id, 제목, 카테고리, 사업, 발행일, 썸네일색상, 요약, 외부링크

2. getCardNewsDetail(id: string)
   - 특정 카드뉴스 페이지의 상세 내용
   - notion-to-md로 본문을 마크다운으로 변환
   - 반환: 메타데이터 + 마크다운 본문

3. getNewsletterList()
   - NOTION_NEWSLETTER_DB에서 데이터 가져오기
   - filter: 공개 = true
   - sort: 발행호수 descending
   - 반환: id, 제목, 발행호수, 발행일, 요약, PDF링크

4. getStatsList()
   - NOTION_STATS_DB에서 데이터 가져오기
   - filter: 활성 = true
   - sort: 순서 ascending
   - 반환: id, 지표명, 수치, 단위, 설명

=== 파일 2: src/lib/utils.ts ===
- formatDate(dateStr): "2025-01-15" → "2025.01.15"
- getThemeColor(color): "blue" → "#248DAC"
- getBgColor(color): "blue" → "#E8F4FD"

=== 파일 3: src/types/notion.ts ===
각 DB 데이터의 TypeScript 타입 정의
- CardNews, Newsletter, StatItem 인터페이스

=== 에러 처리 ===
- API 호출 실패 시 빈 배열 반환 (사이트는 계속 작동)
- console.error로 로그만 남김
- try-catch 모든 함수에 적용
```

✅ 확인:
- [ ] src/lib/notion.ts 생성됨
- [ ] TypeScript 에러 없음
- [ ] npm run dev 정상 실행

---

# ━━━ PHASE 3: 공통 컴포넌트 ━━━
> Phase 2 완료 후 붙여넣기

```
공통 컴포넌트들을 만들어줘.
브랜드 컬러: navy #46549C, blue #248DAC, green #228D7B

=== src/components/layout/Header.tsx ===
- sticky top-0, z-50
- 스크롤 시 배경 white + shadow 전환 (기본: 투명)
- 왼쪽: 소이랩 로고
  <div class="navy 배경 rounded-lg p-2">🌱</div>
  <div>
    <span class="navy font-bold">소이랩</span>
    <span class="text-xs text-gray-500 block">고립·은둔 청년 지원센터</span>
  </div>
- 가운데 nav: 소개 / 사업 / 성과 / 소식 / 뉴스레터 / 문의
  각 링크는 href="#about", "#programs" 등 섹션 앵커
  /cardnews, /newsletter는 페이지 이동
- 오른쪽: "참여 문의" 버튼 (navy 배경, white 텍스트)
  href="tel:05394194903"
- 모바일: 햄버거 메뉴 (useScrollLock 훅으로 열릴 때 스크롤 방지)

=== src/components/layout/Footer.tsx ===
- 배경: #1A1F36 (다크)
- 3컬럼 그리드 (모바일 1열)
- 왼쪽: 로고 + 기관명 + 사업자번호 502-82-21040
- 가운데: 빠른 링크
- 오른쪽:
  📞 053-941-9003
  📧 soilabcoop@gmail.com
  🌐 soilabcoop.kr
  📍 대구광역시
- 하단: 저작권 + youthreconnect 링크
  "성과 사례집 상세보기 →" (a tag, target="_blank")

=== src/components/ui/SectionTitle.tsx ===
props: title, subtitle, align('left'|'center')
- 상단 컬러 라인 (navy, 40px wide, 3px)
- h2 제목
- 선택적 부제목

=== src/components/ui/Badge.tsx ===
props: label, color('navy'|'blue'|'green')
- 작은 pill 형태 배지

=== src/components/ui/Button.tsx ===
props: children, variant('primary'|'outline'|'ghost'), href, onClick, size
- primary: navy 배경
- outline: navy 보더
- 모두 rounded-lg, transition

=== src/components/ui/CardNewsCard.tsx ===
props: CardNews 타입
- 카드 전체 클릭 → /cardnews/[id] 로 이동
- 상단 썸네일 영역: 배경색 getBgColor(썸네일색상), 이모지 아이콘
- Badge (카테고리)
- 제목 (2줄 clamp)
- 사업명 태그
- 발행일
- hover: translateY(-4px) + shadow 강화
- cursor-pointer
```

✅ 확인:
- [ ] 모든 컴포넌트 파일 생성됨
- [ ] TypeScript 에러 없음
- [ ] 헤더 스크롤 동작 확인

---

# ━━━ PHASE 4: 메인 홈페이지 ━━━
> Phase 3 완료 후 붙여넣기

```
src/app/page.tsx를 만들어줘.
Server Component로 노션 데이터를 가져와서 렌더링해.

=== 섹션 구조 ===

1. HeroSection (src/components/sections/HeroSection.tsx)
Client Component (애니메이션 때문에)
- 배경: navy(#46549C) → blue(#248DAC) 대각선 그라디언트
- 배지: "대구 고립·은둔 청년 지원 전문기관"
- h1: "청년의 속도로,\n함께 걷겠습니다"
  (텍스트 흰색, 큰 폰트, 줄바꿈 포함)
- 설명: "협동조합 소이랩은 고립·은둔 청년 곁에서 발굴하고,
  연결하고, 회복을 함께 만들어갑니다."
- 버튼 2개:
  "사업 소개 보기" → href="#programs" (흰색 배경, navy 텍스트)
  "사례집 다운로드" → href 외부링크 PDF (투명, 흰색 보더)
- min-h-screen, flex items-center
- 로드 시 fade-up 애니메이션 (framer-motion 없이 CSS만으로)
- 우하단: 스크롤 다운 인디케이터 (bounce)

2. AboutSection (src/components/sections/AboutSection.tsx)
- 배경: white
- 2컬럼 (텍스트 + 카드들)
- 왼쪽:
  SectionTitle "소이랩을 소개합니다" align=left
  본문: "협동조합 소이랩은 지역사회 문제를 시민·기관·전문가와
  함께 해결하는 리빙랩 전문 조직입니다. 고립·은둔청년 지원사업을
  통해 청년 개인의 회복을 넘어 가족, 지역, 관계망 전체를 함께
  바라보는 접근을 시도해 왔습니다."
  "더 알아보기" 버튼 → soilabcoop.kr 외부링크
- 오른쪽: 3개 카드
  카드1: 🔍 "발굴과 연결" - 보이지 않던 청년들을 지역 네트워크로 발견합니다
  카드2: 💚 "단계적 회복" - 심리안정부터 사회복귀까지 함께 걷습니다
  카드3: 🤝 "지역 협력" - 25개 기관과 촘촘한 안전망을 만듭니다
  각 카드: 왼쪽 3px 세로 보더 navy, 배경 cream, rounded-lg

3. ProgramsSection (src/components/sections/ProgramsSection.tsx)
- 배경: cream(#F8F9FC)
- SectionTitle "주요 사업" align=center
- 2개 카드 (md:grid-cols-2)

카드1 - 고립·은둔 청년 지원사업:
  상단 4px 컬러바: navy #46549C
  Badge "고립·은둔 청년" (navy)
  h3: "고립·은둔 청년 지원사업"
  설명: "방 안에 머무는 청년들을 발견하고, 자신의 속도로 회복할 수 있도록
  단계적으로 지원합니다. 심리 안정부터 사회 복귀까지 함께합니다."
  태그 목록: #발굴 #심리상담 #일상회복 #부모교육 #사회복귀
  (태그: navy/10 배경, navy 텍스트, 작은 pill)
  성과 한줄: "2025년 132명 발굴 · 이수율 100% · 25개 기관 연계"
  버튼 2개:
    "성과 사례집 보기" → href="https://sunra724.github.io/youthreconnect" target="_blank"
    "사례집 PDF 다운로드" → href="/소이랩_고립은둔청년지원사업_성과사례집.pdf" download

카드2 - 청년 다다름 사업:
  상단 4px 컬러바: blue #248DAC
  Badge "청년 연결" (blue)
  h3: "청년 다다름 사업"
  설명: "청년의 다양한 삶의 방식을 인정하고 연결합니다.
  카드뉴스 발행, 활동 홍보, 지역 청년 네트워크를 통해
  청년이 서로를 발견합니다."
  태그 목록: #카드뉴스 #청년네트워크 #활동홍보 #커뮤니티
  버튼: "최신 카드뉴스 보기" → href="/cardnews" (blue 배경)

4. StatsSection (src/components/sections/StatsSection.tsx)
Server Component: const stats = await getStatsList() 호출
- 배경: navy #46549C, 텍스트 white
- SectionTitle "숫자로 보는 소이랩의 발걸음" align=center (흰색)
- 4열 그리드 (모바일 2열)
- 노션에서 가져온 stats 데이터로 렌더링
- 각 카드:
  큰 숫자 + 단위 (흰색, 굵게)
  지표명 (연한 흰색)
  설명 (더 연한 흰색, 작은 텍스트)
- 카운팅 애니메이션: Client Component로 분리
  (CountUp.tsx - Intersection Observer + requestAnimationFrame)
- 노션 데이터 없을 때 기본값:
  [{지표명:"총 발굴 쉼청년", 수치:132, 단위:"명"},
   {지표명:"프로그램 이수율", 수치:100, 단위:"%"},
   {지표명:"협력 유관기관", 수치:25, 단위:"개"},
   {지표명:"사회 진입 성공률", 수치:52, 단위:"%"}]

5. CardNewsPreviewSection (src/components/sections/CardNewsPreviewSection.tsx)
Server Component: const cardNews = await getCardNewsList() 호출
- 배경: white
- SectionTitle "소식 & 카드뉴스" align=center
- 최신 6개만 표시 (slice(0,6))
- 3열 그리드 (md:grid-cols-3, 모바일 1열)
- CardNewsCard 컴포넌트 사용
- 노션 데이터 없을 때: 샘플 카드 3개 표시
- 하단: "모든 소식 보기 →" → href="/cardnews"

6. NewsletterPreviewSection (src/components/sections/NewsletterPreviewSection.tsx)
Server Component: const newsletters = await getNewsletterList() 호출
- 배경: cream
- SectionTitle "뉴스레터" align=center
- 설명: "소이랩의 활동과 고립·은둔청년 이슈를 담은 뉴스레터를 받아보세요."
- 최신 3개 가로 목록:
  각 항목: 발행호수 배지 + 제목 + 발행일 + 요약 + "PDF 다운로드" 버튼
- 하단: "모든 뉴스레터 보기 →" → href="/newsletter"

7. ContactSection (src/components/sections/ContactSection.tsx)
- 배경: navy #46549C
- 흰색 텍스트
- 2컬럼
- 왼쪽:
  "청년 곁에서 함께하고 싶으신가요?"
  설명 텍스트
  "전화 문의하기" 버튼 (흰색 배경, navy 텍스트) → tel:05394194903
  "이메일 문의" 버튼 (투명 아웃라인)→ mailto:soilabcoop@gmail.com
- 오른쪽: 연락처 카드 (반투명 흰색 배경)
  📞 053-941-9003
  📧 soilabcoop@gmail.com
  🌐 soilabcoop.kr (링크)
  📍 대구광역시

=== page.tsx 구조 ===
export default async function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <StatsSection />
      <CardNewsPreviewSection />
      <NewsletterPreviewSection />
      <ContactSection />
    </main>
  )
}
```

✅ 확인:
- [ ] localhost:3000 홈페이지 정상 표시
- [ ] 모든 섹션 렌더링됨
- [ ] 노션 데이터 또는 기본값 표시
- [ ] 스크롤 애니메이션 작동

---

# ━━━ PHASE 5: 카드뉴스 목록/상세 페이지 ━━━
> Phase 4 완료 후 붙여넣기

```
카드뉴스 페이지를 만들어줘.

=== src/app/cardnews/page.tsx ===
Server Component
const cardNews = await getCardNewsList()

레이아웃:
- 상단 Hero 바 (navy 배경, 흰색):
  "소식 & 카드뉴스" h1
  "청년 다다름 사업의 카드뉴스와 소이랩 활동 소식입니다."
- 필터 탭 (Client Component):
  전체 / 카드뉴스 / 활동소식 / 공지
  클릭 시 해당 카테고리만 표시
  (URL 쿼리 파라미터로 관리: ?category=카드뉴스)
- 사업 필터 (Select):
  전체 / 고립은둔청년 / 청년다다름
- 카드 그리드: md:grid-cols-3, gap-6
- CardNewsCard 컴포넌트
- 빈 상태: "아직 등록된 소식이 없습니다." 표시

=== src/app/cardnews/[id]/page.tsx ===
Server Component
const news = await getCardNewsDetail(params.id)

레이아웃:
- 상단 뒤로가기: "← 목록으로" → href="/cardnews"
- 헤더 영역:
  Badge (카테고리)
  h1 (제목)
  사업명 · 발행일
- 본문 영역:
  노션 마크다운을 HTML로 렌더링
  (prose 클래스로 타이포그래피 스타일링)
- 외부링크 있으면: "원본 보기 →" 버튼
- 하단: "다른 소식 보기" → /cardnews

=== generateStaticParams ===
export async function generateStaticParams() {
  const cardNews = await getCardNewsList()
  return cardNews.map((item) => ({ id: item.id }))
}

=== generateMetadata ===
export async function generateMetadata({ params }) {
  const news = await getCardNewsDetail(params.id)
  return {
    title: `${news.title} | 소이랩`,
    description: news.summary,
  }
}

=== 마크다운 스타일링 ===
- @tailwindcss/typography 설치: npm install @tailwindcss/typography
- tailwind.config.ts plugins에 추가
- 본문에 prose prose-lg 클래스 적용
- 이미지: rounded-lg, shadow
- 링크: navy 색상
```

✅ 확인:
- [ ] /cardnews 목록 페이지 접속됨
- [ ] 필터 탭 작동
- [ ] 카드 클릭 시 상세 페이지 이동
- [ ] 상세 페이지 본문 렌더링

---

# ━━━ PHASE 6: 뉴스레터 페이지 ━━━
> Phase 5 완료 후 붙여넣기

```
뉴스레터 아카이브 페이지를 만들어줘.

=== src/app/newsletter/page.tsx ===
Server Component
const newsletters = await getNewsletterList()

레이아웃:
- 상단 Hero 바 (blue #248DAC 배경):
  "뉴스레터" h1
  "소이랩의 활동과 고립·은둔청년 이슈를 정기적으로 전합니다."
- 뉴스레터 목록 (세로 리스트, 카드 형태):
  각 카드:
    왼쪽: 발행호수 (큰 숫자, navy 배경 원형)
    가운데:
      h3 제목
      발행일
      요약 (2줄 clamp)
    오른쪽:
      "PDF 다운로드" 버튼 (navy 아웃라인)
      → href=PDF링크, target="_blank"
  구분선으로 항목 분리
- 빈 상태: "준비 중입니다." 안내

=== 구독 안내 섹션 ===
하단에 추가:
- 배경: cream
- "뉴스레터를 이메일로 받아보세요"
- "soilabcoop@gmail.com 으로 '뉴스레터 구독' 제목으로 보내주시면 등록해드립니다."
- 이메일 버튼: mailto 링크
```

✅ 확인:
- [ ] /newsletter 페이지 접속됨
- [ ] PDF 다운로드 버튼 작동
- [ ] 구독 안내 표시

---

# ━━━ PHASE 7: SEO · 성능 · 마무리 ━━━
> Phase 6 완료 후 붙여넣기

```
SEO와 성능 최적화 작업을 해줘.

=== src/app/layout.tsx metadata ===
export const metadata: Metadata = {
  title: {
    default: '협동조합 소이랩 고립·은둔 청년 지원센터',
    template: '%s | 소이랩 청년지원센터'
  },
  description: '대구 지역 고립·은둔 청년을 발굴하고 회복을 지원합니다. 132명의 쉼청년과 함께 걸어온 협동조합 소이랩입니다.',
  keywords: ['고립청년', '은둔청년', '청년지원', '대구청년', '소이랩', '쉼청년', '청년다다름'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://soilab-youth.kr',
    siteName: '협동조합 소이랩 고립·은둔 청년 지원센터',
    title: '협동조합 소이랩 고립·은둔 청년 지원센터',
    description: '대구 지역 고립·은둔 청년을 발굴하고 회복을 지원합니다.',
  },
}

=== public 폴더에 추가 ===
- public/소이랩_고립은둔청년지원사업_성과사례집.pdf (기존 PDF 복사)
- public/robots.txt:
  User-agent: *
  Allow: /
  Sitemap: https://soilab-youth.kr/sitemap.xml

=== src/app/sitemap.ts ===
import { getCardNewsList } from '@/lib/notion'
export default async function sitemap() {
  const cardNews = await getCardNewsList()
  const cardNewsUrls = cardNews.map(item => ({
    url: `https://soilab-youth.kr/cardnews/${item.id}`,
    lastModified: item.publishedAt,
  }))
  return [
    { url: 'https://soilab-youth.kr', lastModified: new Date() },
    { url: 'https://soilab-youth.kr/cardnews', lastModified: new Date() },
    { url: 'https://soilab-youth.kr/newsletter', lastModified: new Date() },
    ...cardNewsUrls,
  ]
}

=== Revalidation 설정 ===
각 데이터 fetch 함수에 캐시 설정 추가 (notion.ts):
{ next: { revalidate: 3600 } }  // 1시간마다 갱신

=== 반응형 최종 점검 ===
- 375px (모바일): 모든 섹션 1열
- 768px (태블릿): 2열
- 1280px (데스크탑): 최대너비 1100px 중앙정렬

=== 접근성 최종 점검 ===
- 모든 img에 alt
- 버튼에 aria-label
- focus-visible 스타일
- skip-to-content 링크
- 색상 대비 WCAG AA

=== 빌드 확인 ===
npm run build
(에러 없어야 함)
```

✅ 확인:
- [ ] npm run build 성공
- [ ] /sitemap.xml 접속됨
- [ ] 모바일 레이아웃 정상
- [ ] 콘솔 에러 없음

---

# ━━━ PHASE 8: Vercel 배포 ━━━
> Phase 7 완료 후 실행

## 8-1. GitHub 저장소 생성 및 push
```powershell
cd soilab-youth
git init
git add -A
git commit -m "소이랩 청년지원센터 Next.js 첫 배포"
git branch -M main
git remote add origin https://github.com/sunra724/soilab-youth-nextjs.git
git push -u origin main
```

## 8-2. Vercel 배포
```
1. vercel.com 접속 → GitHub 로그인
2. "New Project" → soilab-youth-nextjs 저장소 선택
3. Environment Variables 추가 (중요!):
   NOTION_TOKEN = secret_xxx...
   NOTION_CARDNEWS_DB = xxx...
   NOTION_NEWSLETTER_DB = xxx...
   NOTION_STATS_DB = xxx...
   NEXT_PUBLIC_SITE_URL = https://soilab-youth.kr
4. Deploy 클릭
5. 배포 완료 후 자동 URL 생성: soilab-youth-nextjs.vercel.app
```

## 8-3. 도메인 연결 (soilab-youth.kr)
```
Vercel 대시보드 → 프로젝트 → Settings → Domains
→ soilab-youth.kr 입력 → Add
→ DNS 설정 안내에 따라 도메인 등록업체에서 설정
   (A 레코드 또는 CNAME 설정)
→ 10분~24시간 후 적용
```

## 8-4. 이후 콘텐츠 업데이트
```
담당자 워크플로우:
① 노션에서 새 카드뉴스 페이지 작성
② "공개" 체크박스 체크
③ 끝! → 최대 1시간 후 사이트 자동 반영

즉시 반영이 필요하면:
Vercel 대시보드 → Deployments → Redeploy
```

---

# ━━━ 담당자 운영 가이드 ━━━

## 카드뉴스 등록 방법 (비개발자용)

```
1. 노션 "소이랩_카드뉴스" DB 열기
2. "+ New" 클릭
3. 제목 입력
4. 카테고리 선택 (카드뉴스/활동소식/공지)
5. 사업 선택 (고립은둔청년/청년다다름)
6. 발행일 선택
7. 요약 2~3줄 작성
8. 페이지 본문에 내용 작성 (이미지, 텍스트 자유롭게)
9. 외부링크 있으면 입력 (SNS 등)
10. "공개" 체크박스 ✅ → 사이트에 노출
```

## 실적 지표 수정 방법
```
노션 "소이랩_실적지표" DB에서
수치 숫자만 변경 → 자동 반영
```

## 뉴스레터 등록 방법
```
1. 구글드라이브에 PDF 업로드 → 링크 공유 설정
2. 노션 "소이랩_뉴스레터" DB에 새 항목 추가
3. PDF링크에 구글드라이브 공유 링크 붙여넣기
4. "공개" 체크 → 자동 반영
```
