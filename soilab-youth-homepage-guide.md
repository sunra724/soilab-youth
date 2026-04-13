# 협동조합 소이랩 고립·은둔 청년 지원센터 홈페이지
## 바이브코딩 통합 가이드 (Cursor용)
> 이 파일 하나를 Cursor 채팅창에 단계별로 붙여넣어 완성합니다.
> GitHub 저장소: `soilab-youth` | 배포: sunra724.github.io/soilab-youth

---

# ━━━ PHASE 0 : AI 컨텍스트 주입 ━━━
> **Cursor 새 Agent 시작 후 가장 먼저 붙여넣기**

```
[프로젝트 컨텍스트 - 반드시 기억할 것]

나는 협동조합 소이랩 고립·은둔 청년 지원센터의 공식 홈페이지를 만들고 있어.
이 컨텍스트를 대화 전반에 걸쳐 유지해줘.

=== 기관 정보 ===
기관명: 협동조합 소이랩 고립·은둔 청년 지원센터
대표: 강아름
사업자번호: 502-82-21040
전화: 053-941-9003
이메일: soilabcoop@gmail.com
홈페이지: soilabcoop.kr
지역: 대구광역시

=== 브랜드 색상 (필수 준수) ===
--navy:   #46549C  (메인 - 헤더, 제목, 버튼)
--blue:   #248DAC  (서브 - 강조, 링크, 배지)
--green:  #228D7B  (포인트 - 아이콘, 태그)
--bg:     #F8F9FC  (전체 배경 - 밝은 쿨그레이)
--white:  #FFFFFF
--text:   #1A1F36  (본문)
--sub:    #6B7280  (보조 텍스트)
--border: #E5E7EB

=== 2개 핵심 사업 ===
1. 고립·은둔 청년 지원사업
   - 설명: 대구 지역 고립·은둔 청년 발굴, 회복 프로그램 운영, 부모교육
   - 성과: 132명 발굴, 이수율 100%, 25개 기관 연계, 52% 사회진입
   - 자료: 성과 사례집 "다시, 봄" PDF 다운로드 제공
   - 링크: youthreconnect 사이트 연결 (상세 사례 보기)

2. 청년 다다름 사업
   - 설명: 청년의 다양한 삶의 방식을 인정하고 연결하는 프로그램
   - 주요활동: 카드뉴스 발행·배포, 활동 홍보, 청년 네트워크
   - 특징: SNS 기반 콘텐츠, 지역 청년 커뮤니티 연결

=== 사이트 구조 (6섹션) ===
1. Header + Hero: 기관명, 핵심 메시지, CTA 2개
2. About: 소이랩 소개, 미션/비전
3. Programs: 2개 사업 카드 (상세 페이지 링크)
4. Stats: 성과 지표 4개
5. News: 카드뉴스/소식 갤러리
6. Footer: 연락처, 빠른 링크

=== 기술 스택 ===
HTML5 + CSS3 (Vanilla, 프레임워크 없음)
JavaScript ES6+
Google Fonts: Noto Sans KR (400, 500, 700)
완전 정적 사이트, 서버 없음
반응형: 768px 브레이크포인트

=== 디자인 톤 ===
- 전문적이고 신뢰감 있는 공공기관 스타일
- 따뜻하고 희망적인 어조
- 딱딱한 행정 언어 지양
- '쉼청년', '회복', '연결' 키워드 중심
```

✅ 확인: "네, 컨텍스트를 기억했습니다" 라는 응답이 오면 Phase 1로 이동

---

# ━━━ PHASE 1 : 전체 파일 한번에 생성 ━━━
> **Phase 0 직후 붙여넣기**

