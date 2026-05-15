# 소이랩 뉴스레터 자동화 작업 메모

마지막 정리일: 2026-04-24

이 문서는 `다시봄 뉴스클리핑` 자동 발송과 `기관 소식` 뉴스레터 구분 작업을 다음 작업 때 빠르게 이어가기 위한 운영 메모입니다. 비밀키와 실제 토큰은 문서에 남기지 않습니다.

## 현재 목표

소이랩 뉴스레터는 두 갈래로 운영합니다.

- `다시봄 뉴스클리핑`: 고립은둔, 사회적가치, 청년지원 관련 뉴스와 유튜브 영상을 매일 자동 수집하고 매일 오전 8시에 이메일로 발송합니다.
- `기관 소식`: 소이랩 고립·은둔 청년 지원센터가 직접 작성하는 활동보고, 행사 안내, 공지 등을 비정기적으로 발송하거나 웹에 게시합니다.

현재 구독자는 같은 Resend segment/audience를 사용합니다. 나중에 `뉴스클리핑만 받기`, `기관 소식만 받기`처럼 수신 선택을 나누려면 Resend segment를 분리하고 구독 폼에 선호 항목을 추가해야 합니다.

## 운영 흐름

1. Vercel Cron이 매일 오전 7시 50분(KST)에 `/api/collect-news`를 호출합니다.
2. `collect-news`는 Google News RSS와 YouTube Data API를 키워드별로 조회해 새 기사/영상 URL만 Notion 후보 DB에 저장합니다.
3. Vercel Cron이 매일 오전 8시(KST)에 `/api/send-newsletter/cron`을 호출합니다.
4. `send-newsletter`는 Notion 후보 DB에서 `발송선택=true`, `발송완료=false`인 기사를 우선 발송합니다.
5. 선택된 기사가 없으면 `NEWSLETTER_AUTO_SELECT_COUNT` 값만큼 최신 미발송 후보를 자동 선택해 발송합니다.
6. 정식 발송이 끝나면 후보 기사는 `발송완료=true`로 바뀌고, 뉴스레터 아카이브 DB에 `다시봄 뉴스클리핑 YYYY년 M월 D일` 항목이 생성됩니다.
7. `test=1` 테스트 발송은 메일만 보내고 Notion의 발송완료/아카이브 처리는 하지 않습니다.

## Cron 설정

파일: `vercel.json`

Vercel Cron은 UTC 기준입니다.

- `/api/collect-news`: `50 22 * * *`
- `/api/send-newsletter/cron`: `0 23 * * *`

한국시간 기준으로는 다음과 같습니다.

- 뉴스 수집: 매일 오전 7시 50분
- 뉴스 발송: 매일 오전 8시

## 현재 수집 키워드

파일: `src/app/api/collect-news/route.ts`

현재 Google News RSS 조회 키워드는 다음과 같습니다.

- `고립은둔` → 카테고리 `고립은둔`
- `고립·은둔` → 카테고리 `고립은둔`
- `고립 은둔` → 카테고리 `고립은둔`
- `고립은둔 청년` → 카테고리 `고립은둔`
- `고립·은둔 청년` → 카테고리 `고립은둔`
- `은둔형외톨이` → 카테고리 `고립은둔`
- `청년 고립 지원` → 카테고리 `청년지원`
- `청년지원` → 카테고리 `청년지원`
- `사회적가치` → 카테고리 `사회적가치`
- `사회적 가치 거래` → 카테고리 `사회적가치`
- `임팩트 측정 사회적가치` → 카테고리 `사회적가치`
- `임팩트 측정 복지` → 카테고리 `사회적가치`
- `사회성과인센티브` → 카테고리 `사회적가치`
- `Tradeable Impact` → 카테고리 `사회적가치`
- `Social Progress Credit` → 카테고리 `사회적가치`
- `SPC 사회성과` → 카테고리 `사회적가치`
- `SPC 사회성과인센티브` → 카테고리 `사회적가치`

키워드가 너무 넓거나 좁으면 이 배열을 먼저 조정하면 됩니다. 구글 알리미의 `고립은둔` 결과와 최대한 비슷하게 맞추기 위해 띄어쓰기와 가운뎃점이 다른 `고립은둔`, `고립·은둔`, `고립 은둔` 변형을 함께 조회합니다. `SPC`는 단독으로 조회하면 범위가 너무 넓어지므로 `SPC 사회성과`, `SPC 사회성과인센티브`처럼 맥락어를 붙여 조회합니다.

현재 YouTube Data API 조회 키워드는 다음과 같습니다.

