/** Framework-independent product contract. All lengths are millimetres; money is GBP pence. */
export const deskProduct = {
  id: "desk-organiser",
  version: 1,
  name: "Contour modular desk organiser",
  dimensions: { width: { min: 270, max: 480 }, depth: { min: 180, max: 300 } },
  materials: {
    polymer: {
      label: "Recycled polymer",
      rate: 0.018,
      metalness: 0.05,
      roughness: 0.48,
    },
    aluminium: {
      label: "Brushed aluminium",
      rate: 0.038,
      metalness: 0.8,
      roughness: 0.32,
    },
    oak: {
      label: "Warm oak composite",
      rate: 0.027,
      metalness: 0,
      roughness: 0.7,
    },
  },
  colours: {
    ivory: "#e4dfd2",
    forest: "#425d50",
    charcoal: "#343a40",
    coral: "#b96c57",
  },
  modules: {
    cup: { name: "Pen cup", price: 850, rearOnly: false },
    tray: { name: "Small-parts tray", price: 650, rearOnly: false },
    phone: { name: "Phone rest", price: 1100, rearOnly: true },
  },
} as const;
export type ModuleKind = keyof typeof deskProduct.modules;
export type Slot =
  | "front-left"
  | "front-centre"
  | "front-right"
  | "rear-left"
  | "rear-centre"
  | "rear-right";
export type DeskConfiguration = {
  productId: "desk-organiser";
  schemaVersion: 1;
  width: number;
  depth: number;
  thickness: number;
  wall: number;
  rim: number;
  radius: number;
  material: keyof typeof deskProduct.materials;
  colour: keyof typeof deskProduct.colours;
  modules: { kind: ModuleKind; slot: Slot }[];
  wireframe: boolean;
  showConnections: boolean;
  angle: number;
};
export const initialDesk: DeskConfiguration = {
  productId: "desk-organiser",
  schemaVersion: 1,
  width: 360,
  depth: 240,
  thickness: 10,
  wall: 4,
  rim: 28,
  radius: 6,
  material: "polymer",
  colour: "ivory",
  modules: [
    { kind: "cup", slot: "rear-left" },
    { kind: "tray", slot: "front-right" },
  ],
  wireframe: false,
  showConnections: false,
  angle: -25,
};
export const slots: Slot[] = [
  "front-left",
  "front-centre",
  "front-right",
  "rear-left",
  "rear-centre",
  "rear-right",
];
export function connections(c: DeskConfiguration) {
  return slots.map((id, i) => ({
    id,
    standard: "NITORIX demo rail-v1",
    x: (((i % 3) - 1) * c.width) / 3,
    z: ((i < 3 ? 1 : -1) * c.depth) / 4,
  }));
}
export const moduleCatalogue = Object.keys(deskProduct.modules) as ModuleKind[];
export function connectionIssue(
  c: DeskConfiguration,
  kind: ModuleKind,
  slot: Slot,
  except?: Slot,
): string | null {
  if (!Object.hasOwn(deskProduct.modules, kind))
    return "Module unavailable in this catalogue.";
  if (!slots.includes(slot)) return "Connection point unavailable.";
  if (deskProduct.modules[kind].rearOnly && !slot.startsWith("rear-"))
    return "Rear connections only.";
  if (c.modules.some((m) => m.slot === slot && m.slot !== except))
    return "Occupied — move or remove the installed module.";
  return null;
}
export function availableConnections(c: DeskConfiguration, kind: ModuleKind) {
  return connections(c).filter((p) => !connectionIssue(c, kind, p.id));
}
export function canConnect(
  c: DeskConfiguration,
  kind: ModuleKind,
  slot: Slot,
  except?: Slot,
) {
  return connectionIssue(c, kind, slot, except) === null;
}
export type DeskAction =
  | { type: "footprint"; width: number; depth: number }
  | {
      type: "set";
      key:
        | "width"
        | "depth"
        | "thickness"
        | "wall"
        | "rim"
        | "radius"
        | "angle";
      value: number;
    }
  | { type: "material"; value: DeskConfiguration["material"] }
  | { type: "colour"; value: DeskConfiguration["colour"] }
  | { type: "toggle"; key: "wireframe" | "showConnections" }
  | { type: "add"; kind: ModuleKind; slot: Slot }
  | { type: "remove"; slot: Slot }
  | { type: "move"; from: Slot; to: Slot }
  | { type: "reset" };
