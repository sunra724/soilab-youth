import { deleteMorningSession } from '@/lib/morning/auth';

export async function POST() {
  await deleteMorningSession();
  return Response.json({ ok: true });
}
