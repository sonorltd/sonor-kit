// sortable.test.mjs — the pure ordering maths behind SonorSortable (no DOM). `node --test tests/*.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'sonor-sortable.js'), 'utf8');
const g = {}; new Function('window', src)(g); const S = g.SonorSortable;

test('renumber gives a gap sequence in list order', () => {
  const m = S.renumber(['c', 'a', 'b'], 10);
  assert.deepEqual([...m.entries()], [['c', 10], ['a', 20], ['b', 30]]);
});
test('gapAfter finds the midpoint, or null when neighbours touch', () => {
  assert.equal(S.gapAfter(10, 20, 10), 15);
  assert.equal(S.gapAfter(10, 11, 10), null);
  assert.equal(S.gapAfter(null, 20, 10), 10);
  assert.equal(S.gapAfter(30, null, 10), 40);
  assert.equal(S.gapAfter(null, null, 10), 10);
});
test('diffNumbers changes ONLY the moved row when a gap exists', () => {
  const items = [{ key: 'a', sort: 10 }, { key: 'c', sort: 30 }, { key: 'b', sort: 20 }, { key: 'd', sort: 40 }]; // b dragged below c
  const ch = S.diffNumbers(items, 'b', 10);
  assert.deepEqual(ch, [{ key: 'b', sort: 35 }]);
});
test('diffNumbers falls back to a full gap renumber when neighbours touch', () => {
  const items = [{ key: 'a', sort: 10 }, { key: 'c', sort: 12 }, { key: 'b', sort: 11 }]; // c dragged between 10 and 11 — no room
  const ch = S.diffNumbers(items, 'c', 10);
  assert.deepEqual(ch.map((c) => c.key + ':' + c.sort), ['c:20', 'b:30']); // a already 10
});
test('diffNumbers handles rows with no number yet', () => {
  const items = [{ key: 'a', sort: null }, { key: 'b', sort: 20 }, { key: 'c', sort: null }];
  const ch = S.diffNumbers(items, 'a', 10);
  assert.deepEqual(ch.map((c) => c.key + ':' + c.sort), ['a:10', 'c:30']);
});
test('moving to the top of a list with room uses half of the first number', () => {
  const items = [{ key: 'z', sort: 40 }, { key: 'a', sort: 10 }, { key: 'b', sort: 20 }];
  assert.deepEqual(S.diffNumbers(items, 'z', 10), [{ key: 'z', sort: 5 }]);
});
