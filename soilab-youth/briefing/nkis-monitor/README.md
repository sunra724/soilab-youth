# NKIS 알림: Slack → Telegram 전환 점검

이 폴더는 사용자가 제공한 2026-09-07 v5 코드의 교체용 v6.1이다. 기존 소이랩 전체 키워드와 NKIS 연구보고서 수집을 유지한다. 청년 홈페이지의 Vercel 브리핑과는 별도 Apps Script 프로젝트에서 사용한다.

현재 상태: 로컬 수정본 및 모의 검증 완료. 사용자의 Google Apps Script 프로젝트에는 아직 반영하지 않았고 실제 Telegram 테스트 메시지도 보내지 않았다.

## 1. 코드 교체와 속성 확인

1. [기존 NKIS Apps Script 프로젝트](https://script.google.com/home/projects/1wrGWGRhQ80QjKGKzE37KFwdhEyx1Ey_XGI89RXHyTfkMVqxvRNW-asCt/edit)를 연다. 기존 코드의 사본을 보관한다.
2. 기존 NKIS 코드 파일 내용을 이 폴더의 `Code.gs` 전체 내용으로 교체하고 저장한다. 기존 코드와 새 코드를 동시에 추가하면 같은 전역변수·함수가 중복되므로 한 버전만 둔다.
3. 왼쪽 **프로젝트 설정 → 스크립트 속성**에서 아래 값을 확인한다. 키·토큰은 코드 본문에 적지 않는다.

| 속성 | 값/의미 |
| --- | --- |
| `NKIS_API_KEY` | 기존 NKIS 키 유지 |
| `TELEGRAM_BOT_TOKEN` | 이번 NKIS 알림을 보낼 봇의 토큰 |
| `TELEGRAM_CHAT_ID` | 이번 NKIS 알림 채널/그룹/개인 채팅의 ID 또는 공개 채널 사용자명 |
| `NKIS_SHEET_ID` | 기존 발송기록 시트 ID 유지. v6.1은 앞뒤 공백과 Google Sheets URL도 처리. Apps Script 프로젝트 ID나 시트 탭의 gid가 아님 |
| `ANTHROPIC_API_KEY` | AI 초록 요약을 사용할 때 기존 키 유지. 없으면 제목·발행기관·연도·링크로 안내 |
| `ANTHROPIC_MODEL` | 선택. 기본값은 `claude-sonnet-4-6` |
| `NKIS_AUTOMATION_ENABLED` | 처음에는 `false`. 아래 실제 테스트 후 `true`로 변경 |

`NKIS_AUTOMATION_ENABLED`가 없거나 `true`가 아니면 기존 예약 트리거가 실행되어도 발송하지 않는다. 테스트 함수는 이 값이 `false`인 상태에서도 직접 실행할 수 있다. 청년 홈페이지의 `YOUTH_BRIEFING_*`, `CRON_SECRET` 등을 이 프로젝트에 복사할 필요는 없다.

프로젝트 시간대는 `Asia/Seoul`로 확인한다. 이 폴더의 `appsscript.json`은 독립 NKIS 프로젝트의 설정 참고 파일이다. 기존 매니페스트에 명시적 `oauthScopes`가 있으면 외부 요청과 스프레드시트 접근 범위를 포함한다. 다른 기능이 있는 프로젝트의 매니페스트를 통째로 덮어쓰지 않는다. Apps Script가 첫 실행에 권한 승인을 요청할 수 있다.

## 2. 실제 확인 순서

상단 함수 선택 목록에서 다음을 하나씩 실행한다. 앞 단계의 결과를 확인한 다음 넘어간다.

| 순서 | 실행할 함수 | 예상 결과 |
| --- | --- | --- |
| 1 | `previewNkisReports` | 발송 없이 NKIS 자료 조회. 이력을 읽을 수 있으면 미발송 건수·다음 최대 15건 표시. 이력이 미확인이면 후보만 표시하고 미발송 건수는 `null`. AI 호출과 시트 생성·기록 변경 없음 |
| 2 | `testTelegramConnection` | 설정한 채널에 연결 테스트 문구 1건 도착. 로그에 실제 메시지 ID. 보고서 발송기록은 그대로 유지 |
| 3 | `testNkisOneReport` | 현재 매칭된 보고서 중 1건에 ‘테스트’ 표시와 제목·출처·원문 링크가 포함된 메시지 도착. AI 키와 초록이 있으면 요약도 시도 |
| 4 | 속성을 `NKIS_AUTOMATION_ENABLED=true`로 변경한 뒤 `runNkisReportAlert` | 아직 처리하지 않은 자료 최대 15건 발송 후 해당 자료만 기존 발송기록에 추가. 신규 자료가 없으면 발송 생략 |
| 5 | `runNkisReportAlert` 한 번 더 실행 | 방금 보낸 자료는 다시 보내지 않음. 미처리 자료가 더 있으면 다음 최대 15건을 보낼 수 있음 |

보고서 테스트는 **기존 발송 여부와 관계없이** 1건을 선택하므로, Slack 시절에 이미 보낸 보고서도 테스트에 사용할 수 있다. 테스트 자체는 정규 ‘발송기록’에 보고서를 추가하지 않는다. 따라서 같은 자료가 이후 정규 발송 대상이면 한 번 더 도착할 수 있다.

연결 테스트가 실패하면 `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`와 해당 채널에서 봇의 게시 권한을 확인한다. 개인 대화라면 사용자가 먼저 봇 대화를 시작했는지도 확인한다. 실패 후 반복 실행하기 전에 아래 전송상태 표를 확인한다.

보고서 메시지에서 확인할 것은 제목과 요약의 일치, 출처·연도, 원문 링크의 정상 연결이다. `AI 초록 요약`과 `초록 요약 없음` 표시를 구분한다. 후자는 전송 실패가 아니라 초록 또는 AI 요약을 사용할 수 없어 서지정보만 안내한 상태다.

### `기존 NKIS_SHEET_ID를 열지 못했습니다` 오류

이 오류는 기존 발송기록 시트를 여는 단계의 실패다. 이 로그만으로 ID 오류, 파일 접근 권한, Apps Script의 OAuth 승인 누락 중 어느 것인지 확정할 수 없다.

속성이 이미 올바르게 등록되어 있다면 값을 반복해서 바꾸지 않는다. 우선 `diagnoseNkisSheetAccess`를 실행해 Google이 반환하는 원래 오류를 확인한다. 이 함수는 새 `Code.gs`에 포함되어 있으며 구버전 코드에 해당 함수 하나만 추가해도 실행된다. 스크립트 속성 전체나 API 키를 출력하지 않고 시트 읽기만 수행한다. 기존 일반 오류 문구는 발송 경로에서 유지하되, 두 시트 진단 함수에서는 원래 Sheets 예외를 가리지 않도록 수정했다.

1. 기존 `NKIS_연구보고서_알림_발송기록` 스프레드시트를 연다. URL `https://docs.google.com/spreadsheets/d/시트ID/edit`의 `시트ID` 부분을 스크립트 속성 `NKIS_SHEET_ID`와 대조한다. `script.google.com`의 프로젝트 ID와 URL 끝의 `gid`는 이 값으로 사용하지 않는다.
2. Apps Script를 실행하는 Google 계정으로 그 시트가 열리는지 확인한다. 정규 발송에는 기록을 저장할 편집 권한도 필요하다. 공유 설정은 실제 실행 계정에 필요한 권한을 확인하는 방식으로 처리한다.
3. 새 `Code.gs`를 저장한 뒤 `checkNkisTrackingSheet`를 실행한다. 성공하면 `status: readable`, 시트 URL과 기존 기록 ID 수가 출력된다. 이 함수는 시트를 생성하거나 기록을 수정하지 않는다.
4. 브라우저에서는 열리는데 진단 함수가 실패하면 프로젝트의 `appsscript.json`에 명시한 `oauthScopes`를 확인한다. 다른 범위를 유지하면서 `https://www.googleapis.com/auth/spreadsheets`가 포함되는지 확인하고, 함수를 다시 실행할 때 필요한 Sheets 접근을 승인한다. 계정의 파일 접근 권한과 스크립트 OAuth 승인은 별개다.
5. 진단이 성공한 뒤 `previewNkisReports`와 Telegram 테스트를 이어간다. 예약 트리거는 트리거를 만든 계정으로 실행되므로 그 계정의 권한도 확인한다.

v6.1 미리보기의 `historyStatus`는 `readable`(기록 확인), `unavailable`(접근 실패), `not_configured`(시트 속성 없음), `tab_missing`(발송기록 탭 없음)이다. 기록 미확인 시 `unseen: null`, `nextBatch: []`로 표시하고 `candidates`에 조회된 후보만 제공한다. 접근 실패를 모든 자료가 미발송이라는 뜻으로 취급하지 않는다. 실제 발송의 시트 접근 실패는 계속 중단되며, 기존 시트를 열지 못했다는 이유로 새 시트를 자동 생성하지 않는다.

근거: [Google Sheets ID와 openById](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openById(String)), [Apps Script 실행 계정과 승인](https://developers.google.com/apps-script/guides/services/authorization).

## 3. 발송 기록 확인

기존 스프레드시트에 두 탭을 사용한다.

- **발송기록**: 기존 7개 열을 유지한다. 정규 전송의 모든 조각이 성공한 뒤 그 배치의 보고서만 추가한다. 테스트는 추가하지 않는다.
- **텔레그램전송상태_v6**: 메시지 내용과 대상 자료를 전송 전에 저장한다. 조각별 진행 위치와 Telegram 메시지 ID를 기록한다. 분할 발송 중 실패했을 때 이미 성공한 조각을 다시 보내지 않기 위한 기록이다.

| STATUS | 의미와 처리 |
| --- | --- |
| `pending` | 전송 대기 또는 앞 조각의 성공이 저장된 상태. 다음 정규 실행은 남은 조각부터 처리 |
| `sending` | 요청 전에 기록한 상태. 실행이 여기서 종료됐다면 실제 채널을 확인할 때까지 자동 재발송 보류 |
| `uncertain` | 타임아웃·불명확한 응답 등으로 성공 여부를 모름. 실제 채널 확인 필요 |
| `rejected` | Telegram이 실패를 명시. 채널·봇 설정 등의 원인 수정 후 재시도 |
| `sent` | 모든 메시지 성공 확인 완료. 발송기록 저장이 중단됐으면 다음 정규 실행에서 기록만 복구 |
| `recorded` | 해당 작업 완료. 테스트 작업은 정규 발송기록 추가 없이 완료 |

현재 채널 ID가 대기 작업의 채널과 다르면 발송을 중단한다. 전송상태 탭의 JSON이나 진행 위치를 직접 수정하지 않는다.

### 실패·불명 결과 복구

1. 전송상태 탭의 가장 오래된 미완료 행과 채널의 실제 메시지를 대조한다. `NEXT_CHUNK`는 이미 성공이 확인된 조각 수다. `MESSAGE_IDS_JSON`은 확인된 메시지 ID 목록이다.
2. 해당 행의 `JOB_ID`를 스크립트 속성 `NKIS_RESOLVE_JOB_ID`에 입력한다.
3. 실패한 조각이 채널에 **없는 것을 확인**했거나, `rejected`의 원인을 수정했다면 `retryNkisDeliveryAfterChecking`을 실행한다. 해당 조각부터 다시 보내며 앞서 성공한 조각은 건너뛴다.
4. `sending`/`uncertain` 조각이 채널에 **도착한 것을 확인**했다면 그 메시지 ID를 `NKIS_CONFIRMED_MESSAGE_ID`에 입력하고 `confirmNkisChunkWasReceived`를 실행한다. 그 조각은 재발송하지 않고 이후 조각 또는 기록 저장으로 진행한다.

실제 수신 여부가 불분명하면 그대로 보류한다. Telegram 응답과 Google Sheets 저장은 하나의 트랜잭션이 아니므로, 네트워크 단절 시 완전한 자동 중복 방지를 보장한다고 표현하지 않는다. 모호한 상태는 사람이 채널을 확인하도록 설계했다.

## 4. 예약 확인과 이전 기록

테스트가 끝나면 왼쪽 **트리거**에서 기존 예약의 실행 함수가 `runNkisReportAlert`인지 확인한다. 같은 함수의 예약을 중복 생성하지 않는다. 실제 예약 실행 결과는 **실행 내역**, 채널 메시지, 전송상태·발송기록을 함께 대조한다. 한 번의 수동 성공만으로 예약 실행까지 확인했다고 보지 않는다.

기존 ‘발송기록’에는 Slack으로 보낸 자료가 들어 있을 수 있다. v6는 이 이력을 유지하므로 모두 Telegram에 재전송하지 않는다. 과거 오류로 잘못 기록된 항목도 자동 삭제하지 않는다. 과거 누락 여부는 실제 이전 메시지·기록을 비교해 별도로 확인해야 한다.

조회는 전년도~당해년도 목록의 앞 2페이지(최대 200건)로 제한되어 있다. 다음 실행 전에 자료가 이 범위 밖으로 밀려나면 놓칠 수 있다. 이번 수정은 발송 처리 오류를 고친 것이며 수집 범위를 전체 보고서로 확대한 것은 아니다.

## 검증과 근거

진단 보완 확인: 원래 Sheets 오류 전달과 구버전 코드에 독립적으로 추가 가능한 진단 함수 검증을 포함해 모의 테스트 21개가 통과했다. 화면에 속성 항목이 있다는 사실만으로 전체 ID 일치나 실행 계정의 Sheets 승인을 확정하지 않는다.

v6.1 추가 확인: 시트 접근 실패·미설정 상황에서도 수집 후보를 조회하되 미발송 수를 추정하지 않는지, Sheets URL·공백 정규화, 잘못된 주소/gid 차단, 읽기 진단의 무변경 동작을 검증했다. 기존 발송 검증을 포함한 모의 테스트 19개가 통과했다. Google 연결 계정에서는 기존 발송기록 시트와 ID 열을 실제로 읽었으며 시트 내용·공유 설정은 수정하지 않았다. Apps Script 실행 계정의 권한과 속성값 수정은 별도로 확인해야 한다.

로컬 모의 테스트는 `node --test tests/nkis-monitor-script.test.mjs`로 실행한다. 발송 대상 상한, 전송 거절·타임아웃·부분 성공, 성공 후 시트 저장 실패, 중복 방지, 테스트 모드, HTML 분할, AI 응답 누락 등을 확인한다. 모의 테스트는 Apps Script 계정 권한·현재 봇 설정·실제 예약 동작을 확인하는 테스트와 구분한다.

2026-09-07 확인 결과: 모의 테스트 15개, 테스트 파일 ESLint, Apps Script 코드 구문·매니페스트 JSON 검사가 통과했다. 로컬에 설정된 NKIS 키로 실제 2025~2026년 목록 2페이지를 조회해 모두 HTTP 200/EUC-KR 응답을 받았다. 해당 응답을 로컬 Apps Script 호환 어댑터에 넣어 새 미리보기 로직에서 키워드 매칭 6건을 확인했다. 이 확인에서는 사용자의 Google 발송기록 시트를 읽지 않았으므로 **6건이 모두 실제 미발송 자료라는 뜻은 아니다.** 원격 Apps Script의 키·계정 권한, XmlService 런타임, Telegram 수신과 예약 실행은 위 실제 테스트 순서로 확인해야 한다.

- [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage): 메시지 길이 제한과 성공 응답에 맞춰 전체 보고서 블록 단위로 분할하고 메시지 ID를 보관한다.
- [Google Apps Script LockService](https://developers.google.com/apps-script/reference/lock/lock-service): 수동 실행과 예약 실행이 겹칠 때 같은 자료를 처리하지 않도록 스크립트 잠금을 사용한다.
- [Anthropic 모델 지원 종료 안내](https://platform.claude.com/docs/en/about-claude/model-deprecations): Claude Sonnet 3.5 계열은 2025-10-28 지원 종료로 표시되어 있다. 제공 코드의 오래된 모델명 대신 현재 안내된 `claude-sonnet-4-6`를 기본값으로 사용한다.
