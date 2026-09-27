/* Magnera FX — shared by the landing page and the realm pages.
   • Portal:  CSS portal that irises open inside the stone ring, filled with soft light
   • Warp:    fly through the portal — zoom in on one page, pull back out on the next */

(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WARP_KEY = "magnera:warp";

  /* ───────── Portal ───────── */

  // The look and motion live in fx.css (GPU-composited layers); this only builds
  // the layers once and toggles the open state.
  class Portal {
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

  /* ───────── Warp: fly through the portal ─────────
     Out:    the clicked portal grows to fill the screen (its lit rim sweeping past)
             while the scene zooms into it and faint light streaks rush by.
     Arrive: the next page starts inside the portal and pulls back out of it.
     Only transform + opacity, driven by the Web Animations API (compositor). */

  const EASE_IN = "cubic-bezier(.7, 0, .25, 1)";    // slow start, then rushes in
  const EASE_OUT = "cubic-bezier(.16, 1, .3, 1)";   // fast, then settles
  const DUR_OUT = 1150;
  const DUR_IN = 1400;
  const ZOOM = 1.7;      // scene zoom; kept modest so the browser never re-rasters layers at huge sizes
  const VEIL = 800;      // fixed layer sizes (px) — scaled, never resized, so each is rasterised once
  const STREAKS = 768;

  // the streaks are a tiny pre-rendered image; fetch it early so the first warp doesn't wait
  new Image().src = "assets/fx-streaks.webp";

  let warping = false;
  let last = null;    // the warp in progress, in case the page is restored from the back/forward cache

  function warpEl() {
    let el = document.getElementById("warp");
    if (!el) {
      el = document.createElement("div");
      el.className = "warp";
      el.id = "warp";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<div class="warp__veil"></div><div class="warp__streaks"></div>';
      document.body.appendChild(el);
    }
    return el;
  }

  // build the warp layers ahead of time, while the page is idle
  (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(() => warpEl());

  const centreOf = (node) => {
    if (!node) return { x: innerWidth / 2, y: innerHeight / 2, d: 60 };
    const r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: Math.max(24, r.width, r.height) };
  };

  // scale `node` about a viewport point using the independent `scale` property
  function zoomAbout(node, x, y, from, to, duration, easing) {
    const r = node.getBoundingClientRect();
    node.style.transformOrigin = `${x - r.left}px ${y - r.top}px`;
    return node.animate([{ scale: from }, { scale: to }], { duration, easing, fill: "forwards" });
  }

  /**
   * Fly into `from` (a portal element) and load `url`.
   * @param {{from?: Element, zoom?: Element, url: string, tint?: string, store?: object}} o
   */
  function warpOut({ from, zoom, url, tint = "#7fa8ff", store = {} }) {
    if (warping) return;
    warping = true;
    const { x, y, d } = centreOf(from);
    const el = warpEl();
    el.style.setProperty("--tint", tint);
    const veil = el.querySelector(".warp__veil");
    const streaks = el.querySelector(".warp__streaks");
    veil.style.left = streaks.style.left = `${x}px`;
    veil.style.top = streaks.style.top = `${y}px`;
    el.classList.add("is-on");
    document.documentElement.classList.add("warp-busy");   // pause the page's own CSS animations

    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const s0 = d / VEIL;                 // starts exactly the size of the portal
    const s1 = (far / (VEIL * 0.275)) * 1.05;   // until its dark centre (55% of the radius) covers the screen
    const dur = reduceMotion ? 300 : DUR_OUT;
    const at = (s) => `translate(-50%, -50%) scale(${s.toFixed(4)})`;

    const anims = [
      veil.animate([
        { transform: at(s0), opacity: 0 },
        { transform: at(s0 * 1.15), opacity: 1, offset: 0.12 },
        { transform: at(s1), opacity: 1 },
      ], { duration: dur, easing: EASE_IN, fill: "forwards" }),
    ];
    if (!reduceMotion) {
      const k = far / (STREAKS * 0.5);
      anims.push(streaks.animate([
        { transform: `${at(k * 0.3)} rotate(0deg)`, opacity: 0 },
        { opacity: 0.5, offset: 0.4 },
        { transform: `${at(k * 1.7)} rotate(10deg)`, opacity: 0 },
      ], { duration: dur, easing: "cubic-bezier(.5, 0, .3, 1)", fill: "forwards" }));
    }
    const zoomAnim = zoom && !reduceMotion ? zoomAbout(zoom, x, y, 1, ZOOM, dur, EASE_IN) : null;
    last = { el, anims, zoom, zoomAnim, x, y };

    setTimeout(() => {
      try {
        sessionStorage.setItem(WARP_KEY, "1");
        sessionStorage.setItem("magnera:tint", tint);
        for (const k in store) sessionStorage.setItem(k, store[k]);
      } catch {}
      location.href = url;
    }, dur);
  }

  /**
   * On load: if we came through a warp, pull back out of `focus` (a portal) while the night veil lifts.
   * `zoom`/`focus` may be functions, evaluated once layout has settled. Returns true if we warped in.
   */
  function arrive({ zoom, focus } = {}) {
    const root = document.documentElement;
    if (!root.classList.contains("warp-arrive")) return false;
    try { sessionStorage.removeItem(WARP_KEY); } catch {}
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const z = typeof zoom === "function" ? zoom() : zoom;
      const f = typeof focus === "function" ? focus() : focus;
      if (z && !reduceMotion) {
        const { x, y } = centreOf(f);
        const a = zoomAbout(z, x, y, ZOOM, 1, DUR_IN, EASE_OUT);
        a.onfinish = () => a.cancel();   // hand control back to the page's own styles
      }
      root.classList.add("warp-fade", "warp-busy");
      setTimeout(() => root.classList.remove("warp-arrive", "warp-fade", "warp-busy"), DUR_IN);
    }));
    return true;
  }

  // Back/forward cache restores this page exactly as we left it — inside the portal.
  // Pull back out of it, the same way a normal arrival does.
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !last) return;
    const { el, anims, zoom, zoomAnim, x, y } = last;
    last = null;
    warping = false;
    zoomAnim?.cancel();
    if (zoom && !reduceMotion) {
      const a = zoomAbout(zoom, x, y, ZOOM, 1, DUR_IN, EASE_OUT);
      a.onfinish = () => a.cancel();
    }
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease" });
    fade.onfinish = () => {
      anims.forEach((a) => a.cancel());
      el.classList.remove("is-on");
      document.documentElement.classList.remove("warp-busy");
    };
  });

  window.MagFX = { Portal, warpOut, arrive, reduceMotion };
})();
