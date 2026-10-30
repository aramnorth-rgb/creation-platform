"use client";

export type ReferenceMaterial = {
  id: string;
  name: string;
  productId: string;
  createdAt: number;
  image: string; // manufacturer supplied reference image, not inferred geometry
};
const KEY = "nitorix-v2-material-references-v1";
const EVENT = "nitorix-material-references-change";
const MAX_RECORDS = 24;

export function loadReferences(): ReferenceMaterial[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data)
      ? data.filter((item): item is ReferenceMaterial =>
        Boolean(item && typeof item.id === "string" && typeof item.name === "string" &&
        typeof item.productId === "string" && typeof item.image === "string" &&
        item.image.startsWith("data:image/") && item.image.length < 1_750_000))
        .slice(0, MAX_RECORDS)
      : [];
  } catch { return []; }
}
function persist(items: ReferenceMaterial[]) {
  if (items.length > MAX_RECORDS) throw new Error("The local material library holds up to 24 references.");
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    throw new Error("Could not save this material. Browser storage may be full.");
  }
}
export function saveReference(name: string, productId: string, image: string) {
  if (!name.trim() || name.length > 65) throw new Error("Give the material a short name.");
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 1_750_000)
    throw new Error("Material photograph is too large for local storage.");
  const current = loadReferences();
  persist([{
    id: crypto.randomUUID(), name: name.trim(), productId,
    createdAt: Date.now(), image,
  }, ...current]);
}
export function removeReference(id: string) {
  persist(loadReferences().filter(item => item.id !== id));
}
export const REFERENCE_EVENT = EVENT;

/** Resize BEFORE sending photographs to the external generation provider. */
export async function imageToDataUri(file: File, edge = 1200): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Use a JPEG, PNG or WebP photograph.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Image exceeds 20 MB. Please choose a smaller file.");
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare this photo.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.86);
    if (data.length > 1_750_000)
      throw new Error("This photo is too detailed. Try a smaller or compressed original.");
    return data;
  } finally { bitmap.close(); }
}
