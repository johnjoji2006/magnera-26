# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Magnera '26**, the fest of the Department of Computer Science, St. Berchmans College, Changanassery. A React + Vite site with no server-side logic and no tests. It was migrated from a plain HTML/CSS/vanilla-JS site (see "Migration history" below) — the visual design and animation behavior are unchanged; only the implementation technology changed.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (Vite, default port 5173 — same port the old `serve.py` used). `.claude/launch.json` defines this as the `site` configuration.
- Build: `npm run build` → `dist/`. `npm run preview` serves that build locally.
- Deploy: Vercel project `magnera-26` (linked in `.vercel/`, `vercel.json` sets `framework: vite`). `.vercelignore` keeps `.claude`, `CLAUDE.md`, `design-refs` (unused source art, kept for reference but never published), `.env*` and `.vercel` out of the deploy.

## Architecture

Vite builds **three separate HTML entry points**, not a single-page app with client-side routing — this mirrors the original flat-file site, where `index.html` / `technical.html` / `cultural.html` were independent pages and navigating between them was a real page load:

- `index.html` → `src/main-landing.jsx` → `src/pages/LandingPage.jsx`
- `technical.html` → `src/main-technical.jsx` → `src/pages/RealmPage.jsx` (`realm="technical"`)
- `cultural.html` → `src/main-cultural.jsx` → `src/pages/RealmPage.jsx` (`realm="cultural"`)

`technical.html` and `cultural.html` differ only in the `data-realm`/`--accent` on `<body>` and which page title/description are in `<head>` — the shared markup lives once in `RealmPage.jsx`, parametrized by the `REALMS` lookup at the top of that file. Keep both call sites in sync when changing the shared markup.

Each entry file's `<head>` (fonts, `<link rel="preload">`, and the inline anti-flash `<script>` — see below) and each `<body>`'s static attributes are hand-written HTML, not React; only `<div id="root">` is a React root. Don't move that inline script or the body attributes into JSX — they have to exist before React ever runs.

### CSS and assets are untouched, static files — not imported through Vite

`style.css`, `fx.css`, `event.css`, and everything under `assets/` live in `public/` byte-for-byte as they did at the repo root before the migration, and are linked with plain `<link>`/`<img src>` tags, not `import`ed into JS/CSS bundles. This is deliberate: `fx.css` references `url("assets/fx-streaks.webp")` with a path relative to itself, and keeping both untouched in `public/` (rather than under `src/`) means Vite never rewrites that path — it resolves exactly as it did on the old flat-file site. When editing styles, edit these files directly; there is no CSS build step.

### The animation/interaction code is migrated logic, not rewritten-as-React-state

`main.js`, `event.js` and `fx.js` (the old vanilla-JS files) are now `src/lib/landing.js`, `src/lib/realm.js` and `src/lib/fx.js` — same logic, wrapped in an `initLanding()` / `initRealm(realm)` function that a hook (`src/hooks/useLandingFX.js`, `useRealmFX.js`) calls once from `useEffect`. They still query the DOM directly (`document.querySelector`, etc.) and write `transform`/`style` onto elements every animation frame, exactly as before — this was **not** converted to React state driving re-renders, because the original code is deliberately structured to avoid re-rendering the tree on every frame (see "Performance conventions" below); doing that in React state would change the performance characteristics and, at 60fps, the feel of the parallax. `fx.js` was changed from a global IIFE (`window.MagFX`) to an ES module with named exports (`Portal`, `warpOut`, `arrive`, `reduceMotion`), imported directly by the other two. Lenis is now an npm dependency (`import Lenis from "lenis"`, pinned to the same `1.1.20` the CDN build used) instead of a `<script>` tag.

