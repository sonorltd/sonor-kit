// contrast.mjs — sonor-platform §13 gate: every visible text node in an app is checked against its EFFECTIVE background
// (alpha-blended up the tree, opacity chain applied). Anything under 3:1 is listed; the bar ladder under the header is
// printed too. Run against any served app:  node tests/contrast.mjs http://localhost:8765/sonor-library.html [more urls…]
// Exit 1 when a page has > MAX_BAD low-contrast text elements (default 0; set MAX_BAD=5 to tolerate legacy noise).
import { chromium } from '@playwright/test';
const urls = process.argv.slice(2); if (!urls.length) { console.log('usage: node tests/contrast.mjs <url> [url…]'); process.exit(2); }
const MAX_BAD = +(process.env.MAX_BAD || 0), MIN = +(process.env.MIN_RATIO || 3);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
let failed = 0;
for (const u of urls) {
  const p = await b.newPage({ viewport: { width: 1500, height: 950 } });
  if (process.env.NO_KIT) await p.route(/github\.io\/sonor-kit/, (r) => r.fulfill({ status: 404, body: '' }));
  try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { console.log('nav failed', u, e.message.slice(0, 60)); }
  await p.waitForTimeout(+(process.env.SETTLE_MS || 4000));
  const res = await p.evaluate((MIN) => {
    // parse rgb()/rgba()/color(srgb r g b / a)
    const parse = (c) => { if (!c) return null; let m; if ((m = c.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/))) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] === undefined ? 1 : +m[4] }; m = c.match(/[\d.]+/g); if (!m) return null; return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const canvas = (() => { for (const e of [document.body, document.documentElement]) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) return c; } return document.documentElement.getAttribute('data-theme') === 'graphite' ? { r: 28, g: 28, b: 30, a: 1 } : { r: 255, g: 255, b: 255, a: 1 }; })();
    const effBg = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } } let acc = canvas; for (const l of layers.reverse()) acc = over(l, acc); return acc; };
    const out = []; const seen = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      const t = n.textContent.trim(); if (t.length < 2) continue; const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      if (el.closest('script,style,option,[hidden],[data-csv-tool],[data-sort-input]')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > 950 || r.right < 0) continue;
      let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity; if (op < 0.05) continue; // hidden modals
      let fg = parse(cs.color); if (!fg) continue; const bg = effBg(el); if (fg.a < 1) fg = over(fg, bg);
      const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const eff = 1 + (ratio - 1) * op;   // faint opacity reads as lower contrast
      if (eff < MIN) out.push({ ratio: +eff.toFixed(2), text: t.slice(0, 26), sel: (el.id ? '#' + el.id : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : '')), fg: `${Math.round(fg.r)},${Math.round(fg.g)},${Math.round(fg.b)}`, bg: `${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}`, top: Math.round(r.top) });
    }
    const bars = []; for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.width < 700 || r.height < 20 || r.height > 90 || r.top < 0 || r.top > 260) continue; const c = parse(getComputedStyle(el).backgroundColor); if (!c || c.a < 0.5) continue; bars.push({ top: Math.round(r.top), h: Math.round(r.height), L: Math.round(0.299 * c.r + 0.587 * c.g + 0.114 * c.b), sel: (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 2).join('.') }); }
    const uniq = new Map(); bars.sort((a, b) => a.top - b.top).forEach((x) => { const k = x.top + ':' + x.h; if (!uniq.has(k)) uniq.set(k, x); });
    return { theme: document.documentElement.getAttribute('data-theme'), checked: seen.size, bad: out, bars: [...uniq.values()].slice(0, 8) };
  }, MIN);
  const name = u.split('/').slice(-2).join('/');
  console.log(`== ${name}  theme=${res.theme}  text=${res.checked}  low-contrast=${res.bad.length}`);
  console.log('   bars: ' + res.bars.map((x) => `${x.top}+${x.h} L${x.L} ${x.sel}`.slice(0, 40)).join('  |  '));
  for (const x of res.bad.slice(0, 20)) console.log('   ', String(x.ratio).padStart(5), String(x.top).padStart(4), x.sel.slice(0, 32).padEnd(32), JSON.stringify(x.text).padEnd(28), `rgb(${x.fg}) on rgb(${x.bg})`);
  if (res.bad.length > MAX_BAD) failed++;
  await p.close();
}
await b.close(); process.exit(failed ? 1 : 0);
