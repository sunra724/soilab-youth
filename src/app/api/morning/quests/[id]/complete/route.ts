import { getMorningParticipant } from '@/lib/morning/auth';
import { getKoreanDate, isUuid } from '@/lib/morning/core';
import { morningRpc } from '@/lib/morning/db';
import { enforceRateLimit, errorResponse, mapMorningError } from '@/lib/morning/http';

type CompletionResult = {
  completion_id: string;
  reward_points: number;
  balance: number;
};

type QuestRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: QuestRouteContext) {
  try {
    const participant = await getMorningParticipant();
    if (!participant) return errorResponse('다시 로그인해 주세요.', 401);

    const { id } = await context.params;
    if (!isUuid(id)) return errorResponse('활동 정보를 확인해 주세요.', 400);

    const allowed = await enforceRateLimit(request, `quest:${participant.id}`, 30, 3600);
    if (!allowed) return errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429);

    const result = await morningRpc<CompletionResult>('morning_complete_quest', {
      p_participant_id: participant.id,
      p_quest_id: id,
      p_completed_on: getKoreanDate(),
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    return mapMorningError(error);
  }
}
