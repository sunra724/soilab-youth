// Vercel Cron only sends GET requests, while the public newsletter endpoint
// keeps GET as a dry-run check. Reuse the POST handler here so cron performs
// the real send without changing the safer manual dry-run behavior.
export { POST as GET } from '../route';

