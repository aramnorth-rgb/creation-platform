"use client";
import { useMemo, useSyncExternalStore } from "react";
import { newProduct, validateProduct, type ProductDraft } from "./product";
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
function parse(raw: string): ProductDraft[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (
      Array.isArray(data) &&
      data.length <= 30 &&
      data.every((p) => !validateProduct(p).length)
    )
      return data;
  } catch {}
  return seedProducts();
}
export function useStudioProducts() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => parse(raw), [raw]);
}
export function saveProducts(products: ProductDraft[]) {
  if (products.length > 30 || products.some((p) => validateProduct(p).length))
    return false;
  try {
    localStorage.setItem(key, JSON.stringify(products));
    window.dispatchEvent(new Event(event));
    return true;
  } catch {
    return false;
  }
}
