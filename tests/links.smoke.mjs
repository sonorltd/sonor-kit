// links.smoke.mjs — <sonor-links-banner> / <sonor-links-button> in a real browser (catalogue page, fake SonorRevisions):
// banner rows for attention sources only, locked / unreachable chips, ✕ acks, Keep locked locks, Update calls onUpdate
// then relinks, popover table + Used by + footer, Esc closes. Static server on 8770 (python3 -m http.server 8770).
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto((process.env.KIT_URL || 'http://localhost:8770') + '/catalogue/links.html'); await p.waitForTimeout(300);
const fails = []; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };
const rows = async () => p.$$eval('#ban [data-slk-row]', (r) => r.map((x) => x.getAttribute('data-slk-row')));
ok((await rows()).join(',') === 'takeoffs,library', 'banner rows = takeoffs, library: ' + (await rows()).join(','));
ok(/Takeoffs changed 2 h ago: 3 devices added/.test(await p.textContent('#ban')), 'one wording: "Takeoffs changed 2 h ago: 3 devices added …"');
const chips = await p.$$eval('#ban .slk-chip', (c) => c.map((x) => x.className + '|' + x.textContent.trim()));
ok(chips.some((c) => /slk-locked/.test(c) && /Amp channels locked at 53 rows · now 55 rows/.test(c)), 'locked chip for amps');
ok(chips.some((c) => /slk-muted/.test(c) && /Cable packages not reachable/.test(c)), 'grey chip for unreachable cable packages');
ok(await p.$eval('#btn .slk-dot', (d) => d.classList.contains('slk-dot-moved')), 'button dot amber (moved)');
await p.click('#ban [data-slk-act="ack"][data-slk-src="library"]'); await p.waitForTimeout(50);
ok((await rows()).join(',') === 'takeoffs', '✕ acks library → row hidden');
await p.click('#ban [data-slk-act="update"][data-slk-src="takeoffs"]'); await p.waitForTimeout(80);
ok(/Update takeoffs/.test(await p.textContent('#log')), 'Update → el.onUpdate called');
ok((await rows()).length === 0, 'after Update + relink the banner has no rows');
await p.click('#btn .slk-trigger'); await p.waitForTimeout(80);
const trs = await p.$$eval('#btn .slk-table tbody tr', (r) => r.map((x) => x.querySelector('th').textContent));
ok(trs.join(',') === 'Takeoffs,Network Map,Library,Amp channels,Cable packages', 'popover table rows: ' + trs.join(','));
ok(/Packs → #14/.test(await p.textContent('#btn .slk-used')), 'Used by lists Packs behind');
ok(/Next revision will record:/.test(await p.textContent('#btn .slk-foot')), 'footer: next revision will record');
await p.click('#btn [data-slk-act="unlock"][data-slk-src="amps"]'); await p.waitForTimeout(80);
ok((await p.$$eval('#ban [data-slk-row]', (r) => r.map((x) => x.getAttribute('data-slk-row')))).includes('amps'), 'unlock amps → amps now warns in the banner');
await p.keyboard.press('Escape'); await p.waitForTimeout(30);
await p.click('#ban [data-slk-act="lock"][data-slk-src="amps"]'); await p.waitForTimeout(80);
ok(!(await rows()).includes('amps'), 'Keep locked → amps back to a chip');
await p.click('#btn .slk-trigger'); await p.waitForTimeout(30); await p.keyboard.press('Escape'); await p.waitForTimeout(30);
ok(!(await p.$('#btn .slk-pop')), 'Esc closes the popover');
ok(!errs.length, 'no page errors ' + errs.join(' | '));
await b.close();
if (fails.length) { console.log(fails.length + ' failed'); process.exit(1); } else console.log('links smoke: all ok');
