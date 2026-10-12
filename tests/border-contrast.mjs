// border-contrast.mjs — workspace audit for high-contrast (near-white) borders on the dark graphite theme (2026-10-12, Bryn:
// "everything looks too highly contrasted with white as the border, keep it grey tones … applies workspace and app wide").
// Usage (Playwright + Chromium): node tests/border-contrast.mjs https://sonorltd.github.io/sonor-takeoffs/ …  → audit.json + console
// Flags any visible border whose contrast against its (composited) background is ≥ 2.6 on a dark page. Service-colour accents
// (tab underlines, active states) show up too and are intended — the target is neutral light greys / whites (#CBD5E1, #fff, #ccc).
import { chromium } from 'playwright';
import fs from 'fs';
const urls = process.argv.slice(2);
const b = await chromium.launch(process.env.PW_CHROMIUM ? {executablePath: process.env.PW_CHROMIUM} : {});
const out = {};
for (const u of urls) {
  const ctx = await b.newContext({viewport:{width:1440,height:1000}, colorScheme:'dark'});
  const p = await ctx.newPage();
  try {
    await p.goto(u,{waitUntil:'networkidle',timeout:30000});
  } catch(e) { try { await p.waitForTimeout(3000); } catch{} }
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null; const a=m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}; };
    const lin = c => { c/=255; return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4); };
    const L = c => .2126*lin(c.r)+.7152*lin(c.g)+.0722*lin(c.b);
    const over = (f,bk) => ({r:f.r*f.a+bk.r*(1-f.a), g:f.g*f.a+bk.g*(1-f.a), b:f.b*f.a+bk.b*(1-f.a), a:1});
    const bgOf = el => { const st=[]; for(let e=el;e;e=e.parentElement){ const c=parse(getComputedStyle(e).backgroundColor); if(c&&c.a>0){st.push(c); if(c.a>=1)break;} } let base={r:28,g:28,b:30,a:1}; for(let i=st.length-1;i>=0;i--) base=over(st[i],base); return base; };
    const hits = {};
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el); if (cs.display==='none'||cs.visibility==='hidden') continue;
      const rc = el.getBoundingClientRect(); if (rc.width<4||rc.height<4) continue;
      for (const side of ['Top','Right','Bottom','Left']) {
        if (cs['border'+side+'Style']==='none' || parseFloat(cs['border'+side+'Width'])<0.5) continue;
        const c = parse(cs['border'+side+'Color']); if (!c || c.a<0.05) continue;
        const bg = bgOf(el.parentElement||el); const bc = over(c,bg);
        const l1=L(bc), l2=L(bg); const cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
        if (l2 < 0.2 && cr >= 2.6) { // dark page, bright border
          const key = el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.classList.length?'.'+[...el.classList].slice(0,3).join('.'):'');
          const k = key+' '+cs['border'+side+'Color'];
          hits[k]=(hits[k]||0)+1;
        }
        break;
      }
    }
    return {theme, hits};
  }).catch(e=>({err:String(e)}));
  out[u]=r; await ctx.close();
}
await b.close();
fs.writeFileSync('audit.json', JSON.stringify(out,null,1));
for (const [u,r] of Object.entries(out)) { const h=r.hits||{}; const ks=Object.entries(h).sort((a,b)=>b[1]-a[1]); console.log(`\n## ${u} theme=${r.theme} flagged=${ks.length}${r.err?' ERR '+r.err:''}`); ks.slice(0,12).forEach(([k,n])=>console.log('  ',n,k)); }
