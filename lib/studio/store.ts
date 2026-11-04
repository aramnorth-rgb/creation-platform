"use client";
import { useMemo, useSyncExternalStore } from "react";
import { newProduct, validateProduct, type ProductDraft } from "./product";
import { blankCapabilityEvidence, demoCapabilityEvidence, allowedCreationModes } from "./capabilities";
const key = "nitorix-v2-studio-drafts-v1";
const event = "nitorix-studio-change";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(event, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(event, listener);
  };
}
const snapshot = () => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};
const serverSnapshot = () => "";
export function seedProducts(): ProductDraft[] {
  const second = newProduct("linea-demo");
  second.name = "Linea desk collection";
  second.materials = ["oak"];
  second.colours = ["charcoal", "ivory"];
  second.modes = ["customise", "assemble"];
  return [newProduct(), second];
}
/** Preserve old draft content, but do not grandfather unknown supplier evidence into engineering access. */
function upgradeLegacyProduct(product: ProductDraft): ProductDraft {
  if (product.capabilityEvidence) return product;
  const isBuiltInDemo = product.id === "contour-demo" || product.id === "linea-demo";
  const capabilityEvidence = isBuiltInDemo ? demoCapabilityEvidence() : blankCapabilityEvidence();
  const modes = isBuiltInDemo ? product.modes : product.modes.filter(mode => mode === "customise");
  return { ...product, capabilityEvidence, modes: modes.length ? modes : ["customise"] };
}
function parse(raw: string): ProductDraft[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (Array.isArray(data) && data.length <= 30) {
      const upgraded = data.map(p => upgradeLegacyProduct(p as ProductDraft));
      if (upgraded.every(p => !validateProduct(p).length)) return upgraded;
    }
  } catch {}
  return seedProducts();
}
export function useStudioProducts() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => parse(raw), [raw]);
}
export function saveProducts(products: ProductDraft[]) {
  if (products.length > 30 || products.some((p) => validateProduct(p).length || (p.capabilityEvidence && p.modes.some(m => m !== "customise" && !allowedCreationModes(p).includes(m)))))
    return false;
  try {
    localStorage.setItem(key, JSON.stringify(products));
    window.dispatchEvent(new Event(event));
    return true;
  } catch {
    return false;
  }
}
