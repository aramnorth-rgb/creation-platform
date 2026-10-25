"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { initialDesk } from "@/lib/configurator/desk";
import { DeskFallback } from "../desk-controls";
const Preview = dynamic(() => import("./product-preview"), { ssr: false });
class PreviewBoundary extends Component<
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
export function HomeHero() {
  const [config, setConfig] = useState({
    ...initialDesk,
    colour: "forest" as typeof initialDesk.colour,
    angle: -18,
  });
  const [webgl, setWebgl] = useState(false);
  const drag = useRef<{ x: number; angle: number; id: number } | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas"),
          gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        setWebgl(!!gl);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setWebgl(false);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const fallback = <DeskFallback config={config} />;
  return (
    <section className="nx-hero">
      <div className="nx-hero-copy">
        <span className="nx-eyebrow">
          <i /> MADE FOR YOUR KIND OF EVERYDAY
        </span>
        <h1>
          Imagine it.
          <br />
          <em>Make it yours.</em>
        </h1>
        <p>
          Beautiful products are a beginning.
          <br />
          The possibilities are yours to shape.
        </p>
        <div className="nx-actions">
          <Link className="nx-button nx-primary" href="/explore">
            Explore Products <span></span>
          </Link>
          <Link className="nx-text-link" href="/create">
            Start Creating <span></span>
          </Link>
        </div>
        <div className="nx-hero-note">
          <span>01—03</span>
          <p>
            Choose a product. Find your expression.
            <br />
            Made possible by thoughtful manufacturing.
          </p>
        </div>
      </div>
      <div className="nx-hero-product">
        <div className="nx-product-topline">
          <span>THE EVERYDAY, RECONSIDERED.</span>
          <span>001 / CONTOUR</span>
        </div>
        <div
          className="nx-hero-canvas"
          role="group"
          tabIndex={0}
          aria-label={`Interactive Contour organiser, ${config.colour}. Drag to rotate or use the rotation slider.`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = {
              x: e.clientX,
              angle: config.angle,
              id: e.pointerId,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current?.id === e.pointerId)
              setConfig((c) => ({
                ...c,
                angle: Math.max(
                  -180,
                  Math.min(
                    180,
                    drag.current!.angle + (e.clientX - drag.current!.x) * 0.5,
                  ),
                ),
              }));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              setConfig((c) => ({
                ...c,
                angle: Math.max(
                  -180,
                  Math.min(180, c.angle + (e.key === "ArrowLeft" ? -10 : 10)),
                ),
              }));
            }
          }}
        >
          {webgl ? (
            <PreviewBoundary fallback={fallback}>
              <Preview config={config} />
            </PreviewBoundary>
          ) : (
            fallback
          )}
        </div>
        <div className="nx-hero-product-controls">
          <div>
            <span className="nx-eyebrow">COLOUR STUDY</span>
            <div role="group" aria-label="Hero product colour">
              {[
                { id: "forest", hex: "#425d50" },
                { id: "ivory", hex: "#e4dfd2" },
                { id: "coral", hex: "#b96c57" },
              ].map((c) => (
                <button
                  key={c.id}
                  aria-label={`${c.id} hero colour`}
                  aria-pressed={config.colour === c.id}
                  style={{ background: c.hex }}
                  onClick={() =>
                    setConfig((p) => ({
                      ...p,
                      colour: c.id as typeof p.colour,
                    }))
                  }
                />
              ))}
            </div>
          </div>
          <label>
            Rotate to explore
            <input
              type="range"
              aria-label="Hero product rotation"
              min="-180"
              max="180"
              value={config.angle}
              onChange={(e) =>
                setConfig((c) => ({ ...c, angle: Number(e.target.value) }))
              }
            />
          </label>
        </div>
        <div className="nx-product-caption">
          <div>
            <h2>Contour desk organiser</h2>
            <p>A little order. A lot of possibility.</p>
          </div>
          <Link
            href="/create"
            aria-label="Personalise Contour desk organiser"
          ></Link>
        </div>
        <small className="nx-demo-caption">
          Interactive procedural demo · Illustrative materials
        </small>
      </div>
    </section>
  );
}
