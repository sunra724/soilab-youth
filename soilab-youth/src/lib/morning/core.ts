export const MORNING_PROMISE_OPTIONS = [
  '물 한 잔 마시기',
  '창문 열고 숨 쉬기',
  '씻거나 세수하기',
  '식사 챙기기',
  '5분만 걷기',
] as const;

const SAFETY_SIGNAL_PATTERNS = [
  /죽고\s*싶/i,
  /자살/i,
  /나를\s*해치/i,
  /스스로\s*해치/i,
  /사라지고\s*싶/i,
  /끝내고\s*싶/i,
];

const ENCOURAGEMENTS: Record<string, string> = {
  '물 한 잔 마시기': '물 한 잔을 고른 마음이 오늘의 좋은 시작이에요. 천천히 한 모금이면 충분해요.',
  '창문 열고 숨 쉬기': '바깥 공기를 들이는 작은 선택이 멋져요. 잠깐 숨을 고르는 것만으로도 충분해요.',
  '씻거나 세수하기': '나를 돌보는 한 가지를 골랐네요. 전부가 아니라 가능한 만큼만 해도 좋아요.',
  '식사 챙기기': '오늘의 나에게 에너지를 건네는 선택이에요. 편한 음식 한 가지부터 챙겨봐요.',
  '5분만 걷기': '다섯 분이라는 작은 범위를 정한 게 좋아요. 문 앞까지만 가도 오늘의 실천으로 충분해요.',
};

export function sanitizeShortText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function hasSafetySignal(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 && SAFETY_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function createFallbackEncouragement(value: string) {
  const normalized = value.trim();

  if (ENCOURAGEMENTS[normalized]) {
    return ENCOURAGEMENTS[normalized];
  }

  return `“${normalized}”을 오늘의 작은 약속으로 정했네요. 완벽하게 해내지 않아도, 시작해 본 마음만으로 충분해요.`;
}

export function getKoreanDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.MORNING_PROGRAM_TIMEZONE || 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getKoreanTime(now = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: process.env.MORNING_PROGRAM_TIMEZONE || 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
