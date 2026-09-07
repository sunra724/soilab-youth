# 청년 정책·연구 아카이브와 아침 브리핑

실제 Vercel Root Directory는 `soilab-youth`입니다. 따라서 이 기능은 저장소 루트의 복제 앱이 아닌 `soilab-youth/src`에 구현했습니다.

## 구성

- `/research`: 연구 데스크
- `/research/evidence`: 유형·주제·검색어로 찾는 원문 자료실
- `/research/evidence/[id]`: 요약, 확인 범위, 한계, 현장 적용 질문
- `/research/topics`: 6개 주제의 검토 질문과 연결 근거
- `/research/briefings`: 최근 60건의 날짜별 브리핑
- `/api/research/sources`: 공개된 원문 색인
- `/api/research/briefings`: 비공개 수집·보관·발송 상태 API
- `/research/review`: 운영자 검토함. 요약·적용 방향·한계·확인 범위·주제를 기록하고 공개/대기/제외 처리
- `/api/research/sync?provider=nkis|law`: 수집 실행. GET은 기존 `CRON_SECRET`, POST는 검토용 토큰으로 인증
- `/api/research/daily`: 매일 아침 브리핑 생성·보관·텔레그램 발송

돌봄 아카이브의 수집 → 검토 → 사실 추출 → 편집 → 웹 보관 → 텔레그램 발송 구조를 사용합니다. 공식 보건복지부 RSS와 국내·일본·영국 Google News RSS, 최근 승인한 정책·연구 자료를 사용합니다. Gmail·Google 알리미 설정은 필요하지 않습니다. 자료의 확인 범위와 AI 편집 여부를 표시합니다.

## 기본 운영: Vercel 예약 작업

별도 Apps Script 설치 없이 사이트의 예약 작업으로 실행합니다. 아래 Apps Script 방식은 대체 수단으로만 보관하며 트리거를 함께 설치하지 않습니다.

| 작업 | 한국 시간 | 저장·공개 방식 |
|---|---|---|
| 법령 조회 | 매일 오전 6시 | 법률·시행령·시행규칙을 검토 대기로 저장 |
| NKIS 정책연구 조회 | 매주 월요일 오전 6시 15분 | 고립·은둔·가족돌봄 연구를 검토 대기로 저장 |
| 청년 정책 브리핑 | 매일 오전 7시 실행 시작 | 최초 본문 보관 → 전송 선점 → 청년 채널 발송 |

AI 처리·네트워크에 따라 실제 도착은 실행 시작 시각보다 늦을 수 있습니다. Vercel Production 배포에서만 cron이 실행되며, `YOUTH_BRIEFING_ENABLED=true`가 있어야 발송됩니다. Preview에서는 발송하지 않습니다.

사용하는 환경변수는 `.env.research.example`을 참고합니다. 로컬 설정은 실제 앱인 `C:\dev\soilab-youth\soilab-youth\.env.local`에 있습니다. `YOUTH_RESEARCH_REVIEW_TOKEN`을 검토함 접속 키에 입력합니다. 브라우저의 URL·localStorage에는 저장하지 않습니다.

브리핑 저장 인증의 기본 변수는 `BRIEFING_INGEST_TOKEN`입니다. 이전 `YOUTH_BRIEFING_INGEST_TOKEN`도 호환하며, 함께 설정할 때는 같은 값을 사용합니다. `CRON_SECRET`과 브리핑 토큰은 청년 서비스용으로 각각 독립 발급합니다. 루트 `.env.local`, 실제 앱 `.env.local`, Vercel의 값을 함께 변경한 뒤 재배포해야 적용됩니다. 돌봄 프로젝트의 토큰을 복사해 사용하지 않습니다.

`LAW_GO_KR_REFERER`는 돌봄 API에 등록된 호출 설정을 승계했습니다. 청년 사이트 주소로 임의 변경하면 API가 필수값 오류를 반환할 수 있습니다. 별도 등록을 변경한 경우 그 설정에 맞게 수정합니다. NKIS는 목록의 EUC-KR과 상세의 UTF-8, 상세 응답의 DOCTYPE을 처리합니다.

