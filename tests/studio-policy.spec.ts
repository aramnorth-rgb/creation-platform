import { expect, test } from "@playwright/test";
import {
  newProduct,
  validateProduct,
  approvedInitial,
  permittedAction,
} from "../lib/studio/product";
import {
  initialDesk,
  deskReducer,
  deskGeometry,
  priceDesk,
} from "../lib/configurator/desk";
test("manufacturer rules initialise an approved configuration and reject unsupported drafts and edits", () => {
  const p = newProduct();
  p.materials = ["aluminium"];
  p.colours = ["charcoal"];
  p.modules = ["phone"];
  p.minWidth = 400;
  p.maxWidth = 450;
  p.modes = ["assemble"];
  expect(validateProduct(p)).toEqual([]);
  const c = approvedInitial(p);
  expect(c.material).toBe("aluminium");
  expect(c.colour).toBe("charcoal");
  expect(c.width).toBe(400);
  expect(c.modules).toHaveLength(0);
  expect(permittedAction(c, { type: "material", value: "oak" }, p)).toBe(false);
  expect(
    permittedAction(c, { type: "add", kind: "cup", slot: "front-left" }, p),
  ).toBe(false);
  expect(permittedAction(c, { type: "set", key: "width", value: 480 }, p)).toBe(
    false,
  );
  expect(
    permittedAction(c, { type: "add", kind: "phone", slot: "rear-centre" }, p),
  ).toBe(true);
  expect(validateProduct({ ...p, modes: [] })).toContain(
    "Enable at least one supported creation mode.",
  );
  expect(
    validateProduct({ ...p, minWidth: 470, maxWidth: 400 }).length,
  ).toBeGreaterThan(0);
  expect(
    validateProduct({ ...p, materials: ["unknown"] }).length,
  ).toBeGreaterThan(0);
  expect(
    validateProduct({ ...p, pricing: { basePence: NaN } }).length,
  ).toBeGreaterThan(0);
  expect(validateProduct(null).length).toBeGreaterThan(0);
});
test("manufacturer pricing uses the existing calculator and module rotation changes shared geometry without changing price", () => {
  const p = newProduct();
  const baseline = priceDesk(initialDesk);
  p.pricing.basePence += 1000;
  expect(priceDesk(initialDesk, p.pricing).totalPence).toBe(
    baseline.totalPence + 1000,
  );
  const rotated = deskReducer(initialDesk, {
    type: "rotate",
    slot: "rear-left",
  });
  expect(rotated.modules[0].rotation).toBe(90);
  expect(deskGeometry(rotated)).not.toEqual(deskGeometry(initialDesk));
  expect(priceDesk(rotated)).toEqual(baseline);
  let c = rotated;
  for (let i = 0; i < 3; i++)
    c = deskReducer(c, { type: "rotate", slot: "rear-left" });
  expect(c.modules[0].rotation).toBe(0);
});