- `고립은둔 청년` → 카테고리 `고립은둔`
- `은둔형외톨이` → 카테고리 `고립은둔`
- `청년지원` → 카테고리 `청년지원`
- `사회적가치 청년` → 카테고리 `사회적가치`

유튜브 영상은 기존 Notion 후보 DB 스키마를 깨지 않기 위해 제목 앞에 `[영상]`을 붙이고, 출처는 `YouTube · 채널명 · 조회수 ... · 구독자 ...` 형식으로 저장합니다. `YOUTUBE_API_KEY`가 없으면 영상 수집만 건너뛰고 뉴스 수집은 계속 진행됩니다.

유튜브 수집은 검색 결과를 바로 저장하지 않습니다. 먼저 후보를 넉넉히 가져온 뒤 YouTube `videos.list`의 `statistics.viewCount`와 `channels.list`의 `statistics.subscriberCount`를 조회해 조회수/구독자 기준을 통과한 영상만 점수순으로 저장합니다. 기존에 저장된 낮은 품질 영상이 자동발송에 섞이지 않도록 발송 자동선택 단계에서도 조회수/구독자 정보가 없는 `[영상]` 후보는 제외합니다.

발송 자동선택은 뉴스 기사를 우선합니다. `NEWSLETTER_AUTO_SELECT_ARTICLE_RATIO` 기본값은 `0.7`이며, 예를 들어 `NEWSLETTER_AUTO_SELECT_COUNT=10`이면 기사 7건, 영상 3건을 목표로 선택합니다. 기사가 부족할 때만 남은 자리를 영상으로 채우고, 영상이 부족하면 기사로 채웁니다. 노션에서 `발송선택`을 직접 체크한 항목은 운영자가 고른 목록으로 보고 이 비율을 강제로 바꾸지 않습니다.

사회적가치·임팩트 키워드는 고립은둔청년 뉴스의 보조 관점으로만 들어가도록 자동선택에서 별도 제한을 둡니다. `사회적가치` 또는 `사회적경제` 카테고리는 기본적으로 발송 건수의 20% 수준, 최소 1건·최대 2건까지만 자동선택됩니다. 직접 `발송선택`을 체크한 항목은 운영자 선택으로 보고 이 제한을 적용하지 않습니다.

## 주요 파일

- `src/app/api/collect-news/route.ts`: Google News RSS와 YouTube Data API 수집, 요약 생성, Notion 후보 DB 저장
- `src/app/api/send-newsletter/route.ts`: 드라이런, 테스트 발송, 정식 발송, 자동선택, 발송완료 처리, 아카이브 생성
- `src/app/api/send-newsletter/cron/route.ts`: Vercel Cron용 GET 경로. Vercel Cron은 GET만 보내기 때문에 실제 발송용 POST 핸들러를 GET으로 재사용합니다.
- `src/app/api/subscribe-newsletter/route.ts`: 구독 폼에서 Resend 연락처 등록
- `src/app/api/unsubscribe-newsletter/route.ts`: 개인별 수신거부 링크 처리
- `src/lib/emailTemplate.ts`: HTML/text 이메일 템플릿
- `src/lib/resendContacts.ts`: Resend segment/audience 연락처 조회/생성/수신거부
- `src/lib/newsletterToken.ts`: 수신거부 링크 서명/검증
- `src/lib/notionSchema.ts`: Notion DB 속성명과 후보 카테고리 상수
- `src/app/newsletter/page.tsx`: 웹 뉴스레터 페이지, `매일 뉴스클리핑`과 `기관 소식` 섹션 구분
- `src/components/sections/NewsletterPreviewSection.tsx`: 메인 페이지 뉴스레터 미리보기
- `vercel.json`: Vercel Cron 스케줄

## 필요한 환경변수

Vercel Production 환경변수 기준입니다. 값은 Vercel 대시보드에서 관리하고, 문서나 커밋에 남기지 않습니다.

