// library-bar.smoke.mjs — <sonor-library-bar> in a real browser (catalogue page): tree + ARIA, chips, search auto-open,
// keyboard (↓ from search, → / ← / Enter), dblclick pick, live badges patched WITHOUT re-render (node identity kept),
// HTML5 drag payload, service lock (mode), rail collapse remembered across reload. Static server on 8770 (python3 -m http.server 8770).
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const URL0 = (process.env.KIT_URL || 'http://localhost:8770') + '/catalogue/library-bar.html';
await p.goto(URL0 + '?fresh=1'); await p.waitForTimeout(300);
const fails = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
const E = '#eng';
ok(await p.$eval(E + ' .slb-body', (el) => el.getAttribute('role')) === 'tree', 'body is role=tree');
const heads = await p.$$eval(E + ' .slb-ghead .slb-gnn', (h) => h.map((x) => x.textContent));
ok(heads.join(',') === '01,02,03,04,05,06,07,08,09,10', 'groups 01→10 in service order: ' + heads.join(','));
ok((await p.$$eval(E + ' .slb-chip', (c) => c.map((x) => x.textContent.trim().split(' ')[0]))).join(' ') === 'All CIN AUD VID LIGHT AUTO CLIM CTRL SEC NET STR', 'chips All CIN … STR');
await p.click(E + ' .slb-chip[data-svc="08"]'); ok((await p.$$eval(E + ' .slb-ghead', (h) => h.length)) === 1, 'SEC chip filters to one group');
await p.click(E + ' .slb-chip-all');
await p.click(E + ' .slb-tool[data-act="collapse"]'); ok((await p.$$eval(E + ' .slb-item', (i) => i.length)) === 0, 'collapse all hides items');
await p.fill(E + ' .slb-search', 'araknis'); await p.waitForTimeout(50);
ok((await p.$$eval(E + ' .slb-item .slb-name', (i) => i.map((x) => x.textContent))).length === 2, 'search opens collapsed groups (araknis → 2)');
await p.keyboard.press('ArrowDown'); ok(await p.evaluate(() => document.activeElement.classList.contains('slb-ghead')), '↓ from search focuses the first tree row');
await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
ok(await p.evaluate(() => document.activeElement.classList.contains('slb-item') && document.activeElement.getAttribute('aria-level') === '3'), 'item rows are aria-level 3');
await p.keyboard.press('Enter'); ok((await p.textContent('#engLog')).includes('(keyboard)'), 'Enter picks (onPick via keyboard)');
await p.fill(E + ' .slb-search', ''); await p.click(E + ' .slb-tool[data-act="expand"]');
const row = await p.$(E + ' .slb-item'); await row.dblclick(); ok((await p.textContent('#engLog')).includes('(dblclick)'), 'pickOn dblclick');
// keyboard collapse with ←
await p.focus(E + ' .slb-ghead'); await p.keyboard.press('ArrowLeft'); ok((await p.$eval(E + ' .slb-ghead', (h) => h.getAttribute('aria-expanded'))) === 'false', '← collapses a group');
await p.keyboard.press('ArrowRight'); ok((await p.$eval(E + ' .slb-ghead', (h) => h.getAttribute('aria-expanded'))) === 'true', '→ expands it again');
// HTML5 drag payload
const payload = await p.evaluate(() => { const it = document.querySelector('#eng .slb-item'); const dt = new DataTransfer(); it.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt })); return dt.getData('application/sonor-template') === it.dataset.id; });
ok(payload, 'dragstart sets the dragType payload');
// Takeoffs: live badges without re-render
const T = '#tko';
await p.click(T + ' .slb-item[data-id="net-wap"]');
const before = await p.evaluate(() => { window.__node = document.querySelector('#tko .slb-group[data-service-nn="09"] .slb-item[data-id="net-wap"]'); return window.__node.querySelector('.slb-corner').textContent; });
await p.click('#place'); await p.waitForTimeout(30);
const after = await p.evaluate(() => [window.__node.isConnected, window.__node.querySelector('.slb-corner').textContent]);
ok(after[0] && +after[1] === +before + 1, `refreshBadges patches in place (${before} → ${after[1]}, same node)`);
ok((await p.$$eval(T + ' .slb-section[data-section="recent"] .slb-item', (i) => i.length)) === 1, 'Recent section fed by picks');
await p.click('#floor'); ok((await p.$eval(T + ' .slb-group[data-service-nn="09"] .slb-ghead .slb-gbadges', (b) => b.textContent)) === '3', 'group badge follows the floor (1F WAP = 3)');
await p.click('#mode'); ok((await p.$$eval(T + ' .slb-group:not(.slb-section)', (g) => g.map((x) => x.dataset.serviceNn))).join() === '08' && !(await p.$(T + ' .slb-section')), 'mode lock: service 08 only, sections hidden');
await p.click('#mode');
await p.click(T + ' .slb-tool-x[data-tool="wq"]'); ok((await p.$$eval(T + ' .slb-group:not(.slb-section) .slb-item', (i) => i.every((x) => x.querySelector('.slb-tone-info')))), 'tool: WQ-linked filter');
// rail: collapse, reload, still collapsed (remembered); open again
await p.click(E + ' .slb-collapse'); ok(await p.$eval(E, (e) => e.classList.contains('slb-rail')), 'collapse → rail');
await p.goto(URL0); await p.waitForTimeout(300); ok(await p.$eval(E, (e) => e.classList.contains('slb-rail')), 'rail remembered across reload');
ok(await p.$eval('#rail', (e) => e.classList.contains('slb-rail')), 'collapsed:true default honoured');
await p.click(E + ' .slb-rail-btn'); ok(!(await p.$eval(E, (e) => e.classList.contains('slb-rail'))), 'rail opens');
if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT, fullPage: true });
console.log('ERRORS', errs); await b.close(); process.exit(fails.length || errs.length ? 1 : 0);
