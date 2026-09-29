// ladder.smoke.mjs — sonor-platform §9 gate: under the shared header every full-width bar must be DARK and one step
// LIGHTER than the bar above it (positional ladder, sonor-theme.js v0.3.0). Exits 1 if any bar is darker than the one
// above it or as dark as the header. Usage: node tests/ladder.smoke.mjs http://localhost:8765/board.html [more urls…]
import { chromium } from '@playwright/test';
const urls = process.argv.slice(2); if (!urls.length) { console.log('usage: node tests/ladder.smoke.mjs <url> [url…]'); process.exit(2); }
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
let failed = 0;
for (const u of urls) {
  const p = await b.newPage({ viewport: { width: 1500, height: 950 } });
  await p.addInitScript(() => { try { localStorage.setItem('sonor-theme', 'graphite'); } catch {} });
  try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { console.log('nav failed', u, e.message.slice(0, 60)); }
  await p.waitForTimeout(+(process.env.SETTLE_MS || 5500));
  const bars = await p.evaluate(() => {
    const L = (c) => { const m = (c || '').match(/[\d.]+/g); if (!m || (m[3] !== undefined && +m[3] < .5)) return null; return Math.round(0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]); };
    const out = []; for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.width < innerWidth * 0.6 || r.height < 18 || r.height > 120 || r.top < 0 || r.top > 320) continue; const l = L(getComputedStyle(el).backgroundColor); if (l == null) continue; out.push({ top: Math.round(r.top), h: Math.round(r.height), L: l, sel: (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 2).join('.'), step: el.getAttribute('data-bar-step') }); }
    const u = new Map(); out.sort((a, b) => a.top - b.top || b.h - a.h).forEach((x) => { const k = x.top; if (!u.has(k)) u.set(k, x); }); return [...u.values()];
  });
  const name = u.split('/').slice(-2).join('/'); const errs = [];
  for (let i = 1; i < bars.length; i++) { if (bars[i].L <= bars[i - 1].L) errs.push(`${bars[i].sel} L${bars[i].L} not lighter than ${bars[i - 1].sel} L${bars[i - 1].L}`); if (bars[i].L > 90) errs.push(`${bars[i].sel} L${bars[i].L} is not dark`); }
  console.log(`== ${name}  bars=${bars.length}  ${errs.length ? 'FAIL' : 'ok'}`);
  console.log('   ' + bars.map((x) => `${x.top}+${x.h} L${x.L}${x.step ? ' s' + x.step : ''} ${x.sel}`).join('  |  '));
  errs.forEach((e) => console.log('   ✗ ' + e)); if (errs.length) failed++;
  await p.close();
}
await b.close(); process.exit(failed ? 1 : 0);
