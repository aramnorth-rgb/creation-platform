import type { CreationMode } from "./product";

/**
 * A checked box is a MANUFACTURER ASSERTION in this local prototype,
 * not an independently audited or engineering-validated certification.
 * AI-inferred or invisible geometry must NEVER set these flags automatically.
 */
export const capabilityGroups = [
  {
    mode: "customise",
    name: "Customise",
    introduction: "Personalise a complete product using confirmed visual and commercial information.",
    requirements: [
      { key: "visualReference", label: "Product appearance", detail: "Photographs, scan or 3D asset reviewed against the actual product." },
      { key: "measuredDimensions", label: "Measured outer dimensions", detail: "Width, height and depth confirmed by the manufacturer, not guessed from an image." },
      { key: "approvedOptions", label: "Available finishes and options", detail: "Only variations this manufacturer can really supply." },
      { key: "approvedPricing", label: "Prices for available choices", detail: "Manufacturer-reviewed prices or a valid pricing rule for each option." },
    ],
  },
  {
    mode: "assemble",
    name: "Assemble",
    introduction: "Add, swap or reposition separately documented, compatible components.",
    requirements: [
      { key: "componentGeometry", label: "Individual component geometry", detail: "Models or measurements of the actual detachable modules." },
      { key: "attachmentPoints", label: "Measured attachment points", detail: "Connections and their location, size and orientation." },
      { key: "compatibilityRules", label: "Compatibility rules", detail: "Confirmed combinations and assembly restrictions." },
      { key: "componentPricing", label: "Component pricing", detail: "Manufacturer-approved prices for the parts customers can select." },
    ],
  },
  {
    mode: "engineer",
    name: "Engineer",
    introduction: "Make advanced changes only inside explicit engineering and production constraints.",
    requirements: [
      { key: "parametricGeometry", label: "Engineering geometry", detail: "Editable, dimensionally controlled geometry or supported parametric CAD." },
      { key: "tolerances", label: "Critical tolerances", detail: "Fit tolerances, clearances and verified interface limits." },
      { key: "materialSpecifications", label: "Material and load specifications", detail: "Relevant material grades and verified performance limits." },
      { key: "productionConstraints", label: "Manufacturing boundaries", detail: "Production methods, safety rules and limits on customer modifications." },
    ],
  },
] as const;

export type EvidenceKey = (typeof capabilityGroups)[number]["requirements"][number]["key"];
export type CapabilityEvidence = Record<EvidenceKey, boolean>;
export type CapabilityModeStatus = {
  mode: CreationMode;
  name: string;
  missing: EvidenceKey[];
  complete: boolean;
  requested: boolean;
  enabled: boolean;
};
export type CapabilityPolicy = {
  modes: CreationMode[];
  capabilityEvidence?: CapabilityEvidence;
};

export const capabilityEvidenceKeys: readonly EvidenceKey[] = capabilityGroups.flatMap(
  (group) => group.requirements.map((requirement) => requirement.key),
);

export function blankCapabilityEvidence(): CapabilityEvidence {
  return Object.fromEntries(capabilityEvidenceKeys.map((key) => [key, false])) as CapabilityEvidence;
}

/** Built-in Contour demo is a supported procedural sample, NOT a real certified manufacturer product. */
export function demoCapabilityEvidence(): CapabilityEvidence {
  return Object.fromEntries(capabilityEvidenceKeys.map((key) => [key, true])) as CapabilityEvidence;
}

export function capabilityRequirements(mode: CreationMode): EvidenceKey[] {
  const index = capabilityGroups.findIndex((group) => group.mode === mode);
  if (index < 0) return [];
  return capabilityGroups.slice(0, index + 1).flatMap((group) =>
    group.requirements.map((requirement) => requirement.key),
  );
}

export function assessCapabilities(product: CapabilityPolicy): CapabilityModeStatus[] {
  const evidence = product.capabilityEvidence ?? blankCapabilityEvidence();
  return capabilityGroups.map((group) => {
    const missing = capabilityRequirements(group.mode).filter((key) => evidence[key] !== true);
    const requested = product.modes.includes(group.mode);
    return {
      mode: group.mode,
      name: group.name,
      missing,
      complete: missing.length === 0,
      requested,
      enabled: requested && missing.length === 0,
    };
  });
}

export function allowedCreationModes(product: CapabilityPolicy): CreationMode[] {
  return assessCapabilities(product).filter((mode) => mode.enabled).map((mode) => mode.mode);
}

export function validCapabilityEvidence(value: unknown): boolean {
  if (value === undefined) return true; // legacy drafts remain readable, but unlock nothing
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const evidence = value as Record<string, unknown>;
  return Object.keys(evidence).every((key) => capabilityEvidenceKeys.includes(key as EvidenceKey)) &&
    capabilityEvidenceKeys.every((key) => typeof evidence[key] === "boolean");
}

/** Revoking an attestation closes any mode that depends on it, never silently widening access. */
export function modesAfterEvidenceChange(
  modes: CreationMode[],
  evidence: CapabilityEvidence,
): CreationMode[] {
  const available = assessCapabilities({ modes, capabilityEvidence: evidence });
  // Keep Customise as the pending intention so incomplete products can still be saved as drafts.
  return modes.filter((mode) =>
    mode === "customise" || available.some((status) => status.mode === mode && status.enabled),
  );
}
