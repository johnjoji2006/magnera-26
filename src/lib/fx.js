/* Magnera FX — shared by the landing page and the realm pages.
   • Portal:  CSS portal that irises open inside the stone ring, filled with soft light
   • Warp:    fly through the portal — zoom in on one page, pull back out on the next

   Migrated verbatim from the original fx.js (a global IIFE exposing window.MagFX)
   into an ES module exporting the same names, so it can be imported by the
   landing/realm hooks instead of relying on a global. Behaviour is unchanged. */

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const WARP_KEY = "magnera:warp";

/* ───────── Portal ───────── */

// The look and motion live in fx.css (GPU-composited layers); this only builds
// the layers once and toggles the open state.
export class Portal {
  constructor(el) {
    this.el = el;
    this.target = 0;
    if (!el.querySelector(".portal__core")) {
      el.innerHTML =
        '<span class="portal__halo"></span>' +
        '<span class="portal__core"><span class="portal__drift"></span><span class="portal__drift portal__drift--b"></span></span>';
    }
  }
  open()  { this.target = 1; this.el.classList.add("is-open"); }
  close() { this.target = 0; this.el.classList.remove("is-open"); }
}

/* ───────── Warp: cloud transition (Clash-of-Clans style) ─────────
   Out:    soft, translucent clouds roll in from every edge toward the middle and close over the screen,
           then the next page loads.
   Arrive: the next page starts under the same clouds, which immediately roll back out to the edges.
   No pause in the middle: the cover is only ever the instant between the two motions.
   Only transform + opacity, driven by the Web Animations API (compositor). */

const EASE_IN = "cubic-bezier(.25, .6, .35, 1)";     // rolls in fast, settles as it closes
const EASE_OUT = "cubic-bezier(.5, 0, .75, .4)";     // starts moving at once, then sweeps away
const DUR_IN = 720;
const DUR_OUT = 1000;
const COLS = 6, ROWS = 4;
const SPRITES = ["assets/cloud-1.webp", "assets/cloud-2.webp", "assets/cloud-3.webp", "assets/cloud-4.webp"];

// fetch the sprites early so the first transition doesn't wait on them
SPRITES.forEach((src) => { new Image().src = src; });

let warping = false;
let last = null;    // the transition in progress, in case the page is restored from the back/forward cache

// deterministic pseudo-random, so the grid is identical on both pages
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function warpEl() {
  let el = document.getElementById("warp");
  if (!el) {
    el = document.createElement("div");
    el.className = "warp";
    el.id = "warp";
    el.setAttribute("aria-hidden", "true");
    let html = '<div class="warp__fill"></div>';
    let n = 0;
    for (let layer = 0; layer < 2; layer++) {          // two staggered layers, so the soft edges overlap
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const k = n++;
          const cx = ((c + 0.5) / COLS) * 100 + (rnd(k) - 0.5) * 12 + (layer ? 8 : 0) - 4;
          const cy = ((r + 0.5) / ROWS) * 100 + (rnd(k + 40) - 0.5) * 16 + (layer ? 10 : 0) - 5;
          // unit vector from screen centre to this cloud: the way it travels in from / out to
          let ux = (cx - 50) / 50, uy = (cy - 50) / 50;
          const len = Math.hypot(ux, uy) || 1; ux /= len; uy /= len;
          const rot = ((rnd(k + 90) - 0.5) * 24).toFixed(1);
          const scale = (0.9 + rnd(k + 120) * 0.5).toFixed(2);
          html += `<img class="warp__cloud" src="${SPRITES[k % 4]}" alt="" draggable="false" ` +
            `style="left:${cx.toFixed(1)}%;top:${cy.toFixed(1)}%;--r:${rot}deg;--s:${scale}" ` +
            `data-ux="${ux.toFixed(3)}" data-uy="${uy.toFixed(3)}" data-k="${k}">`;
        }
      }
    }
    el.innerHTML = html;
    document.body.appendChild(el);
  }
  return el;
}

// build the cloud layers ahead of time, while the page is idle
(window.requestIdleCallback || ((f) => setTimeout(f, 800)))(() => warpEl());

