import { deleteMorningSession, getMorningParticipant } from '@/lib/morning/auth';
import { morningDb } from '@/lib/morning/db';
import { enforceRateLimit, errorResponse, mapMorningError } from '@/lib/morning/http';

export async function POST(request: Request) {
  try {
    const participant = await getMorningParticipant();
    if (!participant) return errorResponse('다시 로그인해 주세요.', 401);

    const allowed = await enforceRateLimit(request, `withdraw:${participant.id}`, 2, 86400);
    if (!allowed) return errorResponse('요청을 처리 중입니다. 잠시 후 다시 확인해 주세요.', 429);

    const participantPath = `morning_participants?id=eq.${participant.id}`;
    const relatedPath = `participant_id=eq.${participant.id}`;
    const withdrawnAt = new Date().toISOString();

    await morningDb(participantPath, {
      method: 'PATCH',
      body: JSON.stringify({
        nickname: '탈퇴한 참여자',
        retain_promises: false,
        status: 'withdrawn',
        withdrawn_at: withdrawnAt,
      }),
    });
    await morningDb(`morning_consents?${relatedPath}`, {
      method: 'PATCH',
      body: JSON.stringify({ withdrawn_at: withdrawnAt }),
    });
    await morningDb(`morning_checkins?${relatedPath}`, {
      method: 'PATCH',
      body: JSON.stringify({ promise_text: null, encouragement: null }),
    });
    await deleteMorningSession();

    return Response.json({ ok: true });
  } catch (error) {
    return mapMorningError(error);
  }
}
