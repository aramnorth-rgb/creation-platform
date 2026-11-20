/** Sizes are millimetres. DeskModel renders mm / 100 at world scale 1.65. */
export const MM_TO_WORLD = 1.65 / 100;
export type ScaleReferenceKind = "none" | "person" | "hand" | "ruler" | "banana";

export const scaleChoices: { value: ScaleReferenceKind; label: string }[] = [
  { value: "none", label: "Nothing" },
  { value: "person", label: "Person (adjustable height)" },
  { value: "hand", label: "Hand" },
  { value: "ruler", label: "1-metre ruler" },
  { value: "banana", label: "Banana" },
];

export const DEFAULT_PERSON_HEIGHT_CM = 175;
export const MIN_PERSON_HEIGHT_CM = 140;
export const MAX_PERSON_HEIGHT_CM = 210;

/** Input validation keeps the reference model at sensible, finite dimensions. */
export function personHeightCm(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_PERSON_HEIGHT_CM;
  return Math.min(MAX_PERSON_HEIGHT_CM, Math.max(MIN_PERSON_HEIGHT_CM, Math.round(value)));
}

/** Nominal comparison lengths, not manufacturer's certified measurements. */
export function referenceLengthMm(kind: ScaleReferenceKind, heightCm: number) {
  switch (kind) {
    case "person":
      return personHeightCm(heightCm) * 10;
    case "hand":
    case "banana":
      return 180;
    case "ruler":
      return 1000;
    default:
      return 0;
  }
}

/** Model and reference objects must share this conversion. */
export function referenceLengthWorld(kind: ScaleReferenceKind, heightCm: number) {
  return referenceLengthMm(kind, heightCm) * MM_TO_WORLD;
}

export function referenceLabel(kind: ScaleReferenceKind, heightCm: number) {
  switch (kind) {
    case "person": return `${personHeightCm(heightCm)} cm tall person · stylised mannequin`;
    case "hand": return "Illustrative 18 cm adult hand";
    case "ruler": return "1 metre · 100 cm";
    case "banana": return "Illustrative 18 cm banana";
    default: return "No size comparison";
  }
}
