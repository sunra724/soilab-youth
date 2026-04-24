This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 뉴스레터 자동화

`/api/collect-news`와 `/api/send-newsletter`는 매일 발송되는 `다시봄 뉴스클리핑` 자동화입니다. 고립은둔·사회적가치·청년지원 키워드로 뉴스를 수집하고, 매일 오전 8시(KST)에 자동 발송합니다. 소이랩 고립·은둔 청년 지원센터의 활동보고·행사 안내 같은 비정기 소식은 뉴스레터 페이지의 `기관 소식`으로 별도 구분합니다.

뉴스 수집은 매일 오전 7시 50분(KST)에 `/api/collect-news`로 실행되고, 발송은 매일 오전 8시(KST)에 `/api/send-newsletter`로 실행됩니다. Vercel cron은 UTC 기준이라 각각 `50 22 * * *`, `0 23 * * *`로 설정되어 있습니다. 발송 대상은 노션 후보 DB에서 `발송선택=true`, `발송완료=false`인 기사이며, 선택된 기사가 없으면 `NEWSLETTER_AUTO_SELECT_COUNT`만큼 최신 미발송 후보를 자동 선택합니다.

필요한 환경변수:

- `RESEND_API_KEY`: Resend API 키
- `RESEND_FROM`: 인증된 소이랩 도메인의 발신자 주소. 예: `소이랩 뉴스레터 <youth-news@soilabcoop.kr>`
- `RESEND_SEGMENT_ID`: 뉴스레터 구독자를 저장할 Resend segment ID
- `RESEND_AUDIENCE_ID`: 기존 audience를 계속 쓰는 경우의 호환 설정. `RESEND_SEGMENT_ID`가 있으면 segment를 우선 사용합니다.
- `NEWSLETTER_TO`: Resend segment/audience가 없을 때 쓰는 테스트/백업 수신자 목록
- `NEWSLETTER_REPLY_TO`: 답장 받을 주소. 없으면 `NEWSLETTER_UNSUBSCRIBE_EMAIL`을 사용합니다.
- `NEWSLETTER_UNSUBSCRIBE_EMAIL`: 수신거부 요청을 받을 주소. 없으면 `youth-news@soilabcoop.kr`을 사용합니다.
- `NEWSLETTER_UNSUBSCRIBE_SECRET`: 개인별 수신거부 링크 서명용 비밀값. 없으면 `CRON_SECRET`을 사용합니다.
- `NEWSLETTER_AUTO_SELECT_COUNT`: 발송선택된 기사가 없을 때 최신 미발송 후보를 자동 선택할 개수. 예: `5`
- `CRON_SECRET`: cron/API 보호용 bearer token

발송 전 점검:

```bash
curl -s https://soilab-youth.kr/api/send-newsletter \
  -H "Authorization: Bearer $CRON_SECRET"
```

응답의 `ready`가 `true`이면 선택 기사와 수신자가 모두 준비된 상태입니다. 실제 발송은 같은 endpoint에 `POST`로 호출합니다.
