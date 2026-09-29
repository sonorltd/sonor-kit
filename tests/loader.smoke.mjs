// loader.smoke.mjs — a consumer page loads the SERVED kit with one <script type="module"> line: CSS lands in the sonor-kit layer (app rules win), modules arrive in order, sonor:kit-ready fires, elements work.
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); });
await p.goto((process.env.KIT_URL || 'http://localhost:8770') + '/tests/fixtures/consumer.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 8000 }).catch(() => {});
console.log(await p.evaluate(() => ({ ready: window.__ready, kit: window.SonorKit && SonorKit.version, globals: ['SonorIcons', 'SonorModal', 'SonorProjectBar', 'SonorWqBar', 'SonorSlotGrid'].map(k => k + ':' + typeof window[k]).join(' '), layered: !!document.getElementById('sonor-kit-css'), appWins: getComputedStyle(document.getElementById('b')).paddingTop, iconSwapped: !!document.querySelector('#b svg.s-icon'), tiles: document.getElementById('g').shadowRoot.querySelectorAll('.tile').length })));
console.log('ERRORS', errs); await b.close();
