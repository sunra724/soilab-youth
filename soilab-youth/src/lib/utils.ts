export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10).replace(/-/g, '.');
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue:  { bg: '#E8F4FD', text: '#248DAC' },
  green: { bg: '#E6F4F1', text: '#228D7B' },
  navy:  { bg: '#ECEEF8', text: '#46549C' },
};

export function getThemeColor(color: string): string {
  return COLOR_MAP[color]?.text ?? COLOR_MAP.navy.text;
}

export function getBgColor(color: string): string {
  return COLOR_MAP[color]?.bg ?? COLOR_MAP.navy.bg;
}

const EMOJI_MAP: Record<string, string> = {
  blue:  '📰',
  green: '🌱',
  navy:  '📋',
};

export function getThumbnailEmoji(color: string): string {
  return EMOJI_MAP[color] ?? '📄';
}
