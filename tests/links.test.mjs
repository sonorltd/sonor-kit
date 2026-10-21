// links.test.mjs — the pure model behind <sonor-links-banner> / <sonor-links-button> (sonor-links.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = { console }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../src/sonor-links.js', import.meta.url), 'utf8'), ctx);
const L = ctx.SonorLinks;
const plain = (v) => JSON.parse(JSON.stringify(v));
const S = (source, o) => ({ source, label: source, text: source + ' text', moved: false, attention: false, locked: false, why: null, ...o });

test('banner: one row per attention source; locked+moved and unreachable become chips; current hidden', () => {
  const m = L.bannerModel([S('takeoffs', { moved: true, attention: true }), S('amps', { moved: true, locked: true }), S('netmap', { why: 'source-unavailable' }), S('library')]);
  assert.deepEqual(plain(m.rows.map((r) => r.source)), ['takeoffs']);
  assert.deepEqual(plain(m.chips.map((c) => [c.source, c.tone])), [['amps', 'locked'], ['netmap', 'muted']]);
  assert.equal(m.empty, false);
  assert.equal(L.bannerModel([S('library')]).empty, true);
  assert.equal(L.bannerModel([S('a', { moved: true, acked: true })]).empty, true);   // acked → hidden
});

test('banner collapses above 2 changes until expanded', () => {
  const st = ['a', 'b', 'c'].map((s) => S(s, { moved: true, attention: true }));
  const m = L.bannerModel(st);
  assert.deepEqual([m.collapsed, m.rows.length, m.summary], [true, 0, '3 upstream changes']);
  assert.equal(L.bannerModel(st, { expanded: true }).rows.length, 3);
  assert.equal(L.bannerModel(st.slice(0, 2)).collapsed, false);
});

test('dot: moved > locked > unavailable > ok > none', () => {
  assert.equal(L.dotState([]), 'none');
  assert.equal(L.dotState([S('a')]), 'ok');
  assert.equal(L.dotState([S('a'), S('b', { why: 'source-unavailable' })]), 'unavailable');
  assert.equal(L.dotState([S('a', { locked: true }), S('b', { why: 'source-unavailable' })]), 'locked');
  assert.equal(L.dotState([S('a', { locked: true }), S('b', { moved: true, attention: true })]), 'moved');
});

test('status cell wording', () => {
  assert.deepEqual(plain(L.statusCell(S('a', { moved: true, attention: true, delta: { text: '3 added' } }))), { tone: 'warn', text: '3 added' });
  assert.deepEqual(plain(L.statusCell(S('a', { locked: true, moved: true, link: { locked_by: 'SE' } }))), { tone: 'locked', text: 'locked by SE · behind' });
  assert.deepEqual(plain(L.statusCell(S('a', { moved: true, minor: true }))), { tone: 'muted', text: 'edited, no device change' });
  assert.deepEqual(plain(L.statusCell(S('a', { why: 'source-unavailable' }))), { tone: 'muted', text: 'not reachable' });
  assert.deepEqual(plain(L.statusCell(S('a'))), { tone: 'ok', text: 'current' });
});

test('without SonorRevisions ≥ 1.1.0 the module resolves nothing (elements stay hidden)', () => {
  assert.equal(L.resolveRevisions(), null);
});
