interface NewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  category: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  고립은둔: '#46549C',
  청년지원: '#248DAC',
  사회적가치: '#228D7B',
  사회적경제: '#228D7B',
  기타: '#888888',
};

function categoryBadge(category: string) {
  const color = CATEGORY_COLOR[category] ?? CATEGORY_COLOR.기타;
  return `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;letter-spacing:.04em">${category}</span>`;
}

function newsCard(item: NewsItem) {
  return `
<tr>
  <td style="padding:0 0 18px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:18px 20px;background:#fff;border:1px solid #e8eaf0;border-radius:10px">
          <div style="margin-bottom:8px">${categoryBadge(item.category)}</div>
          <div style="margin-bottom:6px">
            <a href="${item.url}" target="_blank"
               style="font-size:15px;font-weight:700;color:#1a1f36;text-decoration:none;line-height:1.5">
              ${item.title}
            </a>
          </div>
          ${item.summary ? `<div style="font-size:13px;color:#555;line-height:1.7;margin-bottom:8px">${item.summary}</div>` : ''}
          <div style="font-size:12px;color:#aaa">${item.source}</div>
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
    previewText = '소이랩 다시봄 뉴스클리핑 - 고립은둔·사회적가치·청년지원 주요 뉴스를 전합니다.',
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
    #${category}
  </div>
</td></tr>
${categoryItems.map(newsCard).join('')}
`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>다시봄 뉴스클리핑 ${issueLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f8;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif">

<div style="display:none;max-height:0;overflow:hidden">${previewText}</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:32px 16px">
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
    <tr><td style="background:linear-gradient(135deg,#46549C 0%,#248DAC 100%);border-radius:14px 14px 0 0;padding:32px 32px 28px">
      <div style="display:inline-block;background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:.07em;margin-bottom:12px">
        ${issueLabel}
      </div>
      <div style="font-size:28px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:6px">
        다시봄 뉴스클리핑
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,.75)">
        고립은둔·사회적가치·청년지원 이슈를 모은 매일 뉴스 큐레이션
      </div>
    </td></tr>

    <tr><td style="background:#fff;padding:24px 32px 8px">
      <div style="font-size:14px;color:#444;line-height:1.8;border-left:3px solid #46549C;padding-left:14px">
        안녕하세요. 소이랩 다시봄 뉴스클리핑입니다.<br>
        고립은둔·사회적가치·청년지원 현장에서 알아두면 좋을 최신 뉴스를 정리해 전합니다.
      </div>
    </td></tr>

    <tr><td style="background:#f8f9fc;padding:24px 32px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${sections}
      </table>
    </td></tr>

    <tr><td style="background:#1a1f36;border-radius:0 0 14px 14px;padding:24px 32px">
      <div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.8">
        협동조합 소이랩 고립·은둔 청년 지원센터<br>
        대구광역시 북구 대현로 3, 2층(대현동)<br>
        053-941-9003 | youth-news@soilabcoop.kr<br>
        ${
          unsubscribeUrl
            ? `<a href="${unsubscribeUrl}" style="color:rgba(255,255,255,.7)">뉴스레터 수신거부</a><br>`
            : '수신을 원하지 않으시면 이 메일에 답장으로 알려주세요.<br>'
        }
        <a href="https://soilab-youth.kr" style="color:rgba(255,255,255,.7)">soilab-youth.kr</a>
      </div>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

export function buildEmailText(params: { issueLabel: string; items: NewsItem[]; unsubscribeUrl?: string }) {
  const lines = [
    `다시봄 뉴스클리핑 ${params.issueLabel}`,
    '협동조합 소이랩 | soilab-youth.kr',
    '',
  ];

  for (const item of params.items) {
    lines.push(`[${item.category}] ${item.title}`);
    if (item.summary) lines.push(item.summary);
    lines.push(item.url);
    lines.push('');
  }

  if (params.unsubscribeUrl) {
    lines.push('수신거부');
    lines.push(params.unsubscribeUrl);
    lines.push('');
  }

  lines.push('협동조합 소이랩 고립·은둔 청년 지원센터');
  lines.push('대구광역시 북구 대현로 3, 2층(대현동)');
  lines.push('053-941-9003 | youth-news@soilabcoop.kr');
  lines.push('soilab-youth.kr');

  return lines.join('\n');
}
