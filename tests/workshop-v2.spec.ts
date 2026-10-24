import { expect, test, type Page } from "@playwright/test";
async function fallback(page: Page) {
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
}
const catalog = (page: Page) =>
  page.getByRole("radiogroup", { name: "Module catalogue", exact: true });
const points = (page: Page) =>
  page.getByRole("radiogroup", { name: "Connection points", exact: true });
test("visual catalogue covers all modules, compatibility, capacity, removal and saved selection", async ({
  page,
}) => {
  await fallback(page);
  await page.goto("/configure");
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  await expect(catalog(page).getByRole("radio")).toHaveCount(3);
  await expect(page.getByRole("combobox", { name: "Module type" })).toHaveCount(
    0,
  );
  const total = page.getByLabel("Demonstration total");
  for (const name of ["Phone rest", "Small-parts tray", "Pen cup"]) {
    await catalog(page)
      .getByRole("radio", { name: new RegExp(`^${name}`) })
      .click();
    const before = await total.textContent();
    await page.getByRole("button", { name: "Add module" }).click();
    expect(await total.textContent()).not.toBe(before);
    const addedSlot = await points(page)
      .getByRole("radio", { checked: true })
      .getAttribute("data-value");
    await page
      .getByRole("button", { name: `Remove ${name} at ${addedSlot}` })
      .click();
    await expect(total).toHaveText(before!);
  }
  await catalog(page)
    .getByRole("radio", { name: /^Phone rest/ })
    .click();
  await expect(
    points(page).getByRole("radio", { name: /^front-left/ }),
  ).toBeDisabled();
  await expect(
    points(page).getByRole("radio", { name: /^front-left/ }),
  ).toContainText("Rear connections only");
  await page.getByRole("button", { name: "engineer", exact: true }).click();
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  await expect(
    catalog(page).getByRole("radio", { name: /^Phone rest/ }),
  ).toBeChecked();
  // Fill every remaining point with cups; selecting an already selected kind finds the next free point.
  for (let i = 0; i < 4; i++) {
    await catalog(page)
      .getByRole("radio", { name: /^Pen cup/ })
      .click();
    await page.getByRole("button", { name: "Add module" }).click();
  }
  await expect(page.getByTestId("desk-summary")).toContainText("6 modules");
  await expect(
    catalog(page).getByRole("radio", { name: /^Phone rest/ }),
  ).toBeDisabled();
  await expect(catalog(page)).toContainText("Unavailable");
  await expect(page.getByRole("button", { name: "Add module" })).toBeDisabled();
  await page
    .getByRole("button", { name: "Remove Pen cup at front-left" })
    .click();
  await expect(
    catalog(page).getByRole("radio", { name: /^Pen cup/ }),
  ).toBeEnabled();
});
test("shared undo and redo cross all modes, geometry, connections and prices with both keyboard shortcuts", async ({
  page,
}) => {
  await fallback(page);
  await page.goto("/configure");
  const undo = page.getByRole("button", { name: /Undo/ }),
    redo = page.getByRole("button", { name: /Redo/ });
  const total = page.getByLabel("Demonstration total");
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();
  const initial = await total.textContent();
  await page.getByRole("button", { name: "Expansive" }).click();
  await page
    .getByRole("combobox", { name: "Material", exact: true })
    .selectOption("aluminium");
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  await catalog(page)
    .getByRole("radio", { name: /^Phone rest/ })
    .click();
  await page.getByRole("button", { name: "Add module" }).click();
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
  await page.getByRole("button", { name: "engineer", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Width (mm)" }).fill("420");
  await page.getByRole("spinbutton", { name: "Width (mm)" }).press("Enter");
  const final = await total.textContent();
  await undo.click();
  await expect(
    page.getByRole("spinbutton", { name: "Width (mm)" }),
  ).toHaveValue("480");
  await page.keyboard.press("Control+z"); // undo position
  await page.getByText("Connection specification · rail-v1").click();
  await expect(page.getByText(/rear-centre:.*phone/)).toBeVisible();
  await page.keyboard.press("Meta+z"); // undo module
  await expect(page.getByTestId("desk-summary")).toContainText("2 modules");
  await page.keyboard.press("Control+z"); // material
  await page.keyboard.press("Control+z"); // footprint: one transaction
  await expect(total).toHaveText(initial!);
  await expect(undo).toBeDisabled();
  await redo.click();
  await page.keyboard.press("Control+Shift+z");
  await page.keyboard.press("Meta+Shift+z");
  await redo.click();
  await redo.click();
  await expect(total).toHaveText(final!);
  await expect(redo).toBeDisabled();
  await expect(
    page.getByRole("spinbutton", { name: "Width (mm)" }),
  ).toHaveValue("420");
  await undo.click();
  await page.getByRole("spinbutton", { name: "Width (mm)" }).fill("400");
  await page.getByRole("spinbutton", { name: "Width (mm)" }).press("Enter");
  await expect(redo).toBeDisabled();
});
test("environment defaults, cycling and neutral toggle preserve configuration on mobile; visual pickers support keyboard and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fallback(page);
  await page.goto("/configure");
  const background = page.getByRole("checkbox", {
    name: "Workshop background",
  });
  await expect(background).toBeChecked();
  const price = await page.getByLabel("Demonstration total").textContent();
  for (const id of ["wood", "industrial", "future", "studio"]) {
    await page.getByRole("button", { name: "Next environment" }).click();
    await expect(page.locator(`.workshop-backdrop.env-${id}`)).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Previous environment" }).click();
  await expect(
    page.getByRole("button", { name: "Futuristic showroom", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await background.uncheck();
  await expect(page.locator(".workshop-backdrop")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Next environment" }),
  ).toBeDisabled();
  await background.check();
  await expect(page.locator(".workshop-backdrop.env-future")).toHaveCount(1);
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  await catalog(page)
    .getByRole("radio", { name: /^Pen cup/ })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    catalog(page).getByRole("radio", { name: /^Small-parts tray/ }),
  ).toBeChecked();
  await page.keyboard.press("End");
  await expect(
    catalog(page).getByRole("radio", { name: /^Phone rest/ }),
  ).toBeFocused();
  const selected = points(page).getByRole("radio", { checked: true });
  await expect(selected).toHaveAttribute("data-value", "rear-centre");
  expect(
    await selected
      .locator(".picker-spin")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  expect(await page.locator("canvas").count()).toBe(0);
  await expect(page.getByLabel("Demonstration total")).toHaveText(price!);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("animated thumbnail previews pause when clipped and add no WebGL contexts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await fallback(page);
  await page.goto("/configure");
  await page.getByRole("button", { name: "assemble", exact: true }).click();
  const row = catalog(page).getByRole("radio", { name: /^Pen cup/ });
  await row.scrollIntoViewIfNeeded();
  await expect(row.locator(".picker-thumbnail")).toHaveAttribute(
    "data-playing",
    "true",
  );
  await page.locator("body").evaluate(() => window.scrollTo(0, 0));
  await expect(row.locator(".picker-thumbnail")).toHaveAttribute(
    "data-playing",
    "false",
  );
  expect(await page.locator("canvas").count()).toBe(0);
});

test("homepage workshop keeps the catalogue visible and mobile environment controls clear of product details", async ({
  page,
}) => {
  await fallback(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Creation modes" })
    .getByRole("button", { name: /assemble/i })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "Workshop background" }),
  ).toBeChecked();
  await expect(
    page.getByText("Build your possibilities.", { exact: true }),
  ).toHaveCount(0);
  for (const name of ["Pen cup", "Small-parts tray", "Phone rest"])
    await expect(
      catalog(page).getByRole("radio", { name: new RegExp(`^${name}`) }),
    ).toBeInViewport();
  await page.setViewportSize({ width: 375, height: 812 });
  const tools = (await page.locator(".workspace-tools").boundingBox())!;
  const spec = (await page.locator(".model-spec").boundingBox())!;
  const panel = (await page.locator(".config-panel").boundingBox())!;
  expect(spec.y).toBeGreaterThan(tools.y + tools.height);
  expect(panel.y).toBeGreaterThan(spec.y + spec.height);
  await page
    .getByRole("button", { name: "Warm woodworking workshop", exact: true })
    .click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-environment",
    "wood",
  );
  await page.getByRole("checkbox", { name: "Workshop background" }).uncheck();
  await expect(page.locator(".stage")).not.toHaveClass(/workshop/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
