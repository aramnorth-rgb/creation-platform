"use client";

import { useEffect, useRef, type ReactNode } from "react";

const borders =
  ".nx-header, .nx-product-card, .nx-story-grid article, .nx-note-panel, .nx-filter";

/** Decorative only: no scroll listeners, animation loop, or interaction interception. */
export function PastelAtmosphere({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const surface = root.current!;
    const desktop = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let active: HTMLElement | null = null;
    let frame = 0;
    const clear = () => {
      cancelAnimationFrame(frame);
      active?.removeAttribute("data-pastel-hover");
      active = null;
    };
    const move = (event: PointerEvent) => {
      if (
        !desktop.matches ||
        reduced.matches ||
        event.pointerType === "touch"
      ) {
        clear();
        return;
      }
      const next =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(borders)
          : null;
      if (next !== active) {
        clear();
        active = next;
      }
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!active) return;
        const box = active.getBoundingClientRect();
        active.style.setProperty(
          "--nx-cursor-x",
          `${event.clientX - box.left}px`,
        );
        active.style.setProperty(
          "--nx-cursor-y",
          `${event.clientY - box.top}px`,
        );
        active.setAttribute("data-pastel-hover", "true");
      });
    };
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", clear);
    surface.addEventListener("pointercancel", clear);
    desktop.addEventListener("change", clear);
    reduced.addEventListener("change", clear);
    return () => {
      clear();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", clear);
      surface.removeEventListener("pointercancel", clear);
      desktop.removeEventListener("change", clear);
      reduced.removeEventListener("change", clear);
    };
  }, []);
  return (
    <div className="nx nx-atmosphere" ref={root}>
      <div className="nx-atmosphere-depth" aria-hidden="true">
        <div className="nx-atmosphere-distant" />
        <div className="nx-atmosphere-middle">
          <i />
          <i />
          <i />
        </div>
      </div>
      {children}
    </div>
  );
}
