// gate-all.mjs — sonor-platform §20: THE ALL-APPS GATE (2026-09-29, Bryn: "get this right everywhere so we are not doing
// one by one fixes"). Renders every entry page in gate-pages.txt with the theme forced to graphite and the served kit routed to
// the local v1 build, then reports per page: theme · header height · bar ladder (luminance steps under the header) · light
// surfaces outside .s-paper/[data-paper] · text under 3:1 · visible CSV controls · page errors. Run from the workspace root:
//   python3 -m http.server 8790 &   then   node sonor-kit/tests/gate-all.mjs        (BASE / APPS / KIT_DIR / CHROME env overrides)
// Goal state for every graphite row: hdr46 · light0 · low0 · no ERR · no LADDER✗. Fix at the kit / vocab / master level first.
import { chromium } from '@playwright/test';
import fs from 'fs';
const B = process.env.BASE || 'http://localhost:8790/';   // serve the workspace root (python3 -m http.server 8790) or a bundle of it
const pages = fs.readFileSync(process.env.APPS || new URL('./gate-pages.txt', import.meta.url), 'utf8').trim().split('\n').map(l=>{const [app,entry]=l.split('|'); return {name: app.replace(/^APP - /,'')+'/'+entry.split('/').pop(), url: B+encodeURI(app+'/'+entry)};});
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox'] });
const rows=[];
for (const pg of pages) {
  const p = await b.newPage({ viewport: { width: 1500, height: 950 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message.slice(0,80)));
  await p.addInitScript(() => { try { localStorage.setItem('sonor-theme','graphite'); } catch {} });
  await p.route(/sonorltd\.github\.io\/sonor-kit\/(.*)/, async r => { const m = r.request().url().match(/sonor-kit\/(.*)$/); const f = (process.env.KIT_DIR || 'sonor-kit/') + m[1].split('?')[0]; try { const body = fs.readFileSync(f); const ct = f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/json'; r.fulfill({ status: 200, body, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } }); } catch { r.fulfill({ status: 404, body: '' }); } });
  try { await p.goto(pg.url, { waitUntil: 'domcontentloaded', timeout: 40000 }); } catch(e) { rows.push({name:pg.name, nav:'FAIL '+e.message.slice(0,40)}); await p.close(); continue; }
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => {
    const parse=(c)=>{ if(!c) return null; let m; if((m=c.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/))) return {r:+m[1]*255,g:+m[2]*255,b:+m[3]*255,a:m[4]===undefined?1:+m[4]}; m=c.match(/[\d.]+/g); if(!m) return null; return {r:+m[0],g:+m[1],b:+m[2],a:m[3]===undefined?1:+m[3]}; };
    const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
    const over=(fg,bg)=>({r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a),a:1});
    const L8=(c)=>Math.round(0.299*c.r+0.587*c.g+0.114*c.b);
    const html=document.documentElement; const theme=html.getAttribute('data-theme'); const locked=html.hasAttribute('data-theme-lock');
    const canvas=(()=>{for(const e of [document.body,html]){const c=parse(getComputedStyle(e).backgroundColor); if(c&&c.a>0) return c;} return {r:28,g:28,b:30,a:1};})();
    const effBg=(el)=>{const layers=[]; for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor); if(c&&c.a>0){layers.push(c); if(c.a>=1)break;}} let acc=canvas; for(const l of layers.reverse()) acc=over(l,acc); return acc;};
    // bars
    const bars=[]; for(const el of document.querySelectorAll('body *')){ if(/^(SELECT|INPUT|BUTTON|TEXTAREA|OPTION)$/.test(el.tagName)||el.closest('.s-paper')) continue; const r=el.getBoundingClientRect(); const isHdr=!!el.closest('#sonor-header,.header'); if(r.width<innerWidth*0.95||r.left>8||r.height<18||r.height>120||r.top<0||r.top>320) continue; const c=parse(getComputedStyle(el).backgroundColor); if(!c||c.a<.5) continue; bars.push({top:Math.round(r.top),h:Math.round(r.height),L:L8(c),sel:(el.id?'#'+el.id:'')+'.'+String(el.className).split(' ').slice(0,2).join('.')});}
    const u=new Map(); bars.sort((a,b)=>a.top-b.top||b.h-a.h).forEach(x=>{if(!u.has(x.top))u.set(x.top,x)}); const ladder=[...u.values()];
    const ladderBad=[]; for(let i=1;i<ladder.length;i++){ if(ladder[i].L<=ladder[i-1].L) ladderBad.push(ladder[i].sel+' L'+ladder[i].L+'≤'+ladder[i-1].L); if(ladder[i].L>90) ladderBad.push(ladder[i].sel+' light L'+ladder[i].L); }
    // white / light surfaces (graphite only) outside paper
    const light=[]; if(theme==='graphite'){ for(const el of document.querySelectorAll('div,section,aside,table,nav,header,form,main,ul')){ const r=el.getBoundingClientRect(); if(r.width<160||r.height<50||r.bottom<0||r.top>950) continue; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue; const c=parse(cs.backgroundColor); if(!c||c.a<.9) continue; if(L8(c)<150) continue; if(el.closest('.s-paper,.u-card,[data-paper],.pdf-page,.page,.sheet,.cover')) continue; light.push((el.id?'#'+el.id:'')+'.'+String(el.className).split(' ').slice(0,2).join('.')+' L'+L8(c)+' '+Math.round(r.width)+'x'+Math.round(r.height)); if(light.length>=6) break; } }
    // contrast
    let checked=0; const bad=[]; const seen=new Set(); const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
    while((n=w.nextNode())){ const t=n.textContent.trim(); if(t.length<2) continue; const el=n.parentElement; if(!el||seen.has(el)) continue; seen.add(el); if(el.closest('script,style,option,[hidden],[data-csv-tool],[data-sort-input]')) continue; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue; const r=el.getBoundingClientRect(); if(r.width<4||r.height<4||r.bottom<0||r.top>950||r.right<0) continue; let op=1; for(let e=el;e;e=e.parentElement) op*=+getComputedStyle(e).opacity; if(op<0.05) continue; let fg=parse(cs.color); if(!fg) continue; const bg=effBg(el); if(fg.a<1) fg=over(fg,bg); const L1=lum(fg),L2=lum(bg); const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05); const eff=1+(ratio-1)*op; checked++; if(eff<3) bad.push(t.slice(0,18)+' '+eff.toFixed(1)+' '+(el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+String(el.className).split(' ')[0])); }
    const hdr=document.querySelector('#sonor-header, .header'); const hh=hdr?Math.round(hdr.getBoundingClientRect().height):null;
    const dots=!!document.querySelector('.header .badge-row .svc-dot, .header .svc-dot');
    const csv=[...document.querySelectorAll('button,a,label')].filter(e=>/csv/i.test(e.textContent)&&!e.closest('[hidden],[data-csv-tool]')&&getComputedStyle(e).display!=='none').length;
    return {theme,locked,bodyBg:L8(canvas),ladder:ladder.map(x=>x.L+(x.sel.includes('header')?'h':'')).join('→'),ladderBad,light,checked,badN:bad.length,bad:bad.slice(0,5),hh,dots,themeBtn:!!document.querySelector('.sonor-theme-btn'),csv};
  });
  r.name=pg.name; r.errs=errs.slice(0,2); rows.push(r);
  await p.screenshot({ path: 'gate-'+pg.name.replace(/[^a-z0-9]+/gi,'_')+'.png', clip:{x:0,y:0,width:1500,height:420} });
  await p.close();
}
await b.close();
fs.writeFileSync('gate-results.json', JSON.stringify(rows,null,1));
for (const r of rows) console.log((r.nav?'NAV '+r.nav+' ':'')+r.name.padEnd(42)+(r.theme||'').padEnd(9)+(r.locked?'LOCK ':'     ')+'body'+String(r.bodyBg).padEnd(4)+' hdr'+String(r.hh).padEnd(4)+' ladder '+String(r.ladder).padEnd(22)+(r.ladderBad&&r.ladderBad.length?' LADDER✗'+r.ladderBad.length:'')+' light'+(r.light?r.light.length:'-')+' low'+r.badN+'/'+r.checked+(r.dots?' DOTS':'')+(r.csv?' CSV'+r.csv:'')+(r.themeBtn?'':' noBtn')+(r.errs&&r.errs.length?' ERR':''));