const clouds = (el) => [...el.querySelectorAll(".warp__cloud")];
const fill = (el) => el.querySelector(".warp__fill");
const REST = "translate3d(0, 0, 0) rotate(var(--r)) scale(var(--s))";
const away = (c, f) =>
  `translate3d(${(Number(c.dataset.ux) * 115 * f).toFixed(1)}vmax, ${(Number(c.dataset.uy) * 115 * f).toFixed(1)}vmax, 0) rotate(calc(var(--r) * 2)) scale(calc(var(--s) * 1.35))`;

/** Roll the clouds in from the edges. */
function coverAnims(el, dur) {
  const anims = clouds(el).map((c) => {
    const delay = reduceMotion ? 0 : rnd(Number(c.dataset.k) + 7) * dur * 0.3;
    return c.animate(
      [{ transform: away(c, 1), opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: REST, opacity: 1 }],
      { duration: dur * 0.7, delay, easing: EASE_IN, fill: "both" },
    );
  });
  anims.push(fill(el).animate([{ opacity: 0 }, { opacity: 1 }],
    { duration: dur * 0.3, delay: dur * 0.7, easing: "ease-out", fill: "both" }));
  return anims;
}

/** Roll the clouds back out to the edges, revealing the page beneath. */
function revealAnims(el, dur) {
  const anims = clouds(el).map((c) => {
    const delay = reduceMotion ? 0 : rnd(Number(c.dataset.k) + 19) * dur * 0.25;
    return c.animate(
      [{ transform: REST, opacity: 1 }, { opacity: 1, offset: 0.55 }, { transform: away(c, 1), opacity: 0 }],
      { duration: dur * 0.75, delay, easing: EASE_OUT, fill: "both" },
    );
  });
  anims.push(fill(el).animate([{ opacity: 1 }, { opacity: 0 }],
    { duration: dur * 0.3, easing: "ease-in", fill: "both" }));
  return anims;
}

const done = (anims) => Promise.all(anims.map((a) => a.finished.catch(() => {})));

function finish(el, anims) {
  anims.forEach((a) => a.cancel());
  el.classList.remove("is-on");
  document.documentElement.classList.remove("warp-busy");
}

/**
 * Close the clouds over the screen, then load `url`.
 * `from` / `zoom` / `tint` are accepted for compatibility with the old portal warp and ignored.
 * @param {{url: string, store?: object}} o
 */
export function warpOut({ url, store = {} }) {
  if (warping) return;
  warping = true;
  const el = warpEl();
  el.classList.add("is-on");
  document.documentElement.classList.add("warp-busy");   // pause the page's own CSS animations
  const dur = reduceMotion ? 250 : DUR_IN;
  const anims = coverAnims(el, dur);
  last = { el, anims };
  try {
    sessionStorage.setItem(WARP_KEY, "1");
    for (const k in store) sessionStorage.setItem(k, store[k]);
  } catch {}
  const go = () => { location.href = url; };
  Promise.race([done(anims), new Promise((r) => setTimeout(r, dur + 500))]).then(go);
}

/**
 * On load: if we came through a transition, the page starts covered (an inline <head> script added
 * .warp-arrive). Put the same clouds on top, drop that stand-in, and roll them out at once.
 * Returns true if we arrived through a transition.
 */
export function arrive() {
  const root = document.documentElement;
  if (!root.classList.contains("warp-arrive")) return false;
  try { sessionStorage.removeItem(WARP_KEY); } catch {}
  const el = warpEl();
  el.classList.add("is-on");
  root.classList.add("warp-busy");
  // the reveal's first frame is the fully-closed state, so there is no jump when the stand-in goes
  const anims = revealAnims(el, reduceMotion ? 250 : DUR_OUT);
  requestAnimationFrame(() => root.classList.remove("warp-arrive"));
  done(anims).then(() => finish(el, anims));
  return true;
}

// Back/forward cache restores this page exactly as we left it — closed in clouds. Roll them out.
addEventListener("pageshow", (e) => {
  if (!e.persisted || !last) return;
  const { el, anims } = last;
  last = null;
  warping = false;
  anims.forEach((a) => a.cancel());
  const rev = revealAnims(el, reduceMotion ? 250 : DUR_OUT);
  done(rev).then(() => finish(el, rev));
});

export { reduceMotion };
