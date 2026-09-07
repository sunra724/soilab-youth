import 'server-only';

export class MorningDatabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export function getMorningConfiguration() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.MORNING_SESSION_SECRET;
  const consentVersion = process.env.MORNING_CONSENT_VERSION;

  return {
    configured: Boolean(url && serviceRoleKey && sessionSecret && consentVersion),
    url,
    serviceRoleKey,
    sessionSecret,
    consentVersion,
  };
}

export async function morningDb<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const config = getMorningConfiguration();

  if (!config.url || !config.serviceRoleKey) {
    throw new MorningDatabaseError('모닝챌린지 데이터베이스가 설정되지 않았습니다.', 503, 'NOT_CONFIGURED');
  }

  const { prefer, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  headers.set('apikey', config.serviceRoleKey);
  headers.set('Authorization', `Bearer ${config.serviceRoleKey}`);
  headers.set('Content-Type', 'application/json');
  if (prefer) headers.set('Prefer', prefer);

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...requestInit,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { code?: string; message?: string; details?: string }
      | null;
    throw new MorningDatabaseError(
      body?.message || '데이터 처리 중 오류가 발생했습니다.',
      response.status,
      body?.code,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function morningRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  return morningDb<T>(`rpc/${name}`, {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

export async function morningCount(path: string): Promise<number> {
  const config = getMorningConfiguration();
  if (!config.url || !config.serviceRoleKey) {
    throw new MorningDatabaseError('모닝챌린지 데이터베이스가 설정되지 않았습니다.', 503, 'NOT_CONFIGURED');
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: 'HEAD',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Prefer: 'count=exact',
      Range: '0-0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new MorningDatabaseError('참여 기록 수를 확인하지 못했습니다.', response.status);
  }

  const total = response.headers.get('content-range')?.split('/')[1];
  return total && total !== '*' ? Number.parseInt(total, 10) : 0;
}
