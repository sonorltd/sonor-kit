# PATTERNS — how Sonor apps do things (and the kit piece that does it)
Read before building UI. If the pattern you need is here, use the component. If it is not, build it in the kit first (S-4.22).

| Pattern | Kit piece | Notes |
|---|---|---|
| Things in slots (rack U, DIN TE, patch ports) | `<sonor-slot-grid>` | fixed slots, refuse-by-default, ⌥ shove, auto-layout as a start, SVG → PDF |
| Popover menu on a control (pill + ▾) | `.s-menu` + `SonorWqBar` as the reference | `data-swq-*` action attributes, Esc / outside click closes, one menu open at a time |
| Destructive action | two-click arm ("revoke — sure?", 6 s) | never `confirm()` |
| Status chips | `.chip-stage-*`, `.swq-warn`, `.swq-ok` | stage colours are fixed semantics, not themed |
| Modal with actions | `SonorModal.create({ title, body, actions })` | actions get `kind` / `disabled` / `attrs`; body is a DOM node |
| Product / block / area picker | `SonorWqPicker` (Takeoffs today → kit next) | recommended list first, catalogue SKU lookup row |
| Icons | `SonorIcons.svg(name)` / `.auto(root)` | Lucide only; emoji are the fallback when the module is absent |
| Empty / loading | `.s-empty`, `.s-skeleton*` | never a blank panel |
| Private client link | `client_docs` + `doc` edge fn + landing page | token, revocable, view-counted |
| Live data | Supabase realtime on the table the view reads; debounce 400 ms | the WQ bar is the reference |
| Bars under the header (project bar, tabs, filters, stats) | `.s-bar-2/3/4` tokens + `SonorTheme.ladder()` (theme.js ≥ 0.3.0) | steps are assigned by POSITION at boot — never hand-pick a bar colour; `data-bar-fixed` to opt a bar out |
| Hover / active / focus on any control | kit §18 rules (components.css ≥ 0.17.0) | never add an app `:hover` transform/shadow/opacity or an inline onmouseover — the kit already does it |
| Text or glyph on a computed fill (service colour, status hex) | `sonorInkFor(colour)` (sonor-app.js) | dark on bright fills, white on deep — never hard-code `#fff` |
