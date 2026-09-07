import { getMorningParticipant } from '@/lib/morning/auth';
import { getMorningDashboard } from '@/lib/morning/data';
import { mapMorningError } from '@/lib/morning/http';

export async function GET() {
  try {
    const participant = await getMorningParticipant();
    if (!participant) return Response.json({ ok: false, message: '다시 로그인해 주세요.' }, { status: 401 });

    const data = await getMorningDashboard(participant);
    return Response.json({ ok: true, data });
  } catch (error) {
    return mapMorningError(error);
  }
}
