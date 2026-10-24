"use client";
import { useState } from "react";
export const environments = [
  { id: "studio", name: "Modern design studio", floor: "#d9dcd9" },
  { id: "wood", name: "Warm woodworking workshop", floor: "#b4a48b" },
  { id: "industrial", name: "Industrial fabrication space", floor: "#9ea9ad" },
  { id: "future", name: "Futuristic showroom", floor: "#727b85" },
] as const;
export type EnvironmentId = (typeof environments)[number]["id"];
export function useWorkshopEnvironment() {
  const [enabled, setEnabled] = useState(true);
  const [environment, setEnvironment] = useState<EnvironmentId>("studio");
  return { enabled, setEnabled, environment, setEnvironment };
}
export function EnvironmentSwitcher({
  value,
  change,
  disabled = false,
}: {
  value: EnvironmentId;
  change: (id: EnvironmentId) => void;
  disabled?: boolean;
}) {
  const index = environments.findIndex((e) => e.id === value);
  return (
    <fieldset className="environment-switcher" disabled={disabled}>
      <legend>Workshop environment</legend>
      <button
        aria-label="Previous environment"
        onClick={() => change(environments[(index + 3) % 4].id)}
      >
        ‹
      </button>
      <div role="group" aria-label="Environment choices">
        {environments.map((e) => (
          <button
            key={e.id}
            title={e.name}
            aria-label={e.name}
            aria-pressed={value === e.id}
            onClick={() => change(e.id)}
          >
            <span
              className={`environment-swatch env-${e.id}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <button
        aria-label="Next environment"
        onClick={() => change(environments[(index + 1) % 4].id)}
      >
        ›
      </button>
      <output aria-live="polite">
        {disabled
          ? "Neutral studio · background off"
          : environments[index].name}
      </output>
    </fieldset>
  );
}
export function WorkshopBackdrop({
  environment,
}: {
  environment?: EnvironmentId;
}) {
  return environment ? (
    <div className={`workshop-backdrop env-${environment}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  ) : null;
}
