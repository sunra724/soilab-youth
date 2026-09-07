import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../briefing/nkis-monitor/Code.gs', import.meta.url), 'utf8');
const reports = (n, long = false) => Array.from({ length: n }, (_, i) => ({ OTP_ID: `R${i}`, OTP_SEQ: '0', OTP_HAN_NM: `청년 연구 ${i} ` + (long ? '긴 제목 '.repeat(45) : ''), PUBAGC: '연구기관', PBL_YY: '2026', _tier: 'core', HAN_ABS: '제공된 연구 초록' }));
function harness() {
  const props = new Map([['NKIS_API_KEY', 'private-nkis-key'], ['TELEGRAM_BOT_TOKEN', 'private-bot-token'], ['TELEGRAM_CHAT_ID', '@nkis_test'], ['NKIS_SHEET_ID', 'ledger']]);
  const sheets = new Map(), logs = [], messages = [], responses = [];
  const controls = { failTracking: false, failSentSave: false, openFails: false, openedIds: [], created: 0, uuid: 0, ai: null };
  function makeSheet(name) {
    const rows = [];
    const sheet = { rows, getLastRow: () => rows.length, appendRow: row => { rows.push([...row]); },
      getRange: (row, col, height, width) => ({
        getValues: () => Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => rows[row - 1 + y]?.[col - 1 + x] ?? '')),
        setValues: values => {
          if (name === '발송기록' && controls.failTracking) throw new Error('simulated ledger failure');
          if (name === '텔레그램전송상태_v6' && controls.failSentSave && values[0][1] === 'sent') throw new Error('simulated journal failure');
          values.forEach((cells, y) => { rows[row - 1 + y] ||= []; cells.forEach((v, x) => { rows[row - 1 + y][col - 1 + x] = v; }); });
        },
      }),
    };
    sheets.set(name, sheet); return sheet;
  }
  const ss = { getSheetByName: name => sheets.get(name), insertSheet: makeSheet, getName: () => 'NKIS 테스트 기록', getId: () => 'ledger', getUrl: () => 'https://docs.google.com/spreadsheets/d/ledger/edit' };
  const propertyService = { getProperty: key => props.get(key), setProperty: (key, value) => props.set(key, value), deleteProperty: key => props.delete(key) };
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => propertyService },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    Logger: { log: value => logs.push(String(value)) },
    SpreadsheetApp: { openById: id => { controls.openedIds.push(id); if (controls.openFails) throw new Error('no access'); return ss; }, create: () => { controls.created++; return ss; }, flush: () => {} },
    Utilities: { getUuid: () => `job-${++controls.uuid}`, sleep: () => {}, formatDate: () => '2026' },
    UrlFetchApp: { fetch: (url, options) => {
      if (url === 'https://api.anthropic.com/v1/messages') return { getResponseCode: () => 200, getContentText: () => JSON.stringify(controls.ai) };
      assert.ok(url.startsWith('https://api.telegram.org/bot'));
      messages.push(JSON.parse(options.payload));
      const result = responses.shift();
      if (result === 'timeout') throw new Error('network ' + url);
      return { getResponseCode: () => result === 'reject' ? 403 : 200, getContentText: () => result === 'reject'
        ? JSON.stringify({ ok: false, description: 'forbidden' }) : result === 'bad-json' ? '<html>error</html>'
          : JSON.stringify({ ok: true, result: { message_id: messages.length + 100 } }) };
    } },
  });
  vm.runInContext(source, context);
  context.matchedReports_ = () => reports(20);
  context.enrichWithDetails = () => {};
  const outbox = () => sheets.get('텔레그램전송상태_v6')?.rows;
  const tracked = () => sheets.get('발송기록')?.rows.slice(1) || [];
  const enable = () => props.set('NKIS_AUTOMATION_ENABLED', 'true');
  return { context, props, controls, sheets, logs, messages, responses, outbox, tracked, enable };
}