- `RESEND_API_KEY`: Resend API 키
- `RESEND_FROM`: 인증된 소이랩 도메인의 발신자 주소. 예: `소이랩 뉴스레터 <youth-news@soilabcoop.kr>`
- `RESEND_SEGMENT_ID`: 뉴스레터 구독자를 저장할 Resend segment ID
- `RESEND_AUDIENCE_ID`: 기존 audience 호환용. `RESEND_SEGMENT_ID`가 있으면 segment를 우선 사용합니다.
- `NEWSLETTER_TO`: Resend segment/audience가 없을 때 쓰는 테스트/백업 수신자 목록
- `NEWSLETTER_TEST_TO`: 테스트 발송 전용 수신자. 없으면 실제 구독자 목록을 테스트 수신자로 사용합니다.
- `NEWSLETTER_REPLY_TO`: 답장 받을 주소. 없으면 `NEWSLETTER_UNSUBSCRIBE_EMAIL`을 사용합니다.
- `NEWSLETTER_UNSUBSCRIBE_EMAIL`: 수신거부 요청을 받을 주소. 기본값은 `youth-news@soilabcoop.kr`입니다.
- `NEWSLETTER_UNSUBSCRIBE_SECRET`: 개인별 수신거부 링크 서명용 비밀값. 없으면 `CRON_SECRET`을 사용합니다.
- `NEWSLETTER_AUTO_SELECT_COUNT`: 발송선택된 기사가 없을 때 최신 미발송 후보를 자동 선택할 개수. 현재 운영 의도는 `5`입니다.
- `NEWSLETTER_AUTO_SELECT_ARTICLE_RATIO`: 자동선택 시 뉴스 기사 목표 비율. 기본값 `0.7`
- `NEWSLETTER_AUTO_SELECT_IMPACT_LIMIT`: 자동선택 시 `사회적가치`/`사회적경제` 카테고리 최대 포함 개수. 기본값은 발송 건수의 20%, 최소 `1`, 최대 `2`
- `CRON_SECRET`: cron/API 보호용 bearer token
- `ANTHROPIC_API_KEY`: 기사 요약 생성용
- `YOUTUBE_API_KEY`: 유튜브 영상 수집용 YouTube Data API 키. 없으면 영상 수집만 건너뜁니다.
- `NEWS_ITEM_LIMIT_PER_QUERY`: Google News RSS 키워드별 기사 검토 개수. 기본값 `10`, 최대 `20`
- `YOUTUBE_VIDEO_LIMIT_PER_QUERY`: 유튜브 키워드별 수집 개수. 기본값 `1`, 최대 `5`
- `YOUTUBE_VIDEO_SEARCH_POOL_PER_QUERY`: 유튜브 키워드별 검토 후보 개수. 기본값 `10`, 최대 `25`
- `YOUTUBE_VIDEO_LOOKBACK_DAYS`: 유튜브 검색 기간. 기본값 `14`, 최대 `30`
- `YOUTUBE_MIN_VIEW_COUNT`: 유튜브 영상 최소 조회수. 기본값 `1000`
- `YOUTUBE_MIN_CHANNEL_SUBSCRIBERS`: 유튜브 채널 최소 구독자 수. 기본값 `1000`
- `YOUTUBE_VIDEO_SEARCH_ORDER`: 유튜브 검색 정렬. 기본값 `viewCount`
- `NOTION_TOKEN`: Notion API 토큰
- `NOTION_CANDIDATES_DB`: 뉴스 후보 DB ID
- `NOTION_CANDIDATES_COLLECTION`: 뉴스 후보 data source ID
- `NOTION_NEWSLETTER_DB`: 뉴스레터 아카이브 DB ID
- `NOTION_NEWSLETTER_COLLECTION`: 뉴스레터 아카이브 data source ID
- `NEXT_PUBLIC_SITE_URL`: 수신거부 링크 생성에 사용할 사이트 URL. 없으면 `https://soilab-youth.kr`를 기본값으로 사용합니다.

## Notion 데이터 구조

후보 DB 속성은 `src/lib/notionSchema.ts`의 `CANDIDATE_PROPS`와 맞아야 합니다.

- `제목`: title
- `원문링크`: url
- `출처`: rich_text
- `수집일`: date
- `요약`: rich_text
- `카테고리`: select
- `발송선택`: checkbox
- `발송완료`: checkbox

현재 후보 카테고리 상수는 다음과 같습니다.

- `고립은둔`
- `청년지원`
- `사회적가치`
- `사회적경제`
- `기타`

영상 후보는 현재 별도 필드 없이 기존 DB에 저장됩니다.

- `제목`: `[영상] 영상 제목`
- `원문링크`: `https://www.youtube.com/watch?v=...`
- `출처`: `YouTube · 채널명 · 조회수 ...회 · 구독자 ...명`
- `요약`: `[조회수 ...회 · 구독자 ...명]` + 영상 설명 기반 2문장 요약

뉴스레터 아카이브 DB 속성은 `NEWSLETTER_PROPS`와 맞아야 합니다.

- `제목`: title
- `발행호수`: number
- `발행일`: date
- `요약`: rich_text
- `PDF링크`: url
- `공개`: checkbox

