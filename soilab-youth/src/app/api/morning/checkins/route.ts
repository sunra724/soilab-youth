import { getMorningParticipant } from '@/lib/morning/auth';
import {
  getKoreanDate,
  getKoreanTime,
  hasSafetySignal,
  MORNING_PROMISE_OPTIONS,
  sanitizeShortText,
} from '@/lib/morning/core';
import { getMorningDashboard, type MorningCheckin } from '@/lib/morning/data';
import { morningDb } from '@/lib/morning/db';
import { createMorningEncouragement } from '@/lib/morning/encouragement';
import { enforceRateLimit, errorResponse, mapMorningError } from '@/lib/morning/http';

const SAFETY_GUIDE =
  '지금은 일반 응원보다 사람과 연결되는 안내가 먼저예요. 원한다면 소이랩 담당자에게 연결을 요청할 수 있어요.';

type CheckinWindowSetting = {
  value: { start?: string; end?: string; lateUntil?: string };
};

export async function POST(request: Request) {
  try {
    const participant = await getMorningParticipant();
    if (!participant) return errorResponse('다시 로그인해 주세요.', 401);

    const allowed = await enforceRateLimit(request, `checkin:${participant.id}`, 12, 3600);
    if (!allowed) return errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429);

    const body = (await request.json()) as Record<string, unknown>;
    const promiseText = sanitizeShortText(body.promise, 60);
    if (!promiseText) return errorResponse('오늘의 작은 약속을 골라 주세요.', 400);

    const isPreset = MORNING_PROMISE_OPTIONS.includes(
      promiseText as (typeof MORNING_PROMISE_OPTIONS)[number],
    );
    const settings = await morningDb<CheckinWindowSetting[]>(
      'morning_settings?key=eq.checkin_window&select=value&limit=1',
    );
    const window = settings[0]?.value;
    if (!window?.start || !window.end || !window.lateUntil) {
      return errorResponse('체크인 운영 시간이 설정되지 않았습니다. 담당자에게 알려 주세요.', 503);
    }
    const currentTime = getKoreanTime();
    const { start, end, lateUntil } = window;
    if (currentTime < start || currentTime > lateUntil) {
      return errorResponse(`체크인은 ${start}부터 ${lateUntil}까지 가능해요. 놓친 날에도 내일 다시 시작할 수 있어요.`, 400);
    }
    const checkinStatus = currentTime <= end ? 'valid' : 'late';
    const safetySignal = hasSafetySignal(promiseText);
    const dashboard = await getMorningDashboard(participant);
    const encouragement = safetySignal
      ? { text: SAFETY_GUIDE, source: 'safety-guide' as const }
      : await createMorningEncouragement(promiseText, dashboard.aiConsent);

    const rows = await morningDb<MorningCheckin[]>('morning_checkins', {
      method: 'POST',
      prefer: 'return=representation',
      body: JSON.stringify({
        participant_id: participant.id,
        checked_on: getKoreanDate(),
        checkin_status: checkinStatus,
        promise_kind: safetySignal ? 'withheld_safety_signal' : isPreset ? 'preset' : 'custom',
        promise_text: participant.retain_promises && !safetySignal ? promiseText : null,
        encouragement: participant.retain_promises && !safetySignal ? encouragement.text : null,
        encouragement_source: encouragement.source,
        safety_signal: safetySignal,
      }),
    });

    return Response.json({
      ok: true,
      checkin: rows[0],
      encouragement: encouragement.text,
      safetySignal,
    });
  } catch (error) {
    return mapMorningError(error);
  }
}
