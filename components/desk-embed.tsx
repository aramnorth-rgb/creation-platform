"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { readModelAsset, type ModelUnits } from "@/lib/studio/model-assets";
import type { PresentationFinish } from "./imported-model-viewer";
import { defaults } from "./exhibition-data";
import { DeskControls, DeskFallback } from "./desk-controls";
import { deskDescription, priceDesk } from "@/lib/configurator/desk";
import { addDemoEnquiry } from "@/lib/studio/enquiries";
import { scaleChoices, referenceLabel, personHeightCm, type ScaleReferenceKind } from "@/lib/configurator/scale-reference";
import { useDeskEngine } from "./use-desk-engine";
import {
  useWorkshopEnvironment,
  EnvironmentSwitcher,
  WorkshopBackdrop,
} from "./workshop-environment";
const Scene = dynamic(() => import("./creation-scene"), { ssr: false });
const ImportedModelViewer = dynamic(()=>import("./imported-model-viewer"),{ssr:false});
/** Minimal standalone host. No marketplace/account dependency or external services. */
import { type ProductDraft, type CreationMode } from "@/lib/studio/product";
export default function DeskEmbed({
  policy,
  initialMode = "customise",
  customiseOnly = false,
  enableDemoEnquiry = false,
  showcaseChair = false,
}: {
  policy?: ProductDraft;
  initialMode?: CreationMode;
  /** Customer-facing V2 launch: only Customise is available; other engines remain intact. */
  customiseOnly?: boolean;
  /** Only consumer Create can explicitly simulate an enquiry. */
  enableDemoEnquiry?: boolean;
  showcaseChair?: boolean;
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
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [model,setModel]=useState<{url:string;units:ModelUnits}|null>(null);
  const [finish,setFinish]=useState<PresentationFinish>("original");
  const [dimensions,setDimensions]=useState<[number,number,number]|null>(null);
  const [modelError,setModelError]=useState("");
  const receiveDimensions=useCallback((size:[number,number,number])=>setDimensions(size),[]);
  const receiveError=useCallback((msg:string)=>setModelError(msg),[]);
  const displayModel=showcaseChair ? {url:"/models/SheenChair.glb",units:"m" as ModelUnits} : model;
  useEffect(()=>{
    if(!policy?.id)return;
    let active=true;
    let objectUrl="";
    readModelAsset(policy.id).then(asset=>{
      if(!active)return;
      if(asset){objectUrl=URL.createObjectURL(asset.file);setModel({url:objectUrl,units:asset.units});}
      else setModel(null);
    }).catch(()=>{if(active)setModel(null);});
    return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[policy?.id]);
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
          NITORIX CREATE / CUSTOMISE
        </span>
        <h1>{showcaseChair ? "Sheen chair" : policy?.name ?? "Contour desk organiser"}</h1>
        <p>{showcaseChair ? "Sculpted softness. Explore a fully textured 3D furniture model." : policy?.description ?? "A little order. A lot of possibility."}</p>
        <nav className="nx-mode-tabs" aria-label="Standalone creation modes">
          {modes.map((m) => {
            const unavailable = customiseOnly && m !== "customise";
            return (
              <button
                className="nx-mode-tab"
                key={m}
                type="button"
                aria-label={m}
                aria-pressed={mode === m}
                disabled={unavailable}
                onClick={() => setMode(m)}
              >
                <span className="nx-mode-name">{m}</span>
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
          {webgl && displayModel ? (
            <ImportedModelViewer
              url={displayModel.url}
              units={displayModel.units}
              finish={finish}
              onDimensions={receiveDimensions}
              onError={receiveError}
            />
          ) : webgl ? (
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
        {displayModel && dimensions && (
          <div className="nx-model-measurement" aria-live="polite">Actual GLB geometry · {dimensions.map(n=>`${n} mm`).join(" × ")} · width × height × depth</div>
        )}
        {modelError && <p className="nx-model-feedback" role="status">{modelError}</p>}
        {comparison !== "none" && !webgl && (
          <p className="nx-scale-fallback" role="status">
            Size references need WebGL. {referenceLabel(comparison, personHeight)}.
          </p>
        )}
        <div className="nx-viewport-controls">
          <label className="embed-background">
            <input
              type="checkbox"
              checked={room.enabled}
              onChange={(e) => room.setEnabled(e.target.checked)}
            />
            Workshop background
          </label>
          {!displayModel && <div className="nx-scale-inline">
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
                Height
                <input
                  type="number"
                  min={140}
                  max={210}
                  step={1}
                  aria-label="Height (cm)"
                  value={personHeight}
                  onChange={(e) => {
                    if (e.target.value) setPersonHeight(personHeightCm(Number(e.target.value)));
                  }}
                />
                cm
              </label>
            )}
            {comparison !== "none" && (
              <span className="nx-scale-caption">{referenceLabel(comparison, personHeight)}</span>
            )}
          </div>}
        </div>
        <EnvironmentSwitcher
          value={room.environment}
          change={room.setEnvironment}
          disabled={!room.enabled}
        />
      </section>
      <section className="embed-controls" aria-label="Desk configuration">
        {displayModel ? (
          <div className="nx-imported-controls">
            <span className="nx-eyebrow">3D PRODUCT STUDIO</span>
            <h2>Every detail, in view.</h2>
            <p>Drag the model to orbit. Scroll to zoom. Inspect its original textures and finishes under soft studio lighting.</p>
            <fieldset className="nx-model-finish-options">
              <legend>Presentation finish</legend>
              {([
                ["original","Original materials"],
                ["chalk","Soft porcelain"],
                ["graphite","Graphite"],
                ["champagne","Champagne metal"],
              ] as const).map(([value,label])=>(
                <button type="button" key={value} aria-pressed={finish===value}
                  onClick={()=>setFinish(value)}>{label}</button>
              ))}
            </fieldset>
            <p className="nx-model-notice">Finishes are visual demonstrations, not manufacturer-approved options. Measurements reflect the GLB model and selected units.</p>
            {dimensions && <div className="nx-model-specs">
              <span>Width <strong>{dimensions[0]} mm</strong></span>
              <span>Height <strong>{dimensions[1]} mm</strong></span>
              <span>Depth <strong>{dimensions[2]} mm</strong></span>
            </div>}
            <div className="nx-model-specs-footer">3D asset viewer · No manufacturing files, pricing or orders generated</div>
          </div>
        ) : <DeskControls engine={engine} mode={mode} />}
        {enableDemoEnquiry && !displayModel && (
          <details className="nx-enquiry-action">
            <summary>Preview the enquiry workflow</summary>
            <span className="nx-eyebrow">TRY THE CONNECTED WORKFLOW</span>
            <h3>From design to enquiry.</h3>
            <p>See how this exact configuration could appear in a manufacturer's CRM.</p>
            <button
              type="button"
              className="nx-button nx-primary"
              onClick={() => {
                const saved = addDemoEnquiry(
                  policy?.id ?? "contour-demo",
                  policy?.name ?? "Contour desk organiser",
                  config,
                  priceDesk(config, policy?.pricing).totalPence,
                );
                setEnquiryStatus(saved
                  ? "Added to Studio preview on this browser. Nothing was sent."
                  : "Could not save this preview; browser storage may be full.");
              }}
            >
              Add to Studio preview
            </button>
            {enquiryStatus && <p role="status">{enquiryStatus}</p>}
            
          </details>
        )}
      </section>
    </main>
  );
}
