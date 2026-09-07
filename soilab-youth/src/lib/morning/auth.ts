import 'server-only';

import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { getMorningConfiguration, morningDb } from './db';

const SESSION_COOKIE = 'soilab_morning_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SessionRow = {
  id: string;
  participant_id: string;
  expires_at: string;
};

export type MorningParticipant = {
  id: string;
  nickname: string;
  retain_promises: boolean;
  created_at: string;
};

function digest(value: string) {
  const secret = getMorningConfiguration().sessionSecret;
  if (!secret) throw new Error('MORNING_SESSION_SECRET is required');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function hashInviteCode(value: string) {
  return digest(`invite:${value.trim().toUpperCase()}`);
}

export function hashRateLimitKey(value: string) {
  return digest(`rate:${value}`);
}

export async function createMorningSession(participantId: string) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = digest(`session:${token}`);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await morningDb('morning_sessions', {
    method: 'POST',
    body: JSON.stringify({
      participant_id: participantId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    }),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: 'high',
  });
}

export async function getMorningParticipant(): Promise<MorningParticipant | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !getMorningConfiguration().configured) return null;

  const tokenHash = digest(`session:${token}`);
  const sessions = await morningDb<SessionRow[]>(
    `morning_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}&expires_at=gt.${encodeURIComponent(
      new Date().toISOString(),
    )}&select=id,participant_id,expires_at&limit=1`,
  );
  const session = sessions[0];
  if (!session) return null;

  const participants = await morningDb<MorningParticipant[]>(
    `morning_participants?id=eq.${session.participant_id}&status=eq.active&select=id,nickname,retain_promises,created_at&limit=1`,
  );
  return participants[0] || null;
}

export async function deleteMorningSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && getMorningConfiguration().configured) {
    const tokenHash = digest(`session:${token}`);
    await morningDb(`morning_sessions?token_hash=eq.${encodeURIComponent(tokenHash)}`, {
      method: 'DELETE',
    }).catch(() => undefined);
  }

  cookieStore.delete(SESSION_COOKIE);
}
