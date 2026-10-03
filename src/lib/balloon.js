// The sponsor's hot-air balloon: drifts slowly in wandering directions across the hero. It is
// purely decorative (not interactive) and sits just above the background layer, so the islands,
// banner and buttons pass in front of it. Same conventions as the rest of the landing
// code: one rAF loop that never reads layout (sizes are cached on resize) and only writes
// `transform`; it idles while the hero is scrolled off screen.

const WANDER_SPEED = 9;      // px/s, the slow cruising speed
const TURN_RATE = 0.35;      // rad/s, how fast the heading meanders
const DRAG_FRICTION = 1.1;   // 1/s, how quickly velocity eases toward cruising

export function initBalloon(stage, { reduceMotion = false } = {}) {
  const el = stage.querySelector(".balloon");
  if (!el) return () => {};

  let sw = 0, sh = 0, bw = 0, bh = 0;
  let x = 0, y = 0;              // top-left of the balloon within the stage
  let vx = 0, vy = 0;            // px/s
  let heading = Math.random() * Math.PI * 2, headingTarget = heading, headingTimer = 0;
  let angle = 0, angVel = 0;     // swing (radians) hanging from the envelope
  let last = performance.now(), raf = null, lastT = "", placed = false;

  function measure() {
    sw = stage.clientWidth; sh = stage.clientHeight;
    bw = el.offsetWidth; bh = el.offsetHeight;
    if (!placed) {
      x = sw * 0.70; y = sh * 0.16; placed = true;
    }
    clamp();
  }

  // keep the balloon on the screen (a little of it may hang off the edges)
  const margin = () => ({ x: bw * 0.25, y: bh * 0.2 });
  function clamp() {
    const m = margin();
    x = Math.min(sw - bw + m.x, Math.max(-m.x, x));
    y = Math.min(sh - bh * 0.55, Math.max(-m.y, y));
  }

  function write() {
    const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(angle * 57.2958).toFixed(2)}deg)`;
    if (t !== lastT) { lastT = t; el.style.transform = t; }
  }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (stage.classList.contains("is-offscreen") || document.hidden) return;

    const t = now / 1000;
    const prevVx = vx;

    {
      if (!reduceMotion) {
        // meander: pick a new heading every few seconds and ease toward it
        headingTimer -= dt;
        if (headingTimer <= 0) {
          headingTarget = heading + (Math.random() - 0.5) * 2.4;
          headingTimer = 3 + Math.random() * 5;
        }
        // near an edge, steer back toward the middle of the sky
        const m = margin();
        const cx = x + bw / 2, cy = y + bh / 2;
        if (cx < sw * 0.1 || cx > sw * 0.9 || cy < sh * 0.12 || cy > sh * 0.62) {
          headingTarget = Math.atan2(sh * 0.35 - cy, sw * 0.5 - cx);
        }
        let d = headingTarget - heading;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        heading += Math.max(-TURN_RATE * dt, Math.min(TURN_RATE * dt, d));

        // glide toward cruising velocity (and let a throw die down smoothly)
        const tx = Math.cos(heading) * WANDER_SPEED, ty = Math.sin(heading) * WANDER_SPEED * 0.7;
        const k = 1 - Math.exp(-DRAG_FRICTION * dt);
        vx += (tx - vx) * k; vy += (ty - vy) * k;
        // a gentle bob, like it's riding thermals
        vy += Math.sin(t * 0.9) * 3 * dt;
      } else {
        const k = 1 - Math.exp(-3 * dt);
        vx -= vx * k; vy -= vy * k;
      }
      x += vx * dt; y += vy * dt;

      // bounce softly off the limits so it never gets stuck outside
      const m = margin();
      const minX = -m.x, maxX = sw - bw + m.x, minY = -m.y, maxY = sh - bh * 0.55;
      if (x < minX) { x = minX; vx = Math.abs(vx) * 0.5; heading = 0; headingTarget = 0; }
      if (x > maxX) { x = maxX; vx = -Math.abs(vx) * 0.5; heading = Math.PI; headingTarget = Math.PI; }
      if (y < minY) { y = minY; vy = Math.abs(vy) * 0.5; }
      if (y > maxY) { y = maxY; vy = -Math.abs(vy) * 0.5; }
    }

    // the basket swings behind movement: a damped spring pushed by horizontal acceleration
    const ax = dt > 0 ? (vx - prevVx) / dt : 0;
    const idle = reduceMotion ? 0 : Math.sin(t * 0.7) * 0.02;
    angVel += (-12 * (angle - idle) - 3.2 * angVel - ax * 0.0009) * dt;
    angle += angVel * dt;
    angle = Math.max(-0.5, Math.min(0.5, angle));
    write();
  }

  window.addEventListener("resize", measure);

  measure();
  el.classList.add("is-ready");
  write();
  raf = requestAnimationFrame(step);

  return function dispose() {
    if (raf != null) cancelAnimationFrame(raf);
    window.removeEventListener("resize", measure);
  };
}
