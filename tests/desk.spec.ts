import { expect, test } from "@playwright/test";

test("one desk configuration and price persists across modes, exhibition and product switching", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/exhibition");
  const nav = page.getByRole("navigation", { name: "Creation modes" });
  await nav.getByRole("button", { name: /customise/i }).click();
  await expect(
    page.getByRole("combobox", { name: "Workshop product" }),
  ).toHaveValue("desk");
  const canvas = page.locator(".scene canvas");
  await expect(canvas).toHaveAttribute("data-scene-ready", "true", {
    timeout: 20000,
  });
  const before = await canvas.screenshot();
  const total = page.getByLabel("Demonstration total");
  const initialPrice = await total.textContent();
  await page.getByRole("button", { name: "forest organiser" }).click();
  await page
    .getByRole("combobox", { name: "Material", exact: true })
    .selectOption("aluminium");
  await page.getByRole("button", { name: "Expansive" }).click();
  await expect(
    page.getByRole("img", {
      name: /Desk organiser preview: 480 × 300 mm, Brushed aluminium, forest/,
    }),
  ).toBeVisible();
  const changed = await canvas.screenshot();
  expect(changed.equals(before)).toBe(false);
  const expansivePrice = await total.textContent();
  await page.getByRole("button", { name: /Undo/ }).click();
  await expect(
    page.getByRole("img", { name: /Desk organiser preview: 360 × 240 mm/ }),
  ).toBeVisible();
  expect((await canvas.screenshot()).equals(changed)).toBe(false);
  expect(await total.textContent()).not.toBe(expansivePrice);
  await page.getByRole("button", { name: /Redo/ }).click();
  await expect(total).toHaveText(expansivePrice!);

  expect(await total.textContent()).not.toBe(initialPrice);
  await nav.getByRole("button", { name: /assemble/i }).click();
  await page
    .getByRole("radiogroup", { name: "Module catalogue" })
    .getByRole("radio", { name: /^Phone rest/ })
    .click();
  await expect(
    page
      .getByRole("radiogroup", { name: "Connection points", exact: true })
      .getByRole("radio", { name: /^front-left/ }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("radiogroup", { name: "Connection points", exact: true })
      .getByRole("radio", { name: /^rear-centre/ }),
  ).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Add module" }).click();
  await expect(page.getByRole("button", { name: "Add module" })).toBeDisabled();
  const withPhone = await total.textContent();
  await page
    .getByText("Reposition Phone rest at rear-centre", { exact: true })
    .click();
  await page
    .getByRole("radiogroup", {
      name: "Position for Phone rest at rear-centre",
      exact: true,
    })
    .getByRole("radio", { name: /^rear-right/ })
    .click();
  await expect(total).toHaveText(withPhone!);
  await nav.getByRole("button", { name: /engineer/i }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Width (mm)" }),
  ).toHaveValue("480");
  await page.getByRole("spinbutton", { name: "Width (mm)" }).fill("420");
  await page.getByRole("spinbutton", { name: "Width (mm)" }).press("Enter");
  await page.getByRole("spinbutton", { name: "Wall thickness (mm)" }).fill("6");
  await page
    .getByRole("spinbutton", { name: "Wall thickness (mm)" })
    .press("Enter");
  await page
    .getByRole("checkbox", { name: "Show organiser wireframe" })
    .check();
  await page.getByRole("checkbox", { name: "Show connection points" }).check();
  await page.getByText("Connection specification · rail-v1").click();
  await expect(
    page.getByText(/rear-right: X 140.0, Z -75.0 mm · phone/),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export configuration JSON" }).click();
  expect((await download).suggestedFilename()).toBe("nitorix-desk-v1.json");
  const engineeringPrice = await total.textContent();
  await nav.getByRole("button", { name: /customise/i }).click();
  await expect(total).toHaveText(engineeringPrice!);
  await expect(
    page.getByRole("button", { name: "forest organiser" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("combobox", { name: "Material", exact: true }),
  ).toHaveValue("aluminium");
  await page
    .getByRole("combobox", { name: "Workshop product" })
    .selectOption("atlas");
  await page
    .getByRole("combobox", { name: "Workshop product" })
    .selectOption("desk");
  await expect(total).toHaveText(engineeringPrice!);
  await page.getByRole("button", { name: /Back to exhibition/ }).click();
  await nav.getByRole("button", { name: /assemble/i }).click();
  await expect(
    page.getByText("Reposition Phone rest at rear-right", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Phone rest at rear-right" })
    .click();
  expect(await total.textContent()).not.toBe(engineeringPrice);
  await page.getByRole("button", { name: "Reset organiser" }).click();
  await expect(total).toHaveText(initialPrice!);
  await expect(page.getByTestId("desk-summary")).toContainText(
    "360 × 240 × 10 mm · polymer · ivory · 2 modules",
  );
  expect(errors).toEqual([]);
});

test("standalone engine is responsive, keyboard-operable and uses a geometry-driven WebGL fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      return String(args[0]).includes("webgl")
        ? null
        : original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/configure");
  await expect(page.locator(".desk-fallback polygon")).not.toHaveCount(0);
  await page.getByRole("button", { name: "forest organiser" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("img", { name: /forest/ })).toBeVisible();
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  await page
    .getByRole("radiogroup", { name: "Module catalogue" })
    .getByRole("radio", { name: /^Small-parts tray/ })
    .click();
  await page.getByRole("button", { name: "Add module" }).click();
  await expect(page.getByTestId("desk-summary")).toContainText("3 modules");
  await page.getByRole("button", { name: "engineer", exact: true }).click();
  await expect(page.getByTestId("desk-summary")).toContainText(
    "forest · 3 modules",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