Because these `init*()` functions can now run more than once (route back to a page, or React StrictMode's dev-mode double-invoke), each one returns a `dispose()` that removes every listener it added and cancels its animation frame / observers / timers — the original scripts never needed this since they ran exactly once per page load.

If you're touching this logic, treat `src/lib/landing.js`/`realm.js`/`fx.js` as the source of truth for behavior, and `src/pages/*.jsx` as the source of truth for markup; they only meet at DOM query selectors (ids/classes), so a class or id renamed in one must be renamed in the other.

### Warp navigation (cross-page state)

Moving between pages is a "warp" through an island's portal. `warpOut()` (from `src/lib/fx.js`) animates the zoom and then does a real `location.href` navigation — not a client-side route change — matching the original MPA design and the anti-flash inline script's assumption that the page reloads. `arrive()` on the next page's mount plays the pull-back. State crosses the reload through `sessionStorage`:
- `magnera:warp`: a warp is in progress. The inline `<script>` in each HTML file's `<head>` reads it and adds `warp-arrive` plus `--warp-tint` before React ever mounts, so the page does not flash.
- `magnera:tint`: the accent colour of the warp.
- `magnera:slide`: set by the realm pages' back button (`-1` technical, `1` cultural), so the mobile landing page reopens on that island's panel.

Both `landing.js` and `realm.js` also handle `pageshow` with `persisted` (back/forward cache) to reset any state left mid-warp.

### Landing page (`src/lib/landing.js`, rendered by `LandingPage.jsx`)

- `CONFIG` at the top holds the fest date for the countdown (`festDate`) and the easing constants.
- The parallax stage has layers `.layer--bg`, `--islands`, `--cliff` and `--leaves`. Each is tuned by `data-depth` (pointer/tilt), `data-scroll` and `data-pan` (mobile panning in vw).
- Desktop places the two islands in one scene. On mobile (`max-width: 760px`, the `mobile` media query) the `.track` becomes a three-panel carousel (`[Technical] [bridge + banner] [Cultural]`, where `data-slide` is -1/0/1), driven by `go()` and horizontal swipes.
- The rope bridge is an SVG generated in `buildBridge()`. On desktop, `placeBridge()` anchors it to the islands' platforms using `ANCHOR`, which is a fraction of the island image.
- The About section (`.walls`) is a single image whose wall text is baked into the artwork. A `.sr-only` block in `LandingPage.jsx` repeats that text, so update it when the art changes. On mobile the section pins and the scroll pans between the two walls (`updateWalls`, `WALLS.centres`).

### Performance conventions

Follow these when touching the animation code:
- One `requestAnimationFrame` loop per page. It never reads layout: sizes are cached in resize handlers (`onResize`, `measureLayers`, `sizeBg`, `measureWalls`). Transforms are written only when their value changes (the `write()` helper and `frameLast` cache in `landing.js`, the `lastY` check in `realm.js`).
- Animate only `transform` and `opacity`. The warp uses the Web Animations API on fixed-size layers that are scaled, never resized.
- Write per-layer transforms straight onto each element, not as CSS variables on a shared ancestor, so a move does not restyle the whole subtree.
- Looping CSS animations pause while off screen (`.stage.is-offscreen`, the walls' torches).
- Respect `prefers-reduced-motion` (`reduceMotion`). Lenis is enabled only for fine pointers; touch devices keep native scrolling.

### Placeholders

The Sponsors and Contact sections on the landing page and the event cards on the realm pages are still placeholder content ("Coming soon" / "TBA"). `.layer--leaves` is waiting on its asset.

## Migration history

This was originally a flat-file HTML/CSS/vanilla-JS site (`index.html`/`technical.html`/`cultural.html` + `style.css`/`event.css`/`fx.css` + `main.js`/`event.js`/`fx.js`, served in dev by a small `serve.py`). It was migrated to React + Vite for visual and behavioral parity, not as a redesign — see "The animation/interaction code is migrated logic, not rewritten-as-React-state" above for why the animation code stayed imperative. The pre-migration site is preserved in git history (the first commit) if you need to compare against it. `.env.local` only ever held a Vercel-injected build token (`VERCEL_OIDC_TOKEN`); no app code reads environment variables, so there was nothing to migrate to `VITE_`-prefixed vars.
