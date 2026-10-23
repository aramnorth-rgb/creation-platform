"use client";
import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  creations,
  defaults,
  type Configuration,
  type Mode,
} from "./exhibition-data";
import { PromotionCopy } from "./promotion-copy";
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
      ) : selected === 3 ? (
        <g stroke="#bda878" strokeWidth="8" fill="none">
          <ellipse cx="300" cy="108" rx="76" ry="73" />
          <path d="M300 183v69m-55 0h110" />
        </g>
      ) : (
        <OtherStill selected={selected} />
      )}
    </svg>
  );
}
function OtherStill({ selected }: { selected: number }) {
  return (
    <g fill="#a7b4aa" stroke="#687e77" strokeWidth="7" strokeLinejoin="round">
      {selected === 4 ? (
        <>
          <path d="M235 250h120l-25-35h-70Z" />
          <path d="m295 210-35-65 65-65 55 30" fill="none" strokeWidth="25" />
          <circle cx="260" cy="145" r="18" />
          <path d="m365 110 35-20m-20 35 35-5" />
        </>
      ) : selected === 5 ? (
        <>
          <circle
            cx="300"
            cy="165"
            r="72"
            fill="none"
            stroke="#cfb477"
            strokeWidth="18"
          />
          <path d="m300 45 36 32-36 35-36-35Z" fill="#c6dfe0" />
        </>
      ) : selected === 6 ? (
        <>
          <path d="M125 245h350v15H125Z" />
          <path
            d="M155 245V115l145-70 145 70v130M155 115h290M220 245V82m160 163V82"
            fill="none"
            stroke="#c1a37c"
          />
        </>
      ) : selected === 7 ? (
        <>
          <path d="M170 80h210v70h-85v85h-60v-85h-65Z" fill="#b3aa69" />
          <path d="M380 100h65v25h-65M220 235h85v25h-85Z" />
        </>
      ) : selected === 8 ? (
        <>
          <path d="M260 40h80v210h-80Z" fill="#a38871" />
          <circle cx="300" cy="145" r="62" fill="#e5dfc8" />
          <path d="M300 105v40l30 20" fill="none" />
        </>
      ) : selected === 9 ? (
        <>
          <ellipse cx="300" cy="150" rx="42" ry="24" />
          <path d="m265 140-75-50m145 50 75-50m-145 70-75 50m145-50 75 50" />
          {[
            [180, 85],
            [420, 85],
            [180, 215],
            [420, 215],
          ].map(([x, y]) => (
            <ellipse
              key={`${x}${y}`}
              cx={x}
              cy={y}
              rx="48"
              ry="19"
              fill="none"
            />
          ))}
        </>
      ) : selected === 10 ? (
        <>
          <path d="M235 45h130v215H235Z" fill="#b1906d" />
          <circle cx="300" cy="105" r="30" fill="#344943" />
          <circle cx="300" cy="195" r="42" fill="#344943" />
        </>
      ) : (
        <path
          d="M275 40h50v45c80 40 75 110 35 165H240c-40-55-45-125 35-165Z"
          fill="#7ba49b"
        />
      )}
    </g>
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
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [mode, setMode] = useState<Mode>("exhibition");
  const [config, setConfig] = useState<Configuration>(defaults);
  const [revision, setRevision] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [workshop, setWorkshop] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailView, setDetailView] = useState<"profile" | "comments">(
    "profile",
  );
  const [offset, setOffset] = useState(0);
  const [rotation, setRotation] = useState({
    x: 0,
    y: -0.45,
    dragging: false,
    returning: false,
  });
  const [interacting, setInteracting] = useState(false);
  const gesture = useRef<{
    id: number;
    kind: "carousel" | "object";
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    moved: boolean;
    pitch: number;
    yaw: number;
  } | null>(null);
  const sceneRoot = useRef<HTMLDivElement>(null);
  const panelTitle = useRef<HTMLHeadingElement>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const detailOpener = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<
    { creation: number; text: string }[]
  >([]);
  const [notice, setNotice] = useState("");
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const workspaceTitle = useRef<HTMLHeadingElement>(null);

  const workspace = mode !== "exhibition";
  const item = creations[selected];
  const recentComment = comments
    .filter((comment) => comment.creation === selected)
    .at(-1);
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
    if (
      workspace ||
      (webgl && !sceneReady) ||
      paused ||
      reduced ||
      !visible ||
      interacting ||
      detailsOpen
    )
      return;
    const timer = setInterval(() => {
      setSelected((current) => (current + 1) % creations.length);
      setRotation({ x: 0, y: -0.45, dragging: false, returning: true });
    }, 10000);
    return () => clearInterval(timer);
  }, [
    workspace,
    webgl,
    sceneReady,
    paused,
    reduced,
    visible,
    selected,
    selectionVersion,
    interacting,
    detailsOpen,
  ]);
  function changeMode(next: Mode) {
    setMode(next);
    setDetailsOpen(false);
    setOffset(0);
    setNotice("");
    menu.current?.close();
    requestAnimationFrame(() => {
      if (next === "exhibition") sceneRoot.current?.focus();
      else workspaceTitle.current?.focus();
    });
  }
  function update<K extends keyof Configuration>(
    key: K,
    value: Configuration[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
    setRevision((current) => current + 1);
  }
  function choose(delta: number) {
    setSelectionVersion((v) => v + 1);
    setSelected(
      (current) =>
        (current + delta + creations.length * 100) % creations.length,
    );
    setDetailsOpen(false);
    setDraft("");
    setNotice("");
    setOffset(0);
    setRotation({ x: 0, y: -0.45, dragging: false, returning: true });
  }
  function reveal() {
    setDetailsOpen(true);
    requestAnimationFrame(() => {
      panelTitle.current?.focus({ preventScroll: true });
    });
  }
  function startObject(event: PointerEvent, orientation = { x: 0, y: -0.45 }) {
    if (workspace || gesture.current || !event.isPrimary || event.button !== 0)
      return;
    gesture.current = {
      id: event.pointerId,
      kind: "object",
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
      pitch: orientation.x,
      yaw: orientation.y,
    };
    setInteracting(true);
  }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (workspace || !event.isPrimary || event.button !== 0) return;
    if (!gesture.current)
      gesture.current = {
        id: event.pointerId,
        kind: "carousel",
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
        pitch: 0,
        yaw: -0.45,
      };
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteracting(true);
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    if (Math.hypot(dx, dy) > 8) g.moved = true;
    if (g.moved) {
      if (g.kind === "object")
        setRotation({
          x: g.pitch + dy * 0.012,
          y: g.yaw + dx * 0.012,
          dragging: true,
          returning: false,
        });
      else
        setOffset(
          (dx / Math.max(240, event.currentTarget.clientWidth)) * Math.PI * 1.5,
        );
    }
    g.lastX = event.clientX;
    g.lastY = event.clientY;
  }
  function finishPointer(
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    setInteracting(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (g.kind === "object") {
      setRotation({ x: 0, y: -0.45, dragging: false, returning: true });
      if (!g.moved && !cancelled) reveal();
    } else if (g.moved && !cancelled) {
      const distance = g.lastX - g.x;
      const turns =
        (distance / Math.max(240, event.currentTarget.clientWidth)) *
        Math.PI *
        1.5;
      choose(
        -Math.round(turns / ((Math.PI * 2) / creations.length)) ||
          (distance > 0 ? -1 : 1),
      );
    }
    setOffset(0);
  }
  function openDetail(view: "profile" | "comments", opener: HTMLElement) {
    setDetailView(view);
    detailOpener.current = opener;
    detailDialog.current?.showModal();
  }
  function commentForm(id: string) {
    return (
      <form
        className="detail-comment-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setComments((current) => [
            ...current,
            { creation: selected, text: draft.trim() },
          ]);
          setDraft("");
          setNotice("Comment added locally. Not published; resets on refresh.");
        }}
      >
        <label htmlFor={id}>
          Add a comment <small>LOCAL PREVIEW · NOT PUBLISHED</small>
        </label>
        <div className="comment-input">
          <input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            required
            placeholder="What does this inspire?"
          />
          <button type="submit" aria-label="Add local comment">
            <Arrow />
          </button>
        </div>
      </form>
    );
  }
  const fallback = (
    <div className="fallback">
      {workspace ? (
        <Still selected={0} config={config} />
      ) : (
        <button
          className="fallback-object"
          aria-label={`Open ${item.name} details`}
          onPointerDown={(e) => startObject(e.nativeEvent)}
          onClick={(e) => {
            if (e.detail === 0) reveal();
          }}
          style={{
            transition: rotation.dragging ? "none" : undefined,
            transform: `perspective(800px) rotateX(${rotation.x}rad) rotateY(${rotation.y + 0.45}rad)`,
          }}
        >
          <Still selected={selected} />
        </button>
      )}
      <span>Illustrated preview · WebGL unavailable</span>
    </div>
  );
  return (
    <div
      className={
        workspace
          ? "app workspace-active"
          : detailsOpen
            ? "app gallery-detail-open"
            : "app"
      }
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          title="NITORIX — provisional working name"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeMode("exhibition");
          }}
        >
          NITORIX<sup>V5</sup>
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
              reveal();
            }}
          >
            Community <Arrow />
          </a>
          <button
            onClick={() => {
              menu.current?.close();
              setNotice(
                "Drag the surrounding space to turn the carousel; drag the object to rotate it. Tap or press Enter for details. All creations are fictional demos.",
              );
            }}
          >
            How to explore <Arrow />
          </button>
        </nav>
        <p>Fictional concepts. Shared imagination.</p>
      </dialog>
      <main id="main">
        <section
          className={`stage ${workshop && workspace ? "workshop" : ""}`}
          data-configuration-revision={revision}
          aria-label={
            workspace
              ? "Interactive motorhome configurator"
              : "Community creation exhibition"
          }
        >
          <div className="showcase-curtain" />
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
            ref={sceneRoot}
            role={workspace ? "img" : "group"}
            tabIndex={workspace ? undefined : 0}
            aria-roledescription={workspace ? undefined : "3D carousel"}
            aria-describedby={workspace ? undefined : "carousel-instructions"}
            data-creation={selected}
            data-object-dragging={rotation.dragging}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={(e) => finishPointer(e)}
            onPointerCancel={(e) => finishPointer(e, true)}
            onLostPointerCapture={(e) => {
              if (gesture.current) finishPointer(e, true);
            }}
            onKeyDown={(e) => {
              if (workspace || e.target !== e.currentTarget) return;
              if (
                e.shiftKey &&
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                setInteracting(true);
                setRotation((current) => ({
                  x:
                    current.x +
                    (e.key === "ArrowUp"
                      ? -0.18
                      : e.key === "ArrowDown"
                        ? 0.18
                        : 0),
                  y:
                    current.y +
                    (e.key === "ArrowLeft"
                      ? -0.18
                      : e.key === "ArrowRight"
                        ? 0.18
                        : 0),
                  dragging: true,
                  returning: false,
                }));
                return;
              }
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                choose(e.key === "ArrowRight" ? 1 : -1);
              }
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                reveal();
              }
              if (e.key === "p" || e.key === "P") setPaused((p) => !p);
              if (e.key === "Home") {
                e.preventDefault();
                choose(-selected);
              }
            }}
            onKeyUp={(e) => {
              if (
                e.key.startsWith("Arrow") &&
                rotation.dragging &&
                !gesture.current
              ) {
                setRotation({
                  x: 0,
                  y: -0.45,
                  dragging: false,
                  returning: true,
                });
                setInteracting(false);
              }
            }}
            onBlur={() => {
              if (rotation.dragging && !gesture.current) {
                setRotation({
                  x: 0,
                  y: -0.45,
                  dragging: false,
                  returning: true,
                });
                setInteracting(false);
              }
            }}
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
                  detailsOpen={detailsOpen}
                  onReady={() => setSceneReady(true)}
                  reduced={reduced}
                  paused={paused || !visible}
                  workspace={workspace}
                  workshop={workshop}
                  config={config}
                  offset={offset}
                  rotation={rotation}
                  onObjectDown={startObject}
                />
              </SceneBoundary>
            ) : (
              fallback
            )}
          </div>

          {!workspace ? (
            <>
              <h1 className="sr-only">NITORIX community showroom</h1>
              <p id="carousel-instructions" className="sr-only">
                Twelve fictional demo creations. Drag empty space to turn the
                carousel. Drag the featured object to rotate it; release to
                return. Tap the object or press Enter to view details. Left and
                right arrow keys choose creations. Shift plus arrow keys rotate
                the object; release to return. P pauses automatic movement.
                Reduced motion disables automatic cycling.
              </p>
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
                      setRevision((current) => current + 1);
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
                <strong key={revision} className="studio-sync">
                  {colors.find((c) => c.hex === config.color)?.name} ·{" "}
                  {config.finish}
                </strong>
                <span>
                  {config.length.toFixed(1)} M / {config.wheelSize} IN WHEELS
                </span>
              </div>
            </>
          )}
          {!workspace && detailsOpen && (
            <section
              className="creation-panel"
              id="community"
              aria-labelledby="creation-panel-title"
            >
              <div className="detail-heading">
                <div>
                  <span className="fictional-badge">
                    FICTIONAL DEMO · PROFILES, RATINGS & COMMENTS ARE INVENTED
                  </span>
                  <h2 id="creation-panel-title" ref={panelTitle} tabIndex={-1}>
                    {item.name}
                  </h2>
                </div>
                <button
                  aria-label="Close creation details"
                  onClick={() => {
                    setDetailsOpen(false);
                    sceneRoot.current?.focus({ preventScroll: true });
                  }}
                >
                  ×
                </button>
              </div>
              <div className="detail-grid">
                <article>
                  <span className="eyebrow">DESIGNED BY {item.creator}</span>
                  <p>{item.biography}</p>
                  <p className="designer-motivation">{item.story}</p>
                  <a
                    href={`#designer-${selected}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openDetail("profile", e.currentTarget);
                    }}
                  >
                    Full designer profile & story <Arrow />
                  </a>
                </article>
                <article>
                  <span className="eyebrow">FICTIONAL MANUFACTURER</span>
                  <h3>{item.maker}</h3>
                  <div
                    className="rating"
                    aria-label={`Fictional manufacturer rating: ${item.rating} out of 5 stars`}
                  >
                    <span aria-hidden="true">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} viewBox="0 0 20 20">
                          <path
                            d="m10 1 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L10 15.3l-5.6 2.9 1.1-6.2L1 7.6l6.2-.9Z"
                            fill="currentColor"
                          />
                        </svg>
                      ))}
                    </span>
                    <strong>{item.rating} / 5</strong>
                  </div>
                  <small>Illustrative demo rating. No real reviews.</small>
                  <p>{item.material}</p>
                  <p className="model-provenance">
                    {selected === 2
                      ? "Licensed reference: Sheen Chair · Eric Chadwick / Wayfair · CC0"
                      : selected === 10
                        ? "Licensed reference: BoomBox · Microsoft · CC0"
                        : "Procedural demo placeholder · Not photorealistic"}
                  </p>
                  <a
                    className="asset-credit"
                    href="/models/ATTRIBUTION.md"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Model credits & licences <Arrow />
                  </a>
                </article>
                <article className="detail-comments">
                  <span className="eyebrow">COMMUNITY · FICTIONAL PREVIEW</span>
                  <blockquote>
                    {recentComment
                      ? recentComment.text.slice(0, 160) +
                        (recentComment.text.length > 160 ? "…" : "")
                      : item.comment}
                    <cite>
                      {recentComment
                        ? "You · Local preview, not published"
                        : `${item.author} · Fictional`}
                    </cite>
                  </blockquote>
                  {commentForm("preview-comment")}
                  <a
                    href={`#comments-${selected}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openDetail("comments", e.currentTarget);
                    }}
                  >
                    Full comments (
                    {1 + comments.filter((c) => c.creation === selected).length}
                    ) <Arrow />
                  </a>
                </article>
              </div>
            </section>
          )}
        </section>
        {!workspace && (
          <PromotionCopy webgl={webgl} detailsOpen={detailsOpen} />
        )}
        {!workspace && (
          <div className="carousel-access" aria-label="Carousel controls">
            <button onClick={() => choose(-1)} aria-label="Previous creation">
              ←
            </button>
            <span className="sr-only" aria-live="polite">
              {item.name}, creation {selected + 1} of {creations.length}
            </span>
            <button
              onClick={() => reveal()}
              aria-label={`Open ${item.name} details`}
            >
              Explore creation
            </button>
            <button
              disabled={reduced}
              aria-pressed={paused || reduced}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume carousel" : "Pause carousel"}
            >
              {reduced ? "Reduced motion" : paused ? "Play" : "Pause"}
            </button>
            <button onClick={() => choose(1)} aria-label="Next creation">
              →
            </button>
          </div>
        )}
        {workspace && (
          <section className="workspace-disclaimer">
            <span>EXPLORATION, NOT CERTIFICATION.</span>
            <p>
              This Atlas motorhome is a procedural placeholder. All creators and
              manufacturers are fictional. Options are visual demonstrations; no
              real engineering, ordering or production services are provided.
            </p>
          </section>
        )}
        <dialog
          ref={detailDialog}
          className="detail-dialog"
          aria-labelledby="full-detail-title"
          onClose={() => detailOpener.current?.focus({ preventScroll: true })}
          onClick={(e) => {
            if (e.target === e.currentTarget) detailDialog.current?.close();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
              "button, a[href], input",
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }}
        >
          <button
            autoFocus
            className="detail-close"
            aria-label="Close full detail view"
            onClick={() => detailDialog.current?.close()}
          >
            Close ×
          </button>
          <span className="fictional-badge">FICTIONAL DEMO CONTENT</span>
          <h2 id="full-detail-title">
            {detailView === "profile"
              ? item.creator
              : `Conversation / ${item.name}`}
          </h2>
          {detailView === "profile" ? (
            <article id={`designer-${selected}`}>
              <span className="eyebrow">FICTIONAL DESIGNER PROFILE</span>
              <p>{item.biography}</p>
              <p>
                {item.location}. This biography and collaboration are invented
                for this interactive exhibition.
              </p>
              <h3>The story behind {item.name}</h3>
              <p>{item.story}</p>
              <p>
                Materials explored: {item.material}. Imagined manufacturing
                partner: {item.maker}.
              </p>
            </article>
          ) : (
            <div id={`comments-${selected}`} className="full-comments">
              <p>
                Seeded comments are fictional. Your additions are local,
                unpublished and reset on refresh.
              </p>
              <article>
                <strong>{item.author} · Fictional demo comment</strong>
                <p>{item.comment}</p>
              </article>
              {comments
                .filter((c) => c.creation === selected)
                .map((c, i) => (
                  <article key={i}>
                    <strong>You · Local preview, not published</strong>
                    <p>{c.text}</p>
                  </article>
                ))}
              {commentForm("full-comment")}
            </div>
          )}
        </dialog>
        <div className="status-message" role="status">
          {notice}
        </div>
      </main>
      <footer>
        <a
          className="wordmark"
          title="NITORIX — provisional working name"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            changeMode("exhibition");
          }}
        >
          NITORIX
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
