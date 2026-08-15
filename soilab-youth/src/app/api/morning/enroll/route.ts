import { createMorningSession, hashInviteCode } from '@/lib/morning/auth';
import { sanitizeShortText } from '@/lib/morning/core';
import { getMorningConfiguration, morningRpc } from '@/lib/morning/db';
import { enforceRateLimit, errorResponse, mapMorningError } from '@/lib/morning/http';

export async function POST(request: Request) {
  const config = getMorningConfiguration();
  if (!config.configured || !config.consentVersion) {
    return errorResponse('서비스 설정이 아직 완료되지 않았습니다.', 503);
  }

  try {
    const allowed = await enforceRateLimit(request, 'enroll', 8, 900);
    if (!allowed) return errorResponse('잠시 후 다시 시도해 주세요.', 429);

    const body = (await request.json()) as Record<string, unknown>;
    const inviteCode = sanitizeShortText(body.inviteCode, 32).toUpperCase();
    const nickname = sanitizeShortText(body.nickname, 20);
    const serviceConsent = body.serviceConsent === true;
    const privacyConsent = body.privacyConsent === true;
    const aiConsent = body.aiConsent === true;
    const retainPromises = body.retainPromises === true;

    if (inviteCode.length < 4 || nickname.length < 2) {
      return errorResponse('초대코드와 2자 이상의 닉네임을 확인해 주세요.', 400);
    }
    if (!serviceConsent || !privacyConsent) {
      return errorResponse('필수 동의 항목을 확인해 주세요.', 400);
    }

    const participantId = await morningRpc<string>('morning_enroll_participant', {
      p_code_hash: hashInviteCode(inviteCode),
      p_nickname: nickname,
      p_consent_version: config.consentVersion,
      p_ai_consent: aiConsent,
      p_retain_promises: retainPromises,
    });

    await createMorningSession(participantId);
    return Response.json({ ok: true });
  } catch (error) {
    return mapMorningError(error);
  }
}
