/**
 * sonor-theme.js — ONE theme switch for every back-end app (sonor-kit, B-487, 2026-09-29).
 * Bryn: "dark theme for apps throughout… constant, neutral grey with service accents… back just in case".
 *
 *   Themes come from brand.css ([data-theme='graphite'] = macOS-dark neutral grey, the back-end default going forward;
 *   'slate' = the light fallback). Service colours never change. Client-facing surfaces opt out with data-theme-lock.
 *
 *   Load EARLY (classic script, before the app's CSS paints) — the kit loader also loads it, but for a flash-free boot
 *   put it first:  <script src="https://sonorltd.github.io/sonor-kit/v1/modules/sonor-theme.js"></script>
 *   Persists the choice in localStorage 'sonor-theme' (shared by every app on the same origin… and, because every app
 *   is its own GitHub Pages origin, also mirrored into the URL-free cookie 'sonor_theme' on .github.io so the choice
 *   follows you across apps). A ◐ toggle mounts itself into the shared header (.header-right) or project bar when present.
 *
 *   API: SonorTheme.get() → 'graphite'|'slate'|…  SonorTheme.set(name)  SonorTheme.toggle()  SonorTheme.mount(host)
 *   Event: document 'sonor:theme' { theme }
 */
(function (global) {
  'use strict';
  var VERSION = '0.1.0';
  var KEY = 'sonor-theme', COOKIE = 'sonor_theme';
  var DARK = 'graphite', LIGHT = 'slate';
  var doc = global.document; if (!doc) { global.SonorTheme = { VERSION: VERSION }; return; }
  var html = doc.documentElement;
  var locked = html.hasAttribute('data-theme-lock');

  function readCookie() { var m = doc.cookie.match(/(?:^|;\s*)sonor_theme=([a-z-]+)/); return m ? m[1] : null; }
  function writeCookie(v) { try { var d = new Date(Date.now() + 365 * 864e5).toUTCString(); doc.cookie = COOKIE + '=' + v + '; expires=' + d + '; path=/; SameSite=Lax' + (/github\.io$/.test(location.hostname) ? '; domain=.github.io' : ''); } catch (_) {} }
  function stored() { try { return localStorage.getItem(KEY) || readCookie(); } catch (_) { return readCookie(); } }
  function get() { return html.getAttribute('data-theme') || LIGHT; }
  function set(name, opts) {
    if (!name) return get();
    html.setAttribute('data-theme', name);
    if (!(opts && opts.silent)) { try { localStorage.setItem(KEY, name); } catch (_) {} writeCookie(name); }
    html.style.colorScheme = (name === DARK || name === 'nocturne' || name === 'dark') ? 'dark' : 'light';
    doc.querySelectorAll('.sonor-theme-btn').forEach(paint);
    doc.dispatchEvent(new CustomEvent('sonor:theme', { detail: { theme: name } }));
    return name;
  }
  function toggle() { return set(get() === DARK ? LIGHT : DARK); }
  function paint(btn) { var dark = get() === DARK; btn.setAttribute('aria-pressed', dark ? 'true' : 'false'); btn.title = dark ? 'Graphite (dark) — click for the light fallback' : 'Slate (light) — click for graphite'; btn.innerHTML = dark ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'; }
  function mount(host) {
    host = typeof host === 'string' ? doc.querySelector(host) : host; if (!host || host.querySelector('.sonor-theme-btn')) return null;
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'sonor-theme-btn';
    b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;border:1px solid var(--border-strong,rgba(255,255,255,.2));background:transparent;color:inherit;cursor:pointer;opacity:.85';
    b.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
    paint(b); host.appendChild(b); return b;
  }
  function autoMount() {
    if (locked) return;
    var tries = 0, t = setInterval(function () {
      var host = doc.querySelector('.header .header-right') || doc.querySelector('.sonor-project-bar .meta') || doc.querySelector('.sonor-header-right');
      if (host) { mount(host); clearInterval(t); } else if (++tries > 40) clearInterval(t);
    }, 250);
  }

  // apply the remembered theme NOW (before first paint when loaded in <head>)
  if (!locked) { var s = stored(); if (s && s !== get()) set(s, { silent: true }); else html.style.colorScheme = get() === DARK ? 'dark' : 'light'; }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', autoMount); else autoMount();

  global.SonorTheme = { VERSION: VERSION, get: get, set: set, toggle: toggle, mount: mount, DARK: DARK, LIGHT: LIGHT };
})(typeof window !== 'undefined' ? window : globalThis);
