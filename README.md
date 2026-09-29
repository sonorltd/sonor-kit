# sonor-kit — the shared Sonor UI kit, served not copied

Spine v1.4 / B-485 (2026-09-29). Every Sonor app loads **one line**:

```html
<script type="module" src="https://sonorltd.github.io/sonor-v1/kit.js"></script>
```

That brings the brand tokens + `components.css` (in the `sonor-kit` cascade layer — the app's own rules always win), the Lucide icons, the modal, the project bar, the WeQuote bar and `<sonor-slot-grid>`. `window.SonorKit.ready` resolves when the modules are in; `sonor:kit-ready` fires on `document`.

- **Channel vs pin** — `/v1/` auto-updates minors; a locked app pins `/v1.4.2/` (a copy of `v1` frozen at release).
- **Local dev** — add `?kit=local` to any page URL (resolves `../../sonor-kit/v1/` next to the app folder) or `data-kit-base="…"` on the script tag.
- **Catalogue** — `catalogue/index.html` (served at the repo's Pages URL): every component, live demo, usage, which apps use it. Read it before building UI in any app (rule S-4.22: *second use → kit*).
- **Build** — `bash build-kit.sh` assembles `v1/` from the masters (`src/` here; the ones still at the workspace root are pulled from `../` until cohesion step 2 moves them in). Commit the built tree — GitHub Pages serves it as-is.
- **Tests** — `node --test tests/*.test.mjs` (pure model) · `node tests/slot-grid.smoke.mjs` (Playwright, static server on 8770).
- **CI** — `.github/workflows/sonor-ci.yml` is the reusable workflow every app repo calls.

Setup once (Bryn): create the `sonor-kit` GitHub repo, push this folder, enable Pages from `main` root. Then the URL above is live.
