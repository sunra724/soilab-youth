import { getMorningParticipant } from '@/lib/morning/auth';
import { morningDb } from '@/lib/morning/db';
import { enforceRateLimit, errorResponse, mapMorningError } from '@/lib/morning/http';

type SupportRow = { id: string; status: string; created_at: string };

export async function POST(request: Request) {
  try {
    const participant = await getMorningParticipant();
    if (!participant) return errorResponse('다시 로그인해 주세요.', 401);

    const allowed = await enforceRateLimit(request, `support:${participant.id}`, 3, 86400);
    if (!allowed) return errorResponse('담당자 연결 요청이 이미 접수되었거나 요청 횟수를 초과했습니다.', 429);

    const existing = await morningDb<SupportRow[]>(
      `morning_support_requests?participant_id=eq.${participant.id}&status=in.(requested,reviewing)&select=id,status,created_at&limit=1`,
    );
    if (existing[0]) return errorResponse('확인 중인 담당자 연결 요청이 있습니다.', 409);

    const rows = await morningDb<SupportRow[]>('morning_support_requests', {
      method: 'POST',
      prefer: 'return=representation',
      body: JSON.stringify({
        participant_id: participant.id,
        request_type: 'participant_requested',
        status: 'requested',
      }),
    });

    return Response.json({ ok: true, request: rows[0] });
  } catch (error) {
    return mapMorningError(error);
  }
}
