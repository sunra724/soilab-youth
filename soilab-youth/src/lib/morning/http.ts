import 'server-only';

import { hashRateLimitKey } from './auth';
import { MorningDatabaseError, morningRpc } from './db';

export function errorResponse(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}
export function mapMorningError(error: unknown) {
  if (!(error instanceof MorningDatabaseError)) {
    return errorResponse('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.', 500);
  }

  const message = error.message;
  if (message.includes('INVALID_INVITE')) return errorResponse('초대코드를 확인해 주세요.', 400);
  if (message.includes('EXPIRED_INVITE')) return errorResponse('사용기간이 끝난 초대코드입니다.', 400);
  if (message.includes('EXHAUSTED_INVITE')) return errorResponse('사용 가능한 횟수를 모두 사용한 초대코드입니다.', 400);
  if (message.includes('ALREADY_COMPLETED')) return errorResponse('오늘 이미 완료한 활동입니다.', 409);
  if (error.code === '23505') return errorResponse('오늘의 체크인은 이미 기록되어 있습니다.', 409);
  if (error.code === 'NOT_CONFIGURED') return errorResponse('서비스 설정이 아직 완료되지 않았습니다.', 503);
  return errorResponse('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.', error.status >= 500 ? 500 : 400);
}

export async function enforceRateLimit(
  request: Request,
  action: string,
  limit: number,
  windowSeconds: number,
) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const keyHash = hashRateLimitKey(`${forwardedFor}:${userAgent}`);
  const allowed = await morningRpc<boolean>('morning_consume_rate_limit', {
    p_key_hash: keyHash,
    p_action: action,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  return allowed;
}
