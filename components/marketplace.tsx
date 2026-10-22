"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import {
  creations,
  defaults,
  type Configuration,
  type Mode,
} from "./exhibition-data";
const Scene = dynamic(() => import("./creation-scene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Opening the exhibition…</div>,
});
const modes = ["customise", "assemble", "engineer"] as const;
const colors = [
  { name: "Pearl", hex: "#e4dfd2" },
  { name: "Forest", hex: "#425d50" },
  { name: "Graphite", hex: "#555d66" },
  { name: "Terracotta", hex: "#ae7057" },
];
function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function Still({
  selected,
  config = defaults,
}: {
  selected: number;
  config?: Configuration;
}) {
  return (
    <svg className="still-model" viewBox="0 0 600 300" aria-hidden="true">
      <ellipse cx="300" cy="256" rx="215" ry="15" fill="#000" opacity=".16" />
      {selected === 0 ? (
        <g
          transform={`translate(${300 - (300 * config.length) / 6.8} 0) scale(${config.length / 6.8} 1)`}
        >
          <path
            d="M85 100 431 100 509 141 509 229 85 229Z"
            fill={config.color}
            stroke="#8a9393"
            strokeWidth="2"
          />
          <path d="m431 107 63 39h-63Z" fill="#22353e" />
          <path d="M101 120h193v49H101zM321 120h82v49h-82z" fill="#22353e" />
          <path d="M307 107v113M85 208h424" stroke="#596a68" strokeWidth="3" />
          {[164, 428].map((x) => (
            <g key={x}>
              <circle
                cx={x}
                cy={229}
                r={config.wheelSize * 1.3}
                fill="#1c2226"
              />
              <circle
                cx={x}
                cy={229}
                r={config.wheelSize * 0.7}
                fill="#aab0ae"
              />
            </g>
          ))}
          {config.solar && <path d="M128 90h191v9H128z" fill="#456584" />}
          {config.awning && (
            <path d="m102 99-37-23h290l40 23Z" fill="#bda87b" />
          )}
          {config.storage && <path d="M60 155h25v65H60z" fill="#657263" />}
        </g>
      ) : selected === 1 ? (
        <g stroke="#9aa99d" strokeWidth="12" strokeLinecap="round" fill="none">
          <circle cx="196" cy="228" r="32" stroke="#525e56" />
          <circle cx="408" cy="228" r="32" stroke="#525e56" />
          <path d="M196 211h212L380 70h-38M245 210v-78h-35m0 0h70" />
        </g>
      ) : selected === 2 ? (
        <g fill="#ba9473" stroke="#6b7776" strokeWidth="7">
          <path d="m210 80 130 15 20 115-130-15Z" />
          <path d="m230 195 130 15 55-40-134-16Z" />
          <path d="m230 195 5 62m125-47 5 47m50-87 4 67" fill="none" />
        </g>
      ) : (
        <g stroke="#bda878" strokeWidth="8" fill="none">
          <ellipse cx="300" cy="108" rx="76" ry="73" />
          <path d="M300 183v69m-55 0h110" />
        </g>
      )}
    </svg>
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
  const [mode, setMode] = useState<Mode>("exhibition");
  const [config, setConfig] = useState<Configuration>(defaults);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [workshop, setWorkshop] = useState(false);
  const [liked, setLiked] = useState<number[]>([]);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<
    { creation: number; text: string }[]
  >([]);
  const [notice, setNotice] = useState("");
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const workspaceTitle = useRef<HTMLHeadingElement>(null);
  const exhibitionTitle = useRef<HTMLHeadingElement>(null);
  const workspace = mode !== "exhibition";
  const item = creations[selected];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const frame = requestAnimationFrame(() => {
      update();
      visibility();
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        setWebgl(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setWebgl(false);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (workspace || paused || reduced || !visible) return;
    const timer = setInterval(
      () => setSelected((current) => (current + 1) % creations.length),
      10000,
    );
    return () => clearInterval(timer);
  }, [workspace, paused, reduced, visible, selected]);
  function changeMode(next: Mode) {
    setMode(next);
    setNotice("");
    menu.current?.close();
    requestAnimationFrame(() => {
      if (next === "exhibition") exhibitionTitle.current?.focus();
      else workspaceTitle.current?.focus();
    });
  }
  function update<K extends keyof Configuration>(
    key: K,
    value: Configuration[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }
  const fallback = (
    <div className="fallback">
      <Still
        selected={workspace ? 0 : selected}
        config={workspace ? config : defaults}
      />
      <span>Illustrated preview · WebGL unavailable</span>
    </div>
  );
  return (
    <div className={workspace ? "app workspace-active" : "app"}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeMode("exhibition");
          }}
        >
          form<span>&</span>field<sup>®</sup>
        </a>
        <nav className="mode-nav" aria-label="Creation modes">
          {modes.map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => changeMode(m)}
            >
              {m}
              <span>
                <Arrow />
              </span>
            </button>
          ))}
        </nav>
        <button
          ref={trigger}
          className="menu-button"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          onClick={() => {
            menu.current?.showModal();
            menu.current?.querySelector("button")?.focus();
          }}
        >
          <span>Explore</span>
          <i />
          <i />
        </button>
      </header>
      <dialog
        className="menu-dialog"
        ref={menu}
        aria-labelledby="menu-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) menu.current?.close();
        }}
        onClose={() => {
          if (mode === "exhibition") trigger.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const elements =
            e.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
          const first = elements[0];
          const last = elements[elements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="menu-top">
          <span id="menu-title">A world of possibility</span>
          <button
            autoFocus
            onClick={() => menu.current?.close()}
            aria-label="Close navigation menu"
          >
            Close ×
          </button>
        </div>
        <nav aria-label="Explore">
          {modes.map((m) => (
            <button key={m} onClick={() => changeMode(m)}>
              {m}
              <Arrow />
            </button>
          ))}
          <a
            href="#community"
            onClick={() => {
              changeMode("exhibition");
            }}
          >
            Community <Arrow />
          </a>
          <a href="#faq" onClick={() => changeMode("exhibition")}>
            How it works & FAQ <Arrow />
          </a>
        </nav>
        <p>Fictional concepts. Shared imagination.</p>
      </dialog>
      <main id="main">
        <section
          className={`stage ${workshop && workspace ? "workshop" : ""}`}
          aria-label={
            workspace
              ? "Interactive motorhome configurator"
              : "Community creation exhibition"
          }
        >
          <div className="showcase-curtain" />
          {!workspace && (
            <div className="exhibition-heading">
              <span className="eyebrow">
                <i /> THE COMMUNITY EXHIBITION — VOL. 001
              </span>
              <h1 ref={exhibitionTitle} tabIndex={-1}>
                Extraordinary starts
                <br />
                with <em>someone.</em>
              </h1>
              <p>A spark of imagination. A world waiting to be made.</p>
            </div>
          )}
          {workspace && (
            <div className="workspace-heading">
              <button
                className="back-link"
                onClick={() => changeMode("exhibition")}
              >
                ← Back to exhibition
              </button>
              <span className="eyebrow">ATLAS / 01 · INTERACTIVE CONCEPT</span>
              <h1 ref={workspaceTitle} tabIndex={-1}>
                {mode === "customise"
                  ? "Make it yours."
                  : mode === "assemble"
                    ? "Build your possibilities."
                    : "Think in the details."}
              </h1>
              <p>One imagined motorhome. Your next iteration.</p>
            </div>
          )}
          <div className="spotlight-beam" aria-hidden="true" />
          <div
            className="scene"
            role="img"
            aria-label={
              workspace
                ? `Atlas motorhome preview: ${colors.find((c) => c.hex === config.color)?.name}, ${config.finish}, ${config.length} metres, ${config.clearance} millimetres clearance, ${config.wheelSize} inch wheels, solar ${config.solar ? "on" : "off"}, awning ${config.awning ? "on" : "off"}, storage ${config.storage ? "on" : "off"}, wireframe ${config.wireframe ? "on" : "off"}`
                : `${item.name}, featured 3D concept with other community creations in the shadows`
            }
          >
            {webgl ? (
              <SceneBoundary fallback={fallback}>
                <Scene
                  selected={selected}
                  reduced={reduced || paused || !visible}
                  workspace={workspace}
                  workshop={workshop}
                  config={config}
                />
              </SceneBoundary>
            ) : (
              fallback
            )}
          </div>
          {!workspace ? (
            <>
              <div className="exhibit-index">
                <span>
                  IN THE SHADOWS.
                  <br />
                  UNTIL IT’S THEIR MOMENT.
                </span>
                {creations.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelected(i);
                      setDraft("");
                      setNotice("");
                    }}
                    aria-label={`Feature ${c.name}`}
                    aria-pressed={selected === i}
                  >
                    <small>0{i + 1}</small>
                    <span>{c.name.split(" /")[0]}</span>
                    <i />
                  </button>
                ))}
              </div>
              <div
                className="exhibit-caption"
                aria-live={paused || reduced ? "polite" : "off"}
              >
                <span className="eyebrow">
                  {String(selected + 1).padStart(2, "0")} / 04 · {item.material}
                </span>
                <h2>{item.name}</h2>
                <p>{item.category}</p>
                <button
                  className="text-link"
                  onClick={() => changeMode("customise")}
                >
                  Enter the design studio <Arrow />
                </button>
              </div>
              <div className="exhibition-controls">
                <span className="live-label">
                  <i />{" "}
                  {reduced
                    ? "REDUCED MOTION · MANUAL EXPLORATION"
                    : paused
                      ? "EXHIBITION PAUSED"
                      : "A NEW PERSPECTIVE, EVERY 10 SECONDS"}
                </span>
                <button
                  onClick={() => setPaused(!paused)}
                  disabled={reduced}
                  aria-label={
                    reduced
                      ? "Motion disabled by reduced-motion preference"
                      : paused
                        ? "Resume exhibition"
                        : "Pause exhibition"
                  }
                  aria-pressed={paused || reduced}
                >
                  {reduced ? "Motion off" : paused ? "Play" : "Pause"}
                  <span
                    className={paused || reduced ? "play-icon" : "pause-icon"}
                    aria-hidden="true"
                  />
                </button>
                <span className="demo-tag">FICTIONAL DEMO · PROCEDURAL 3D</span>
              </div>
            </>
          ) : (
            <>
              <div className="workspace-tools">
                <label>
                  <input
                    type="checkbox"
                    checked={workshop}
                    onChange={(e) => setWorkshop(e.target.checked)}
                  />{" "}
                  Workshop background
                </label>
                <button
                  onClick={() => setPaused(!paused)}
                  disabled={reduced}
                  aria-pressed={paused || reduced}
                >
                  {paused || reduced ? "Rotation paused" : "Pause rotation"}
                </button>
              </div>
              <aside className="config-panel" aria-label={`${mode} controls`}>
                <div className="panel-top">
                  <span className="eyebrow">DESIGN STUDIO</span>
                  <span>PROTOTYPE / 01</span>
                </div>
                <div
                  className="panel-tabs"
                  role="group"
                  aria-label="Workspace mode"
                >
                  {modes.map((m) => (
                    <button
                      key={m}
                      aria-pressed={mode === m}
                      onClick={() => changeMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {mode === "customise" && (
                  <div className="panel-content">
                    <h2>A different kind of escape.</h2>
                    <p>Refine the character of your Atlas.</p>
                    <fieldset>
                      <legend>01 / Exterior colour</legend>
                      <div className="color-options">
                        {colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => update("color", c.hex)}
                            aria-label={`${c.name} exterior`}
                            aria-pressed={config.color === c.hex}
                          >
                            <i style={{ background: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>02 / Surface finish</legend>
                      <div className="segmented">
                        {(["satin", "polished"] as const).map((f) => (
                          <button
                            key={f}
                            aria-pressed={config.finish === f}
                            onClick={() => update("finish", f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="range-label">
                      03 / Body length{" "}
                      <output>{config.length.toFixed(1)} m</output>
                      <input
                        aria-label="Body length"
                        type="range"
                        min="5.5"
                        max="8"
                        step="0.1"
                        value={config.length}
                        onChange={(e) =>
                          update("length", Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                )}
                {mode === "assemble" && (
                  <div className="panel-content">
                    <h2>More than the sum.</h2>
                    <p>Add or remove modules. Watch your concept take shape.</p>
                    {(
                      [
                        {
                          key: "solar",
                          name: "Solar roof",
                          detail: "Two low-profile panel modules",
                          number: "01",
                        },
                        {
                          key: "awning",
                          name: "Outdoor awning",
                          detail: "A sheltered space beyond the cabin",
                          number: "02",
                        },
                        {
                          key: "storage",
                          name: "Rear storage",
                          detail: "Room for the things you take along",
                          number: "03",
                        },
                      ] as const
                    ).map((module) => (
                      <label className="module-row" key={module.key}>
                        <span className="module-icon">{module.number}</span>
                        <span>
                          <strong>{module.name}</strong>
                          <small>{module.detail}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={config[module.key]}
                          onChange={(e) => update(module.key, e.target.checked)}
                        />
                      </label>
                    ))}
                    <div className="assembly-count">
                      {Number(config.solar) +
                        Number(config.awning) +
                        Number(config.storage)}{" "}
                      / 3 optional modules installed
                    </div>
                  </div>
                )}
                {mode === "engineer" && (
                  <div className="panel-content">
                    <h2>Precision meets possibility.</h2>
                    <p>
                      Explore geometry. These are visual parameters, not
                      validated engineering calculations.
                    </p>
                    <label className="range-label">
                      Body length <output>{config.length.toFixed(1)} m</output>
                      <input
                        aria-label="Body length"
                        type="range"
                        min="5.5"
                        max="8"
                        step="0.1"
                        value={config.length}
                        onChange={(e) =>
                          update("length", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="range-label">
                      Ground clearance <output>{config.clearance} mm</output>
                      <input
                        aria-label="Ground clearance"
                        type="range"
                        min="180"
                        max="450"
                        step="10"
                        value={config.clearance}
                        onChange={(e) =>
                          update("clearance", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="range-label">
                      Wheel diameter <output>{config.wheelSize} in</output>
                      <input
                        aria-label="Wheel diameter"
                        type="range"
                        min="16"
                        max="26"
                        value={config.wheelSize}
                        onChange={(e) =>
                          update("wheelSize", Number(e.target.value))
                        }
                      />
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={config.wireframe}
                        onChange={(e) => update("wireframe", e.target.checked)}
                      />{" "}
                      Show body wireframe
                    </label>
                    <div className="engineering-note">
                      CONCEPT GEOMETRY ONLY
                      <br />
                      No structural, safety or roadworthiness assessment.
                    </div>
                  </div>
                )}
                <div className="panel-footer">
                  <button
                    onClick={() => {
                      setConfig(defaults);
                      setNotice("Design reset to the original Atlas concept.");
                    }}
                  >
                    Reset design <span>↺</span>
                  </button>
                  <p>Local prototype only. No manufacturing files or orders.</p>
                </div>
              </aside>
              <div className="model-spec">
                <span>ATLAS / 01</span>
                <strong>
                  {colors.find((c) => c.hex === config.color)?.name} ·{" "}
                  {config.finish}
                </strong>
                <span>
                  {config.length.toFixed(1)} M / {config.wheelSize} IN WHEELS
                </span>
              </div>
            </>
          )}
        </section>
        {!workspace ? (
          <>
            <section id="community" className="community">
              <div className="community-top">
                <span className="eyebrow">
                  BEHIND EVERY CREATION, A HUMAN SPARK.
                </span>
                <span className="fictional-badge">
                  ALL PEOPLE, MAKERS & STORIES ARE FICTIONAL DEMO CONTENT
                </span>
              </div>
              <div className="story-grid">
                <div className="creator-column">
                  <span className="section-number">01 / THE PEOPLE</span>
                  <div className="creator">
                    <span className="avatar">{item.initials}</span>
                    <div>
                      <small>CONCEPT CREATOR · FICTIONAL</small>
                      <h3>{item.creator}</h3>
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <div className="manufacturer">
                    <small>MANUFACTURING PARTNER · FICTIONAL</small>
                    <h3>{item.maker}</h3>
                    <p>
                      An imagined collaboration between creative ambition and
                      thoughtful manufacturing.
                    </p>
                  </div>
                </div>
                <article className="creation-story">
                  <span className="section-number">02 / THE IDEA</span>
                  <h2>{item.category}.</h2>
                  <p>{item.story}</p>
                  <button
                    className={`appreciate ${liked.includes(selected) ? "liked" : ""}`}
                    aria-pressed={liked.includes(selected)}
                    onClick={() =>
                      setLiked((current) =>
                        current.includes(selected)
                          ? current.filter((n) => n !== selected)
                          : [...current, selected],
                      )
                    }
                  >
                    <span>♡</span>{" "}
                    {liked.includes(selected)
                      ? "Appreciated"
                      : "Appreciate this idea"}{" "}
                    <small>LOCAL DEMO</small>
                  </button>
                </article>
                <div className="comments">
                  <span className="section-number">03 / THE CONVERSATION</span>
                  <article>
                    <span className="comment-avatar">
                      {item.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <h3>
                        {item.author} <small>FICTIONAL DEMO COMMENT</small>
                      </h3>
                      <p>{item.comment}</p>
                    </div>
                  </article>
                  {comments
                    .filter((c) => c.creation === selected)
                    .map((c, i) => (
                      <article key={i}>
                        <span className="comment-avatar">YOU</span>
                        <div>
                          <h3>
                            You <small>LOCAL PREVIEW · NOT PUBLISHED</small>
                          </h3>
                          <p>{c.text}</p>
                        </div>
                      </article>
                    ))}
                  <form
                    onFocus={() => setPaused(true)}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = draft.trim();
                      if (!text) {
                        setNotice("Write a comment before adding it.");
                        return;
                      }
                      setComments((current) => [
                        ...current,
                        { creation: selected, text },
                      ]);
                      setDraft("");
                      setNotice(
                        "Comment added locally. It is not published and will disappear on refresh.",
                      );
                    }}
                  >
                    <label htmlFor="comment">
                      Add to the conversation <small>LOCAL PREVIEW ONLY</small>
                    </label>
                    <div className="comment-input">
                      <input
                        id="comment"
                        maxLength={500}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="What does this inspire?"
                        required
                      />
                      <button type="submit" aria-label="Add local comment">
                        <Arrow />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
            <section className="invitation">
              <span className="eyebrow">IMAGINE. EXPLORE. MAKE IT YOURS.</span>
              <h2>
                The next extraordinary thing
                <br />
                could start <em>with you.</em>
              </h2>
              <button onClick={() => changeMode("customise")}>
                Step inside the studio <Arrow />
              </button>
            </section>
            <section id="faq" className="faq">
              <span className="eyebrow">A LITTLE CLARITY</span>
              <h2>Behind the possibility.</h2>
              {[
                [
                  "Is this a real marketplace?",
                  "No. Every creation, creator, manufacturer, story and seeded comment is fictional demo content. There are no real customers, orders, payments or external AI integrations.",
                ],
                [
                  "What can I do in the studio?",
                  "Customise changes the Atlas motorhome’s colour, finish and length. Assemble toggles solar panels, an awning and rear storage. Engineer adjusts visual dimensions, clearance, wheel size and wireframe. These are interactive prototypes, not CAD or validated engineering tools.",
                ],
                [
                  "Are my comments and designs saved?",
                  "Your settings, appreciations and comments exist only in this browser session’s page state. Nothing is sent to a server or published. Refreshing resets them.",
                ],
                [
                  "How does the exhibition move?",
                  "A different creation moves into the spotlight every 10 seconds. Select any creation manually, or pause the exhibition. Reduced-motion preferences turn off automatic rotation, transitions and cycling; manual selection remains available.",
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
          </>
        ) : (
          <section className="workspace-disclaimer">
            <span>EXPLORATION, NOT CERTIFICATION.</span>
            <p>
              This Atlas motorhome is a procedural placeholder. All creators and
              manufacturers are fictional. Options are visual demonstrations; no
              real engineering, ordering or production services are provided.
            </p>
          </section>
        )}
        <div className="status-message" role="status">
          {notice}
        </div>
      </main>
      <footer>
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeMode("exhibition");
          }}
        >
          form<span>&</span>field
        </a>
        <p>Human imagination. Endless possibility.</p>
        <span>
          FICTIONAL COMMUNITY EXHIBITION
          <br />
          NO REAL ORDERS · NO EXTERNAL AI
        </span>
      </footer>
    </div>
  );
}
