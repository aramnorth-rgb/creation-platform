import {
  deskProduct,
  initialDesk,
  type DeskConfiguration,
  type DeskAction,
  deskReducer,
  type DeskPricing,
  defaultDeskPricing,
} from "../configurator/desk";
import { assessCapabilities, blankCapabilityEvidence, demoCapabilityEvidence, validCapabilityEvidence, type CapabilityEvidence } from "./capabilities";
export type CreationMode = "customise" | "assemble" | "engineer";
export type ProductDraft = {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  modes: CreationMode[];
  capabilityEvidence?: CapabilityEvidence;
  materials: DeskConfiguration["material"][];
  colours: DeskConfiguration["colour"][];
  modules: (keyof typeof deskProduct.modules)[];
  minWidth: number;
  maxWidth: number;
  minDepth: number;
  maxDepth: number;
  pricing: DeskPricing;
  channels: { marketplace: boolean; website: boolean };
};
export function newProduct(id = "contour-demo"): ProductDraft {
  return {
    schemaVersion: 1,
    id,
    name: "Contour desk organiser",
    description: "A considered home for the things you reach for every day.",
    modes: id === "contour-demo" || id === "linea-demo" ? ["customise", "assemble", "engineer"] : ["customise"],
    capabilityEvidence: id === "contour-demo" || id === "linea-demo" ? demoCapabilityEvidence() : blankCapabilityEvidence(),
    materials: ["polymer", "aluminium", "oak"],
    colours: ["ivory", "forest", "charcoal", "coral"],
    modules: ["cup", "tray", "phone"],
    minWidth: 270,
    maxWidth: 480,
    minDepth: 180,
    maxDepth: 300,
    pricing: structuredClone(defaultDeskPricing),
    channels: { marketplace: true, website: true },
  };
}
export const creationModes: CreationMode[] = [
  "customise",
  "assemble",
  "engineer",
];
export function validateProduct(value: unknown): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return ["Invalid product data."];
  const p = value as ProductDraft;
  if (
    p.schemaVersion !== 1 ||
    typeof p.id !== "string" ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(p.id)
  )
    errors.push("Unsupported product identity or version.");
  if (
    typeof p.name !== "string" ||
    p.name.trim().length < 3 ||
    p.name.length > 100
  )
    errors.push("Product name must be 3–100 characters.");
  if (typeof p.description !== "string" || p.description.length > 1000)
    errors.push("Description must be at most 1,000 characters.");
  const choices = (v: unknown, allowed: string[], required: boolean) =>
    Array.isArray(v) &&
    (!required || v.length > 0) &&
    new Set(v).size === v.length &&
    v.every((k) => typeof k === "string" && allowed.includes(k));
  if (!choices(p.modes, creationModes, true))
    errors.push("Enable at least one supported creation mode.");
  if (!validCapabilityEvidence(p.capabilityEvidence)) errors.push("Product capability information is invalid.");
  else if (p.capabilityEvidence && assessCapabilities(p).some((mode) => mode.mode !== "customise" && mode.requested && !mode.complete))
    errors.push("An enabled creation mode is missing its required manufacturer-confirmed information.");
  if (!choices(p.materials, Object.keys(deskProduct.materials), true))
    errors.push("Enable at least one supported material.");
  if (!choices(p.colours, Object.keys(deskProduct.colours), true))
    errors.push("Enable at least one supported colour.");
  if (!choices(p.modules, Object.keys(deskProduct.modules), false))
    errors.push("Module catalogue contains unsupported or repeated modules.");
  if (
    ![p.minWidth, p.maxWidth, p.minDepth, p.maxDepth].every(Number.isInteger) ||
    p.minWidth < 270 ||
    p.maxWidth > 480 ||
    p.minWidth > p.maxWidth ||
    p.minDepth < 180 ||
    p.maxDepth > 300 ||
    p.minDepth > p.maxDepth
  )
    errors.push(
      "Approved dimensions must be within 270–480 mm width and 180–300 mm depth, with minimum no greater than maximum.",
    );
  const prices = p.pricing;
  if (
    !prices ||
    !Number.isInteger(prices.basePence) ||
    prices.basePence < 0 ||
    prices.basePence > 100000 ||
    !Object.keys(deskProduct.materials).every(
      (k) =>
        Number.isFinite(
          prices.materialRates?.[k as keyof typeof prices.materialRates],
        ) &&
        prices.materialRates[k as keyof typeof prices.materialRates] >= 0 &&
        prices.materialRates[k as keyof typeof prices.materialRates] <= 1,
    ) ||
    !Object.keys(deskProduct.modules).every(
      (k) =>
        Number.isInteger(
          prices.modulePrices?.[k as keyof typeof prices.modulePrices],
        ) &&
        prices.modulePrices[k as keyof typeof prices.modulePrices] >= 0 &&
        prices.modulePrices[k as keyof typeof prices.modulePrices] <= 100000,
    )
  )
    errors.push(
      "Enter valid demonstration prices (0–100,000 pence) and material rates (0–1 GBP per cm³).",
    );
  if (
    !p.channels ||
    typeof p.channels.marketplace !== "boolean" ||
    typeof p.channels.website !== "boolean"
  )
    errors.push("Choose valid publishing preferences.");
  return errors;
}
export function approvedInitial(policy: ProductDraft): DeskConfiguration {
  return {
    ...structuredClone(initialDesk),
    material: policy.materials.includes(initialDesk.material)
      ? initialDesk.material
      : policy.materials[0],
    colour: policy.colours.includes(initialDesk.colour)
      ? initialDesk.colour
      : policy.colours[0],
    width: Math.max(
      policy.minWidth,
      Math.min(policy.maxWidth, initialDesk.width),
    ),
    depth: Math.max(
      policy.minDepth,
      Math.min(policy.maxDepth, initialDesk.depth),
    ),
    modules: initialDesk.modules.filter((m) => policy.modules.includes(m.kind)),
  };
}
export function permittedConfiguration(
  c: DeskConfiguration,
  policy: ProductDraft,
) {
  return (
    policy.materials.includes(c.material) &&
    policy.colours.includes(c.colour) &&
    c.modules.every((m) => policy.modules.includes(m.kind)) &&
    c.width >= policy.minWidth &&
    c.width <= policy.maxWidth &&
    c.depth >= policy.minDepth &&
    c.depth <= policy.maxDepth
  );
}
export function permittedAction(
  c: DeskConfiguration,
  action: DeskAction,
  policy: ProductDraft,
) {
  return permittedConfiguration(deskReducer(c, action), policy);
}