const limits = {
  width: [270, 480],
  depth: [180, 300],
  thickness: [8, 20],
  wall: [3, 8],
  rim: [18, 55],
  radius: [2, 12],
  angle: [-180, 180],
} as const;
export function deskReducer(
  c: DeskConfiguration,
  a: DeskAction,
): DeskConfiguration {
  switch (a.type) {
    case "footprint":
      return deskReducer(
        deskReducer(c, { type: "set", key: "width", value: a.width }),
        { type: "set", key: "depth", value: a.depth },
      );
    case "set": {
      if (!Number.isFinite(a.value)) return c;
      const [min, max] = limits[a.key];
      return {
        ...c,
        [a.key]: Math.min(max, Math.max(min, Math.round(a.value))),
      };
    }
    case "material":
      return a.value in deskProduct.materials ? { ...c, material: a.value } : c;
    case "colour":
      return a.value in deskProduct.colours ? { ...c, colour: a.value } : c;
    case "toggle":
      return { ...c, [a.key]: !c[a.key] };
    case "add":
      return canConnect(c, a.kind, a.slot)
        ? { ...c, modules: [...c.modules, { kind: a.kind, slot: a.slot }] }
        : c;
    case "remove":
      return { ...c, modules: c.modules.filter((m) => m.slot !== a.slot) };
    case "move": {
      const m = c.modules.find((m) => m.slot === a.from);
      return m && canConnect(c, m.kind, a.to, a.from)
        ? {
            ...c,
            modules: c.modules.map((m) =>
              m.slot === a.from ? { ...m, slot: a.to } : m,
            ),
          }
        : c;
    }
    case "reset":
      return {
        ...initialDesk,
        modules: initialDesk.modules.map((m) => ({ ...m })),
      };
  }
}
export function priceDesk(c: DeskConfiguration) {
  const volume =
    (c.width * c.depth * c.thickness +
      2 * (c.width + c.depth) * c.wall * c.rim) /
    1000;
  const lines = [
    { label: "Base fabrication", pence: 1800 },
    {
      label: `${deskProduct.materials[c.material].label} · base geometry`,
      pence: Math.round(volume * deskProduct.materials[c.material].rate * 100),
    },
    ...c.modules.map((m) => ({
      label: `${deskProduct.modules[m.kind].name} · ${m.slot}`,
      pence: Math.round(
        deskProduct.modules[m.kind].price *
          (c.material === "aluminium" ? 1.3 : c.material === "oak" ? 1.15 : 1),
      ),
    })),
  ];
  return {
    currency: "GBP" as const,
    demonstration: true,
    lines,
    totalPence: lines.reduce((n, l) => n + l.pence, 0),
  };
}
export const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;
export type DeskPart = {
  id: string;
  size: [number, number, number];
  position: [number, number, number];
  accent?: boolean;
  rotation?: [number, number, number];
};
/** One parametric geometry description consumed by both WebGL and SVG renderers. */
export function deskGeometry(c: DeskConfiguration): DeskPart[] {
  const parts: DeskPart[] = [];
  const box = (
    id: string,
    size: DeskPart["size"],
    position: DeskPart["position"],
    accent = false,
    rotation?: DeskPart["rotation"],
  ) => parts.push({ id, size, position, accent, rotation });
  box("base", [c.width, c.thickness, c.depth], [0, c.thickness / 2, 0]);
  const walls = (
    id: string,
    w: number,
    d: number,
    h: number,
    t: number,
    x: number,
    y: number,
    z: number,
  ) => {
    box(`${id}-front`, [w, h, t], [x, y + h / 2, z + (d - t) / 2]);
    box(`${id}-back`, [w, h, t], [x, y + h / 2, z - (d - t) / 2]);
    box(`${id}-left`, [t, h, d - t * 2], [x - (w - t) / 2, y + h / 2, z]);
    box(`${id}-right`, [t, h, d - t * 2], [x + (w - t) / 2, y + h / 2, z]);
  };
  walls("rim", c.width, c.depth, c.rim, c.wall, 0, c.thickness, 0);
  for (const p of connections(c))
    box(`${p.id}-rail`, [45, 3, 12], [p.x, c.thickness + 1.5, p.z], true);
  for (const m of c.modules) {
    const p = connections(c).find((p) => p.id === m.slot)!;
    const y = c.thickness + 3;
    box(`${m.slot}-floor`, [72, 4, 68], [p.x, y + 2, p.z]);
    if (m.kind === "cup" || m.kind === "tray")
      walls(
        m.slot,
        72,
        68,
        m.kind === "cup" ? 85 : 23,
        c.wall,
        p.x,
        y + 4,
        p.z,
      );
    else {
      box(
        `${m.slot}-rest`,
        [66, 78, 5],
        [p.x, y + 42, p.z - 16],
        false,
        [-0.22, 0, 0],
      );
      box(`${m.slot}-lip`, [66, 10, 5], [p.x, y + 9, p.z + 20], true);
    }
  }
  for (const x of [-1, 1])
    for (const z of [-1, 1])
      box(
        `foot-${x}-${z}`,
        [22, 3, 22],
        [x * (c.width / 2 - 22), -1.5, z * (c.depth / 2 - 22)],
        true,
      );
  return parts;
}
export function deskDescription(c: DeskConfiguration) {
  return `Desk organiser preview: ${c.width} × ${c.depth} mm, ${deskProduct.materials[c.material].label}, ${c.colour}, ${c.modules.length} modules, rim ${c.rim} mm, wall ${c.wall} mm, wireframe ${c.wireframe ? "on" : "off"}`;
}
