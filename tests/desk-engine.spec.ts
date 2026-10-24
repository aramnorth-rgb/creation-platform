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
