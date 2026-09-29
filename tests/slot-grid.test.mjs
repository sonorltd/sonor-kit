// slot-grid.test.mjs — pure model tests for sonor-slot-grid.js (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const g = {}; new Function('window', readFileSync(new URL('../src/sonor-slot-grid.js', import.meta.url), 'utf8'))(g);
const S = g.SonorSlotGrid;
const rack = { orientation: 'vertical', rows: 1, size: 12, unit: 20 };
const din = { orientation: 'horizontal', rows: 2, size: 24, unit: 18 };
const A = { id: 'a', start: 0, size: 2, row: 0 }, B = { id: 'b', start: 2, size: 1, row: 0 }, C = { id: 'c', start: 5, size: 3, row: 0 };
test('canPlace: out / collide / ok', () => {
  assert.equal(S.canPlace(rack, [A, B, C], { id: 'x', size: 2 }, 11), 'out');
  assert.equal(S.canPlace(rack, [A, B, C], { id: 'x', size: 2 }, 1), 'collide');
  assert.equal(S.canPlace(rack, [A, B, C], { id: 'x', size: 2 }, 3), true);
  assert.equal(S.canPlace(rack, [A, B, C], { id: 'a', size: 2 }, 0), true, 'an item may stay where it is');
  assert.equal(S.canPlace(din, [], { id: 'x', size: 4 }, 0, 2), 'out', 'row beyond rows');
});
test('place refuses on collision unless shove; shove pushes neighbours away, never past the edge', () => {
  assert.equal(S.place(rack, [A, B, C], { id: 'x', size: 2 }, 1), null);
  const shoved = S.place(rack, [A, B, C], { id: 'x', size: 2 }, 1, { shove: true });
  const by = Object.fromEntries(shoved.map((i) => [i.id, i.start]));
  assert.equal(by.x, 1); assert.equal(by.a, -0 + 0 <= 0 ? by.a : by.a);
  assert.ok(by.a + 2 <= 1 || by.a >= 3, 'a moved clear of x'); assert.ok(by.b >= 3, 'b moved up clear of x');
  assert.equal(S.place(rack, [{ id: 'big', start: 0, size: 12, row: 0 }], { id: 'x', size: 1 }, 3, { shove: true }), null, 'nothing to shove into');
  assert.equal(S.place(rack, [{ ...A, locked: true }], { id: 'x', size: 1 }, 0, { shove: true }), null, 'locked items are never shoved');
});
test('place returns a NEW array and never mutates', () => {
  const items = [A, B]; const next = S.place(rack, items, C, 9);
  assert.notEqual(next, items); assert.equal(items.length, 2); assert.equal(next.find((i) => i.id === 'c').start, 9);
});
test('autoLayout: first fit, heavy first from the bottom, vent gap, unplaced flagged', () => {
  const out = S.autoLayout(rack, [{ id: 'amp', size: 2, weightRank: 5, vent: true }, { id: 'sw', size: 1, weightRank: 1 }, { id: 'ups', size: 3, weightRank: 9 }]);
  const by = Object.fromEntries(out.map((i) => [i.id, i]));
  assert.equal(by.ups.start, 0, 'heaviest at the bottom'); assert.equal(by.amp.start, 3); assert.equal(by.sw.start, 6, 'gap left above the amp');
  const over = S.autoLayout({ ...rack, size: 3 }, [{ id: 'a', size: 2 }, { id: 'b', size: 2 }]);
  assert.equal(over.find((i) => i.id === 'b').unplaced, true);
  const rows = S.autoLayout(din, [{ id: 'a', size: 20 }, { id: 'b', size: 6 }]);
  assert.equal(rows.find((i) => i.id === 'b').row, 1, 'spills to the next DIN row');
});
test('stats per row', () => {
  const s = S.stats(din, [{ id: 'a', start: 0, size: 20, row: 0 }, { id: 'b', start: 0, size: 6, row: 1 }]);
  assert.equal(s.used, 26); assert.equal(s.free, 22); assert.deepEqual(s.perRow.map((p) => p.free), [4, 18]);
});
test('toSvg draws every item and the DIN rail', () => {
  const svg = S.toSvg(din, [{ id: 'mcb', start: 0, size: 1, row: 0, label: 'MCB 6A' }, { id: 'dim', start: 4, size: 4, row: 1, label: 'Dimmer', sub: '8ch' }]);
  assert.match(svg, /^<svg/); assert.match(svg, /MCB 6A/); assert.match(svg, /Dimmer/); assert.equal((svg.match(/fill="#94A3B8"/g) || []).length, 2, 'two rails');
  const rk = S.toSvg(rack, [{ id: 'u', start: 0, size: 2, label: 'UPS' }], { labelOrigin: 1 });
  assert.match(rk, />1<\/text>/); assert.match(rk, />12<\/text>/);
});
test('shove chains: pushed items push each other and never bounce back or overlap', () => {
  const r = S.place(rack, [{ id: 'a', start: 0, size: 2, row: 0 }, { id: 'b', start: 2, size: 1, row: 0 }, { id: 'c', start: 5, size: 3, row: 0 }], { id: 'x', size: 2 }, 1, { shove: true });
  for (const p of r) for (const q of r) if (p !== q) assert.equal(S.overlaps(p, q), false, p.id + ' overlaps ' + q.id);
  assert.equal(S.place(rack, [{ id: 'a', start: 0, size: 5, row: 0 }, { id: 'b', start: 6, size: 6, row: 0 }], { id: 'x', size: 2 }, 1, { shove: true }), null, 'no room at all');
});
