// library-bar.test.mjs — the pure model behind <sonor-library-bar>: service normalising, 01→10 order (Other last),
// subgroup tiers (numeric, "NN · Other" last), search across fields, service filter, extra filter, empty services.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = { console }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../src/sonor-library-bar.js', import.meta.url), 'utf8'), ctx);
const L = ctx.SonorLibraryBar;
const plain = (v) => JSON.parse(JSON.stringify(v));   // arrays from the vm realm → this realm
const items = [
  { id: 'a', label: 'Wall light', service: 'lighting', service_sub: '2', sub_name: 'Wall' },
  { id: 'b', label: 'Downlight', service_nn: '04', service_sub: '1', sub_name: 'Ceiling' },
  { id: 'c', label: 'Atmos speaker', service_nn: 1, manufacturer: 'Sonance', model: 'VP82R' },
  { id: 'd', label: 'Switch', service: 'network', category: 'switch' },
  { id: 'e', label: 'Mystery', service: 'zzz' },
  { id: 'f', label: 'Rack', service: 'structure', service_sub: '10', sub_name: 'Racks' },
  { id: 'g', label: 'Keypad', service: '04.3' },
  { id: 'h', label: 'LED tape', service_nn: '04', service_sub: '12', sub_name: 'Strip' },
];

test('serviceNN normalises every spelling', () => {
  assert.deepEqual(plain(['01', 1, 'cinema', '04.2', '01 Cinema', 's09', 'structure', 'hvac', 'CCTV', 'STR', 'zzz', null, 20].map((v) => L.serviceNN(v))),
    ['01', '01', '01', '04', '01', '09', '10', '06', '08', '10', '99', '99', '99']);
  assert.equal(L.serviceNN('20', { '20': { name: 'Barlows tender' } }), '20');
});

test('groups run 01 → 10, Other last, counts per service', () => {
  const m = L.buildModel(items, {}, {});
  assert.deepEqual(plain(m.groups.map((g) => g.nn)), ['01', '04', '09', '10', '99']);
  assert.equal(m.counts['04'], 4); assert.equal(m.total, 8); assert.equal(m.shown, 8);
  assert.deepEqual(plain(m.groups[1].items.map((i) => i.id)), ['b', 'g', 'h', 'a']);   // default: label A→Z
});

test('byTier subgroups: numeric tier order, untiered "NN · Other" last', () => {
  const m = L.buildModel(items, { getSubgroup: L.subgroups.byTier() }, {});
  const light = m.groups.find((g) => g.nn === '04');
  assert.deepEqual(plain(light.subgroups.map((s) => s.label)), ['04.1 · Ceiling', '04.2 · Wall', '04.12 · Strip', '04 · Other']);
});

test('search opens across label / manufacturer / model, multi-word AND', () => {
  const m = L.buildModel(items, {}, { q: 'sonance vp82' });
  assert.equal(m.shown, 1); assert.equal(m.groups[0].items[0].id, 'c');
  assert.equal(L.buildModel(items, {}, { q: 'sonance rack' }).shown, 0);
});

test('service filter + extra filter; chip counts ignore the service filter', () => {
  const m = L.buildModel(items, { filter: (i) => i.id !== 'g' }, { service: '04' });
  assert.deepEqual(plain(m.groups.map((g) => g.nn)), ['04']); assert.equal(m.shown, 3); assert.equal(m.counts['01'], 1);
});

test('showEmptyServices renders all ten (Takeoffs), extras via services map', () => {
  const m = L.buildModel([], { showEmptyServices: true }, {});
  assert.equal(m.groups.length, 10); assert.ok(m.groups.every((g) => g.count === 0));
  const x = L.buildModel([{ id: 1, label: 'Barlows item', service_nn: '20' }], { services: { '20': { name: 'Barlows tender', short: 'BAR' } } }, {});
  assert.equal(x.groups[0].name, 'Barlows tender'); assert.equal(x.groups[0].short, 'BAR');
});

test('compareItems override + string subgroup', () => {
  const m = L.buildModel(items.filter((i) => i.service_nn === '04' || i.service === 'lighting' || i.service === '04.3'), { compareItems: (a, b) => b.label.localeCompare(a.label), getSubgroup: (i) => (i.sub_name || '') }, {});
  const g = m.groups[0]; assert.equal(g.subgroups.at(-1).label, '04 · Other');
  assert.deepEqual(plain(g.subgroups.map((s) => s.label).slice(0, 3)), ['Ceiling', 'Strip', 'Wall']);
});
