import assert from 'node:assert/strict';
import test from 'node:test';
import { findRecoverableBounceSuppressions } from '../src/lib/newsletterSuppression.ts';

const recipient = 'goo@soilabcoop.kr';

function suppression(overrides = {}) {
  return {
    id: 'suppression-1',
    email: recipient,
    origin: 'bounce',
    created_at: '2026-06-11T00:00:00.000Z',
    ...overrides,
  };
}

function delivery(overrides = {}) {
  return {
    id: 'email-1',
    to: [recipient],
    created_at: '2026-06-17T00:00:00.000Z',
    last_event: 'delivered',
    ...overrides,
  };
}

test('recovers a bounce suppression when a later successful delivery proves the address works', () => {
  const result = findRecoverableBounceSuppressions(
    [suppression()],
    [delivery()],
    [recipient]
  );

  assert.deepEqual(result, [{
    suppressionId: 'suppression-1',
    email: recipient,
    evidenceEmailId: 'email-1',
  }]);
});

test('accepts opened and clicked events as successful-delivery evidence', () => {
  for (const lastEvent of ['opened', 'clicked']) {
    const result = findRecoverableBounceSuppressions(
      [suppression()],
      [delivery({ last_event: lastEvent })],
      [recipient]
    );

    assert.equal(result.length, 1);
  }
});

test('never recovers complaint or manual suppressions', () => {
  for (const origin of ['complaint', 'manual']) {
    const result = findRecoverableBounceSuppressions(
      [suppression({ origin })],
      [delivery()],
      [recipient]
    );

    assert.deepEqual(result, []);
  }
});

test('requires delivery evidence newer than the suppression', () => {
  const result = findRecoverableBounceSuppressions(
    [suppression()],
    [delivery({ created_at: '2026-06-10T00:00:00.000Z' })],
    [recipient]
  );

  assert.deepEqual(result, []);
});

test('does not treat sent, suppressed, or bounced events as delivery evidence', () => {
  for (const lastEvent of ['sent', 'suppressed', 'bounced']) {
    const result = findRecoverableBounceSuppressions(
      [suppression()],
      [delivery({ last_event: lastEvent })],
      [recipient]
    );

    assert.deepEqual(result, []);
  }
});

test('only considers recipients in the current newsletter send', () => {
  const result = findRecoverableBounceSuppressions(
    [suppression()],
    [delivery()],
    ['someone-else@example.com']
  );

  assert.deepEqual(result, []);
});
