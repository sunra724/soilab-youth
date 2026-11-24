import assert from 'node:assert/strict';
import test from 'node:test';
import { extractArticleBody, publicAddress, readBriefingSource, seenBriefingStory, youthPolicyScope } from '../src/lib/research/briefing-evidence.ts';
import { editEvidenceSource, parseEvidenceNote, composeEvidenceBriefing } from '../src/lib/research/briefing-editor.ts';
import { prepareDailyDraft, prepareQualityDraft } from '../src/lib/research/daily.ts';

const original = '고립·은둔 청년을 대상으로 정서지원과 유급 일경험을 연계하는 사업을 추진한다. 아직 대상 연령과 모집 시기는 정하지 않았다. ';
const source = () => ({ title: '고립·은둔 청년 지원사업 추진', url: 'https://www.mohw.go.kr/sample', publisher: '보건복지부', tier: 'official',
  excerpt: '', checked_at: '2026-10-19T00:00:00Z', published_at: '2026-09-22T00:00:00Z', evidence_text: original.repeat(4),
  evidence_scope: 'article_body', retrieved_at: '2026-10-19T00:00:00Z' });
const note = () => ({ headline: '정서지원과 일경험을 연계하는 청년 지원 계획',
  facts: [{ text: '고립·은둔 청년의 정서지원과 유급 일경험을 연계하는 사업을 추진한다.', quote: '고립·은둔 청년을 대상으로 정서지원과 유급 일경험을 연계하는 사업을 추진한다.' }],
  change: null, youthMeaning: { text: '정서적 지원을 받으며 일경험을 준비하는 경로가 될 수 있다.', basedOn: [1] },
  fieldQuestion: { text: '정서지원에서 일경험으로 넘어갈 때 필요한 지원을 검토할 수 있다.', basedOn: [1] },
  limitation: '모집 시기와 대상 연령이 제시되지 않아 현재 신청 가능한 사업으로 안내할 수 없다.' });
const runtime = fetcher => ({ fetcher, now: () => new Date('2026-10-19T00:00:00Z'), resolveHost: async () => ['8.8.8.8'] });

test('본문 없이 제목·메타 설명·메뉴만 있는 페이지는 분석 근거로 사용하지 않는다', () => {
  assert.throws(() => extractArticleBody(`<meta name="description" content="${original.repeat(5)}"><nav>${original.repeat(5)}</nav>`), /article_body_not_found/);
  const result = extractArticleBody(`<nav>다른 기관의 소식 999명</nav><article><p>${original.repeat(4)}</p><script>나쁜 지시</script></article>`);
  assert.ok(result.text.includes('정서지원'));
  assert.ok(!result.text.includes('999명'));
  assert.ok(!result.text.includes('나쁜 지시'));
});

test('국내외 일반 외로움 기사를 청년 정책으로 확대 해석하지 않는다', () => {
  assert.equal(youthPolicyScope('A library workshop to tackle loneliness among older adults'), false);
  assert.equal(youthPolicyScope('young people and social isolation policy'), true);
  assert.equal(youthPolicyScope('고립·은둔 청년의 가족지원'), true);
});

test('언론사와 날짜가 달라도 같은 모집사업이나 동일 URL은 재발행하지 않는다', () => {
  assert.equal(seenBriefingStory({ title: '남양주시, 고립 청년 지원 ‘청년, 김치로 무르잇다’ 참여자 모집 - 웹이코노미' }, [
    { title: '남양주시, 고립 청년 지원사업 ‘청년, 김치로 무르잇다’ 참여자 모집 - 경기연합뉴스' },
  ]), true);
  assert.equal(seenBriefingStory({ title: '다른 제목', url: 'https://example.com/a?utm_source=rss' }, [{ title: '이전 제목', url: 'https://example.com/a' }]), true);
  assert.equal(seenBriefingStory({ title: '제주 고립 청년 상담 창구 개설' }, [{ title: '남양주 김치 프로그램 모집' }]), false);
});

test('본문 조회는 사설망·메타데이터 주소와 사설망으로 이동하는 리디렉션을 거부한다', async () => {
  for (const address of ['127.0.0.1', '169.254.169.254', '172.16.0.1', '192.168.1.1', '100.64.0.1', '::1', 'fc00::1', '::ffff:127.0.0.1']) assert.equal(publicAddress(address), false);
  assert.equal(publicAddress('8.8.8.8'), true);
  let requests = 0;
  await assert.rejects(readBriefingSource(source(), runtime(async () => {
    requests++;
    return new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest' } });
  })), /unsafe_source/);
  assert.equal(requests, 1);
});

test('접근 불가한 원문은 제외하고 제목만으로 AI 해설을 만들지 않는다', async () => {
  let aiCalls = 0;
  const result = await prepareQualityDraft({ model: 'test', openaiKey: 'test' }, [], {
    ...runtime(async url => {
      if (String(url) === 'https://api.openai.com/v1/responses') aiCalls++;
      return new Response(null, { status: 403 });
    }), candidates: [source()],
  });
  assert.equal(aiCalls, 0);
  assert.equal(result.briefing.sources.length, 0);
  assert.equal(result.briefing.generator_model, null);
  assert.equal(result.audit.source_checks[0].reason, 'source_http_failed');
});