두 SQL 마이그레이션(`202609070001`, `202609070002`)은 2026-09-07 청년 Supabase에 적용했습니다. 최초 수집 결과는 연구 8건·법령 3건이며 모두 검토 대기입니다. 기존 검토문은 재수집으로 덮어쓰지 않습니다. 원자료가 바뀌면 공개를 해제하고 다시 검토하도록 표시합니다. 검토 중 원자료가 바뀐 경우 이전 버전에 대한 승인은 거부합니다.

2026-09-07 운영 사이트 배포와 세 예약 작업의 활성화를 확인했습니다. 첫 브리핑은 `https://t.me/soilab_youth_briefing/3`에 발송됐으며 `/research/briefings/2026-09-07`에 같은 본문을 보관했습니다. 첫 발행에서 발견한 제목·요약 연결 오류는 웹·텔레그램의 같은 메시지에서 정정했고, 개별 요약을 단일 자료에 묶도록 생성 구조를 수정했습니다. 운영 서버에서 법령 3건·연구 8건의 재수집도 성공했습니다.

수집은 검색어당 최대 2페이지(페이지당 50개), 연구 상세 최대 24건으로 제한합니다. 조회 실패와 상한 도달은 검토함의 수집 기록에 표시합니다. 상세 조회가 실패한 자료는 기존 초록을 지우지 않도록 저장에서 제외합니다. 발행연도만 제공되는 연구에 발행일을 만들어 넣지 않습니다. 법령 공포일과 시행일은 구분합니다.

수동 확인 명령(실제 앱 폴더에서 실행):

```powershell
npm run sync:research -- --report      # 조회만 수행, .local/research에 후보 목록 저장
npm run sync:research -- --write       # 검토 대기로 저장
node scripts/preview-research-briefing.mjs  # AI 미리보기, 저장·전송 없음
```

브리핑 원고는 `.local/research/briefing-preview.txt`에서 확인합니다. 출처 후보 최대 10건, 발행 최대 3건이며 최근 승인 자료는 후보 중 최대 2건입니다. 기존 연구는 ‘최근 검토자료·발행연도·신규 발표 아님’으로 표시합니다. 최근 30일 발송한 제목은 제외합니다.

KOSIS는 청년 연령대에 맞는 통계표 선정이 필요해 이번 자동 수집에는 포함하지 않았습니다. 돌봄용 NHIS 장기요양 통계와 NTIS 수집기도 복제하지 않았습니다.

## 대체 운영: Google Apps Script

기본 Vercel 예약 작업을 중지하고 Apps Script로 전환할 때만 아래를 사용합니다. 동일한 웹 보관함의 전송 선점을 공유하지만, 중복 AI 편집 비용을 피하기 위해 한 실행기만 운영합니다.

1. 청년 사이트의 Supabase SQL Editor에서 `supabase/migrations/202609070001_youth_policy_briefings.sql`을 실행합니다. 청년 프로젝트의 기존 모닝챌린지 테이블은 변경하지 않습니다.
2. Vercel의 `soilab-youth` 프로젝트에 `BRIEFING_INGEST_TOKEN`(32자 이상 임의 문자열), `YOUTH_BRIEFING_CHANNEL_URL`(실제 공개 채널의 `https://t.me/...`)을 등록합니다. 기존 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다.
3. 새 버전을 배포합니다.
4. 새 Google Apps Script 프로젝트를 만들고 `youth-policy-telegram.gs` 내용을 넣습니다. 프로젝트 시간대는 `Asia/Seoul`; 매니페스트를 편집할 경우 함께 제공한 `appsscript.json`을 사용합니다.
5. 프로젝트 설정 → 스크립트 속성에 아래 값을 넣습니다. 토큰을 소스코드에 넣지 않습니다.

| 속성 | 값 |
|---|---|
| `YOUTH_BRIEFING_API_URL` | `https://www.soilab-youth.kr/api/research/briefings` |
| `BRIEFING_INGEST_TOKEN` | Vercel과 동일한 전용 토큰. 이전 `YOUTH_BRIEFING_INGEST_TOKEN` 이름도 호환 |
| `TELEGRAM_BOT_TOKEN` | 청년 채널에 게시할 봇의 토큰 |
| `TELEGRAM_CHANNEL_ID` | 확정한 청년 채널 `@아이디` 또는 숫자 ID |
| `ANTHROPIC_API_KEY` | Anthropic 키 |
| `CLAUDE_MODEL` | 선택. 기본 `claude-sonnet-4-6` |

