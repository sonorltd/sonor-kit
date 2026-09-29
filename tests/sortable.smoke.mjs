// sortable.smoke.mjs — a real pointer drag on a table reorders rows, renumbers with a gap, fires onReorder; ⌥↑ works.
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto((process.env.KIT_URL || 'http://localhost:8770') + '/tests/fixtures/sortable.html'); await p.waitForTimeout(300);
const rowOf = async (k) => (await p.$(`tr[data-id="${k}"]`)).boundingBox();
const h = await p.$('tr[data-id="b"] .s-drag'); const hb = await h.boundingBox(); const target = await rowOf('d');
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down(); await p.mouse.move(hb.x + 5, hb.y + 20, { steps: 4 }); await p.mouse.move(hb.x + 5, target.y + target.height - 2, { steps: 12 }); await p.mouse.up();
await p.waitForTimeout(100);
console.log('order after drag', await p.evaluate(() => [...document.querySelectorAll('tr[data-id]')].map((r) => r.dataset.id + '@' + r.dataset.sort).join(' ')));
console.log('changes', await p.evaluate(() => JSON.stringify(window.__changes.map((c) => c.map((x) => x.key + ':' + x.sort)))));
console.log('legacy input hidden', await p.evaluate(() => document.querySelector('[data-sort-input]').offsetParent === null));
await p.focus('tr[data-id="a"] .s-drag'); await p.keyboard.down('Alt'); await p.keyboard.press('ArrowDown'); await p.keyboard.up('Alt'); await p.waitForTimeout(50);
console.log('order after ⌥↓', await p.evaluate(() => [...document.querySelectorAll('tr[data-id]')].map((r) => r.dataset.id).join('')));
console.log('ERRORS', errs); await b.close();

// ── declarative mode: attributes only, persisted through the resolved client, late DOM picked up by the observer ──
{
  const b2 = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
  const p2 = await b2.newPage({ viewport: { width: 900, height: 600 } }); const e2 = []; p2.on('pageerror', (e) => e2.push(e.message));
  await p2.goto((process.env.KIT_URL || 'http://localhost:8770') + '/tests/fixtures/sortable-declared.html'); await p2.waitForTimeout(500);
  const h = await p2.$('tr[data-id="a"] .s-drag'); const hb = await h.boundingBox(); const t = await (await p2.$('tr[data-id="c"]')).boundingBox();
  await p2.mouse.move(hb.x + 5, hb.y + 8); await p2.mouse.down(); await p2.mouse.move(hb.x + 5, hb.y + 30, { steps: 4 }); await p2.mouse.move(hb.x + 5, t.y + t.height - 2, { steps: 10 }); await p2.mouse.up(); await p2.waitForTimeout(200);
  console.log('declared order', await p2.evaluate(() => [...document.querySelectorAll('tbody tr')].map((r) => r.dataset.id + '@' + r.dataset.sort).join(' ')));
  console.log('declared writes', await p2.evaluate(() => window.__writes));
  console.log('late container handles', await p2.evaluate(() => document.querySelectorAll('#late .s-drag').length));
  console.log('ERRORS', e2); await b2.close();
}
