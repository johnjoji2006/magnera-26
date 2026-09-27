# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for **Magnera '26**, the fest of the Department of Computer Science, St. Berchmans College, Changanassery. Plain HTML/CSS/vanilla JS: no build step, no package.json, no framework, no tests. The only runtime dependency is Lenis (smooth scroll), loaded from jsDelivr.

## Commands

- Dev server: `python serve.py [port]` (default 5173). It sends `Cache-Control: no-store`, so edits show on a plain reload. `.claude/launch.json` defines the same server as the `site` configuration.
- Deploy: Vercel project `magnera-26` (linked in `.vercel/`). `.vercelignore` keeps `serve.py`, `.claude`, `.env*`, `.vercel` and the unused source art (`assets/concept*.webp`, `assets/layer2-island.webp`) out of the published site. Add any new file that is not part of the site to it.

## Architecture

Three pages share one FX module:

- `index.html` + `style.css` + `main.js`: the landing page.
- `technical.html` / `cultural.html` + `event.css` + `event.js`: the two "realm" pages. They are near-identical: they differ only in `data-realm`, `--accent` (`#3fa9ff` technical, `#ff3b8a` cultural), and their copy. Keep them in sync when changing either one.
- `fx.css` + `fx.js`: shared. `fx.js` is an IIFE that exposes `window.MagFX = { Portal, warpOut, arrive, reduceMotion }`, so it must load before `main.js` / `event.js`.

### Warp navigation (cross-page state)

Moving between pages is a "warp" through an island's portal. `MagFX.warpOut()` animates the zoom and then navigates. `MagFX.arrive()` on the next page plays the pull-back. They hand state across through `sessionStorage`:
- `magnera:warp`: a warp is in progress. An inline `<script>` in each page's `<head>` reads it and adds `warp-arrive` plus `--warp-tint` before first paint, so the page does not flash. Keep that snippet in every page.
- `magnera:tint`: the accent colour of the warp.
- `magnera:slide`: set by the realm pages' back button (`-1` technical, `1` cultural), so the mobile landing page reopens on that island's panel.

Both pages also handle `pageshow` with `persisted` (back/forward cache) to reset any state left mid-warp.

### Landing page (`main.js`)

- `CONFIG` at the top holds the fest date for the countdown (`festDate`) and the easing constants.
- The parallax stage has layers `.layer--bg`, `--islands`, `--cliff` and `--leaves`. Each is tuned by `data-depth` (pointer/tilt), `data-scroll` and `data-pan` (mobile panning in vw).
- Desktop places the two islands in one scene. On mobile (`max-width: 760px`, the `mobile` media query) the `.track` becomes a three-panel carousel (`[Technical] [bridge + banner] [Cultural]`, where `data-slide` is -1/0/1), driven by `go()` and horizontal swipes.
- The rope bridge is an SVG generated in `buildBridge()`. On desktop, `placeBridge()` anchors it to the islands' platforms using `ANCHOR`, which is a fraction of the island image.
- The About section (`.walls`) is a single image whose wall text is baked into the artwork. A `.sr-only` block repeats that text, so update it when the art changes. On mobile the section pins and the scroll pans between the two walls (`updateWalls`, `WALLS.centres`).

### Performance conventions

Follow these when touching the animation code:
- One `requestAnimationFrame` loop per page. It never reads layout: sizes are cached in resize handlers (`onResize`, `measureLayers`, `sizeBg`, `measureWalls`). Transforms are written only when their value changes (the `write()` helper and `last` cache in `main.js`, the `lastY` check in `event.js`).
- Animate only `transform` and `opacity`. The warp uses the Web Animations API on fixed-size layers that are scaled, never resized.
- Write per-layer transforms straight onto each element, not as CSS variables on a shared ancestor, so a move does not restyle the whole subtree.
- Looping CSS animations pause while off screen (`.stage.is-offscreen`, the walls' torches).
- Respect `prefers-reduced-motion` (`reduceMotion`). Lenis is enabled only for fine pointers; touch devices keep native scrolling.

### Placeholders

The Sponsors and Contact sections on the landing page and the event cards on the realm pages are still placeholder content ("Coming soon" / "TBA"). `.layer--leaves` is waiting on its asset.
