"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
const Scene = dynamic(() => import("./creation-scene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">Preparing your perspective…</div>
  ),
});
const creations = [
  {
    name: "The Solstice Vessel",
    type: "OBJECT 001 / LIVING",
    material: "Layered oak · Natural oil finish",
    maker: "Northline Studio",
    location: "Copenhagen, Denmark",
    subtitle: "A little nature. A new perspective.",
    description:
      "Sculpted by imagination. Shaped by skilled hands. A quiet statement in layered oak, made to feel entirely your own.",
    shape: "vessel",
  },
  {
    name: "The Continuum Form",
    type: "OBJECT 002 / SCULPTURE",
    material: "Cast mineral · Honed finish",
    maker: "Atelier Sora",
    location: "Porto, Portugal",
    subtitle: "A study in the space between.",
    description:
      "An open, flowing form that catches the light differently every hour. Imagined digitally, grounded in the beauty of mineral.",
    shape: "arc",
  },
  {
    name: "The Ember Light",
    type: "OBJECT 003 / LIGHTING",
    material: "Spun copper · Brushed brass",
    maker: "Common Ground Works",
    location: "Bristol, United Kingdom",
    subtitle: "Warmth, with a point of view.",
    description:
      "A generous copper shade and a beautifully simple silhouette. An everyday ritual, seen in a warmer light.",
    shape: "lamp",
  },
];
const links = [
  ["Customise", "customise"],
  ["Assemble", "assemble"],
  ["Engineer", "engineer"],
  ["How It Works", "how-it-works"],
  ["FAQ", "faq"],
  ["Account", "account"],
];
function Arrow() {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function Placeholder({ shape }: { shape: string }) {
  return (
    <div className={`object-placeholder ${shape}`}>
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function Marketplace() {
  const [selected, setSelected] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [account, setAccount] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const item = creations[selected];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    const frame = requestAnimationFrame(() => {
      update();
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        setWebgl(Boolean(context));
        if (context) context.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setWebgl(false);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
    };
  }, []);
  function closeMenu() {
    menu.current?.close();
    trigger.current?.focus();
  }
  const fallback = (
    <div className="fallback">
      <Placeholder shape={item.shape} />
      <span>Still-life preview · 3D unavailable</span>
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Form and Field home">
          form<span>&</span>field<span className="brand-dot">®</span>
        </a>
        <span className="header-note">IMAGINATION, MADE REAL.</span>
        <button
          ref={trigger}
          className="menu-button"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          onClick={() => {
            menu.current?.showModal();
            menu.current?.querySelector<HTMLButtonElement>("button")?.focus();
          }}
        >
          <span>MENU</span>
          <span className="hamburger">
            <i />
            <i />
          </span>
        </button>
      </header>
      <dialog
        ref={menu}
        className="menu-dialog"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const elements =
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button, a[href]",
            );
          const first = elements[0];
          const last = elements[elements.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
        onClose={() => trigger.current?.focus()}
        aria-labelledby="menu-title"
      >
        <div className="menu-inner">
          <div className="menu-top">
            <span id="menu-title">Explore Form & Field</span>
            <button
              autoFocus
              aria-label="Close navigation menu"
              onClick={closeMenu}
            >
              Close ×
            </button>
          </div>
          <nav aria-label="Main navigation">
            {links.map(([label, id], i) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => {
                  closeMenu();
                  if (id === "account") setAccount(true);
                }}
              >
                <small>0{i + 1}</small>
                {label}
                <span>
                  <Arrow />
                </span>
              </a>
            ))}
          </nav>
          <p>A fictional marketplace. A real sense of possibility.</p>
        </div>
      </dialog>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-intro">
            <span className="eyebrow">
              <i /> THE NEXT CHAPTER OF MAKING
            </span>
            <h1 id="hero-title">
              Extraordinary.
              <br />
              <em>By you.</em>
            </h1>
            <p>
              A spark of an idea. A world of possibility.
              <br />
              Create something that could only be yours.
            </p>
            <a className="button ivory" href="#customise">
              Explore your possibilities{" "}
              <span>
                <Arrow />
              </span>
            </a>
            <div className="hero-footnote">
              <span className="tiny-star">✳</span> YOUR IMAGINATION. HUMAN
              CRAFT. AI POSSIBILITY.
            </div>
          </div>
          <div className="showcase">
            <div className="showcase-top">
              <span>THE CURATED EXPLORATION</span>
              <span>
                0{selected + 1} <b>/ 03</b>
              </span>
            </div>
            <div
              className="scene"
              role="img"
              aria-label={`${item.name}: ${item.material}. ${webgl ? "Interactive gallery render" : "Illustrated preview"}.`}
            >
              <div className="scene-glow" />
              {webgl ? (
                <SceneBoundary fallback={fallback}>
                  <Scene variant={selected} reduced={reduced || paused} />
                </SceneBoundary>
              ) : (
                fallback
              )}
              <span className="vertical-note">
                IMAGINED WITH AI. REFINED BY PEOPLE.
              </span>
              <div className="scene-base" />
            </div>
            <div className="showcase-bottom">
              <span>
                <i className="live-dot" />{" "}
                {webgl ? "LIVE 3D EXPLORATION" : "STILL-LIFE EXPLORATION"}
              </span>
              {webgl && (
                <button
                  onClick={() => setPaused(!paused)}
                  disabled={reduced}
                  aria-label={
                    reduced
                      ? "Rotation disabled by reduced-motion preference"
                      : paused
                        ? "Resume rotation"
                        : "Pause rotation"
                  }
                  aria-pressed={paused || reduced}
                >
                  {paused || reduced ? "Rotation paused" : "Pause rotation"}{" "}
                  {paused ? "▷" : "Ⅱ"}
                </button>
              )}
            </div>
          </div>
          <div
            className="creation-details"
            aria-live="polite"
            aria-atomic="true"
          >
            <div>
              <span className="eyebrow muted">{item.type}</span>
              <h2>{item.name}</h2>
              <p>{item.material}</p>
            </div>
            <div className="maker">
              <span className="maker-seal">nf</span>
              <div>
                <span>ENVISIONED WITH</span>
                <strong>
                  {item.maker}{" "}
                  <span>
                    <Arrow />
                  </span>
                </strong>
                <small>{item.location} · Fictional maker</small>
              </div>
            </div>
            <a href="#story" className="text-link">
              Meet the imagination behind it{" "}
              <span>
                <Arrow />
              </span>
            </a>
          </div>
        </section>
        <section className="collection" aria-label="Choose a creation">
          <div className="collection-heading">
            <span className="eyebrow">A FEW THINGS WE’RE IMAGINING</span>
            <span>THOUGHTFULLY MADE. NEVER ORDINARY.</span>
          </div>
          <div className="creation-grid">
            {creations.map((creation, i) => (
              <button
                key={creation.name}
                className={`creation-card ${selected === i ? "selected" : ""}`}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                <span className="card-number">0{i + 1}</span>
                <div className="card-art">
                  <Placeholder shape={creation.shape} />
                </div>
                <div className="card-label">
                  <span>
                    <strong>{creation.name}</strong>
                    <small>{creation.material.split(" · ")[0]}</small>
                  </span>
                  <span className="card-arrow">
                    <Arrow />
                  </span>
                </div>
                {selected === i && (
                  <span className="selected-label">NOW EXPLORING</span>
                )}
              </button>
            ))}
          </div>
        </section>
        <section id="customise" className="possibility">
          <span className="eyebrow">FROM WHAT IF, TO WHAT’S NEXT.</span>
          <h2>
            Good things begin
            <br />
            with <em>your imagination.</em>
          </h2>
          <p>
            Explore a concept, make it personal, and discover the craft behind
            it. Our vision brings AI-assisted design together with independent
            manufacturing.
          </p>
          <div id="how-it-works" className="steps">
            <article>
              <span>01 / CUSTOMISE</span>
              <h3>Find your form.</h3>
              <p>
                Choose a concept above. Imagine a different material, a softer
                curve, a place in your life.
              </p>
            </article>
            <article id="assemble">
              <span>02 / ASSEMBLE</span>
              <h3>Bring it together.</h3>
              <p>
                Explore how thoughtfully chosen parts and materials could become
                a considered whole.
              </p>
            </article>
            <article id="engineer">
              <span>03 / ENGINEER</span>
              <h3>Make it possible.</h3>
              <p>
                Discover the fictional studios behind each concept and the
                manufacturing approach they represent.
              </p>
            </article>
          </div>
          <div className="demo-note">
            <span>↳</span> This is an interactive concept gallery. Custom design
            tools, engineering services and ordering are not available in this
            demo.
          </div>
        </section>
        <section id="story" className="story">
          <div className="story-art">
            <span className="eyebrow">THE OBJECTS WE LIVE WITH</span>
            <div className="still-life">
              <div className="arch" />
              <Placeholder shape="vessel" />
              <div className="table-line" />
            </div>
            <span className="art-caption">
              A fictional home, somewhere slow.
            </span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">A CUSTOMER STORY / IMAGINED</span>
            <h2>
              “I wanted something
              <br />
              that felt like <em>me.</em>”
            </h2>
            <p>
              For fictional architect Elena, it started with a corner of her
              home that needed a little warmth. An idea became a vessel. And a
              vessel became a daily reminder to make room for beautiful things.
            </p>
            <div className="person">
              <span>EM</span>
              <div>
                <strong>Elena Moreau</strong>
                <small>Fictional customer · An illustrative story</small>
              </div>
            </div>
          </div>
        </section>
        <section className="conversation">
          <div>
            <span className="eyebrow">AROUND THE WORKTABLE</span>
            <h2>
              A shared sense
              <br />
              of <em>possibility.</em>
            </h2>
            <p>Imagined voices from a community of makers.</p>
          </div>
          <div className="comments">
            <article>
              <span className="avatar">JL</span>
              <div>
                <h3>
                  Jules Laurent <small>Design enthusiast · Demo</small>
                </h3>
                <p>
                  That layered texture is everything. I can imagine the Solstice
                  in a darker walnut, beside a stack of well-loved books.
                </p>
                <span className="comment-meta">CONCEPT COMMENT · 01</span>
              </div>
            </article>
            <article>
              <span className="avatar brass">AK</span>
              <div>
                <h3>
                  Ada Kim <small>Independent maker · Demo</small>
                </h3>
                <p>
                  The most exciting part? The conversation between an idea and
                  the hands that bring it to life.
                </p>
                <span className="comment-meta">CONCEPT COMMENT · 02</span>
              </div>
            </article>
          </div>
        </section>
        <section id="faq" className="faq">
          <span className="eyebrow">A LITTLE MORE CLARITY</span>
          <h2>Good questions.</h2>
          {[
            [
              "Can I buy these creations?",
              "Not yet. Every creation, maker, customer and comment here is fictional demo content. No purchases or real orders are supported.",
            ],
            [
              "How is AI used in this demo?",
              "This website presents a vision for AI-assisted manufacturing. It does not connect to external AI services or generate designs. The 3D objects are lightweight procedural placeholders.",
            ],
            [
              "Can I customise or engineer an object?",
              "You can select and explore three concept previews. Material editing, assembly tools and engineering reviews are future possibilities, not working services in this demo.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <section id="account" className="account">
          <div>
            <span className="eyebrow">YOUR NEXT CHAPTER</span>
            <h2>There’s space for your ideas.</h2>
          </div>
          <button
            className="button outline"
            onClick={() => setAccount(!account)}
            aria-expanded={account}
            aria-controls="account-message"
          >
            Explore membership{" "}
            <span>
              <Arrow />
            </span>
          </button>
          <p id="account-message" hidden={!account} role="status">
            Accounts are not available in this concept demo. No sign-up
            information is collected.
          </p>
        </section>
      </main>
      <footer>
        <a className="wordmark" href="#">
          form<span>&</span>field
        </a>
        <p>A world imagined. A future made.</p>
        <span>
          FICTIONAL CONCEPT DEMO · NO REAL ORDERS
          <br />© {new Date().getFullYear()} FORM & FIELD
        </span>
      </footer>
    </>
  );
}
