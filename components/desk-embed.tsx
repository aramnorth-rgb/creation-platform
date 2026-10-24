"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useReducer, useState } from "react";
import { defaults } from "./exhibition-data";
import { DeskControls, DeskFallback } from "./desk-controls";
import {
  deskDescription,
  deskReducer,
  initialDesk,
} from "@/lib/configurator/desk";
const Scene = dynamic(() => import("./creation-scene"), { ssr: false });
/** Minimal standalone host. No marketplace/account dependency or external services. */
export default function DeskEmbed() {
  const [config, dispatch] = useReducer(deskReducer, initialDesk);
  const [mode, setMode] = useState<"customise" | "assemble" | "engineer">(
    "customise",
  );
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    // Run once outside rendering; this host deliberately keeps the model still.
    setWebgl(Boolean(context)); // eslint-disable-line react-hooks/set-state-in-effect
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);
  return (
    <main className="desk-embed">
      <section className="embed-preview">
        <Link href="/">NITORIX / provisional working name</Link>
        <h1>Contour desk organiser</h1>
        <p>Shared configuration engine · standalone demo</p>
        <div role="img" aria-label={deskDescription(config)}>
          {webgl ? (
            <Scene
              selected={0}
              reduced
              paused
              workspace
              workshop={false}
              config={defaults}
              desk={config}
            />
          ) : (
            <DeskFallback config={config} />
          )}
        </div>
      </section>
      <section className="embed-controls" aria-label="Desk configuration">
        <nav aria-label="Standalone creation modes">
          {(["customise", "assemble", "engineer"] as const).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </nav>
        <DeskControls config={config} dispatch={dispatch} mode={mode} />
      </section>
    </main>
  );
}
