# sonor-kit — Project Notes

**Current version: v0.6.2** (v1/manifest.json)
> Spine version: 1.4 (the kit IS the served Spine v1.4 surface — B-485) · Spine v1.4 (B-485 cohesion plan: `../reports/COHESION-PLAN_2026-09-29.md`).

## What this is
The served UI kit. Masters born here live in `src/`; masters still at the workspace root are pulled by `build-kit.sh` until cohesion step 2. Apps load `v1/kit.js` (see README). The catalogue (`catalogue/`) is the living style guide — **read it before building UI in any app**; a pattern needed by a second app is promoted here first (S-4.22), never copied.

## Laws
- BACKUP-FIRST, MODULAR-FIRST, no WeQuote writes from the browser — as the workspace.
- Every component: brand tokens only (`--fs-* --sp-* --r-* --dur-* --shadow-*`), Lucide via `sonor-icons.js`, `data-state` for hover / selected / dragging / invalid, keyboard + aria, `prefers-reduced-motion`.
- Custom elements are the boundary (vanilla + React 19). IIFE globals stay as adapters until every caller has moved.
- `build-kit.sh` before every commit; `node --test tests/*.test.mjs` green; smokes green.

## Components
| File | Element / global | Since | Notes |
|---|---|---|---|
| `src/sonor-slot-grid.js` | `<sonor-slot-grid>` · `SonorSlotGrid.{canPlace,place,autoLayout,stats,toSvg}` | v0.1.0 (B-484) | rack U bottom-up · DIN TE rows · patch ports; pointer drag, styled ghost, refuse / ⌥ shove (settle loop, never overlaps, never past the edge), hover / selected / dragging states, keyboard (arrows ⇧×5, Del, ⌘Z/⇧⌘Z, Enter, Esc), undo 100 deep, `beginExternalDrag` from any palette, `renderItem` faceplates, `rules.canPlace`, `toSvg` for PDFs. 7 unit tests + pointer smoke. |
| `src/sonor-theme.js` | `SonorTheme.{get,set,toggle,mount}` · event `sonor:theme` · injects `vocab.css` | v0.3.0 (B-487) / v0.2.0 module | graphite ↔ slate, remembered in localStorage + .github.io cookie so it follows you across apps; loads before paint; ◐ auto-mounts into the shared header / project bar; `data-theme-lock` opts a page out (client-facing). |
| `src/sonor-rack-calc.js` | `SonorRackCalc.{compute, specFromLibrary, breakerFor, upsRuntimeMin}` | v0.2.0 (B-484 t2b) | rack engineering numbers from Library specs: space per side, power W/A/VA + MCB, PoE draw vs budget, heat BTU/h + ventilation, weight vs rating + heavy-high, depth vs cabinet, outlets vs PDU, UPS protected load / runtime (exact or labelled estimate) / recommended VA, data completeness, warnings[]. 8 tests. |
| `src/sonor-sortable.js` | `SonorSortable.{attach, renumber, gapAfter, diffNumbers}` · events `sonor:reorder` / `sonor:sort-refused` | v0.4.0 (B-491) | ONE way to order anything: ⋮⋮ handle drag (pointer, ghost, auto-scroll), ⌥↑/⌥↓ + ⌥⇧ top/bottom, per-group sequences, gap renumbering (10, 20, 30… — only the moved row changes when there is room), hides legacy `[data-sort-input]`; `auto:` comparator = derived order, no handles. First consumer: Library Head End rules. |
| (pulled) `sonor-icons.js` `sonor-takeoffs-modal.js` `sonor-project-bar.js` `sonor-wq-bar.js` `components.css` `brand.css` | as today | root masters | move here in cohesion step 2 |

## Changelog
| v | date | change |
|---|---|---|
| 0.6.2 | 2026-09-29 | `sonor-theme.js` v0.3.2 — ladder finds bars by SHAPE (full-width opaque strips under the header; nested collapse; `body > header` counts as the header for own-chrome apps like C-Bus); `data/sonor-components.css` v0.17.0 **§18 hover/focus law** (one wash, no lifts, focus ring, reduced-motion); `.s-paper` now re-declares `--ink-mix` / `--ink-on-bright`; `tests/contrast.mjs` skips `[data-decorative]` / `[aria-hidden]`. Spec sweep over 26 pages (session log). |
| 0.6.0 | 2026-09-29 | `sonor-theme.js` v0.3.0 — **positional bar ladder** (`SonorTheme.ladder()`, sonor-platform §9): full-width bars under the header take --bar-2/3/4 in visual order (inline background), `data-bar-fixed` opts out. Cause: Packs stacks project-bar-first and rendered the ladder inverted (Bryn 22:39 "still doesn't look right"). New gate `tests/ladder.smoke.mjs` (fails if any bar is not lighter than the one above). Also `data/sonor-header.css` ≤480px phone rules (synced, not in kit.css). |
| 0.5.0 | 2026-09-29 | FRAMEWORK ROUND (Bryn: "not patches"): `v1/vocab.css` (generated from brand-core `<vocab>`, injected by `sonor-theme.js` v0.2.0 — every app colour name → token, every theme; per-app graphite blocks and the header-css hand bridge deleted); `sonor-sortable.js` v0.2.0 declarative `[data-sortable]` + client resolver + persist + MutationObserver; components.css v0.16.0 `.s-pill` family. Smoke covers declarative mode. |
| 0.4.1 | 2026-09-29 | `tests/contrast.mjs` — the contrast + bar-ladder gate (sonor-platform §13); components.css v0.15.0 `.s-paper`, `--ink-mix`, `--ink-on-bright`; `sonor-project-bar.js` on `--surface-text` / ladder tokens (its `--body` ink was invisible in graphite); `sonor-wq-bar.js` v1.4.4 menu ink + slot chip tokenised. |
| 0.4.0 | 2026-09-29 | `sonor-sortable.js` (B-491, Bryn: "sorting should never be done by typing numbers") + `.s-drag/.s-drag-ghost` styles; components.css v0.14.0 bar-ladder tokens (`--bar-2/3/4`, `.s-bar-*`) + locked=red rule; brand-core v1.3.1 neutral graphite header chrome. 6 unit tests + `sortable.smoke.mjs`. |
| 0.3.0 | 2026-09-29 | `sonor-theme.js` + components.css v0.10.0 graphite aliases / re-tints; root `sonor-header.css` safety net scoped to `:root:not([data-theme])` (it was overriding every theme's text tokens). |
| 0.2.0 | 2026-09-29 | `sonor-rack-calc.js` (rack numbers, shared by Engineering / PM / PDF); slot-grid `labels=none` + `flush` for host frames. |
| 0.1.0 | 2026-09-29 | Kit born: loader (`v1/kit.js`, manifest, layered CSS, `?kit=local`), `build-kit.sh`, reusable CI, catalogue index + slot-grid demo, `<sonor-slot-grid>` v0.1.0 (B-484 tranche 1). |


## 2026-09-29 · path fix
Served tree lives at `v1/` (repo root) — Pages serves `https://sonorltd.github.io/sonor-kit/v1/kit.js`. `kit/v1/` was wrong and is parked in `_to_delete_kit_dir` (delete it). `ci.yml` checks `v1/manifest.json`. Pages must be enabled (main, /) and the repo public or on a Pages plan — until then every consumer silently falls back to its `data/` copies.
