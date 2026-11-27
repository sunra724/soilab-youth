import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(root, 'src/data/series-archive.json'), 'utf8'));
test('published archive has complete, distinct articles and accessible media', () => {
  assert.equal(data.series.length, 3);
  const entries = data.series.flatMap(series => series.entries);
  assert.equal(entries.length, 24);
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  assert.equal(new Set(entries.map(entry => entry.path)).size, entries.length);
  for (const series of data.series) {
    for (const [index, entry] of series.entries.entries()) {
      assert.equal(entry.number, index + 1);
      assert.equal(entry.path, `/series/${series.slug}/${entry.number}`);
      assert.ok(entry.title && entry.description && entry.body.length > 200);
      assert.doesNotMatch(entry.body, /https?:\/\/[^\s]*(?:\.\.\.|…)/);
      assert.ok(entry.cards.length > 0);
      for (const asset of [...entry.cards.map(card => card.src), entry.download, ...entry.videos.map(video => video.src)]) {
        assert.ok(asset.startsWith('/series-media/'));
        assert.ok(existsSync(path.join(root, 'public', asset)), `${entry.id}: missing ${asset}`);
      }
      for (const card of entry.cards) assert.ok(card.alt && card.width > 0 && card.height > 0);
      for (const ref of [...entry.related, ...entry.sources]) {
        if (ref.href) assert.ok(/^https?:\/\//.test(ref.href) && !ref.href.includes('...'));
      }
      assert.equal(entry.href, entry.canonicalPath ? `${entry.canonicalPath}#series-cardnews` : entry.path);
    }
  }
});
test('draft mockups and private working files are excluded from published media', () => {
  const entries = data.series.flatMap(series => series.entries);
  for (const entry of entries) {
    assert.ok(entry.download.endsWith('/originals.zip'));
    assert.ok(entry.cards.every(card => card.src.endsWith('.webp')));
  }
  if (data.site === 'LAB') {
    assert.equal(entries.find(entry => entry.id === 'L08').cards.length, 1);
    assert.equal(entries.find(entry => entry.id === 'L09').cards.length, 5);
    assert.equal(entries.find(entry => entry.id === 'L12').cards.length, 7);
    assert.equal(entries.find(entry => entry.id === 'L13').cards.length, 6);
  } else {
    assert.equal(entries.find(entry => entry.id === 'Y07').cards.length, 10);
    assert.equal(entries.filter(entry => entry.canonicalPath).length, 2);
  }
});
