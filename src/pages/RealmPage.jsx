import { useRealmFX } from "../hooks/useRealmFX.js";

// technical.html and cultural.html were near-identical (see CLAUDE.md): same
// markup, differing only in copy and accent. This is that shared markup, with
// the differences pulled into REALMS below instead of being duplicated in two
// components — a structural simplification, not a visual one; the rendered
// DOM is the same as each original page.
const REALMS = {
  technical: {
    eyebrow: "Realm of builders",
    heading: "Technical Events",
    subheading: "The realm of builders",
  },
  cultural: {
    eyebrow: "Realm of performers",
    heading: "Cultural Events",
    subheading: "The realm of performers",
  },
};

const CARDS = [1, 2, 3, 4, 5, 6];

export default function RealmPage({ realm }) {
  useRealmFX(realm);
  const { eyebrow, heading, subheading } = REALMS[realm];

  return (
    <>
      <a className="back" href="index.html" data-warp-back>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m5-5-5 5 5 5" /></svg>
        Back to Magnera
      </a>

      {/* HERO: the island's portal, open. Scrolling steps through it. */}
      <header className="portal-hero">
        <div className="portal-hero__frame">
          <img decoding="async" className="portal-hero__sky" src="assets/realm-sky.webp" alt="" />
          <div className="portal-hero__scene">
            <img decoding="async" src="assets/layer2-island-baked.webp" alt={`The ${heading} island's portal, open`} draggable="false" />
            <span className="portal" id="heroPortal" aria-hidden="true"></span>
          </div>
          <div className="portal-hero__intro">
            <p className="eyebrow"><i className="gem"></i>{eyebrow}</p>
            <h1>{heading}</h1>
          </div>
          <div className="scroll-cue" aria-hidden="true">Scroll to enter<i></i></div>
          <div className="portal-hero__veil"></div>
        </div>
      </header>

      <main className="realm">
        <div className="realm__inner">
          <p className="eyebrow"><i className="gem"></i>{heading}</p>
          <h2>{subheading}</h2>
          <p className="lede">The full line-up, dates and registration details will be announced soon.</p>
          <div className="cards">
            {CARDS.map((n) => (
              <article className="card" key={n}>
                <span className="tag">{`Event ${String(n).padStart(2, "0")}`}</span>
                <h3>Event title</h3>
                <p>Description to be announced.</p>
                <p className="meta">Date · Venue — TBA</p>
              </article>
            ))}
          </div>
        </div>
        <footer className="footer">© Magnera ’26 · Department of Computer Science, St. Berchmans College</footer>
      </main>
    </>
  );
}
