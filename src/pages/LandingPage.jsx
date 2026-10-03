import { useLandingFX } from "../hooks/useLandingFX.js";

// The landing page. Markup is a 1:1 JSX translation of the original index.html
// <body> — same elements, classes, ids and data-* attributes — because
// src/lib/landing.js (main.js, migrated) still queries this DOM directly and
// writes transforms onto it every frame. See CLAUDE.md's "Performance
// conventions" for why that stayed imperative instead of becoming React state.
export default function LandingPage() {
  useLandingFX();

  return (
    <>
      {/* ═══════════════ LANDING ═══════════════ */}
      <header className="stage" id="stage">

        {/* LAYER 1 — background: the hero sky with the floating campus islands (sharp, no blur) */}
        <div className="layer layer--bg" data-depth="0.014" data-scroll="0.55" data-pan="0" aria-hidden="true">
          <img decoding="async" fetchPriority="high" src="assets/hero-sky.webp" width="2560" height="1439" alt="" draggable="false" />
        </div>

        {/* SPONSOR BALLOON — decorative, sits just above the background layer, behind the islands, banner and buttons, and never takes clicks (src/lib/balloon.js). */}
        <div className="balloon" aria-hidden="true">
          <img decoding="async" src="assets/hot-air-balloon.svg" width="400" height="620" alt="" draggable="false" />
        </div>

        {/* LAYER 2 — floating islands.
            Desktop: two islands placed in the scene.
            Mobile:  a 3-panel track  [Technical] [bridge + hero] [Cultural]  that slides horizontally. */}
        <div className="layer layer--islands" data-depth="0.03" data-scroll="0.3">
          <div className="track" id="track">

            <section className="panel panel--tech" data-slide="-1" aria-label="Technical Events">
              <a className="island" href="technical.html" style={{ "--accent": "#e5303f" }}>
                <img decoding="async" src="assets/layer2-island-baked.webp" alt="Floating island — Technical Events" draggable="false" />
                <span className="portal" aria-hidden="true"></span>
                <span className="island__label">Technical Events<span className="island__go" aria-hidden="true">→</span><span className="island__hint">Click to enter</span></span>
              </a>
            </section>

            <section className="panel panel--center" data-slide="0" aria-label="Choose a realm">
              <div className="bridge">
                <svg className="bridge__svg" id="bridge" viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true"></svg>
                <button className="bridge__end bridge__end--left" data-go="-1">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                  <span><i className="gem" style={{ "--accent": "#e5303f" }}></i>Technical Events</span>
                </button>
                <button className="bridge__end bridge__end--right" data-go="1">
                  <span>Cultural Events<i className="gem" style={{ "--accent": "#2f8cff" }}></i></span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>

              </div>
            </section>

            <section className="panel panel--cult" data-slide="1" aria-label="Cultural Events">
              <a className="island island--mirrored" href="cultural.html" style={{ "--accent": "#2f8cff" }}>
                <img decoding="async" src="assets/layer2-island-baked.webp" alt="Floating island — Cultural Events" draggable="false" />
                <span className="portal" aria-hidden="true"></span>
                <span className="island__label">Cultural Events<span className="island__go" aria-hidden="true">→</span><span className="island__hint">Click to enter</span></span>
              </a>
            </section>

          </div>
        </div>

        {/* LAYER 4 — crimson leaves (asset pending; vignette stands in for now) */}
        <div className="layer layer--leaves" data-depth="0.09" data-scroll="0" data-pan="10" aria-hidden="true"></div>


        {/* CTA: midnight waymarker plaque, bottom-right */}
        <a className="cta" href="#gifts">
          <span className="cta__halo" aria-hidden="true"></span>
          <span className="cta__plate">
            <span className="cta__face" aria-hidden="true"></span>
            <span className="cta__shine" aria-hidden="true"></span>
            <span className="cta__medal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11h18v3H3zM5 14h14v7H5zM12 11v10M12 11c-2-4-6-5-6-2s4 2 6 2c2 0 6 1 6-2s-4-2-6 2" strokeLinejoin="round" /></svg></span>
            <span className="cta__label"><small>Get</small> Free gifts</span>
            <svg className="cta__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </span>
          <span className="cta__sparks" aria-hidden="true"><i></i><i></i><i></i></span>
        </a>

        {/* royal banner: hangs top-right; drag it up and down (landing.js) */}
        <div className="banner" id="hero" aria-label="Magnera 26 banner — drag to move" tabIndex={0}>
          <svg className="banner__hanger" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <path d="M50 3 L4 30 M50 3 L96 30" />
            <circle cx="50" cy="3" r="2.4" />
          </svg>
          <div className="banner__rod"></div>
          <div className="banner__cloth">
            <div className="banner__inner"></div>
            <div className="banner__content">
              <p className="banner__presents">Department of Computer Science<em><span>presents</span></em></p>
              <h1 className="title">MAGNERA<sup>’26</sup></h1>
              <div className="collab"><span className="x">×</span><span className="partner">Brototype</span></div>
              <span className="rule" aria-hidden="true"><i></i></span>
              <div className="countdown" id="countdown" aria-live="off">
                <div><b data-unit="d">000</b><span>Days</span></div>
                <div><b data-unit="h">00</b><span>Hours</span></div>
                <div><b data-unit="m">00</b><span>Minutes</span></div>
                <div><b data-unit="s">00</b><span>Seconds</span></div>
              </div>
              <span className="banner__hint" aria-hidden="true"><i>▼</i>Pull down<i>▼</i></span>
            </div>
            <div className="banner__folds" aria-hidden="true"></div>
          </div>
          <span className="banner__tassel" aria-hidden="true"></span>
        </div>


      </header>

      {/* ═══════════════ SECTIONS ═══════════════ */}
      <main className="sections">

        {/* The floating cliff: the traveller stands on it at the bottom of the landing and its
            rock underside hangs down over the top of the walls, carrying the eye from one
            section into the next. One piece of art, straddling the boundary. */}
        <div className="seam">
          <img src="assets/cliff-bridge.webp" alt="A traveller standing on a floating cliff, looking out at the campus" width="2170" height="725" decoding="async" draggable="false" />
        </div>

        {/* ABOUT: two lit stone walls. Desktop shows both; on mobile the section pins
            and scrolling pans from one wall to the next (main.js's updateWalls, migrated
            into src/lib/landing.js). */}
        <section className="walls" id="about" aria-labelledby="walls-title">
          <h2 id="walls-title" className="sr-only">About Magnera</h2>
          <div className="walls__frame">
            <div className="walls__scene">
              <img className="walls__img" src="assets/walls.webp" alt="" width="1672" height="941" loading="lazy" decoding="async" draggable="false" />
              <span className="walls__torch walls__torch--fire" aria-hidden="true"></span>
              <span className="walls__torch walls__torch--blue" aria-hidden="true"></span>
            </div>
          </div>
          {/* the wall text is part of the artwork; this is the same text for screen readers and search */}
          <div className="sr-only">
            <article>
              <h3>01 · About Magnera</h3>
              <p>A two-day celebration of technology, creativity, and culture. Magnera brings together curious minds, bold ideas, and unforgettable experiences.</p>
            </article>
            <article>
              <h3>02 · Concept</h3>
              <p>Magnera is more than a fest — it's a convergence of ideas, talent, and communities. A space where technology meets creativity, students become creators, and every experience turns into a story.</p>
            </article>
          </div>
        </section>

        {/* THE EXPERIENCE: the fest in a nutshell */}
        <section className="section" id="experience">
          <p className="eyebrow">The experience</p>
          <h2>Two realms. One fest.</h2>
          <p className="lede">Magnera is the annual fest of the Department of Computer Science at St. Berchmans College, Changanassery. Cross the bridge and pick your realm, or stay for both.</p>
          <div className="cards">
            <a className="card card--realm" href="technical.html" style={{ "--accent": "#e5303f" }}>
              <span className="card__tag">Realm 01</span>
              <h3>Technical</h3>
              <p>Coding contests, hackathons, quizzes, workshops and talks for people who like to build, break and figure things out.</p>
              <span className="card__go">Enter the realm →</span>
            </a>
            <a className="card card--realm" href="cultural.html" style={{ "--accent": "#3fa9ff" }}>
              <span className="card__tag">Realm 02</span>
              <h3>Cultural</h3>
              <p>Music, dance, art, drama and games: the creative side of campus, on stage and off it.</p>
              <span className="card__go">Enter the realm →</span>
            </a>
          </div>
        </section>

        {/* WHY COME */}
        <section className="section" id="highlights">
          <p className="eyebrow">Why come</p>
          <h2>Built for curious minds</h2>
          <ul className="features">
            <li><span className="features__n">01</span><h3>Compete</h3><p>Put your skills against the best on campus and beyond, with prizes for the winners.</p></li>
            <li><span className="features__n">02</span><h3>Learn</h3><p>Hands-on workshops and talks that go past the syllabus.</p></li>
            <li><span className="features__n">03</span><h3>Create</h3><p>Turn an idea into something real over a day of building with your team.</p></li>
            <li><span className="features__n">04</span><h3>Connect</h3><p>Meet students, mentors and industry people who share your curiosity.</p></li>
          </ul>
        </section>

        {/* DATE + PLACE */}
        <section className="section" id="plan">
          <p className="eyebrow">Plan your visit</p>
          <h2>Mark the date</h2>
          <dl className="facts">
            <div><dt>When</dt><dd>29 January 2027<small>Schedule to be announced</small></dd></div>
            <div><dt>Where</dt><dd>St. Berchmans College<small>Changanassery, Kerala</small></dd></div>
            <div><dt>Hosted by</dt><dd>Department of Computer Science<small>Magnera ’26</small></dd></div>
            <div><dt>Entry</dt><dd>Open to students<small>Registration details soon</small></dd></div>
          </dl>
        </section>

        {/* SPONSORS */}
        <section className="section" id="sponsors">
          <p className="eyebrow">Sponsors</p>
          <h2>Our partners</h2>
          <p className="lede">Magnera runs on the support of people who believe in student creativity. Partners will be announced here.</p>
          <div className="partners" aria-label="Partner slots">
            <span>Title partner</span><span>Partner</span><span>Partner</span><span>Partner</span>
          </div>
          <p className="lede lede--small">Want to support Magnera? <a href="#contact">Get in touch</a>.</p>
        </section>

        {/* CONTACT */}
        <section className="section" id="contact">
          <p className="eyebrow">Contact</p>
          <h2>Get in touch</h2>
          <p className="lede">Questions about events, registration or sponsorship? Reach the organising team.</p>
          <dl className="facts facts--contact">
            <div><dt>Email</dt><dd>To be announced</dd></div>
            <div><dt>Phone</dt><dd>To be announced</dd></div>
            <div><dt>Campus</dt><dd>Dept. of Computer Science<small>St. Berchmans College, Changanassery</small></dd></div>
          </dl>
        </section>

        <footer className="footer">
          <div className="footer__brand">Magnera ’26</div>
          <nav className="footer__nav" aria-label="Footer">
            <a href="#about">About</a><a href="technical.html">Technical</a><a href="cultural.html">Cultural</a><a href="#sponsors">Sponsors</a><a href="#contact">Contact</a>
          </nav>
          <div className="footer__copy">© Magnera ’26 · Department of Computer Science, St. Berchmans College</div>
        </footer>
      </main>
    </>
  );
}
