// links-sample.js — a fake SonorRevisions (1.1.0 links surface) for the catalogue page. Real apps load root
// sonor-revisions.js ≥ 1.1.0; this stub only fakes checkLinks / usedBy / watch / lock / unlock / ack / link.
(function () {
  var t = Date.now();
  var iso = function (minsAgo) { return new Date(t - minsAgo * 60000).toISOString(); };
  var links = {
    takeoffs: { kind: 'app', app_key: 'takeoffs', display_label: 'A3', linked_at: iso(180), locked: false },
    netmap: { kind: 'app', app_key: 'netmap', display_label: 'r12', linked_at: iso(180), locked: false },
    library: { kind: 'library', rev: 7, linked_at: iso(180), locked: false },
    amps: { kind: 'amps', counts: { rows: 53 }, linked_at: iso(180), locked: true, locked_by: 'SE' },
    cablepkgs: { kind: 'cablepkgs', counts: { packages: 14 }, linked_at: iso(180) },
  };
  var acked = {};
  function ago(i) { var m = Math.round((Date.now() - Date.parse(i)) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; }
  var LBL = { takeoffs: 'Takeoffs', netmap: 'Network Map', library: 'Library', amps: 'Amp channels', cablepkgs: 'Cable packages' };
  function status() {
    var rows = [
      { source: 'takeoffs', now: 'A5', moved: true, why: 'new-revision', upstream_at: iso(120), delta: { added: 3, removed: 1, text: '3 devices added · 1 removed · 2 moved room' } },
      { source: 'netmap', now: 'r12', moved: false },
      { source: 'library', now: 'r7', moved: true, why: 'edited-since', upstream_at: iso(14), delta: { changed: ['SPK-IC8', 'AMP-16'], text: '2 blocks edited' } },
      { source: 'amps', now: '55 rows', moved: true, why: 'edited-since', upstream_at: iso(40) },
      { source: 'cablepkgs', now: null, why: 'source-unavailable' },
    ];
    return rows.map(function (r) {
      var l = links[r.source], linked = l.display_label || (l.rev != null ? 'r' + l.rev : (l.counts && (l.counts.rows || l.counts.packages) + (l.counts.rows ? ' rows' : ' packages')));
      if (!r.moved && r.why !== 'source-unavailable' && l._relinked) linked = r.now;
      var moved = !!r.moved && !l._relinked, s = { source: r.source, label: LBL[r.source], linked: linked, now: r.now, moved: moved, why: moved ? r.why : r.why === 'source-unavailable' ? r.why : null,
        locked: !!l.locked, acked: !!acked[r.source], delta: moved ? r.delta || null : null, upstream_at: r.upstream_at || null, ago: moved && r.upstream_at ? ago(r.upstream_at) : null, link: l, current: { kind: l.kind } };
      if (l._relinked) s.linked = r.now;
      s.attention = s.moved && !s.locked && !s.acked;
      s.text = s.why === 'source-unavailable' ? s.label + ' not reachable' : s.locked ? s.label + ' locked at ' + s.linked + (s.moved ? ' · now ' + s.now : '')
        : !s.moved ? s.label + ' current (' + s.linked + ')' : s.label + (s.why === 'edited-since' ? ' edited ' : ' changed ') + s.ago + (s.delta ? ': ' + s.delta.text : '') + (s.linked === s.now ? ' (linked ' + s.linked + ')' : ' (linked ' + s.linked + ' → now ' + s.now + ')');
      return s;
    });
  }
  var subs = [];
  function bump() { setTimeout(function () { var s = status(); subs.forEach(function (fn) { fn(s); }); }, 0); }
  window.SonorRevisions = {
    VERSION: '1.1.0-sample', _linksConfigured: true, configure: function () { return this; }, ago: ago,
    checkLinks: function () { return Promise.resolve(status()); },
    usedBy: function () { return Promise.resolve([{ consumer: 'packs', label: 'Packs', status: { linked: '#14', now: '#15', moved: true } }, { consumer: 'pm', label: 'Project Master', status: { linked: '#15', now: '#15', moved: false } }]); },
    watch: function (pid, keys, cb) { subs.push(cb); return function () { subs = subs.filter(function (x) { return x !== cb; }); }; },
    lock: function (app, pid, s, o) { links[s].locked = true; links[s].locked_by = (o && o.by) || 'you'; bump(); return Promise.resolve(links[s]); },
    unlock: function (app, pid, s) { links[s].locked = false; links[s].locked_by = null; bump(); return Promise.resolve(links[s]); },
    ack: function (app, pid, s) { acked[s] = true; bump(); return Promise.resolve(links[s]); },
    link: function (app, pid, s) { links[s]._relinked = true; links[s].linked_at = new Date().toISOString(); acked[s] = false; bump(); return Promise.resolve(links[s]); },
    builtFromText: function (l) { return 'From ' + Object.keys(l).map(function (k) { var x = l[k]; return LBL[k] + ' ' + (x._relinked ? 'now' : x.display_label || (x.rev != null ? 'r' + x.rev : '')) + (x.locked ? ' 🔒' : ''); }).join(' · '); },
  };
})();
