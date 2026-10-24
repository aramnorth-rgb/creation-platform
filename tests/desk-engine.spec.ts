import { expect, test } from "@playwright/test";
import {
  initialDesk,
  deskReducer,
  connections,
  deskGeometry,
  priceDesk,
} from "../lib/configurator/desk";

test("shared product rules clamp geometry, reject invalid connections and keep configurations immutable", () => {
  const base = structuredClone(initialDesk);
  let c = deskReducer(base, { type: "set", key: "width", value: 420 });
  expect(base).toEqual(initialDesk);
  expect(deskGeometry(c).find((p) => p.id === "base")?.size[0]).toBe(420);
  expect(connections(c)[0].x).toBe(-140);
  expect(priceDesk(c).totalPence).toBeGreaterThan(priceDesk(base).totalPence);
  expect(deskReducer(c, { type: "set", key: "depth", value: NaN })).toBe(c);
  expect(deskReducer(c, { type: "set", key: "wall", value: -10 }).wall).toBe(3);
  expect(deskReducer(c, { type: "set", key: "width", value: 9999 }).width).toBe(
    480,
  );
  expect(
    deskReducer(c, { type: "add", kind: "phone", slot: "front-left" }),
  ).toBe(c);
  expect(deskReducer(c, { type: "add", kind: "tray", slot: "rear-left" })).toBe(
    c,
  );
  c = deskReducer(c, { type: "add", kind: "phone", slot: "rear-centre" });
  expect(c.modules).toHaveLength(3);
  expect(
    deskReducer(c, { type: "move", from: "rear-centre", to: "front-centre" }),
  ).toBe(c);
  c = deskReducer(c, { type: "move", from: "rear-centre", to: "rear-right" });
  expect(c.modules.find((m) => m.kind === "phone")?.slot).toBe("rear-right");
  const beforeRemoval = priceDesk(c).totalPence;
  c = deskReducer(c, { type: "remove", slot: "rear-right" });
  expect(priceDesk(c).totalPence).toBe(beforeRemoval - 1100);
  const quote = priceDesk(c);
  expect(quote.totalPence).toBe(quote.lines.reduce((n, l) => n + l.pence, 0));
  expect(priceDesk({ ...c, material: "aluminium" }).totalPence).toBeGreaterThan(
    quote.totalPence,
  );
  expect(
    priceDesk({ ...c, angle: 80, showConnections: true, wireframe: true }),
  ).toEqual(quote);
  expect(deskReducer(c, { type: "reset" })).toEqual(initialDesk);
});

test("all supported footprints keep module envelopes inside the base and parts nondegenerate", () => {
  for (const width of [270, 360, 480])
    for (const depth of [180, 240, 300]) {
      const c = { ...initialDesk, width, depth, wall: 8 };
      for (const p of connections(c)) {
        expect(Math.abs(p.x) + 36).toBeLessThanOrEqual(width / 2 - c.wall);
        expect(Math.abs(p.z) + 34).toBeLessThanOrEqual(depth / 2 - c.wall);
      }
      for (const p of deskGeometry(c))
        expect(p.size.every((n) => n > 0 && Number.isFinite(n))).toBe(true);
    }
});

import {
  createDeskHistory,
  deskHistoryReducer,
  HISTORY_LIMIT,
} from "../lib/configurator/history";
import {
  availableConnections,
  moduleCatalogue,
  connectionIssue,
  type ModuleKind,
} from "../lib/configurator/desk";
test("catalogue exposes every module, handles capacity and rejects unavailable data", () => {
  expect(moduleCatalogue).toEqual(["cup", "tray", "phone"]);
  for (const kind of moduleCatalogue) {
    expect(availableConnections(initialDesk, kind).length).toBeGreaterThan(0);
    const p = availableConnections(initialDesk, kind)[0];
    const added = deskReducer(initialDesk, { type: "add", kind, slot: p.id });
    expect(added.modules.at(-1)).toEqual({ kind, slot: p.id });
    expect(deskGeometry(added).length).toBeGreaterThan(
      deskGeometry(initialDesk).length,
    );
    expect(priceDesk(added).totalPence).toBeGreaterThan(
      priceDesk(initialDesk).totalPence,
    );
  }
  expect(connectionIssue(initialDesk, "phone", "front-left")).toContain("Rear");
  expect(connectionIssue(initialDesk, "cup", "rear-left")).toContain(
    "Occupied",
  );
  expect(
    deskReducer(initialDesk, {
      type: "add",
      kind: "missing" as ModuleKind,
      slot: "front-left",
    }),
  ).toBe(initialDesk);
  const full = {
    ...initialDesk,
    modules: connections(initialDesk).map((p) => ({
      kind: "cup" as const,
      slot: p.id,
    })),
  };
  for (const kind of moduleCatalogue)
    expect(availableConnections(full, kind)).toHaveLength(0);
});
test("bounded history shares atomic edits, restores geometry/prices, preserves redo on no-op and branches correctly", () => {
  let h = createDeskHistory();
  const original = structuredClone(h.present);
  h = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "footprint", width: 480, depth: 300 },
  });
  expect(h.past).toHaveLength(1);
  h = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "material", value: "aluminium" },
  });
  h = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "add", kind: "phone", slot: "rear-centre" },
  });
  h = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "move", from: "rear-centre", to: "rear-right" },
  });
  const final = structuredClone(h.present),
    quote = priceDesk(h.present);
  for (let i = 0; i < 4; i++) h = deskHistoryReducer(h, { type: "undo" });
  expect(h.present).toEqual(original);
  expect(deskGeometry(h.present)).toEqual(deskGeometry(original));
  const noOp = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "add", kind: "phone", slot: "front-left" },
  });
  expect(noOp).toBe(h);
  for (let i = 0; i < 4; i++) h = deskHistoryReducer(h, { type: "redo" });
  expect(h.present).toEqual(final);
  expect(priceDesk(h.present)).toEqual(quote);
  h = deskHistoryReducer(h, { type: "undo" });
  h = deskHistoryReducer(h, {
    type: "edit",
    action: { type: "colour", value: "forest" },
  });
  expect(h.future).toHaveLength(0);
  for (let i = 0; i < 80; i++)
    h = deskHistoryReducer(h, {
      type: "edit",
      action: { type: "set", key: "width", value: 300 + i },
    });
  expect(h.past).toHaveLength(HISTORY_LIMIT);
  for (let i = 0; i < 80; i++) h = deskHistoryReducer(h, { type: "undo" });
  expect(h.past).toHaveLength(0);
  expect(h.future).toHaveLength(HISTORY_LIMIT);
});