웹 `/newsletter` 페이지는 제목이나 요약에 `뉴스클리핑`, `주요 카테고리:`, `주요 뉴스`가 들어간 항목을 `매일 뉴스클리핑`으로 분류하고, 나머지를 `기관 소식`으로 분류합니다. 더 안정적으로 나누려면 Notion 뉴스레터 DB에 `유형` select 속성을 추가하고 코드에서 그 값을 읽도록 바꾸는 것이 좋습니다.

## 테스트와 운영 명령

아래 명령은 PowerShell 예시입니다. 실제 토큰 값은 로컬 `.env.local` 또는 Vercel 환경변수에서 가져와야 합니다.

드라이런: 발송 준비 상태, 수신자 수, 자동선택 후보를 확인합니다.

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri "https://soilab-youth.kr/api/send-newsletter" -Headers $headers -Method Get
```

오늘 뉴스 수집만 실행합니다. 이 작업은 Notion 후보 DB에 새 기사를 실제로 저장합니다.

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri "https://soilab-youth.kr/api/collect-news" -Headers $headers -Method Get
```

테스트 메일을 보냅니다. `test=1`은 발송완료/아카이브 처리를 하지 않습니다.

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri "https://soilab-youth.kr/api/send-newsletter?test=1" -Headers $headers -Method Post
```

정식 발송입니다. 운영자가 명시적으로 요청했을 때만 실행합니다.

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri "https://soilab-youth.kr/api/send-newsletter" -Headers $headers -Method Post
```

Resend 발송 상태 확인 예시입니다.

```powershell
$headers = @{ Authorization = "Bearer $env:RESEND_API_KEY" }
Invoke-RestMethod -Uri "https://api.resend.com/emails/<EMAIL_ID>" -Headers $headers -Method Get
```

## 메일 디자인 메모

파일: `src/lib/emailTemplate.ts`

아웃룩에서 그라디언트와 투명 흰색 텍스트가 흐리게 보이는 문제가 있었습니다. 그래서 현재 템플릿은 다음 기준으로 조정되어 있습니다.

- 헤더는 `linear-gradient` 대신 단색 `#248DAC` 사용
- 헤더 제목은 완전 흰색 `#ffffff` 사용
- 날짜 배지는 흰 배경 + 청록 글자 사용
- 푸터는 짙은 남색 배경 대신 밝은 `#eef7f9` 배경 사용
- 푸터 글자와 링크는 진한 회색/파란색으로 대비 확보

이메일 HTML은 웹 CSS보다 제한이 많습니다. 특히 Outlook 호환성을 위해 `rgba`, 복잡한 배경, 외부 CSS, 최신 레이아웃 속성은 피하는 편이 안전합니다.

## 최근 작업 기록

관련 커밋 흐름입니다.

- `6899699`: 다시봄레터 구독 및 자동 발송 흐름 개선
- `8c6e407`: 테스트 발송 수신자 선택 개선
- `668f834`: 뉴스레터 발송 드라이런 수신자 정보 추가
- `909a550`: 매일 뉴스레터 발송 일정 적용
- `0297444`: 뉴스레터 발송 후보를 고립은둔으로 제한
- `d70ff7d`: 뉴스레터 발행 라벨을 날짜 기준으로 변경
- `efa9258`: 뉴스클리핑과 기관 소식 구분
- `5c29610`: 아웃룩 메일 템플릿 대비 개선

## 현재 확인된 운영 상태

2026-04-24 기준으로 확인한 내용입니다.

- 운영 드라이런에서 `ready: true`
- 환경변수 누락 없음
- Resend 리스트 사용 중
- 테스트 메일은 `delivered` 상태 확인
- 발신 주소는 `youth-news@soilabcoop.kr`
- 메일 푸터 주소는 `대구광역시 북구 대현로 3, 2층(대현동)`

## 다음에 손볼 만한 것

- Notion 뉴스레터 DB에 `유형` select 속성을 추가해 `뉴스클리핑`과 `기관 소식`을 명시적으로 분류하기
- 구독 폼에서 `뉴스클리핑`, `기관 소식` 수신 선택을 분리하기
- Resend segment를 유형별로 나누기
- 기사 자동선택 기준에 날짜 필터를 추가해 너무 오래된 미발송 후보가 섞이지 않게 하기
- Google News RSS 키워드 품질을 며칠간 모니터링한 뒤 키워드 목록 조정하기
- 발송 전에 운영자가 후보 기사 목록을 웹에서 승인할 수 있는 간단한 관리자 화면 만들기
