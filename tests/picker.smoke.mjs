// picker.smoke.mjs — <sonor-catalogue-picker>: groups by service → category, tabs, search auto-expands, keyboard Enter picks, pointerdown drags.
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 700, height: 700 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto((process.env.KIT_URL || 'http://localhost:8770') + '/tests/fixtures/picker.html'); await p.waitForTimeout(300);
console.log('services', await p.$$eval('.s-cp-svc-h', (h) => h.map((x) => x.textContent.trim().replace(/\s+/g, ' '))));
console.log('categories', await p.$$eval('.s-cp-cat-h', (h) => h.length), 'items', await p.$$eval('.s-cp-item', (h) => h.length));
await p.click('.s-cp-tab[data-tab="accessory"]'); await p.waitForTimeout(50); console.log('accessory tab items', await p.$$eval('.s-cp-item', (h) => h.map((x) => x.querySelector('.s-cp-name').textContent)));
await p.click('.s-cp-tab[data-tab="device"]'); await p.fill('.s-cp-search', 'triad'); await p.waitForTimeout(50);
console.log('search triad →', await p.$$eval('.s-cp-item', (h) => h.map((x) => x.querySelector('.s-cp-name').textContent)));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(50);
await p.fill('.s-cp-search', ''); await p.waitForTimeout(50); const first = await p.$('.s-cp-item'); const bb = await first.boundingBox(); await p.mouse.move(bb.x + 10, bb.y + 10); await p.mouse.down(); await p.mouse.up();
console.log('picks', await p.evaluate(() => window.__picks), 'drags', await p.evaluate(() => window.__drags));
await p.screenshot({ path: process.env.SHOT || '/tmp/claude-0/-home-claude/e4a4e309-50af-5982-9800-dfb15970bc52/scratchpad/picker.png' });
console.log('ERRORS', errs); await b.close();