```
위 컨텍스트를 바탕으로 index.html, style.css, script.js 3개 파일을 생성해줘.

=== index.html 요구사항 ===

1. HEAD
- lang="ko", charset="UTF-8"
- title: "협동조합 소이랩 고립·은둔 청년 지원센터"
- description: "대구 지역 고립·은둔 청년을 발굴하고 회복을 지원하는 소이랩 청년지원센터입니다."
- Google Fonts: Noto Sans KR 400/500/700
- og:title, og:description, og:image 메타태그
- style.css, script.js 연결

2. HEADER (sticky)
- 왼쪽: 소이랩 로고 (네이비 #46549C 사각형 아이콘 + 텍스트)
- 가운데: 네비게이션 (소개 / 사업 / 성과 / 소식 / 문의)
- 오른쪽: "참여 문의" 버튼 (네이비 배경)
- 모바일: 햄버거 메뉴

3. HERO 섹션 (#hero)
- 배경: 네이비(#46549C)에서 블루(#248DAC)로 대각선 그라디언트
- 배지: "대구 고립·은둔 청년 지원 전문기관"
- 메인 타이틀: "청년의 속도로,<br>함께 걷겠습니다"
- 서브: "협동조합 소이랩은 고립·은둔 청년 곁에서 발굴하고, 연결하고, 회복을 함께 만들어갑니다."
- 버튼 2개: "사업 소개 보기"(흰색 배경), "사례집 다운로드"(투명 아웃라인)
- min-height: 100vh, 텍스트 흰색, 왼쪽 정렬, 최대너비 600px

4. ABOUT 섹션 (#about)
- 배경: 흰색
- 왼쪽: 섹션 제목 "소이랩을 소개합니다" + 본문
  본문: "협동조합 소이랩은 지역사회 문제를 시민·기관·전문가와 함께 해결하는 리빙랩 전문 조직입니다.
  고립·은둔청년 지원사업을 통해 청년 개인의 회복을 넘어 가족, 지역, 관계망 전체를 함께 바라보는 접근을 시도해 왔습니다."
- 오른쪽: 3개 카드 (아이콘 + 제목 + 설명)
  카드1: 🔍 "발굴과 연결" - 보이지 않던 청년들을 지역 네트워크로 발견합니다
  카드2: 💚 "단계적 회복" - 심리안정부터 사회복귀까지 함께 걷습니다
  카드3: 🤝 "지역 협력" - 25개 기관과 함께 촘촘한 안전망을 만듭니다
- 카드 상단 왼쪽 보더: 3px solid #46549C

5. PROGRAMS 섹션 (#programs)
- 배경: #F8F9FC
- 섹션 제목: "주요 사업"
- 2개 사업 카드 (가로 2열, 모바일 1열)

카드1 - 고립·은둔 청년 지원사업:
  상단 컬러바: #46549C
  뱃지: "고립·은둔 청년"
  제목: "고립·은둔 청년 지원사업"
  설명: "방 안에 머무는 청년들을 발견하고, 자신의 속도로 회복할 수 있도록 단계적으로 지원합니다. 심리 안정부터 사회 복귀까지 함께합니다."
  태그: #발굴 #심리상담 #일상회복 #사회복귀
  버튼 2개: "사업 상세보기"(네이비), "사례집 다운로드"(아웃라인)
  클릭시 사례집: ./소이랩_고립은둔청년지원사업_성과사례집.pdf

카드2 - 청년 다다름 사업:
  상단 컬러바: #248DAC
  뱃지: "청년 연결"
  제목: "청년 다다름 사업"
  설명: "청년의 다양한 삶의 방식을 인정하고 연결합니다. 카드뉴스 발행, 활동 홍보, 지역 청년 네트워크를 통해 청년이 서로를 발견합니다."
  태그: #카드뉴스 #청년네트워크 #활동홍보 #커뮤니티
  버튼: "활동 소식 보기"(블루)

6. STATS 섹션 (#stats)
- 배경: 네이비 #46549C, 텍스트 흰색
- 제목: "숫자로 보는 소이랩의 발걸음"
- 4개 수치 카드 (가로 4열, 모바일 2열):
  132명 / 총 발굴 쉼청년
  100% / 프로그램 이수율
  25개 / 협력 유관기관
  52% / 사회 진입 성공률
- 각 숫자에 카운팅 애니메이션 (Intersection Observer)

7. NEWS 섹션 (#news)
- 배경: 흰색
- 제목: "소식 & 카드뉴스"
- 설명: "청년 다다름 사업의 최신 카드뉴스와 소이랩 활동 소식입니다."
- 3개 카드 (가로 3열, 모바일 1열):
  카드1: 🟦 배경색 #E8F4FD, 태그"카드뉴스", 제목"고립·은둔 청년을 이해하는 5가지 방법", 날짜"2025.01"
  카드2: 🟩 배경색 #E8F5F2, 태그"활동소식", 제목"2025 청년 다다름 네트워킹 데이 후기", 날짜"2025.01"
  카드3: 🟦 배경색 #EEF0F9, 태그"카드뉴스", 제목"부모님이 알아야 할 자녀 고립 신호 7가지", 날짜"2024.12"
- 하단 "더 많은 소식 보기" 버튼

8. CONTACT 섹션 (#contact)
- 배경: #F8F9FC
- 제목: "함께하고 싶으신가요?"
- 2컬럼: 왼쪽 문의 안내, 오른쪽 연락처 카드
- 연락처:
  📞 053-941-9003
  📧 soilabcoop@gmail.com
  🌐 soilabcoop.kr
  📍 대구광역시
- "전화 문의하기" 버튼 (tel: 링크)

9. FOOTER
- 배경: #1A1F36 (다크)
- 왼쪽: 로고 + 기관명 + 사업자번호 502-82-21040
- 가운데: 빠른 링크 (소개/사업/성과/문의)
- 오른쪽: 연락처
- 하단: © 2025 협동조합 소이랩. All rights reserved.

=== style.css 요구사항 ===
:root {
  --navy: #46549C;
  --blue: #248DAC;
  --green: #228D7B;
  --bg: #F8F9FC;
  --white: #FFFFFF;
  --text: #1A1F36;
  --sub: #6B7280;
  --border: #E5E7EB;
  --shadow: 0 4px 20px rgba(70,84,156,0.1);
  --radius: 12px;
  --transition: 0.3s ease;
  --font: 'Noto Sans KR', sans-serif;
  --max-width: 1100px;
}
- CSS reset 포함
- .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
- 모든 섹션 padding: 80px 0
- 카드 호버: translateY(-4px) + shadow 강화
- 버튼: border-radius 8px, padding 12px 28px
- sticky header: scroll시 배경 흰색 + shadow
- 반응형 768px 브레이크포인트
- 스크롤 페이드인 애니메이션 (.fade-in 클래스)

=== script.js 요구사항 ===
- 햄버거 메뉴 토글
- 스크롤 시 header 스타일 변경
- 스무스 스크롤
- 카운팅 애니메이션 (Intersection Observer)
- 스크롤 페이드인 (Intersection Observer)
- 현재 섹션 nav 활성화
```

