// Server/CLI only. The service-account private key never leaves the OAuth signing step.
import { createSign } from 'node:crypto';
import { entryIdentity, entryWrites, ITEM_HEADERS, RUN_HEADERS, type PendingEntry } from './ledger-core.ts';

type Env = Record<string, string | undefined>;
type Sheet = { properties: { sheetId: number; title: string; gridProperties: { rowCount: number; columnCount: number } };
  tables?: { tableId: string; range: { endRowIndex: number; endColumnIndex: number } }[] };
type Metadata = { properties: { timeZone: string }; sheets: Sheet[] };
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export function sheetsCredentialsAvailable(env: Env = process.env) {
  return Boolean(env.YOUTH_LEDGER_GOOGLE_SERVICE_ACCOUNT_JSON?.trim());
}
function account(env: Env) {
  try {
    const value = JSON.parse(env.YOUTH_LEDGER_GOOGLE_SERVICE_ACCOUNT_JSON || '');
    if (value.type !== 'service_account' || !/^[^@\s]+@[^@\s]+\.gserviceaccount\.com$/.test(value.client_email)
      || typeof value.private_key !== 'string' || !value.private_key.includes('PRIVATE KEY')) throw new Error();
    return { email: value.client_email as string, key: value.private_key as string };
  } catch { throw new Error('ledger_google_credentials_invalid'); }
}
function base64(value: unknown) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }

export function createSheetsClient(env: Env = process.env, fetcher: typeof fetch = fetch, now = () => new Date()) {
  const spreadsheetId = env.YOUTH_LEDGER_SHEET_ID || '';
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(spreadsheetId)) throw new Error('ledger_sheet_id_invalid');
  let accessToken: Promise<string> | undefined;
  async function token() {
    return accessToken ??= (async () => {
      const credentials = account(env);
      const issued = Math.floor(now().getTime() / 1000);
      const unsigned = base64({ alg: 'RS256', typ: 'JWT' }) + '.' + base64({
        iss: credentials.email, scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: TOKEN_URL, iat: issued, exp: issued + 3600,
      });
      let signature: string;
      try { signature = createSign('RSA-SHA256').update(unsigned).sign(credentials.key, 'base64url'); }
      catch { throw new Error('ledger_google_credentials_invalid'); }
      let response: Response;
      try { response = await fetcher(TOKEN_URL, { method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + signature }),
        cache: 'no-store', signal: AbortSignal.timeout(12000) }); }
      catch { throw new Error('ledger_google_auth_unavailable'); }
      if (!response.ok) throw new Error('ledger_google_auth_' + response.status);
      const data = await response.json().catch(() => null);
      if (typeof data?.access_token !== 'string') throw new Error('ledger_google_auth_invalid');
      return data.access_token as string;
    })();
  }
  async function api<T>(suffix: string, method = 'GET', body?: unknown): Promise<T> {
    const bearer = await token();
    let response: Response;
    try { response = await fetcher('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + suffix, {
      method, headers: { Authorization: 'Bearer ' + bearer, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000),
    }); } catch { throw new Error('ledger_sheets_unavailable'); }
    if (!response.ok) throw new Error('ledger_sheets_http_' + response.status);
    try { return await response.json() as T; }
    catch { throw new Error('ledger_sheets_invalid_response'); }
  }
  async function values(ranges: string[]) {
    const query = new URLSearchParams({ valueRenderOption: 'UNFORMATTED_VALUE', dateTimeRenderOption: 'SERIAL_NUMBER' });
    for (const range of ranges) query.append('ranges', range);
    const result = await api<{ valueRanges: { values?: unknown[][] }[] }>('/values:batchGet?' + query);
    if (!Array.isArray(result.valueRanges) || result.valueRanges.length !== ranges.length) throw new Error('ledger_sheets_invalid_response');
    return result.valueRanges.map(range => range.values || []);
  }
  return {
    async write(entries: PendingEntry[]) {
      const metadata = await api<Metadata>('?fields=properties(timeZone),sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)),tables(tableId,range))');
      if (metadata.properties?.timeZone !== 'Asia/Seoul') throw new Error('ledger_sheet_timezone_mismatch');
      const sheets = Object.fromEntries(metadata.sheets.map(sheet => [sheet.properties.title, sheet]));
      for (const name of ['items', 'source_runs', 'config']) if (!sheets[name]) throw new Error('ledger_sheet_tab_missing');
      const [itemHeader, runHeader, config] = await values(['items!A1:Y1', 'source_runs!A1:H1', 'config!A1:C40']);
      if (JSON.stringify(itemHeader[0]) !== JSON.stringify(ITEM_HEADERS)
        || JSON.stringify(runHeader[0]) !== JSON.stringify(RUN_HEADERS)) throw new Error('ledger_sheet_header_mismatch');
      const ranges = entries.map(entry => entry.target + '!A' + entry.sheet_row + ':' + (entry.target === 'items' ? 'Y' : 'H') + entry.sheet_row);
      for (const entry of entries) if (!Number.isSafeInteger(entry.sheet_row) || entry.sheet_row < 2 || entry.sheet_row > 200000) throw new Error('ledger_sheet_row_invalid');
      // batchGet cannot read rows outside the current grid; grow first, without writing values.
      const grow = [];
      for (const name of ['items', 'source_runs']) {
        const sheet = sheets[name];
        const end = Math.max(2, ...entries.filter(entry => entry.target === name).map(entry => entry.sheet_row));
        if (sheet.properties.gridProperties.rowCount < end) {
          grow.push({ appendDimension: { sheetId: sheet.properties.sheetId, dimension: 'ROWS', length: end - sheet.properties.gridProperties.rowCount } });
        }
      }
      if (grow.length) await api(':batchUpdate', 'POST', { requests: grow });
      const existing = entries.length ? await values(ranges) : [];
      const requests: unknown[] = [];
      let written = 0;
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        const row = existing[index]?.[0] || [];
        if (row[0] === entryIdentity(entry)) {
          if (entry.target === 'items' && row[1] !== entry.dedupe_key) throw new Error('ledger_sheet_row_collision');
          continue; // A prior write succeeded, or a person has since edited it. Never overwrite it.
        }
        const occupied = row.some((value, col) => value !== '' && value !== null && value !== undefined
          && !(entry.target === 'items' && [9, 20].includes(col) && value === false));
        if (occupied) throw new Error('ledger_sheet_row_collision');
        requests.push(...entryWrites(entry, sheets[entry.target].properties.sheetId));
        written++;
      }
      // Expand native table metadata in the same atomic batch as cell writes.
      for (const name of ['items', 'source_runs']) {
        const sheet = sheets[name];
        const table = sheet.tables?.[0];
        const end = Math.max(2, ...entries.filter(entry => entry.target === name).map(entry => entry.sheet_row));
        if (table && end > table.range.endRowIndex) requests.push({ updateTable: { table: {
          tableId: table.tableId, range: { sheetId: sheet.properties.sheetId, startRowIndex: 0,
            endRowIndex: end, startColumnIndex: 0, endColumnIndex: name === 'items' ? ITEM_HEADERS.length : RUN_HEADERS.length },
        }, fields: 'range' } });
      }
      const configIndex = config.findIndex(row => row[0] === 'pipeline_mode');
      if (configIndex < 1) throw new Error('ledger_sheet_config_missing');
      requests.push({ updateCells: { range: { sheetId: sheets.config.properties.sheetId,
        startRowIndex: configIndex, endRowIndex: configIndex + 1, startColumnIndex: 1, endColumnIndex: 3 },
        rows: [{ values: [{ userEnteredValue: { stringValue: 'metadata_connected' } },
          { userEnteredValue: { stringValue: '수집 항목 자동 보관 연결. 원문 확인·분류·브리핑 전환은 별도 진행' } }] }], fields: 'userEnteredValue' } });
      // Never blindly retry this network request. The durable row identity makes the next run inspect it first.
      await api(':batchUpdate', 'POST', { requests });
      return { written, alreadyPresent: entries.length - written };
    },
  };
}
