import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evidenceLibrary } from '../src/data/research.ts';
import { researchNotes } from '../src/data/research-notes.ts';

// Public URLs recovered from the previous production deployment, independent of the current data.
const published = JSON.parse(readFileSync(new URL('./fixtures/published-research.json', import.meta.url), 'utf8'));

test('previously published research URLs remain available after a deployment', () => {
  for (const [kind, records] of [['notes', researchNotes], ['evidence', evidenceLibrary]]) {
    const ids = new Set(records.map(record => record.id));
    assert.equal(ids.size, records.length, `Duplicate ${kind} identifiers`);
    for (const id of published[kind]) assert.ok(ids.has(id), `Published ${kind} URL removed: ${id}`);
  }
});

test('restored research notes link to existing evidence and valid source references', () => {
  const evidenceIds = new Set([...evidenceLibrary.map(item => item.id), ...published.reviewedEvidence]);
  const noteIds = new Set(researchNotes.map(item => item.id));
  for (const note of researchNotes) {
    for (const source of note.sources) assert.ok(evidenceIds.has(source.evidenceId), `${note.id}: ${source.evidenceId}`);
    for (const section of note.sections) {
      for (const index of section.references) assert.ok(Number.isInteger(index) && index > 0 && index <= note.sources.length, `${note.id}: source ${index}`);
    }
    for (const link of note.relatedLinks || []) {
      const id = link.href.match(/^\/research\/notes\/([^?#]+)/)?.[1];
      if (id) assert.ok(noteIds.has(id), `${note.id}: ${link.href}`);
    }
  }
});