✅ 생성 후 확인:
- [ ] index.html 파일 생성됨
- [ ] style.css 파일 생성됨
- [ ] script.js 파일 생성됨
- [ ] Live Server로 미리보기 확인
- [ ] 헤더 네이비 색상 (#46549C) 확인
- [ ] Hero 텍스트 잘 보임
- [ ] 사업 카드 2개 표시

---

# ━━━ PHASE 2 : PDF 연결 및 외부 링크 설정 ━━━
> **Phase 1 완료 후 붙여넣기**

```
아래 작업을 해줘:

1. PDF 다운로드 버튼 연결
   - "사례집 다운로드" 버튼의 href를 아래로 수정:
     href="./소이랩_고립은둔청년지원사업_성과사례집.pdf"
     download="소이랩_고립은둔청년지원사업_성과사례집.pdf"
   - PDF 파일은 index.html과 같은 폴더에 있음

2. youthreconnect 링크 연결
   - "사업 상세보기" 버튼:
     href="https://sunra724.github.io/youthreconnect"
     target="_blank"

3. 전화 링크 연결
   - 모든 전화번호를 <a href="tel:05394194903">053-941-9003</a> 으로 수정

4. 이메일 링크 연결
   - soilabcoop@gmail.com → <a href="mailto:soilabcoop@gmail.com">

5. favicon 추가 (없으면 생략)
   - <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%2346549C'/><text y='.9em' font-size='80' x='10'>🌱</text></svg>">
```

✅ 확인:
- [ ] PDF 다운로드 버튼 클릭 시 파일 다운로드
- [ ] "사업 상세보기" 클릭 시 youthreconnect 사이트 열림
- [ ] 전화번호 클릭 시 전화 앱 연결

---

# ━━━ PHASE 3 : 반응형 및 품질 개선 ━━━
> **Phase 2 완료 후 붙여넣기**

```
아래 품질 개선 작업을 해줘:

1. 모바일 반응형 점검 (768px)
   - 헤더 햄버거 메뉴 정상 작동 확인
   - Hero 텍스트 font-size 줄이기 (모바일 h1: 2rem)
   - 사업 카드 2열 → 1열
   - Stats 4열 → 2열
   - News 카드 3열 → 1열
   - 버튼 full-width

2. 접근성 개선
   - 모든 이미지/아이콘에 alt 또는 aria-label
   - 버튼에 명확한 텍스트
   - 색상 대비 WCAG AA 준수
   - 키보드 네비게이션 가능하도록 focus 스타일 추가
   - skip-to-content 링크

3. SEO 메타태그 완성
   - og:title: "협동조합 소이랩 고립·은둔 청년 지원센터"
   - og:description: "대구 지역 고립·은둔 청년을 발굴하고 회복을 지원합니다. 132명의 쉼청년과 함께 걸어온 소이랩입니다."
   - og:url: "https://sunra724.github.io/soilab-youth"
   - keywords: "고립청년, 은둔청년, 청년지원, 대구청년, 소이랩, 쉼청년, 청년다다름"

4. 성능 최적화
   - 이미지 없으므로 생략
   - CSS 불필요한 중복 제거
   - JS에 'use strict' 추가

5. 최종 정리
   - 콘솔 에러 없음 확인
   - 모든 링크 작동 확인
   - HTML 주석 정리
```

✅ 확인:
- [ ] 모바일(375px)에서 레이아웃 정상
- [ ] 햄버거 메뉴 열림/닫힘
- [ ] 콘솔 에러 없음
- [ ] 모든 버튼/링크 작동

---

# ━━━ PHASE 4 : GitHub 배포 ━━━
> **Phase 3 완료 후 Cursor 터미널에서 실행**

## 4-1. GitHub 저장소 생성
```
github.com 접속 → "+" → New repository
이름: soilab-youth
Public 선택
README 체크 해제
Create repository 클릭
```

## 4-2. 터미널에서 배포 (PowerShell)
```powershell
# 프로젝트 폴더로 이동 (실제 경로로 변경)
cd C:\Users\sunra\Downloads\soilab-youth

# PDF 파일 복사 (youthreconnect 폴더에 있는 경우)
Copy-Item "..\youthreconnect\소이랩_고립은둔청년지원사업_성과사례집.pdf" .

# Git 초기화 및 업로드
git init
git add -A
git commit -m "소이랩 청년지원센터 홈페이지 첫 배포"
git branch -M main
git remote add origin https://github.com/sunra724/soilab-youth.git
git push -u origin main
```

## 4-3. GitHub Pages 설정
```
github.com/sunra724/soilab-youth
→ Settings → Pages
→ Source: Deploy from a branch
→ Branch: main / (root)
→ Save
→ 3분 대기
```

## 4-4. 접속 확인
```
https://sunra724.github.io/soilab-youth
```

✅ 최종 확인:
- [ ] 사이트 정상 접속
- [ ] PDF 다운로드 작동
- [ ] youthreconnect 링크 작동
- [ ] 모바일 화면 정상
- [ ] 전화번호 클릭 시 전화 연결

---

# ━━━ 나중에 추가할 것 ━━━

## 카드뉴스 추가 방법
새 카드뉴스 생성 시 index.html의 News 섹션에:
```html
<div class="news-card">
  <div class="news-thumb" style="background:#E8F4FD">📋</div>
  <span class="news-tag">카드뉴스</span>
  <h3>제목</h3>
  <p class="news-date">2025.02</p>
</div>
```
추가 후 git push하면 자동 반영

## 사업 추가 시
Programs 섹션에 카드 추가 → 같은 방식으로 push

## 도메인 연결 (선택)
soilabcoop.kr 구매 후:
Settings → Pages → Custom domain → soilabcoop.kr 입력
