// rack-calc.test.mjs — SonorRackCalc pure maths (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const g = {}; new Function('window', readFileSync(new URL('../src/sonor-rack-calc.js', import.meta.url), 'utf8'))(g);
const C = g.SonorRackCalc;
const items = [
  { id: 'ups', label: 'APC SMT1500', u: 2, watts: 40, kg: 26.1, depth: 457, isUps: true, ups: { va: 1500, w: 1000 }, outlets: 6, start: 0 },
  { id: 'amp', label: 'Triad amp', u: 2, watts: 220, btu: 650, kg: 12, depth: 400, start: 2 },
  { id: 'sw', label: 'Araknis 24 PoE', u: 1, watts: 45, kg: 4, depth: 300, poeBudgetW: 190, start: 4 },
  { id: 'core', label: 'C4 CORE 3', u: 1, watts: 18, kg: 2, depth: 250, start: 5 },
  { id: 'pp', label: 'Patch panel', u: 1, accessory: true, kg: 1, start: 6 },
  { id: 'pdu', label: 'WattBox 12', u: 1, watts: 10, kg: 3, isPdu: true, outlets: 12, maxAmps: 16, side: 'rear', start: 0 },
];
test('space per side', () => { const r = C.compute(items, { rack: { heightU: 12 } }); assert.equal(r.space.frontU, 7); assert.equal(r.space.rearU, 1); assert.equal(r.space.freeU, 5); });
test('power, amps, breaker, PoE', () => {
  const r = C.compute(items, { rack: { heightU: 12 }, poeLoads: [{ label: 'WAP', watts: 12 }, { label: 'cam', watts: 8 }] });
  assert.equal(r.power.loadW, 333); assert.equal(r.power.poeW, 20); assert.equal(r.power.totalW, 353);
  assert.equal(r.power.amps, 1.7); assert.equal(r.power.breakerA, 6); assert.equal(r.poe.headroomW, 170);
  assert.equal(C.breakerFor(9), 13); assert.equal(C.breakerFor(30), 32);
});
test('heat uses Library BTU when present else W×3.412', () => { const r = C.compute(items, {}); assert.equal(r.heat.btuHr, Math.round(650 + (40 + 45 + 18 + 10) * 3.412)); assert.equal(r.heat.fromLibrary, 1); });
test('weight and rating warnings', () => {
  const r = C.compute(items, { rack: { heightU: 12, wallMount: true, ownKg: 20 } });
  assert.equal(r.weight.devicesKg, 48.1); assert.equal(r.weight.totalKg, 68.1); assert.equal(r.weight.limitKg, 50);
  assert.ok(r.warnings.some((w) => w.code === 'weight-tight'));
  const heavyHigh = C.compute([{ label: 'UPS', u: 2, kg: 26, start: 9, watts: 10 }], { rack: { heightU: 12 } }); assert.ok(heavyHigh.warnings.some((w) => w.code === 'heavy-high'));
});
test('depth check against usable rack depth', () => { const r = C.compute(items, { rack: { heightU: 12, depthMm: 500 } }); assert.deepEqual(r.depth.tooDeep, ['APC SMT1500']); assert.equal(r.depth.usableMm, 440); });
test('outlets and PDU amps', () => { const r = C.compute(items, {}); assert.equal(r.outlets.wanted, 4); assert.equal(r.outlets.supplied, 18); assert.equal(r.outlets.pduMaxAmps, 16); });
test('UPS: protected load, runtime estimate, recommendation when absent', () => {
  const r = C.compute(items, {}); assert.equal(r.ups.protectedW, 293); assert.equal(r.ups.loadPct, 29); assert.ok(r.ups.runtimeMin > 15 && r.ups.runtimeMin < 40, 'runtime ' + r.ups.runtimeMin); assert.match(r.ups.basis, /estimate/);
  const exact = C.compute(items.map((i) => i.isUps ? { ...i, ups: { ...i.ups, batteryWh: 400 } } : i), {}); assert.equal(exact.ups.runtimeMin, Math.round(400 * 0.85 / 293 * 60)); assert.match(exact.ups.basis, /Library/);
  const none = C.compute(items.filter((i) => !i.isUps), {}); assert.equal(none.ups.runtimeMin, null); assert.equal(none.ups.recommendVa, 500); assert.ok(none.warnings.some((w) => w.code === 'ups-none'));
  assert.equal(C.upsRuntimeMin({ w: 1000 }, 1200), 0);
});
test('specFromLibrary maps a device_catalogue row and a palette template', () => {
  const row = { model_id: 'WB-800VPS-IPVM-12', model: '800 VPS IPVM 12-Outlet', category: 'pdu', u_size: 1, watts: 80, btu_hr: 0, weight_kg: 0, depth_mm: null, metadata: { outlet_count: 12, max_amps: 16, ups: true, physical_dims: { depth_mm: 76 } } };
  const s = C.specFromLibrary(row); assert.equal(s.isUps, true); assert.equal(s.outlets, 12); assert.equal(s.depth, 76); assert.equal(s.maxAmps, 16);
  const tpl = { id: 'dev-x', label: 'Araknis 310', subName: 'switch', heightU: 1, powerW: 45, btuHr: 150, weightKg: 4, depthMm: 300, libMetadata: { poe_budget_w: 190 } };
  const t = C.specFromLibrary(tpl); assert.equal(t.u, 1); assert.equal(t.watts, 45); assert.equal(t.poeBudgetW, 190); assert.equal(t.isPdu, false);
  const ups = C.specFromLibrary({ model_id: 'SMT1500RMI2U', model: 'SMT1500RMI2U', category: 'ups', u_size: 2, watts: 1000, weight_kg: 26.1, metadata: {} });
  assert.equal(ups.isUps, true); assert.equal(ups.ups.w, 1000, 'watts is the capacity'); assert.equal(ups.watts, 30, 'own draw = 3 % losses'); assert.equal(ups.btu, 0);
  assert.ok(C.upsRuntimeMin({ w: 1000 }, 35) <= 240, 'light-load runtime bounded by battery energy: ' + C.upsRuntimeMin({ w: 1000 }, 35));
});
