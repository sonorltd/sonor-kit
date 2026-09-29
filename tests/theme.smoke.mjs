// theme.smoke.mjs — graphite check for any back-end app: opens each URL with the theme forced, reports body colours, large pure-white boxes (regressions) and whether the ◐ toggle mounted; screenshots dark-<name>.png. Usage: URLS="pm=http://localhost:8769/sonor-project-master.html,lib=…" node tests/theme.smoke.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const shots = (process.env.URLS || 'pm=http://localhost:8769/sonor-project-master.html,lib=http://localhost:8765/sonor-library.html,eng=http://localhost:8771/app/index.html').split(',').map(s => { const [n, u] = s.split('='); return [n, u, 4000]; });
for (const [name, url, wait] of shots) {
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.addInitScript(() => { try { localStorage.setItem('sonor-theme', 'graphite'); } catch {} });
  await p.goto(url); await p.waitForTimeout(wait);
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'graphite')); await p.waitForTimeout(400);
  const info = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bodyBg: getComputedStyle(document.body).backgroundColor, bodyColor: getComputedStyle(document.body).color, whiteBoxes: Array.from(document.querySelectorAll('div,section,aside,table')).filter(el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 60 && /^rgb\(255, 255, 255\)$/.test(cs.backgroundColor) && cs.visibility !== 'hidden'; }).slice(0, 8).map(el => (el.id || el.className || el.tagName).toString().slice(0, 40)), themeBtn: !!document.querySelector('.sonor-theme-btn') }));
  console.log(name, JSON.stringify(info));
  await p.screenshot({ path: 'dark-' + name + '.png' }); await p.close();
}
await b.close();