6. 해당 채널에서 봇을 관리자로 추가하고 게시 권한을 부여합니다.
7. `checkYouthBriefingSetup` 실행: DB 테이블·API 인증·봇의 게시 권한 확인. 메시지는 보내지 않습니다.
8. `previewYouthPolicyBriefing` 실행: 수집·AI 편집을 미리 확인. 저장·발송·이력 변경 없음. AI API 사용료는 발생합니다.
9. `sendYouthPolicyBriefing` 실행: 첫 발행을 웹과 텔레그램에서 확인합니다.
10. `createYouthDailyTrigger` 실행: 매일 오전 7시 전후 발송. 같은 함수를 다시 실행해도 이 스크립트의 청년 일간 트리거는 하나만 유지합니다.

Apps Script 시간 트리거는 분 단위 정시를 보장하지 않습니다. `nearMinute(0)`은 약 ±15분의 오차가 있으므로 오전 7시 전후로 안내합니다. 기존 오전 8시 다시봄 뉴스클리핑과 돌봄 채널의 트리거는 수정하지 않습니다.

## 운영 기준

- 최근 72시간 자료 중 30일 이력에 없는 제목을 선별합니다. 후보 최대 10개, 발행 최대 3개.
- 공식 자료의 도메인을 우선합니다. Google News 중계 링크는 공식 원문 확인으로 승격하지 않습니다.
- 수집원이 일부 실패하면 브리핑에 누락 범위를 표시합니다. 전부 실패하면 발행하지 않습니다.
- 새 후보가 없으면 수집 범위에서 새로 선별한 자료가 없다는 짧은 안내를 보냅니다. 오래된 자료를 새 소식으로 채우지 않습니다.
- AI는 ID 선택 → 자료별 단독 요약 → 전체 신호·검토 제안 순서로 실행합니다. 개별 요약 호출에 다른 자료를 함께 넣지 않으며 제목·URL 연결은 서버가 유지합니다. Google RSS의 관련기사 묶음은 본문으로 사용하지 않습니다. 모든 결과를 검토 완료 연구나 효과 입증으로 표시하지 않습니다.
- 하나의 텔레그램 메시지에 맞춰 최대 3,500자로 제한합니다. 초과·AI 오류는 전송 전에 중단합니다.
- 웹에는 원문 링크·메타데이터와 브리핑만 저장합니다. 원문 전문이나 상담기록을 저장하지 않습니다.
- API의 `POST`는 날짜별 최초 본문을 보존합니다. 같은 날 재실행해도 원문과 발행본을 덮어쓰지 않습니다.
- 전송 직전에 DB 상태를 원자적으로 `sending`으로 선점합니다. 응답이 불명확하면 자동 재전송을 중지해 중복 발송을 방지합니다.

## 전송 상태 복구

`pending` 또는 확실한 실패인 `failed` 상태만 전송 가능합니다. `sending`·`uncertain` 상태는 채널을 먼저 확인합니다.

- 실제 발송됐다면 Apps Script의 `youth_last_delivery`에서 날짜와 메시지 ID를 확인하고 DB의 `delivery_status=delivered`, `message_id`를 기록합니다.
- 실제 발송되지 않았음을 확인한 경우에만 해당 날짜 행을 `pending`으로 되돌리고 재실행합니다.
- 중지: `removeYouthDailyTrigger` 실행.

## 자료 검토·추가

최초 색인은 `src/data/research.ts`에서 관리합니다. 자동 수집 자료는 `/research/review`에서 검토하고 공개합니다. 요약·적용 방향·한계·확인 범위와 주제를 모두 채워야 공개할 수 있습니다. 승인 자료는 재배포 없이 자료실·주제 페이지와 최근 검토자료 피드에 반영됩니다. 수집 초록과 내부 검토 대기 행은 공개 API에 노출되지 않습니다.

브리핑 정정은 현재 날짜별 최초본을 보존하므로 자동 재생성으로 덮어쓰지 않습니다. 정정이 필요하면 운영자가 Supabase에서 해당 행의 본문과 요약을 수정하고, 텔레그램 원문도 함께 정정합니다.

## 검증

`soilab-youth`에서 `node --test tests/research.test.mjs tests/youth-policy-script.test.mjs`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

공식 문서: [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage), [Apps Script 시간 트리거](https://developers.google.com/apps-script/reference/script/clock-trigger-builder), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service).