test('원문에 없는 인용·숫자·사실 참조는 발행 초안에서 제외한다', () => {
  assert.equal(parseEvidenceNote(note(), source()).facts.length, 1);
  const fabricatedQuote = note();fabricatedQuote.facts[0].quote = '원문에 없는 실제 효과가 입증되었다.';
  assert.throws(() => parseEvidenceNote(fabricatedQuote, source()), /quote_mismatch/);
  const fabricatedNumber = note();fabricatedNumber.facts[0].text += ' 150명을 지원한다.';
  assert.throws(() => parseEvidenceNote(fabricatedNumber, source()), /unsupported_fact_number/);
  const badReference = note();badReference.youthMeaning.basedOn = [2];
  assert.throws(() => parseEvidenceNote(badReference, source()), /invalid_fact_reference/);
  const foreignFragment = note();foreignFragment.fieldQuestion.text += ' 届けるという';
  assert.throws(() => parseEvidenceNote(foreignFragment, source()), /invalid_editor_text/);
});

test('일반 설명을 전후 비교로 만들거나 재검토 자료를 신규 발표로 표시하지 않는다', () => {
  const invalid = note();invalid.change = invalid.facts[0];
  assert.throws(() => parseEvidenceNote(invalid, source()), /comparison_not_in_source/);
  const body = composeEvidenceBriefing('2026-10-19', [{ source: { ...source(), feed_kind: 'reviewed_reading', publication_year: 2024 }, note: note() }], 'test');
  assert.match(body.body_text, /발행 2024 · 신규 발표 아님/);
  assert.match(body.body_text, /청년에게 갖는 의미 · 해석/);
  assert.ok(body.body_text.includes(source().url));
});

test('발표일의 앞자리 0은 동등하게 읽지만 원문 다른 문장의 수치는 가져오지 않는다', () => {
  const dated = note(); dated.facts[0].text += ' 발표일은 2026년 9월 22일이다.';
  assert.doesNotThrow(() => parseEvidenceNote(dated, source()));
  dated.facts[0].text += ' 4단계로 진행한다.';
  assert.throws(() => parseEvidenceNote(dated, { ...source(), evidence_text: original.repeat(4) + ' 이 사업은 4단계로 진행한다.' }), /unsupported_fact_number/);
});

test('본문은 읽었지만 모든 편집 검사가 실패하면 정상적인 빈 브리핑으로 발송하지 않는다', async () => {
  await assert.rejects(prepareDailyDraft({ model: 'test', openaiKey: 'test' }, [], {
    ...runtime(async () => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: '{}' }] }] }))),
    candidates: [{ ...source(), excerpt: original.repeat(4), reviewed_at: '2026-10-19', feed_kind: 'reviewed_reading' }],
  }), /all_editorial_checks_failed/);
});

test('근거 인용이 맞아도 독립 검토가 계획을 성과로 단정했다고 판단하면 발행하지 않는다', async () => {
  let calls = 0;
  await assert.rejects(editEvidenceSource(source(), async () => ++calls === 1 ? note() : {
    supported: false, unsupportedClaims: ['사업 추진을 시행 완료로 단정'],
  }), /editor_review_rejected/);
  assert.equal(calls, 2);
});

test('OpenAI 인증·잔액 오류와 불완전한 응답은 발행 전에 원인별로 보고한다', async () => {
  for (const [status, body, reason] of [
    [401, { error: { code: 'invalid_api_key' } }, /openai_http_401/],
    [429, { error: { code: 'insufficient_quota' } }, /openai_insufficient_quota/],
    [200, { status: 'incomplete', output: [] }, /openai_incomplete/],
  ]) {
    await assert.rejects(prepareDailyDraft({ model: 'fixture', openaiKey: 'sample' }, [], {
      ...runtime(async (url, init) => {
        assert.equal(url, 'https://api.openai.com/v1/responses');
        assert.equal(init.headers.Authorization, 'Bearer sample');
        assert.equal(JSON.parse(init.body).store, false);
        return Response.json(body, { status });
      }),
      candidates: [{ ...source(), excerpt: original.repeat(4), reviewed_at: '2026-10-19', feed_kind: 'reviewed_reading' }],
    }), reason);
  }
});

test('AI가 선택한 문장 번호는 서버가 원문 문장으로 연결하고 존재하지 않는 번호는 거부한다', async () => {
  let calls = 0;
  const result = await editEvidenceSource(source(), async (_system, input) => {
    calls++;
    if (calls === 2) {
      assert.ok(source().evidence_text.includes(input.note.facts[0].quote));
      return { supported: true, unsupportedClaims: [] };
    }
    assert.ok(input.source.passages[0].text.startsWith('고립'));
    return { ...note(), facts: [{ text: note().facts[0].text, evidenceId: 1 }] };
  });
  assert.equal(result.facts[0].quote, note().facts[0].quote);
  await assert.rejects(editEvidenceSource(source(), async () => ({ ...note(), facts: [{ text: note().facts[0].text, evidenceId: 999 }] })), /invalid_evidence_reference/);
});

test('원문 주소가 다른 기사나 사이트 안내 페이지로 바뀌면 분석에서 제외한다', async () => {
  await assert.rejects(readBriefingSource(source(), runtime(async () => new Response(
    `<title>도서관 이용 안내</title><article>${'도서관 대출과 반납에 대한 운영 안내입니다. '.repeat(20)}</article>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  ))), /source_title_mismatch/);
});

test('형식·근거 오류는 한 번만 교정하고 동일한 검사를 다시 적용한다', async () => {
  let calls = 0;
  await editEvidenceSource(source(), async (_system, input) => {
    calls++;
    if (calls === 1) return { ...note(), facts: [{ text: note().facts[0].text + ' 999명.', evidenceId: 1 }] };
    if (calls === 2) { assert.equal(input.validationError, 'unsupported_fact_number'); return note(); }
    return { supported: true, unsupportedClaims: [] };
  });
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(editEvidenceSource(source(), async () => { calls++; return {}; }), /invalid_fact_count/);
  assert.equal(calls, 2);
});
