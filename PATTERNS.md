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
| Library bar — grouped service palette; use for any list of library items (blocks, devices, catalogue rows) in a side panel | `<sonor-library-bar>` · `SonorLibraryBar.mount(el, opts)` (kit ≥ 0.8.0) | services 01→10 via the sort law, sub-groups `subgroups.byTier()` / `byField()`, chips, search, expand / collapse all, rail (`collapsed`, `storageKey`), tree keyboard, `drag: 'html5' \| 'pointer'`; app extras through `getItemBadges` / `getGroupBadges` / `renderIcon` / `renderItem` / `sections` / `recent` / `tools` / `headerExtra` and `refreshBadges()` for live counts — never fork the palette markup. Pop-over "add from the Library" menus stay on `<sonor-catalogue-picker>`. |
| Another app changed what this page was built from / which version is this linked or locked to | `<sonor-links-banner>` + `<sonor-links-button>` (kit ≥ 0.9.0) over root `SonorRevisions` ≥ 1.1.0 | one wording (`SonorRevisions.describe`); Update goes through the app's own re-read (`el.onUpdate`) then records the link; field-level overwrites through `SonorOverwriteGuard`; never block an export — warn in one line. |
