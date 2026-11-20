"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DeskConfiguration } from "@/lib/configurator/desk";

export type DemoLeadStage = "new" | "qualified" | "quoted" | "closed";
export const demoLeadStages: { value: DemoLeadStage; label: string }[] = [
  { value: "new", label: "New enquiry" },
  { value: "qualified", label: "Qualified" },
  { value: "quoted", label: "Quote prepared" },
  { value: "closed", label: "Closed" },
];

/** One browser's demo only; this is NOT secure CRM, a quote or a submitted message. */
export type DemoEnquiry = {
  schemaVersion: 1;
  id: string;
  productId: string;
  productName: string;
  createdAt: string;
  stage: DemoLeadStage;
  pricePence: number;
  configuration: DeskConfiguration;
};

const STORAGE_KEY = "nitorix-v2-local-enquiries-v1";
const CHANGE = "nitorix-v2-local-enquiries-change";
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE, listener);
  };
};
const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
const serverSnapshot = () => "";

function validLead(v: unknown): v is DemoEnquiry {
  if (!v || typeof v !== "object") return false;
  const p = v as Partial<DemoEnquiry>;
  const c = p.configuration as Partial<DeskConfiguration> | undefined;
  return (
    p.schemaVersion === 1 &&
    typeof p.id === "string" &&
    /^[a-zA-Z0-9-]{1,80}$/.test(p.id) &&
    typeof p.productId === "string" &&
    /^[a-zA-Z0-9-]{1,80}$/.test(p.productId) &&
    typeof p.productName === "string" &&
    p.productName.length <= 100 &&
    typeof p.createdAt === "string" &&
    !Number.isNaN(Date.parse(p.createdAt)) &&
    demoLeadStages.some((s) => s.value === p.stage) &&
    Number.isInteger(p.pricePence) && p.pricePence! >= 0 &&
    !!c && c.productId === "desk-organiser" && c.schemaVersion === 1 &&
    Number.isFinite(c.width) && Number.isFinite(c.depth) &&
    typeof c.material === "string" && typeof c.colour === "string" &&
    Array.isArray(c.modules)
  );
}
const read = (raw: string): DemoEnquiry[] => {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) && data.length <= 100 && data.every(validLead)
      ? data : [];
  } catch {
    return [];
  }
};

export function useDemoEnquiries() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  return useMemo(() => read(raw), [raw]);
}

function write(enquiries: DemoEnquiry[]) {
  if (enquiries.length > 100 || enquiries.some((e) => !validLead(e))) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    window.dispatchEvent(new Event(CHANGE));
    return true;
  } catch {
    return false;
  }
}

export function addDemoEnquiry(
  productId: string,
  productName: string,
  configuration: DeskConfiguration,
  pricePence: number,
) {
  const existing = read(getSnapshot());
  if (existing.length >= 100) return false;
  const entry: DemoEnquiry = {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    productId,
    productName: productName.slice(0, 100),
    createdAt: new Date().toISOString(),
    stage: "new",
    pricePence,
    configuration: structuredClone(configuration),
  };
  return write([entry, ...existing]);
}

export function moveDemoEnquiry(id: string, stage: DemoLeadStage) {
  if (!demoLeadStages.some((x) => x.value === stage)) return false;
  const existing = read(getSnapshot());
  if (!existing.some((e) => e.id === id)) return false;
  return write(existing.map((e) => e.id === id ? { ...e, stage } : e));
}

export function deleteDemoEnquiry(id: string) {
  const existing = read(getSnapshot());
  return write(existing.filter((e) => e.id !== id));
}
