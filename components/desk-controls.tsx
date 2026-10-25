"use client";
import { useState } from "react";
import {
  connections,
  deskGeometry,
  deskProduct,
  formatPrice,
  priceDesk,
  canConnect,
  availableConnections,
  connectionIssue,
  moduleCatalogue,
  type DeskConfiguration,
  type ModuleKind,
  type Slot,
} from "@/lib/configurator/desk";
import { VisualPicker, PickerThumbnail } from "./visual-picker";
import type { DeskEngine } from "./use-desk-engine";
function Measurement({
  label,
  value,
  min,
  max,
  change,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  change: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  return (
    <label className="desk-measure">
      {label} (mm)
      <input
        type="number"
        min={min}
        max={max}
        step="1"
        value={editing ? draft : value}
        onFocus={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim()) change(Number(draft));
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
    </label>
  );
}
export function DeskControls({
  engine,
  mode,
}: {
  engine: DeskEngine;
  mode: "customise" | "assemble" | "engineer";
}) {
  const { config: c, dispatch, kind, slot, chooseKind, chooseSlot } = engine;
  const [message, setMessage] = useState("");
  const policy = engine.policy;
  const kindPermitted = !policy || policy.modules.includes(kind);
  const price = priceDesk(c, policy?.pricing);
  const measure = (
    key: "width" | "depth" | "thickness" | "wall" | "rim" | "radius",
    label: string,
    min: number,
    max: number,
  ) => (
    <Measurement
      key={key}
      label={label}
      value={c[key]}
      min={min}
      max={max}
      change={(value) => dispatch({ type: "set", key, value })}
    />
  );
  return (
    <div className="panel-content desk-controls" data-mode={mode}>
      <div
        className="desk-history"
        role="group"
        aria-label="Configuration history"
      >
        <button
          disabled={!engine.canUndo}
          onClick={() => {
            engine.undo();
            setMessage("Configuration undone.");
          }}
          aria-keyshortcuts="Control+Z Meta+Z"
        >
          ↶ Undo
        </button>
        <button
          disabled={!engine.canRedo}
          onClick={() => {
            engine.redo();
            setMessage("Configuration redone.");
          }}
          aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
        >
          ↷ Redo
        </button>
        <small>Ctrl / ⌘ Z · Shift to redo</small>
      </div>
      <p className="desk-feedback" role="status">
        {engine.historyMessage || message}
      </p>
      <h2>{policy?.name ?? "Contour / desk organiser"}</h2>
      <p className="desk-intro">
        One product. One shared design.{" "}
        {mode === "customise"
          ? "Start with the essentials."
          : mode === "assemble"
            ? "Snap modules onto compatible rail points."
            : "Inspect the geometry behind your design."}
      </p>
      <div className="desk-price">
        <span>DEMONSTRATION PRICE · GBP</span>
        <output aria-live="polite" aria-label="Demonstration total">
          {formatPrice(price.totalPence)}
        </output>
        <details>
          <summary>Price breakdown</summary>
          {price.lines.map((line, i) => (
            <p key={i}>
              {line.label}
              <strong>{formatPrice(line.pence)}</strong>
            </p>
          ))}
        </details>
        <small>
          Illustrative only. No manufacturer quote, tax, delivery or order.
        </small>
      </div>
      {mode === "customise" && (
        <>
          <label>
            Material
            <select
              value={c.material}
              onChange={(e) =>
                dispatch({
                  type: "material",
                  value: e.target.value as DeskConfiguration["material"],
                })
              }
            >
              {Object.entries(deskProduct.materials).map(([id, m]) => (
                <option
                  key={id}
                  value={id}
                  disabled={
                    policy &&
                    !policy.materials.includes(
                      id as DeskConfiguration["material"],
                    )
                  }
                >
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Colour</legend>
            <div className="color-options">
              {Object.entries(deskProduct.colours).map(([name, colour]) => (
                <button
                  key={name}
                  aria-label={`${name} organiser`}
                  disabled={
                    policy &&
                    !policy.colours.includes(
                      name as DeskConfiguration["colour"],
                    )
                  }
                  aria-pressed={c.colour === name}
                  onClick={() =>
                    dispatch({
                      type: "colour",
                      value: name as DeskConfiguration["colour"],
                    })
                  }
                >
                  <i style={{ background: colour }} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Desk footprint</legend>
            <div className="segmented">
              {[
                { label: "Compact", width: 270, depth: 180 },
                { label: "Everyday", width: 360, depth: 240 },
                { label: "Expansive", width: 480, depth: 300 },
              ].map((s) => (
                <button
                  key={s.label}
                  disabled={
                    policy &&
                    (s.width < policy.minWidth ||
                      s.width > policy.maxWidth ||
                      s.depth < policy.minDepth ||
                      s.depth > policy.maxDepth)
                  }
                  aria-pressed={c.width === s.width && c.depth === s.depth}
                  onClick={() => {
                    dispatch({
                      type: "footprint",
                      width: s.width,
                      depth: s.depth,
                    });
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {mode === "assemble" && (
        <>
          <VisualPicker
            label="Module catalogue"
            value={kind}
            change={(id) => {
              chooseKind(id as ModuleKind);
              setMessage(
                `${deskProduct.modules[id as ModuleKind].name} selected. A compatible empty connection is chosen when available.`,
              );
            }}
            options={moduleCatalogue.map((id) => {
              const allowed = !policy || policy.modules.includes(id);
              const available = allowed ? availableConnections(c, id) : [];
              return {
                id,
                name: deskProduct.modules[id].name,
                detail: !allowed
                  ? "Not enabled in this manufacturer demo."
                  : available.length
                    ? `${available.length} compatible points${deskProduct.modules[id].rearOnly ? " · rear only" : ""}`
                    : "Unavailable — no empty compatible connection.",
                disabled: !available.length,
                preview: <PickerThumbnail kind={id} config={c} />,
              };
            })}
          />
          <VisualPicker
            label="Connection points"
            value={slot}
            change={(id) => {
              chooseSlot(id as Slot);
              setMessage(`Selected ${id}.`);
            }}
            options={connections(c).map((p) => ({
              id: p.id,
              name: p.id,
              detail: connectionIssue(c, kind, p.id) ?? "Available · rail-v1",
              disabled: !kindPermitted || !canConnect(c, kind, p.id),
              preview: <PickerThumbnail slot={p.id} config={c} />,
            }))}
          />
          <button
            className="desk-primary"
            disabled={!kindPermitted || !canConnect(c, kind, slot)}
            onClick={() => {
              dispatch({ type: "add", kind, slot });
              setMessage(
                `${deskProduct.modules[kind].name} connected at ${slot}.`,
              );
            }}
          >
            Add module
          </button>
          {(!kindPermitted || !canConnect(c, kind, slot)) && (
            <p className="desk-hint">
              {kindPermitted
                ? connectionIssue(c, kind, slot)
                : "This module is not enabled by the manufacturer demo."}{" "}
              Choose another available connection or remove a module.
            </p>
          )}
          <ul className="desk-modules">
            {c.modules.map((m) => (
              <li key={m.slot}>
                <strong>{deskProduct.modules[m.kind].name}</strong>
                <button
                  aria-label={`Rotate ${deskProduct.modules[m.kind].name} at ${m.slot}`}
                  onClick={() => {
                    dispatch({ type: "rotate", slot: m.slot });
                    setMessage("Module rotated by 90 degrees.");
                  }}
                >
                  Rotate 90° · {m.rotation ?? 0}°
                </button>
                <details>
                  <summary>
                    Reposition {deskProduct.modules[m.kind].name} at {m.slot}
                  </summary>
                  <VisualPicker
                    label={`Position for ${deskProduct.modules[m.kind].name} at ${m.slot}`}
                    value={m.slot}
                    change={(id) => {
                      dispatch({ type: "move", from: m.slot, to: id as Slot });
                      setMessage(`Module moved to ${id}.`);
                    }}
                    options={connections(c).map((p) => ({
                      id: p.id,
                      name: p.id,
                      detail:
                        connectionIssue(c, m.kind, p.id, m.slot) ??
                        "Compatible · rail-v1",
                      disabled: !canConnect(c, m.kind, p.id, m.slot),
                      preview: <PickerThumbnail slot={p.id} config={c} />,
                    }))}
                  />
                </details>
                <button
                  onClick={() => {
                    dispatch({ type: "remove", slot: m.slot });
                    setMessage(`Removed ${deskProduct.modules[m.kind].name}.`);
                  }}
                  aria-label={`Remove ${deskProduct.modules[m.kind].name} at ${m.slot}`}
                >
                  Remove module
                </button>
              </li>
            ))}
          </ul>
          <p>{c.modules.length} / 6 connection points occupied</p>
        </>
      )}
      {mode === "engineer" && (
        <>
          <div className="desk-measurements">
            {measure(
              "width",
              "Width",
              policy?.minWidth ?? 270,
              policy?.maxWidth ?? 480,
            )}
            {measure(
              "depth",
              "Depth",
              policy?.minDepth ?? 180,
              policy?.maxDepth ?? 300,
            )}
            {measure("thickness", "Base thickness", 8, 20)}
            {measure("wall", "Wall thickness", 3, 8)}
            {measure("rim", "Rim height", 18, 55)}
            {measure("radius", "Edge radius", 2, 12)}
          </div>
          <p className="desk-hint">
            Whole millimetres.{" "}
            {policy
              ? "Edits outside approved ranges are rejected."
              : "Values clamp to supported ranges."}{" "}
            Edge rounding is limited by each part’s thickness.
          </p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={c.wireframe}
              onChange={() => dispatch({ type: "toggle", key: "wireframe" })}
            />{" "}
            Show organiser wireframe
          </label>
          <details>
            <summary>Connection specification · rail-v1</summary>
            <p>
              Demo keyed rail, 45 × 12 × 3 mm. One module per point. Phone
              rests: rear only. No strength or tolerance certification.
            </p>
            <ul>
              {connections(c).map((p) => (
                <li key={p.id}>
                  {p.id}: X {p.x.toFixed(1)}, Z {p.z.toFixed(1)} mm ·{" "}
                  {c.modules.find((m) => m.slot === p.id)?.kind ?? "empty"}
                </li>
              ))}
            </ul>
          </details>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(c, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "nitorix-desk-v1.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Export configuration JSON
          </button>
          <p className="engineering-note">
            VISUAL PROTOTYPE · NOT MANUFACTURING CAD
            <br />
            No load, tolerance or process validation.
          </p>
        </>
      )}
      <label className="range-label">
        Preview rotation <output>{c.angle}°</output>
        <input
          aria-label="Organiser preview rotation"
          type="range"
          min="-180"
          max="180"
          value={c.angle}
          onChange={(e) =>
            dispatch({
              type: "set",
              key: "angle",
              value: Number(e.target.value),
            })
          }
        />
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={c.showConnections}
          onChange={() => dispatch({ type: "toggle", key: "showConnections" })}
        />{" "}
        Show connection points
      </label>
      <p className="desk-summary" data-testid="desk-summary">
        {c.width} × {c.depth} × {c.thickness} mm · {c.material} · {c.colour} ·{" "}
        {c.modules.length} modules · {deskGeometry(c).length} parts
      </p>
      <button
        onClick={() => {
          dispatch({ type: "reset" });
          setMessage("Desk design reset.");
        }}
      >
        Reset organiser
      </button>
    </div>
  );
}
export function DeskFallback({
  config: c,
  highlightSlot,
}: {
  config: DeskConfiguration;
  highlightSlot?: Slot;
}) {
  const parts = deskGeometry(c);
  // Same millimetre geometry projected into an isometric SVG; no independent product model.
  return (
    <svg
      viewBox="-330 -180 660 430"
      className="desk-fallback"
      aria-hidden="true"
    >
      <g transform={`rotate(${c.angle / 8})`}>
        {parts.map((part) => {
          const [x, y, z] = part.position;
          const [width, h, depth] = part.size;
          const quarterTurn = Math.abs(Math.sin(part.yaw ?? 0)) > 0.5;
          const w = quarterTurn ? depth : width,
            d = quarterTurn ? width : depth;
          const project = (x: number, y: number, z: number) =>
            `${x * 0.8 - z * 0.65},${x * 0.22 + z * 0.3 - y}`;
          const pts = [
            [x - w / 2, y + h / 2, z - d / 2],
            [x + w / 2, y + h / 2, z - d / 2],
            [x + w / 2, y + h / 2, z + d / 2],
            [x - w / 2, y + h / 2, z + d / 2],
          ]
            .map(([x, y, z]) => project(x, y, z))
            .join(" ");
          return (
            <g
              key={part.id}
              fill={part.accent ? "#525c60" : deskProduct.colours[c.colour]}
              stroke="#667273"
              strokeWidth={c.wireframe ? 1.5 : 0.6}
            >
              <polygon points={pts} fillOpacity={c.wireframe ? 0.1 : 1} />
              <path
                d={`M${project(x - w / 2, y + h / 2, z + d / 2)} L${project(x - w / 2, y - h / 2, z + d / 2)} L${project(x + w / 2, y - h / 2, z + d / 2)} L${project(x + w / 2, y + h / 2, z + d / 2)}`}
                fillOpacity="0.65"
              />
            </g>
          );
        })}
        {(c.showConnections || highlightSlot) &&
          connections(c).map((p) => (
            <circle
              key={p.id}
              cx={p.x * 0.8 - p.z * 0.65}
              cy={p.x * 0.22 + p.z * 0.3 - c.thickness - 5}
              r={p.id === highlightSlot ? 12 : 6}
              fill={p.id === highlightSlot ? "#b12646" : "#16866c"}
            />
          ))}
      </g>
    </svg>
  );
}
