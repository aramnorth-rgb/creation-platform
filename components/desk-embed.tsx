"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { defaults } from "./exhibition-data";
import { DeskControls, DeskFallback } from "./desk-controls";
import { deskDescription } from "@/lib/configurator/desk";
import { useDeskEngine } from "./use-desk-engine";
import {
  useWorkshopEnvironment,
  EnvironmentSwitcher,
  WorkshopBackdrop,
} from "./workshop-environment";
const Scene = dynamic(() => import("./creation-scene"), { ssr: false });
/** Minimal standalone host. No marketplace/account dependency or external services. */
import { type ProductDraft, type CreationMode } from "@/lib/studio/product";
export default function DeskEmbed({
  policy,
  initialMode = "customise",
}: {
  policy?: ProductDraft;
  initialMode?: CreationMode;
}) {
  const engine = useDeskEngine(true, policy);
  const config = engine.config;
  const room = useWorkshopEnvironment();
  const [mode, setMode] = useState<"customise" | "assemble" | "engineer">(
    policy && !policy.modes.includes(initialMode)
      ? policy.modes[0]
      : initialMode,
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
        <span className="nx-eyebrow">
          NITORIX CREATE · TRY WITHOUT AN ACCOUNT
        </span>
        <h1>{policy?.name ?? "Contour desk organiser"}</h1>
        <p>{policy?.description ?? "A little order. A lot of possibility."}</p>
        <div
          className="embed-canvas"
          role="img"
          aria-label={deskDescription(config)}
        >
          <WorkshopBackdrop
            environment={room.enabled ? room.environment : undefined}
          />
          {webgl ? (
            <Scene
              selected={0}
              reduced
              paused
              workspace
              workshop={room.enabled}
              environment={room.enabled ? room.environment : undefined}
              highlightSlot={mode === "assemble" ? engine.slot : undefined}
              config={defaults}
              desk={config}
            />
          ) : (
            <DeskFallback
              config={config}
              highlightSlot={mode === "assemble" ? engine.slot : undefined}
            />
          )}
        </div>
        <label className="embed-background">
          <input
            type="checkbox"
            checked={room.enabled}
            onChange={(e) => room.setEnabled(e.target.checked)}
          />{" "}
          Workshop background
        </label>
        <EnvironmentSwitcher
          value={room.environment}
          change={room.setEnvironment}
          disabled={!room.enabled}
        />
      </section>
      <section className="embed-controls" aria-label="Desk configuration">
        <nav aria-label="Standalone creation modes">
          {(
            policy?.modes ?? (["customise", "assemble", "engineer"] as const)
          ).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </nav>
        <DeskControls engine={engine} mode={mode} />
      </section>
    </main>
  );
}
