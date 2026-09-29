# sonor-kit — Project Notes

**Current version: v0.1.0** (kit/v1/manifest.json) · Spine v1.4 (B-485 cohesion plan: `../reports/COHESION-PLAN_2026-09-29.md`).

## What this is
The served UI kit. Masters born here live in `src/`; masters still at the workspace root are pulled by `build-kit.sh` until cohesion step 2. Apps load `kit/v1/kit.js` (see README). The catalogue (`catalogue/`) is the living style guide — **read it before building UI in any app**; a pattern needed by a second app is promoted here first (S-4.22), never copied.

## Laws
- BACKUP-FIRST, MODULAR-FIRST, no WeQuote writes from the browser — as the workspace.
- Every component: brand tokens only (`--fs-* --sp-* --r-* --dur-* --shadow-*`), Lucide via `sonor-icons.js`, `data-state` for hover / selected / dragging / invalid, keyboard + aria, `prefers-reduced-motion`.
- Custom elements are the boundary (vanilla + React 19). IIFE globals stay as adapters until every caller has moved.
- `build-kit.sh` before every commit; `node --test tests/*.test.mjs` green; smokes green.

## Components
| File | Element / global | Since | Notes |
|---|---|---|---|
| `src/sonor-slot-grid.js` | `<sonor-slot-grid>` · `SonorSlotGrid.{canPlace,place,autoLayout,stats,toSvg}` | v0.1.0 (B-484) | rack U bottom-up · DIN TE rows · patch ports; pointer drag, styled ghost, refuse / ⌥ shove (settle loop, never overlaps, never past the edge), hover / selected / dragging states, keyboard (arrows ⇧×5, Del, ⌘Z/⇧⌘Z, Enter, Esc), undo 100 deep, `beginExternalDrag` from any palette, `renderItem` faceplates, `rules.canPlace`, `toSvg` for PDFs. 7 unit tests + pointer smoke. |
| (pulled) `sonor-icons.js` `sonor-takeoffs-modal.js` `sonor-project-bar.js` `sonor-wq-bar.js` `components.css` `brand.css` | as today | root masters | move here in cohesion step 2 |

## Changelog
| v | date | change |
|---|---|---|
| 0.1.0 | 2026-09-29 | Kit born: loader (`kit/v1/kit.js`, manifest, layered CSS, `?kit=local`), `build-kit.sh`, reusable CI, catalogue index + slot-grid demo, `<sonor-slot-grid>` v0.1.0 (B-484 tranche 1). |
