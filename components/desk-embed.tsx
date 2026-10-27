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
  customiseOnly = false,
}: {
  policy?: ProductDraft;
  initialMode?: CreationMode;
  /** Customer-facing V2 launch: only Customise is available; other engines remain intact. */
  customiseOnly?: boolean;
}) {
  const engine = useDeskEngine(true, policy);
  const config = engine.config;
  const room = useWorkshopEnvironment();
  const [mode, setMode] = useState<CreationMode>(
    customiseOnly
      ? "customise"
      : policy && !policy.modes.includes(initialMode)
        ? policy.modes[0]
        : initialMode,
  );
  const modes: CreationMode[] = customiseOnly
    ? ["customise", "assemble", "engineer"]
    : (policy?.modes ?? ["customise", "assemble", "engineer"]);
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
        <nav className="nx-mode-tabs" aria-label="Standalone creation modes">
          {modes.map((m) => {
            const underConstruction = customiseOnly && m !== "customise";
            return (
              <button
                className="nx-mode-tab"
                key={m}
                type="button"
                aria-label={m}
                aria-pressed={mode === m}
                disabled={underConstruction}
                onClick={() => setMode(m)}
              >
                <span className="nx-mode-name">{m}</span>
                {underConstruction && (
                  <span className="nx-mode-tape" aria-hidden="true">
                    <span>Under construction</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
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
        <DeskControls engine={engine} mode={mode} />
      </section>
    </main>
  );
}
