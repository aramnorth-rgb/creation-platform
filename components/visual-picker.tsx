"use client";
import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import {
  connections,
  deskGeometry,
  initialDesk,
  type DeskConfiguration,
  type ModuleKind,
  type Slot,
} from "@/lib/configurator/desk";
const projectedModules = Object.fromEntries(
  (["cup", "tray", "phone"] as ModuleKind[]).map((kind) => [
    kind,
    deskGeometry({
      ...initialDesk,
      modules: [{ kind, slot: "front-centre" }],
    }).filter((p) => p.id.startsWith("front-centre") && !p.id.endsWith("rail")),
  ]),
);
const point = (x: number, y: number, z: number) =>
  `${x * 0.7 - z * 0.55},${x * 0.22 + z * 0.3 - y}`;
export const PickerThumbnail = memo(function PickerThumbnail({
  kind,
  slot,
  config,
}: {
  kind?: ModuleKind;
  slot?: Slot;
  config: DeskConfiguration;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    let visible = false;
    const update = () => setPlaying(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <span
      ref={ref}
      className="picker-thumbnail"
      data-playing={playing}
      aria-hidden="true"
    >
      {kind ? (
        <svg viewBox="-80 -125 160 175" className="picker-spin">
          {projectedModules[kind].map((p) => {
            const [x, y, z] = p.position,
              [w, h, d] = p.size;
            const corner = (a: number, b: number, c: number) =>
              point(x + (a * w) / 2, y + (b * h) / 2, z - 60 + (c * d) / 2);
            return (
              <g key={p.id} stroke="#38564e" strokeWidth="1.2">
                <polygon
                  fill="#c9d8ce"
                  points={[
                    corner(-1, 1, -1),
                    corner(1, 1, -1),
                    corner(1, 1, 1),
                    corner(-1, 1, 1),
                  ].join(" ")}
                />
                <polygon
                  fill="#7d9e91"
                  points={[
                    corner(-1, 1, 1),
                    corner(1, 1, 1),
                    corner(1, -1, 1),
                    corner(-1, -1, 1),
                  ].join(" ")}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <svg viewBox="-260 -180 520 360" className="picker-spin">
          <rect
            x={-config.width / 2}
            y={-config.depth / 2}
            width={config.width}
            height={config.depth}
            rx="14"
            fill="#dce4df"
            stroke="#61776e"
            strokeWidth="5"
          />
          <text
            x="0"
            y={config.depth / 2 + 33}
            textAnchor="middle"
            fontSize="25"
            fill="#4a6158"
          >
            FRONT
          </text>
          {connections(config).map((p) => (
            <g key={p.id}>
              <rect
                x={p.x - 20}
                y={p.z - 7}
                width="40"
                height="14"
                rx="3"
                fill={
                  p.id === slot
                    ? "#b12646"
                    : config.modules.some((m) => m.slot === p.id)
                      ? "#aa8555"
                      : "#7e9e91"
                }
              />
              {p.id === slot && (
                <circle
                  cx={p.x}
                  cy={p.z}
                  r="28"
                  fill="none"
                  stroke="#b12646"
                  strokeWidth="5"
                />
              )}
            </g>
          ))}
        </svg>
      )}
    </span>
  );
});
export type PickerOption = {
  id: string;
  name: string;
  detail: string;
  disabled?: boolean;
  preview: ReactNode;
};
export function VisualPicker({
  label,
  value,
  options,
  change,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  change: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const selected =
    options.find((o) => o.id === value && !o.disabled) ??
    options.find((o) => !o.disabled);
  return (
    <div className="visual-picker">
      <h3>{label}</h3>
      <div
        ref={root}
        role="radiogroup"
        aria-label={label}
        className="visual-picker-list"
        onKeyDown={(e) => {
          if (
            ![
              "ArrowDown",
              "ArrowUp",
              "ArrowLeft",
              "ArrowRight",
              "Home",
              "End",
            ].includes(e.key)
          )
            return;
          e.preventDefault();
          const enabled = options.filter((o) => !o.disabled);
          if (!enabled.length) return;
          const index = enabled.findIndex((o) => o.id === value);
          const next =
            e.key === "Home"
              ? enabled[0]
              : e.key === "End"
                ? enabled.at(-1)!
                : enabled[
                    (index +
                      (e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1) +
                      enabled.length) %
                      enabled.length
                  ];
          change(next.id);
          const button = Array.from(
            root.current!.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
          ).find((b) => b.dataset.value === next.id);
          button?.focus();
          button?.scrollIntoView({ block: "nearest", behavior: "instant" });
        }}
      >
        {options.map((o) => (
          <button
            type="button"
            role="radio"
            key={o.id}
            data-value={o.id}
            aria-label={`${o.name}. ${o.detail}`}
            aria-checked={o.id === value}
            aria-disabled={!!o.disabled}
            tabIndex={o.id === selected?.id ? 0 : -1}
            onClick={() => {
              if (!o.disabled) change(o.id);
            }}
          >
            {o.preview}
            <span>
              <strong>{o.name}</strong>
              <small>{o.detail}</small>
            </span>
            <i aria-hidden="true">
              {o.disabled ? "—" : o.id === value ? "●" : "○"}
            </i>
          </button>
        ))}
      </div>
    </div>
  );
}
