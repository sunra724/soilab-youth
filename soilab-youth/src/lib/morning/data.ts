import 'server-only';

import { getKoreanDate } from './core';
import { morningCount, morningDb } from './db';

export type MorningCheckin = {
  id: string;
  checked_on: string;
  checkin_status: 'valid' | 'late';
  promise_kind: string;
  promise_text: string | null;
  encouragement: string | null;
  safety_signal: boolean;
  created_at: string;
};

export type MorningQuest = {
  id: string;
  category: string;
  title: string;
  description: string;
  estimated_minutes: number;
  reward_points: number;
  sort_order: number;
};

export type MorningQuestCompletion = {
  id: string;
  quest_id: string;
  completed_on: string;
  created_at: string;
};

type PointEntry = { amount: number };
type ConsentRow = { consent_type: string; granted: boolean; withdrawn_at: string | null };
type SupportRow = { id: string; status: string; created_at: string };

export type MorningDashboardData = {
  today: string;
  nickname: string;
  retainPromises: boolean;
  aiConsent: boolean;
  todayCheckin: MorningCheckin | null;
  checkins: MorningCheckin[];
  quests: MorningQuest[];
  completions: MorningQuestCompletion[];
  points: number;
  totalCheckins: number;
  totalCompletions: number;
  latestSupportRequest: SupportRow | null;
};

export async function getMorningDashboard(
  participant: { id: string; nickname: string; retain_promises: boolean },
): Promise<MorningDashboardData> {
  const today = getKoreanDate();
  const [
    checkins,
    quests,
    completions,
    pointEntries,
    consents,
    supportRequests,
    totalCheckins,
    totalCompletions,
  ] = await Promise.all([
    morningDb<MorningCheckin[]>(
      `morning_checkins?participant_id=eq.${participant.id}&select=id,checked_on,checkin_status,promise_kind,promise_text,encouragement,safety_signal,created_at&order=checked_on.desc&limit=14`,
    ),
    morningDb<MorningQuest[]>(
      'morning_quests?active=is.true&select=id,category,title,description,estimated_minutes,reward_points,sort_order&order=sort_order.asc',
    ),
    morningDb<MorningQuestCompletion[]>(
      `morning_quest_completions?participant_id=eq.${participant.id}&select=id,quest_id,completed_on,created_at&order=created_at.desc&limit=40`,
    ),
    morningDb<PointEntry[]>(
      `morning_point_ledger?participant_id=eq.${participant.id}&select=amount`,
    ),
    morningDb<ConsentRow[]>(
      `morning_consents?participant_id=eq.${participant.id}&select=consent_type,granted,withdrawn_at`,
    ),
    morningDb<SupportRow[]>(
      `morning_support_requests?participant_id=eq.${participant.id}&select=id,status,created_at&order=created_at.desc&limit=1`,
    ),
    morningCount(`morning_checkins?participant_id=eq.${participant.id}&select=id`),
    morningCount(`morning_quest_completions?participant_id=eq.${participant.id}&select=id`),
  ]);

  return {
    today,
    nickname: participant.nickname,
    retainPromises: participant.retain_promises,
    aiConsent: Boolean(
      consents.find((item) => item.consent_type === 'ai_optional' && !item.withdrawn_at)?.granted,
    ),
    todayCheckin: checkins.find((item) => item.checked_on === today) || null,
    checkins,
    quests,
    completions,
    points: pointEntries.reduce((sum, item) => sum + item.amount, 0),
    totalCheckins,
    totalCompletions,
    latestSupportRequest: supportRequests[0] || null,
  };
}
