export interface TelegramNewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
}

export type TelegramSkipReason =
  | 'disabled'
  | 'test-chat-not-configured'
  | 'empty-digest';

export interface TelegramSendResult {
  skipped: boolean;
  messageIds: number[];
  reason?: TelegramSkipReason;
}

export type TelegramTarget =
  | { enabled: false; reason: 'disabled' | 'test-chat-not-configured' }
  | { enabled: true; token: string; chatId: string };

const TELEGRAM_MESSAGE_LIMIT = 3_500;
const ARTICLE_BLOCK_LIMIT = 2_800;
const NEWSLETTER_URL = 'https://www.soilab-youth.kr/newsletter';

function truncateText(value: string, maxLength: number) {
  const characters = Array.from(value.trim());
  if (characters.length <= maxLength) {
    return characters.join('');
  }

  return `${characters.slice(0, Math.max(0, maxLength - 1)).join('')}…`;
}

export function escapeTelegramHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeTelegramUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    const normalized = url.toString();
    return normalized.length <= 600 ? normalized : null;
  } catch {
    return null;
  }
}

export function resolveTelegramChannelUrl(env: NodeJS.ProcessEnv = process.env) {
  const configuredUrl = env.TELEGRAM_CHANNEL_URL?.trim();
  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      return url.protocol === 'https:' && url.hostname === 't.me'
        ? url.toString()
        : null;
    } catch {
      return null;
    }
  }

  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  return chatId && /^@[A-Za-z0-9_]{5,}$/u.test(chatId)
    ? `https://t.me/${chatId.slice(1)}`
    : null;
}

function categoryHashtag(value: string) {
  const normalized = truncateText(value, 40).replace(/[^\p{L}\p{N}_]/gu, '');
  return normalized ? `#${normalized}` : '';
}

function formatArticleBlock(
  item: TelegramNewsItem,
  index: number,
  options: { includeSummary: boolean; includeLink: boolean },
) {
  const title = escapeTelegramHtml(truncateText(item.title || '제목 없음', 140));
  const source = escapeTelegramHtml(truncateText(item.source, 80));
  const hashtag = escapeTelegramHtml(categoryHashtag(item.category));
  const summary = options.includeSummary
    ? escapeTelegramHtml(truncateText(item.summary, 240))
    : '';
  const url = options.includeLink ? safeTelegramUrl(item.url) : null;
  const metadata = [source, hashtag].filter(Boolean).join(' · ');

  return [
    `<b>${index}. ${title}</b>`,
    metadata ? `<i>${metadata}</i>` : '',
    summary,
    url ? `<a href="${escapeTelegramHtml(url)}">원문 보기</a>` : '',
  ].filter(Boolean).join('\n');
}

function articleBlock(item: TelegramNewsItem, index: number) {
  let block = formatArticleBlock(item, index, { includeSummary: true, includeLink: true });
  if (block.length <= ARTICLE_BLOCK_LIMIT) {
    return block;
  }

  block = formatArticleBlock(item, index, { includeSummary: false, includeLink: true });
  if (block.length <= ARTICLE_BLOCK_LIMIT) {
    return block;
  }

  return formatArticleBlock(item, index, { includeSummary: false, includeLink: false });
}

function messageHeader(issueLabel: string, part?: { current: number; total: number }) {
  const partLabel = part ? ` (${part.current}/${part.total})` : '';
  return `<b>다시봄 뉴스클리핑${partLabel}</b>\n${escapeTelegramHtml(truncateText(issueLabel, 80))}`;
}

function messageFooter() {
  return `고립·은둔 청년지원센터 다시봄\n<a href="${NEWSLETTER_URL}">지난 뉴스 보기</a>`;
}

export function buildTelegramMessages(params: {
  issueLabel: string;
  items: TelegramNewsItem[];
}) {
  if (params.items.length === 0) {
    return [];
  }

  const blocks = params.items.map(articleBlock);
  const headerReserve = messageHeader(params.issueLabel, {
    current: params.items.length,
    total: params.items.length,
  }).length;
  const bodyLimit = TELEGRAM_MESSAGE_LIMIT - headerReserve - messageFooter().length - 8;
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const block of blocks) {
    const separatorLength = currentChunk.length > 0 ? 2 : 0;
    if (currentChunk.length > 0 && currentLength + separatorLength + block.length > bodyLimit) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentLength = 0;
    }

    currentChunk.push(block);
    currentLength += (currentChunk.length > 1 ? 2 : 0) + block.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.map((chunk, index) => {
    const part = chunks.length > 1
      ? { current: index + 1, total: chunks.length }
      : undefined;
    const footer = index === chunks.length - 1 ? `\n\n${messageFooter()}` : '';
    const message = `${messageHeader(params.issueLabel, part)}\n\n${chunk.join('\n\n')}${footer}`;

    if (message.length > TELEGRAM_MESSAGE_LIMIT) {
      throw new Error('텔레그램 메시지 길이 제한을 초과했습니다.');
    }

    return message;
  });
}

export function resolveTelegramTarget(
  testMode: boolean,
  env: NodeJS.ProcessEnv = process.env,
): TelegramTarget {
  if (env.TELEGRAM_ENABLED !== 'true') {
    return { enabled: false, reason: 'disabled' };
  }

  if (testMode && !env.TELEGRAM_TEST_CHAT_ID) {
    return { enabled: false, reason: 'test-chat-not-configured' };
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = testMode ? env.TELEGRAM_TEST_CHAT_ID : env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error(
      testMode
        ? 'TELEGRAM_BOT_TOKEN 또는 TELEGRAM_TEST_CHAT_ID가 설정되지 않았습니다.'
        : 'TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID가 설정되지 않았습니다.',
    );
  }

  return { enabled: true, token, chatId };
}

function telegramErrorDescription(payload: unknown) {
  if (
    payload
    && typeof payload === 'object'
    && 'description' in payload
    && typeof payload.description === 'string'
  ) {
    return payload.description;
  }

  return '알 수 없는 오류';
}

function telegramMessageId(payload: unknown) {
  if (
    payload
    && typeof payload === 'object'
    && 'ok' in payload
    && payload.ok === true
    && 'result' in payload
    && payload.result
    && typeof payload.result === 'object'
    && 'message_id' in payload.result
    && typeof payload.result.message_id === 'number'
  ) {
    return payload.result.message_id;
  }

  return null;
}

export async function sendTelegramDigest(params: {
  issueLabel: string;
  items: TelegramNewsItem[];
  testMode?: boolean;
}): Promise<TelegramSendResult> {
  const target = resolveTelegramTarget(Boolean(params.testMode));
  if (!target.enabled) {
    return { skipped: true, messageIds: [], reason: target.reason };
  }

  const messages = buildTelegramMessages(params);
  if (messages.length === 0) {
    return { skipped: true, messageIds: [], reason: 'empty-digest' };
  }

  const messageIds: number[] = [];
  for (const message of messages) {
    const response = await fetch(`https://api.telegram.org/bot${target.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: target.chatId,
        text: message,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const payload: unknown = await response.json().catch(() => null);
    const messageId = telegramMessageId(payload);

    if (!response.ok || messageId === null) {
      throw new Error(
        `텔레그램 발송 실패 (${response.status}): ${telegramErrorDescription(payload)}`,
      );
    }

    messageIds.push(messageId);
  }

  return { skipped: false, messageIds };
}
