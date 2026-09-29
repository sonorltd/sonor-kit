// slot-grid.smoke.mjs — headless: real pointer drags on the catalogue page (move, refuse, ⌥ shove, palette drop, undo, keyboard).
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1300, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto((process.env.KIT_URL || 'http://localhost:8770') + '/catalogue/slot-grid.html'); await p.waitForTimeout(800);
const state = (id) => p.evaluate((id) => document.getElementById(id).items.map(i => i.label.split(' ')[0] + '@' + i.start + (i.row ? 'r' + i.row : '')).sort(), id);
console.log('rack', await state('rack'), 'din', await state('din'));
// geometry helpers: centre of a tile / slot inside the shadow root
const tileBox = (id, label) => p.evaluate(([id, label]) => { const g = document.getElementById(id); const t = Array.from(g.shadowRoot.querySelectorAll('.tile')).find(t => t.textContent.includes(label)); const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, [id, label]);
const slotBox = (id, slot, row = 0) => p.evaluate(([id, slot, row]) => { const g = document.getElementById(id); const s = g.shadowRoot.querySelector(`.slot[data-row="${row}"][data-slot="${slot}"]`); const r = s.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [id, slot, row]);
const drag = async (from, to, mods) => { await p.mouse.move(from.x, from.y); await p.mouse.down(); await p.mouse.move(from.x + 3, from.y + 3); await p.mouse.move(to.x, to.y, { steps: 8 }); if (mods === 'alt') await p.keyboard.down('Alt'); await p.mouse.move(to.x + 1, to.y); await p.mouse.up(); if (mods === 'alt') await p.keyboard.up('Alt'); await p.waitForTimeout(80); };
// 1. move the 1U switch (at U7) up to U10 — free → accepted, nothing else moves
let from = await tileBox('rack', 'Araknis 310 24'); let to = await slotBox('rack', 9); await drag(from, to);
console.log('move free', await state('rack'));
// 2. drag the UPS (2U at U1) onto the amp (U4-5) → refused, state unchanged
const before = await state('rack'); from = await tileBox('rack', 'APC'); to = await slotBox('rack', 4); await drag(from, to);
console.log('refused kept state', JSON.stringify(before) === JSON.stringify(await state('rack')), (await p.evaluate(() => document.getElementById('log').textContent.split('\n')[0])).slice(0, 80));
// 3. same drop with Alt → shove
from = await tileBox('rack', 'APC'); to = await slotBox('rack', 4); await drag(from, to, 'alt');
const after = await state('rack'); console.log('shoved', after, 'no overlaps', await p.evaluate(() => { const it = document.getElementById('rack').items; return !it.some(a => it.some(b => a !== b && SonorSlotGrid.overlaps(a, b))); }));
// 4. palette → rack external drop (Control4 CORE 3 to U12)
const pal = await p.evaluate(() => { const el = Array.from(document.querySelectorAll('#palRack .pal')).find(x => x.textContent.includes('CORE')); const r = el.getBoundingClientRect(); return { x: r.x + 20, y: r.y + r.height / 2 }; });
to = await slotBox('rack', 11); await drag(pal, to); console.log('palette drop', (await state('rack')).filter(s => s.startsWith('Control4')));
// 5. undo twice
await p.evaluate(() => { document.getElementById('rack').undo(); document.getElementById('rack').undo(); }); console.log('after 2 undo', await state('rack'));
// 6. DIN: drag the dimmer (row 2) into row 1 free space, then keyboard nudge right
from = await tileBox('din', 'C4 8ch dimmer'); to = await slotBox('din', 12, 0); await drag(from, to); console.log('din move', await state('din'));
await p.evaluate(() => { const g = document.getElementById('din'); g.select(g.items.find(i => i.label.includes('dimmer')).id); g.focus(); }); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); console.log('nudged', (await state('din')).filter(s => s.startsWith('C4')));
// 7. states + svg
console.log('hover state', await p.evaluate(async () => { const g = document.getElementById('rack'); const t = g.shadowRoot.querySelector('.tile'); t.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })); return t.dataset.state; }), 'svg', (await p.evaluate(() => document.getElementById('din').toSvg().length)) > 500);
await p.screenshot({ path: 'slot-grid.png', fullPage: false });
console.log('ERRORS', errs); await b.close();
