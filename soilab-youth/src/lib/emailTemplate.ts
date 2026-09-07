import {
  SOILAB_COUNSELING_NOTICE,
  SUPPORT_RESOURCES,
} from '../config/supportResources.js';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  고립은둔: '#46549C',
  청년지원: '#248DAC',
  기타: '#888888',
};

const COPYRIGHT_NOTICE = [
  '본 클리핑은 각 언론사가 공개한 기사의 제목과 원문 링크만을 안내합니다.',
  '기사의 저작권은 각 언론사에 있으며, 본문은 원문 링크에서 확인해 주세요.',
] as const;

const COUNSELING_NOTICE = [
  '힘든 시간을 보내고 계신다면 혼자 견디지 않으셔도 됩니다.',
  `· ${SUPPORT_RESOURCES.suicidePrevention.label} ${SUPPORT_RESOURCES.suicidePrevention.phone} (${SUPPORT_RESOURCES.suicidePrevention.detail})`,
  `· ${SUPPORT_RESOURCES.mentalHealthCrisis.label} ${SUPPORT_RESOURCES.mentalHealthCrisis.phone} (${SUPPORT_RESOURCES.mentalHealthCrisis.detail})`,
  `· ${SUPPORT_RESOURCES.healthAndWelfare.label} ${SUPPORT_RESOURCES.healthAndWelfare.phone} (${SUPPORT_RESOURCES.healthAndWelfare.detail})`,
  `· ${SUPPORT_RESOURCES.institutionSearch.label}: ${SUPPORT_RESOURCES.institutionSearch.href}`,
  SOILAB_COUNSELING_NOTICE,
] as const;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.toString()) : '';
  } catch {
    return '';
  }
}

function formatPublishedAt(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function categoryBadge(category: string) {
  const color = CATEGORY_COLOR[category] ?? CATEGORY_COLOR.기타;
  return `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:.04em">${escapeHtml(category)}</span>`;
}

function newsCard(item: NewsItem) {
  const metadata = [item.source, formatPublishedAt(item.publishedAt)]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' · ');
  const articleUrl = safeUrl(item.url);

  return `
<tr>
  <td style="padding:0 0 18px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:18px 20px;background:#fff;border:1px solid #e8eaf0;border-radius:10px">
          <div style="margin-bottom:8px">${categoryBadge(item.category)}</div>
          <div style="margin-bottom:7px">
            <a href="${articleUrl}" target="_blank" rel="noopener noreferrer"
               style="font-size:15px;font-weight:700;color:#1a1f36;text-decoration:none;line-height:1.5">
              ${escapeHtml(item.title)}
            </a>
          </div>
          <div style="font-size:12px;color:#7b8190">${metadata}</div>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

export function buildEmailHtml(params: {
  issueLabel: string;
  items: NewsItem[];
  previewText?: string;
  unsubscribeUrl?: string;
}) {
  const {
    issueLabel,
    items,
    previewText = '다시봄 뉴스클리핑 - 고립·은둔 청년과 회복 지원 현장의 주요 보도를 전합니다.',
    unsubscribeUrl,
  } = params;

  const byCategory: Record<string, NewsItem[]> = {};
  for (const item of items) {
    const category = item.category || '기타';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(item);
  }

  const sections = Object.entries(byCategory)
    .map(
      ([category, categoryItems]) => `
<tr><td style="padding:0 0 6px">
  <div style="font-size:13px;font-weight:700;color:${CATEGORY_COLOR[category] ?? CATEGORY_COLOR.기타};letter-spacing:.05em;padding-bottom:10px;border-bottom:2px solid ${CATEGORY_COLOR[category] ?? CATEGORY_COLOR.기타};margin-bottom:16px">
    #${escapeHtml(category)}
  </div>
</td></tr>
${categoryItems.map(newsCard).join('')}
`
    )
    .join('');

  const unsubscribeLink = unsubscribeUrl ? safeUrl(unsubscribeUrl) : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>다시봄 뉴스클리핑 ${escapeHtml(issueLabel)}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f8;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif">

<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:32px 16px">
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
    <tr><td style="background:#248DAC;border-radius:14px 14px 0 0;padding:32px 32px 28px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;mso-table-lspace:0;mso-table-rspace:0">
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;color:#248DAC;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:.07em">
            ${escapeHtml(issueLabel)}
          </td>
        </tr>
      </table>
      <div style="font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;margin-bottom:6px">
        다시봄 뉴스클리핑
      </div>
      <div style="font-size:13px;color:#ffffff">
        고립·은둔 청년과 회복 지원 현장을 위한 뉴스 큐레이션
      </div>
    </td></tr>

    <tr><td style="background:#fff;padding:24px 32px 8px">
      <div style="font-size:14px;color:#444;line-height:1.8;border-left:3px solid #46549C;padding-left:14px">
        안녕하세요. 소이랩 다시봄 뉴스클리핑입니다.<br>
        등록 언론사의 관련 보도 중 오늘 확인할 소식만 골라 원문으로 안내합니다.
      </div>
    </td></tr>

    <tr><td style="background:#f8f9fc;padding:24px 32px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${sections}
      </table>
    </td></tr>

    <tr><td style="background:#fff8ed;border-top:1px solid #f4dfbd;padding:20px 32px">
      <div style="font-size:12px;color:#694b25;line-height:1.8">
        <strong>${escapeHtml(COUNSELING_NOTICE[0])}</strong><br>
        ${COUNSELING_NOTICE.slice(1).map(escapeHtml).join('<br>')}
      </div>
    </td></tr>

    <tr><td style="background:#eef7f9;border-top:1px solid #d8e9ee;border-radius:0 0 14px 14px;padding:24px 32px">
      <div style="font-size:11px;color:#52616b;line-height:1.8;margin-bottom:14px">
        ${COPYRIGHT_NOTICE.map(escapeHtml).join('<br>')}
      </div>
      <div style="font-size:12px;color:#334155;line-height:1.8">
        협동조합 소이랩<br>
        대구광역시 북구 대현로 3, 2층(대현동)<br>
        뉴스레터 문의: youth-news@soilabcoop.kr<br>
        ${
          unsubscribeLink
            ? `<a href="${unsubscribeLink}" style="color:#1f6f8b;text-decoration:underline">뉴스레터 수신거부</a><br>`
            : '수신을 원하지 않으시면 이 메일에 답장으로 알려주세요.<br>'
        }
        <a href="https://www.soilab-youth.kr" style="color:#1f6f8b;text-decoration:underline">www.soilab-youth.kr</a>
      </div>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

export function buildEmailText(params: {
  issueLabel: string;
  items: NewsItem[];
  unsubscribeUrl?: string;
}) {
  const lines = [
    `다시봄 뉴스클리핑 ${params.issueLabel}`,
    '협동조합 소이랩 | www.soilab-youth.kr',
    '',
  ];

  for (const item of params.items) {
    lines.push(`[${item.category}] ${item.title}`);
    lines.push([item.source, formatPublishedAt(item.publishedAt)].filter(Boolean).join(' · '));
    lines.push(item.url);
    lines.push('');
  }

  lines.push(...COUNSELING_NOTICE, '', ...COPYRIGHT_NOTICE, '');

  if (params.unsubscribeUrl) {
    lines.push('수신거부', params.unsubscribeUrl, '');
  }

  lines.push('협동조합 소이랩');
  lines.push('대구광역시 북구 대현로 3, 2층(대현동)');
  lines.push('뉴스레터 문의: youth-news@soilabcoop.kr');
  lines.push('www.soilab-youth.kr');

  return lines.join('\n');
}
