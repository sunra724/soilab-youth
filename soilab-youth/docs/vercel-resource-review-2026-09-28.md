# Vercel runtime review — 2026-09-28

The supplied team Usage screenshot attributes 30m 19s (9.9%) of the displayed Fluid Active CPU to this project. This is historical usage, not a measurement of the changes below.

## Changes

- Newsletter detail pages generate on their first visit and reuse the rendered response for 600 seconds. Previously each visit rendered the page and queried Notion again; React `cache` only deduplicated work within one render.
- Card-news details generate on their first visit with 3600-second revalidation, matching the existing public-list cache. Detail lookup now uses that public collection list, so arbitrary Notion page IDs and unpublished cards cannot become public cached details.
- The existing authenticated revalidation endpoint explicitly invalidates card-news details as well as newsletters. The existing newsletter publishing endpoint already invalidates newsletter paths after publication.
- The five existing cron schedules remain unchanged. Member pages, consent/subscription endpoints and research review/publication flows remain dynamic.

## Production source preservation

The previous production deployment was uploaded from a working tree and included the published FKI seminar research note and evidence entry that were absent from `main`. These public changes were recovered using the deployment file hashes and preserved alongside the cache change. Existing `main` additions, including Naver site verification, remain present. The original local working tree was not modified.

## Validation

- 109 existing tests pass; Next.js production build and changed-file ESLint pass.
- `npm run test:cache` starts a local production server and verifies four public details, matching 1h/10m cache headers, repeat-request cache hits, canonical URLs, missing-item behavior, unauthorized invalidation rejection, and cache refresh after authenticated invalidation.
- Missing asynchronous newsletter lookups retain Next.js's existing streamed not-found response: the transport may be HTTP 200, with a not-found marker and `noindex`. This existed before the change.
- Local build environment lacks the optional youth-information API keys. Production verification must use the existing Vercel environment.

The monthly CPU reduction cannot be calculated from these checks. Compare daily project CPU usage for 24–48 hours after deployment under similar traffic, and use the team total when deciding whether the Hobby allowance is sufficient.
