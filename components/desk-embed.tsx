"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { defaults } from "./exhibition-data";
import { DeskControls, DeskFallback } from "./desk-controls";
import { deskDescription } from "@/lib/configurator/desk";
import { scaleChoices, referenceLabel, personHeightCm, type ScaleReferenceKind } from "@/lib/configurator/scale-reference";
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
  const [comparison, setComparison] = useState<ScaleReferenceKind>("none");
  const [personHeight, setPersonHeight] = useState(175);
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
        <div className="nx-scale-toolbar">
          <label htmlFor="nx-scale-reference">Compare size with…</label>
          <select
            id="nx-scale-reference"
            value={comparison}
            onChange={(e) => setComparison(e.target.value as ScaleReferenceKind)}
          >
            {scaleChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
          {comparison === "person" && (
            <label className="nx-person-height">
              Height (cm)
              <input
                type="number"
                min={140}
                max={210}
                step={1}
                value={personHeight}
                onChange={(e) => {
                  if (e.target.value) setPersonHeight(personHeightCm(Number(e.target.value)));
                }}
              />
            </label>
          )}
          {comparison !== "none" && (
            <span className="nx-scale-caption">{referenceLabel(comparison, personHeight)}</span>
          )}
        </div>
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
              referenceKind={comparison}
              personHeight={personHeight}
            />
          ) : (
            <DeskFallback
              config={config}
              highlightSlot={mode === "assemble" ? engine.slot : undefined}
            />
          )}
        </div>
        {comparison !== "none" && !webgl && (
          <p className="nx-scale-fallback" role="status">
            The size reference is available in the 3D viewer. {referenceLabel(comparison, personHeight)}.
          </p>
        )}
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
