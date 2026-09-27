/* Realm pages: open portal hero → scroll steps through it; back button warps home */

const body = document.body;
const realm = body.dataset.realm;   // "technical" | "cultural"
const { Portal, warpOut, arrive, reduceMotion } = MagFX;

/* ───────── Hero portal ───────── */

const portalEl = document.getElementById("heroPortal");
const portal = new Portal(portalEl);
const frameEl = document.querySelector(".portal-hero__frame");
// arriving through a warp: start inside the portal and pull back out of it
const arrived = arrive({ zoom: frameEl, focus: portalEl });
let portalReady = false;   // open once the arrival fade is under way
setTimeout(() => { portalReady = true; if (scrollY < innerHeight) portal.open(); }, arrived ? 380 : 150);

/* ───────── Smooth scroll + hero progress ───────── */

const lenis = !reduceMotion && window.Lenis && !matchMedia("(pointer: coarse)").matches ? new Lenis({ lerp: 0.085, anchors: true }) : null;
const hero = document.querySelector(".portal-hero");

let lastY = -1;
function frame(time) {
  lenis?.raf(time);
  if (scrollY !== lastY) {              // only touch styles when the page actually moved
    lastY = scrollY;
    const span = hero.offsetHeight - innerHeight;       // sticky travel
    const p = Math.max(0, Math.min(1, scrollY / span));
    body.style.setProperty("--p", p.toFixed(4));
    // stop animating a portal we've already stepped through
    if (p >= 0.98) portal.close(); else if (portalReady && p < 0.9 && !portal.target) portal.open();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ───────── Back: fly through the portal home (to this island's panel on mobile) ───────── */

document.querySelector("[data-warp-back]").addEventListener("click", (e) => {
  e.preventDefault();
  portal.open();
  warpOut({
    from: scrollY < innerHeight * 0.5 ? portalEl : null,   // dive into the portal if it's on screen
    zoom: frameEl,
    url: e.currentTarget.getAttribute("href"),
    tint: getComputedStyle(body).getPropertyValue("--accent").trim(),
    store: { "magnera:slide": realm === "technical" ? "-1" : "1" },
  });
});

/* ───────── Content reveals ───────── */

const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); revealer.unobserve(en.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".realm__inner > *, .card").forEach((n, i) => {
  n.classList.add("reveal");
  if (n.classList.contains("card")) n.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealer.observe(n);
});