test('미리보기는 Telegram·AI·시트 생성·발송기록을 변경하지 않는다', () => {
  const h = harness(); h.props.delete('NKIS_SHEET_ID'); h.context.previewNkisReports();
  assert.equal(h.messages.length, 0); assert.equal(h.controls.created, 0); assert.equal(h.sheets.size, 0);
  const result = JSON.parse(h.logs[0]);
  assert.equal(result.historyStatus, 'not_configured'); assert.equal(result.unseen, null);
  assert.equal(result.nextBatch.length, 0); assert.equal(result.candidates.length, 15);
});
test('시트 접근 실패여도 후보를 미리 보되 미발송 수를 추정하지 않는다', () => {
  const h = harness(); h.controls.openFails = true; h.context.previewNkisReports();
  const result = JSON.parse(h.logs[0]);
  assert.equal(result.historyStatus, 'unavailable'); assert.equal(result.matched, 20); assert.equal(result.unseen, null);
  assert.equal(result.nextBatch.length, 0); assert.equal(result.candidates.length, 15);
  assert.equal(h.props.get('NKIS_SHEET_ID'), 'ledger'); assert.equal(h.controls.created, 0); assert.equal(h.messages.length, 0);
  h.enable(); assert.throws(() => h.context.runNkisReportAlert(), /NKIS_SHEET_ID/);
  assert.equal(h.messages.length, 0);
});
test('Sheets URL과 공백은 ID로 해석하되 저장된 속성을 변경하지 않는다', () => {
  const h = harness(); const value = '  https://docs.google.com/spreadsheets/d/abc_123-xyz/edit#gid=99  ';
  h.props.set('NKIS_SHEET_ID', value); h.context.previewNkisReports();
  assert.equal(h.controls.openedIds[0], 'abc_123-xyz'); assert.equal(h.props.get('NKIS_SHEET_ID'), value);
  h.props.set('NKIS_SHEET_ID', ' ledger '); h.context.previewNkisReports(); assert.equal(h.controls.openedIds[1], 'ledger');
});
test('Apps Script 주소와 gid를 시트 ID로 사용하면 실제 발송을 중단한다', () => {
  for (const value of ['https://script.google.com/home/projects/wrong/edit', '1771909972']) {
    const h = harness(); h.enable(); h.props.set('NKIS_SHEET_ID', value);
    assert.throws(() => h.context.runNkisReportAlert(), /형식 확인/); assert.equal(h.controls.openedIds.length, 0);
    assert.equal(h.controls.created, 0); assert.equal(h.messages.length, 0);
  }
});
test('시트 읽기가 성공하면 기존 기록을 대조하고 진단은 기록을 수정하지 않는다', () => {
  const h = harness(); h.enable(); h.context.runNkisReportAlert();
  const calls = h.messages.length, before = JSON.stringify(h.tracked());
  h.context.previewNkisReports(); const result = JSON.parse(h.logs.at(-1));
  assert.equal(result.historyStatus, 'readable'); assert.equal(result.unseen, 5); assert.equal(result.nextBatch.length, 5);
  h.context.checkNkisTrackingSheet(); const diagnostic = JSON.parse(h.logs.at(-1));
  assert.equal(diagnostic.status, 'readable'); assert.equal(diagnostic.recordedIds, 15);
  assert.equal(h.messages.length, calls); assert.equal(JSON.stringify(h.tracked()), before);
});
test('진단 함수는 원래 Sheets 오류를 그대로 전달하며 키·토큰을 읽지 않는다', () => {
  const h = harness(); h.controls.openFails = true;
  assert.throws(() => h.context.checkNkisTrackingSheet(), /^Error: no access$/);
  const requested = [];
  h.context.PropertiesService = { getScriptProperties: () => ({ getProperty: key => { requested.push(key); return h.props.get(key); } }) };
  assert.throws(() => h.context.diagnoseNkisSheetAccess(), /^Error: no access$/);
  assert.deepEqual(requested, ['NKIS_SHEET_ID']); assert.equal(h.messages.length, 0); assert.equal(h.controls.created, 0);
});
test('별도 추가한 진단 함수는 구버전 도우미 없이 읽기 성공을 확인한다', () => {
  const h = harness(); h.context.trackingSpreadsheetId_ = undefined; h.context.openTrackingSpreadsheet_ = undefined;
  h.context.diagnoseNkisSheetAccess(); assert.match(h.logs[0], /시트 연결 성공/);
  assert.equal(h.messages.length, 0); assert.equal(h.sheets.size, 0);
});
test('교체 직후 기존 트리거가 실행되어도 활성화 전에는 발송하지 않는다', () => {
  const h = harness(); h.context.runNkisReportAlert();
  assert.equal(h.messages.length, 0); assert.equal(h.sheets.size, 0);
});
test('다른 실행이 잠금을 보유하면 시트·발송에 접근하지 않는다', () => {
  const h = harness(); h.enable(); h.context.LockService = { getScriptLock: () => ({ tryLock: () => false }) };
  assert.throws(() => h.context.runNkisReportAlert(), /다른 실행/);
  assert.equal(h.messages.length, 0); assert.equal(h.sheets.size, 0);
});
test('20건 중 첫 실행의 15건만 기록하고 다음 실행에서 나머지 5건을 처리한다', () => {
  const h = harness(); h.enable(); h.context.runNkisReportAlert();
  assert.equal(h.tracked().length, 15);
  assert.equal(h.messages.map(m => m.text).join('').match(/원문 보기/g).length, 15);
  h.context.runNkisReportAlert(); assert.equal(h.tracked().length, 20);
  const calls = h.messages.length; h.context.runNkisReportAlert(); assert.equal(h.messages.length, calls);
});
test('Telegram 명시적 실패는 발송기록에 넣지 않고 자동 재시도를 막는다', () => {
  const h = harness(); h.enable(); h.responses.push('reject');
  assert.throws(() => h.context.runNkisReportAlert(), /rejected/);
  assert.equal(h.tracked().length, 0); assert.equal(h.outbox()[1][1], 'rejected');
  assert.throws(() => h.context.runNkisReportAlert(), /발송 확인 필요/); assert.equal(h.messages.length, 1);
  h.props.set('NKIS_RESOLVE_JOB_ID', 'job-1'); h.context.retryNkisDeliveryAfterChecking();
  assert.equal(h.tracked().length, 15); assert.equal(h.outbox()[1][1], 'recorded');
});
test('전송 타임아웃은 uncertain이며 확인한 메시지를 기록할 때 재전송하지 않는다', () => {
  const h = harness(); h.enable(); h.context.matchedReports_ = () => reports(1); h.responses.push('timeout');
  assert.throws(() => h.context.runNkisReportAlert(), /uncertain/);
  assert.equal(h.outbox()[1][1], 'uncertain'); assert.equal(h.tracked().length, 0);
  assert.throws(() => h.context.runNkisReportAlert(), /발송 확인 필요/);
  h.props.set('NKIS_RESOLVE_JOB_ID', 'job-1'); h.props.set('NKIS_CONFIRMED_MESSAGE_ID', '981');
  h.context.confirmNkisChunkWasReceived(); assert.equal(h.messages.length, 1); assert.equal(h.tracked().length, 1);
  assert.ok(h.logs.every(line => !line.includes('private-bot-token')));
});
test('부분 발송 실패 복구 시 성공한 첫 조각을 다시 보내지 않는다', () => {
  const h = harness(); h.enable(); h.context.matchedReports_ = () => reports(15, true); h.responses.push('success', 'reject');
  assert.throws(() => h.context.runNkisReportAlert(), /rejected/); assert.equal(h.outbox()[1][4], 1);
  const first = h.messages[0].text; h.props.set('NKIS_RESOLVE_JOB_ID', 'job-1'); h.context.retryNkisDeliveryAfterChecking();
  assert.equal(h.messages.filter(message => message.text === first).length, 1); assert.equal(h.tracked().length, 15);
});
test('발송 후 기록 저장 실패는 다음 실행에서 기록만 복구한다', () => {
  const h = harness(); h.enable(); h.controls.failTracking = true;
  assert.throws(() => h.context.runNkisReportAlert(), /ledger failure/); assert.equal(h.outbox()[1][1], 'sent');
  const count = h.messages.length; h.controls.failTracking = false; h.context.runNkisReportAlert();
  assert.equal(h.messages.length, count); assert.equal(h.tracked().length, 15);
});
test('Telegram 성공 직후 상태 저장이 끊기면 sending을 유지해 중복 발송을 막는다', () => {
  const h = harness(); h.enable(); h.context.matchedReports_ = () => reports(1); h.controls.failSentSave = true;
  assert.throws(() => h.context.runNkisReportAlert(), /journal failure/); assert.equal(h.outbox()[1][1], 'sending');
  h.controls.failSentSave = false; assert.throws(() => h.context.runNkisReportAlert(), /발송 확인 필요/);
  assert.equal(h.messages.length, 1); assert.equal(h.tracked().length, 0);
});
test('기존 시트 접근 실패를 새 시트 생성으로 덮지 않는다', () => {
  const h = harness(); h.enable(); h.controls.openFails = true;
  assert.throws(() => h.context.runNkisReportAlert(), /NKIS_SHEET_ID/);
  assert.equal(h.controls.created, 0); assert.equal(h.messages.length, 0);
});
test('연결·보고서 1건 테스트는 테스트 상태만 남기고 정규 발송기록을 유지한다', () => {
  const h = harness(); h.context.testTelegramConnection(); h.context.testNkisOneReport();
  assert.equal(h.messages.length, 2); assert.match(h.messages[1].text, /테스트/); assert.equal(h.tracked().length, 0);
  assert.ok(h.outbox().slice(1).every(row => row[1] === 'recorded' && row[8] === 'test'));
});
test('긴 제목과 HTML 문자가 있어도 조각 길이와 링크·태그가 유지된다', () => {
  const h = harness(); const items = reports(15).map(item => ({ ...item, OTP_HAN_NM: '<&"'.repeat(600) }));
  const chunks = h.context.buildMessages_(items, {}, false);
  assert.ok(chunks.every(chunk => chunk.length <= 3500));
  assert.equal(chunks.join('').match(/원문 보기/g).length, 15);
  for (const chunk of chunks) {
    assert.equal((chunk.match(/<b>/g) || []).length, (chunk.match(/<\/b>/g) || []).length);
    assert.equal((chunk.match(/<a href=/g) || []).length, (chunk.match(/<\/a>/g) || []).length);
  }
});
test('AI 응답이 일부 항목만 요약해도 선택 자료 모두 메시지에 포함된다', () => {
  const h = harness(); h.props.set('ANTHROPIC_API_KEY', 'private-ai-key');
  h.controls.ai = { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ items: [{ id: 'R0:0', summary: '관계 회복 지원을 검토한 연구' }] }) }] };
  const items = reports(15), notes = h.context.summarizeWithClaude(items);
  const body = h.context.buildMessages_(items, notes, false).join('');
  assert.equal(body.match(/원문 보기/g).length, 15); assert.equal(body.match(/초록 요약 없음/g).length, 14);
});
test('잘린 AI 응답·허구 ID·HTML 요약은 제목과 링크 안내로 대체한다', () => {
  for (const [stop, note] of [['max_tokens', { id: 'R0:0', summary: '내용' }], ['end_turn', { id: 'unknown', summary: '내용' }], ['end_turn', { id: 'R0:0', summary: '<b>내용</b>' }]]) {
    const h = harness(); h.props.set('ANTHROPIC_API_KEY', 'private-ai-key');
    h.controls.ai = { stop_reason: stop, content: [{ type: 'text', text: JSON.stringify({ items: [note] }) }] };
    assert.equal(Object.keys(h.context.summarizeWithClaude(reports(1))).length, 0);
  }
});
test('복구 작업 ID나 채널이 다르면 전송하지 않는다', () => {
  const h = harness(); h.enable(); h.responses.push('reject'); assert.throws(() => h.context.runNkisReportAlert());
  h.props.set('NKIS_RESOLVE_JOB_ID', 'wrong-job'); assert.throws(() => h.context.retryNkisDeliveryAfterChecking(), /일치/);
  h.props.set('NKIS_RESOLVE_JOB_ID', 'job-1'); h.props.set('TELEGRAM_CHAT_ID', '@different');
  assert.throws(() => h.context.retryNkisDeliveryAfterChecking(), /다릅니다/); assert.equal(h.messages.length, 1);
  assert.equal(h.outbox()[1][1], 'rejected'); assert.equal(h.props.get('NKIS_RESOLVE_JOB_ID'), 'job-1');
});
