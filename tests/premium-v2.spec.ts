import { expect, test, type Page } from "@playwright/test";
async function noWebgl(page: Page) {
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
const studioSection = (page: Page, name: string) =>
  page
    .getByRole("navigation", { name: "Studio sections" })
    .getByRole("button", { name, exact: true });
test("premium homepage offers an interactive 3D product, clear routes and restrained editorial sections", async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Imagine it.Make it yours.",
  );
  await expect(
    page.getByRole("link", { name: /Explore Products/ }),
  ).toHaveAttribute("href", "/explore");
  await expect(
    page.getByRole("link", { name: /Start Creating/ }).last(),
  ).toHaveAttribute("href", "/create");
  const canvas = page.locator(".nx-hero-canvas canvas");
  await expect(canvas).toHaveAttribute("data-scene-ready", "true", {
    timeout: 30000,
  });
  const before = await canvas.screenshot();
  await page.getByRole("button", { name: "coral hero colour" }).click();
  await expect(
    page.getByRole("button", { name: "coral hero colour" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  const angle = page.getByRole("slider", { name: "Hero product rotation" });
  const prior = await angle.inputValue();
  const box = (await page.locator(".nx-hero-canvas").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, {
    steps: 4,
  });
  await page.mouse.up();
  expect(await angle.inputValue()).not.toBe(prior);
  await expect(page.locator(".promotion-pair")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Why buy ordinary/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile navigation, collection filtering and manufacturer honesty work without WebGL", async ({
  page,
}) => {
  await noWebgl(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".nx-hero-canvas .desk-fallback")).toBeVisible();
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await menu.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(4);
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page.getByRole("link", { name: /Explore Products/ }).click();
  await page.getByRole("button", { name: "Living", exact: true }).click();
  await expect(page.locator(".nx-product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Explore Fold chair" }).click();
  await expect(
    page.getByRole("link", { name: /View 3D exhibition/ }),
  ).toHaveAttribute("href", "/exhibition");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /For Manufacturers/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Create Account", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(/subject to final programme terms/),
  ).toBeVisible();
  await page
    .getByLabel("Business name", { exact: true })
    .fill("Sample Workshop");
  await page.getByLabel("Work email").fill("demo@example.test");
  await page.getByLabel("What do you make?").fill("Furniture");
  await page.getByRole("button", { name: /Prepare interest note/ }).click();
  await expect(page.getByRole("status")).toContainText("It has not been sent");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("Studio saves local products, validates options, enforces rules and prices in the shared preview, and persists on reload", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  await page.getByRole("button", { name: /Add product draft/ }).click();
  await page
    .getByLabel("Product name", { exact: true })
    .fill("Workshop Series One");
  await page.getByRole("button", { name: /Save draft/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "saved on this browser only",
  );
  await studioSection(page, "Configurator Builder").click();
  // A new product has Customise-only access until the supplier declares real modular data.
  await expect(page.getByRole("checkbox", { name: /^assemble$/i })).toBeDisabled();
  for (const field of [
    "Product appearance", "Measured outer dimensions", "Available finishes and options",
    "Prices for available choices", "Individual component geometry",
    "Measured attachment points", "Compatibility rules", "Component pricing",
  ]) {
    await page.getByRole("checkbox", { name: new RegExp(field) }).check();
  }
  await page.getByRole("checkbox", { name: /^assemble$/i }).check();
  await expect(page.getByRole("checkbox", { name: /^engineer$/i })).toBeDisabled();
  await page
    .getByRole("checkbox", { name: "Warm oak composite", exact: true })
    .uncheck();
  await page.getByRole("checkbox", { name: "Pen cup", exact: true }).uncheck();
  await page.getByRole("button", { name: /Save draft/ }).click();
  await studioSection(page, "Pricing").click();
  await page.getByLabel("Demo base fee (pence)").fill("2800");
  await page.getByRole("button", { name: /Save draft/ }).click();
  await page.getByRole("button", { name: /Preview demo pricing/ }).click();
  const preview = page.getByRole("dialog");
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("button", { name: "engineer", exact: true }),
  ).toHaveCount(0);
  await expect(
    preview
      .getByRole("combobox", { name: "Material", exact: true })
      .getByRole("option", { name: "Warm oak composite" }),
  ).toHaveJSProperty("disabled", true);
  const price = preview.getByLabel("Demonstration total");
  const original = await price.textContent();
  await preview.getByRole("button", { name: "assemble", exact: true }).click();
  await expect(
    preview
      .getByRole("radiogroup", { name: "Module catalogue" })
      .getByRole("radio", { name: /^Pen cup/ }),
  ).toBeDisabled();
  await preview
    .getByRole("radiogroup", { name: "Module catalogue" })
    .getByRole("radio", { name: /^Phone rest/ })
    .click();
  await preview.getByRole("button", { name: "Add module" }).click();
  expect(await price.textContent()).not.toBe(original);
  await preview
    .getByRole("button", { name: "Rotate Phone rest at rear-left" })
    .click();
  await expect(
    preview.getByRole("button", { name: "Rotate Phone rest at rear-left" }),
  ).toHaveText("Rotate 90° · 90°");
  await preview.getByRole("button", { name: /Undo/ }).click();
  await expect(
    preview.getByRole("button", { name: "Rotate Phone rest at rear-left" }),
  ).toHaveText("Rotate 90° · 0°");
  await page.getByRole("button", { name: "Close product preview" }).click();
  await studioSection(page, "Publishing").click();
  await expect(
    page.getByRole("button", { name: /Publish · not connected/ }),
  ).toBeDisabled();
  const create = page.getByRole("link", { name: /Open saved draft in Create/ });
  const href = await create.getAttribute("href");
  await page.goto(href!);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Workshop Series One",
  );
  await expect(
    page.getByRole("button", { name: "engineer", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Workshop Series One",
  );
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  await expect(
    page.getByRole("heading", { level: 3, name: "Workshop Series One" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Workshop Series One" }).click();
  await studioSection(page, "Configurator Builder").click();
  await page.getByRole("checkbox", { name: /^customise$/i }).uncheck();
  await page.getByRole("checkbox", { name: /^assemble$/i }).uncheck();
  await page.getByRole("button", { name: /Save draft/ }).click();
  await expect(
    page.getByRole("alert", { name: "Product validation errors" }),
  ).toContainText("Enable at least one supported creation mode");
});
test("Studio prototype sections are honest, responsive and permit duplicate/delete of local drafts", async ({
  page,
}) => {
  await noWebgl(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/studio");
  for (const section of [
    "Overview",
    "Products",
    "Configurator Builder",
    "Pricing",
    "Publishing",
    "Orders and Enquiries",
    "Analytics",
    "Business Settings",
  ]) {
    await studioSection(page, section).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await studioSection(page, "Orders and Enquiries").click();
  await expect(
    page.getByText(/There are no real orders or messages/),
  ).toBeVisible();
  await studioSection(page, "Products").click();
  await page
    .getByRole("button", {
      name: "Duplicate Contour desk organiser",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Save draft/ }).click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Contour desk organiser copy",
    }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", {
      name: "Delete Contour desk organiser copy",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Contour desk organiser copy",
    }),
  ).toHaveCount(0);
});
test("Underlying configurator retains shared pricing, rotation and history across all three modes", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/configure");
  await page.getByRole("button", { name: "forest organiser" }).click();
  const modes = page.getByRole("navigation", {
    name: "Standalone creation modes",
  });
  await modes.getByRole("button", { name: "assemble", exact: true }).click();
  await page
    .getByRole("radiogroup", { name: "Module catalogue" })
    .getByRole("radio", { name: /^Phone rest/ })
    .click();
  await page.getByRole("button", { name: "Add module" }).click();
  const price = await page.getByLabel("Demonstration total").textContent();
  await modes.getByRole("button", { name: "engineer", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Width (mm)" }).fill("420");
  await page.getByRole("spinbutton", { name: "Width (mm)" }).press("Enter");
  await page.getByRole("button", { name: /Undo/ }).click();
  await expect(page.getByLabel("Demonstration total")).toHaveText(price!);
  await page
    .getByRole("button", { name: "Warm woodworking workshop", exact: true })
    .click();
  await expect(page.locator(".workshop-backdrop.env-wood")).toHaveCount(1);
  await modes.getByRole("button", { name: "customise", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "forest organiser" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("desk-summary")).toContainText("3 modules");
});

test("Customer Create shows Customise above 3D canvas with disabled future modes", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/create");
  const nav = page.getByRole("navigation", { name: "Standalone creation modes" });
  await expect(nav.getByRole("button", { name: "customise", exact: true })).toHaveAttribute("aria-pressed", "true");
  for (const mode of ["assemble", "engineer"]) {
    const button = nav.getByRole("button", { name: mode, exact: true });
    await expect(button).toBeDisabled();
    await expect(button).toHaveText(mode, { ignoreCase: true });
  }
  const navBounds = await nav.boundingBox();
  const canvasBounds = await page.locator(".embed-canvas").boundingBox();
  expect(navBounds).not.toBeNull();
  expect(canvasBounds).not.toBeNull();
  expect(navBounds!.y + navBounds!.height).toBeLessThanOrEqual(canvasBounds!.y);
  await expect(page.getByRole("combobox", { name: "Material", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "forest organiser" }).click();
  await expect(page.getByTestId("desk-summary")).toContainText("forest");
});

test("Customise stage is larger and breathing room scales down without mobile overflow", async ({
  page,
}) => {
  await noWebgl(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/create");
  const viewer = page.locator(".nx-create .embed-canvas");
  const large = await viewer.boundingBox();
  expect(large).not.toBeNull();
  expect(large!.height).toBeGreaterThanOrEqual(560);
  const desktopModeTabs = await page.locator(".nx-create .nx-mode-tabs").boundingBox();
  expect(desktopModeTabs).not.toBeNull();
  expect(large!.y - (desktopModeTabs!.y + desktopModeTabs!.height)).toBeGreaterThanOrEqual(16);

  await page.setViewportSize({ width: 375, height: 812 });
  const mobile = await viewer.boundingBox();
  expect(mobile).not.toBeNull();
  expect(mobile!.height).toBeGreaterThanOrEqual(390);
  expect(mobile!.width).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test("Create offers optional size references, configurable height and no-WebGL disclosure", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/create");
  const compare = page.getByRole("combobox", { name: "Compare size with…" });
  await expect(compare).toHaveValue("none");
  await expect(page.locator(".nx-scale-fallback")).toHaveCount(0);
  await compare.selectOption("person");
  const height = page.getByRole("spinbutton", { name: "Height (cm)" });
  await expect(height).toHaveValue("175");
  await height.fill("195");
  await expect(page.locator(".nx-scale-caption")).toContainText("195 cm");
  await expect(page.locator(".nx-scale-fallback")).toContainText("need WebGL");
  await compare.selectOption("ruler");
  await expect(height).toHaveCount(0);
  await expect(page.locator(".nx-scale-caption")).toContainText("100 cm");
  await compare.selectOption("banana");
  await expect(page.locator(".nx-scale-caption")).toContainText("18 cm");
  await compare.selectOption("hand");
  await expect(page.locator(".nx-scale-caption")).toContainText("18 cm");
  await compare.selectOption("none");
  await expect(page.locator(".nx-scale-fallback")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "assemble", exact: true })).toBeDisabled();
});


test("Shared manufacturer catalogue and demo CRM link an explicit configured design", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/create");
  const catalogue = page.getByRole("combobox", { name: "Demo manufacturer catalogue" });
  await expect(catalogue).toBeVisible();
  await page.getByRole("button", { name: "forest organiser" }).click();
  await page.locator(".nx-enquiry-action summary").click();
  await page.getByRole("button", { name: "Add to Studio preview" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing was sent");
  await page.goto("/studio");
  await studioSection(page, "Orders and Enquiries").click();
  await expect(page.getByText("Contour desk organiser", { exact: true })).toBeVisible();
  await expect(page.getByText(/forest · 2 modules/)).toBeVisible();
  await page.getByRole("combobox", { name: "Enquiry stage for Contour desk organiser" })
    .selectOption("qualified");
  await expect(page.getByRole("combobox", { name: "Enquiry stage for Contour desk organiser" }))
    .toHaveValue("qualified");
  await page.reload();
  await studioSection(page, "Orders and Enquiries").click();
  await expect(page.getByRole("combobox", { name: "Enquiry stage for Contour desk organiser" }))
    .toHaveValue("qualified");
  await page.getByRole("button", { name: "Remove demo" }).click();
  await expect(page.getByText("No demo enquiries yet.")).toBeVisible();
});


test("Studio CSV catalogue drafts feed the same consumer configurator and CRM demo", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  await page.getByLabel("Import catalogue CSV").setInputFiles({
    name: "manufacturer-catalogue.csv",
    mimeType: "text/csv",
    buffer: Buffer.from('sku,name,description\nNIT-101,Arc Desk Tray,"Adjustable demo tray"\n'),
  });
  await expect(page.getByRole("status")).toContainText("1 catalogue drafts imported");
  await expect(page.getByRole("heading", { name: "Arc Desk Tray" })).toBeVisible();
  await page.goto("/create");
  await page.getByRole("combobox", { name: "Demo manufacturer catalogue" })
    .selectOption("nit-101");
  await expect(page.getByRole("heading", { level: 1, name: "Arc Desk Tray" })).toBeVisible();
  await page.locator(".nx-enquiry-action summary").click();
  await page.getByRole("button", { name: "Add to Studio preview" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing was sent");
  await page.goto("/studio");
  await studioSection(page, "Orders and Enquiries").click();
  await expect(page.getByRole("heading", { name: "Arc Desk Tray" })).toBeVisible();
});


test("Studio accepts a real GLB and reuses it in the same product's Create viewer", async ({
  page,
}) => {
  await noWebgl(page);
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  const library = page.getByRole("region", { name: "3D model library" });
  await expect(library).toBeVisible();
  await library.getByLabel("Choose 3D model (.glb)").setInputFiles("public/models/BoomBox.glb");
  await expect(library.getByRole("status")).toContainText("saved in this browser");
  await expect(library.getByText("3D preview unavailable")).toBeVisible();
  await page.goto("/create?draft=contour-demo");
  await expect(page.getByRole("heading", { level: 1, name: "Contour desk organiser" })).toBeVisible();
  await expect(page.getByText("Presentation finish")).toBeVisible();
  await expect(page.getByText("3D preview unavailable")).toBeVisible();
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  await expect(page.getByText("Remove model")).toBeVisible();
});

test("Second showcase is a textured chair, not the desk organiser", async ({ page }) => {
  await noWebgl(page);
  await page.goto("/create?showcase=chair");
  await expect(page.getByRole("heading", { level: 1, name: "Sheen chair" })).toBeVisible();
  await expect(page.getByText("Presentation finish")).toBeVisible();
  await expect(page.getByText("3D preview unavailable")).toBeVisible();
  await expect(page.getByRole("combobox", {name:"Demo manufacturer catalogue"})).toHaveValue("chair-showcase");
});


test("Progressive onboarding never unlocks Assemble or Engineer from pictures alone", async ({ page }) => {
  await noWebgl(page);
  await page.goto("/studio");
  await studioSection(page, "Products").click();
  await page.getByRole("button", { name: /Add product draft/ }).click();
  await page.getByLabel("Product name", {exact:true}).fill("Photo-only armchair");
  await page.getByRole("button", {name:/Save draft/}).click();
  await studioSection(page, "Configurator Builder").click();
  const assemble = page.getByRole("checkbox", {name:/^assemble$/i});
  const engineer = page.getByRole("checkbox", {name:/^engineer$/i});
  await expect(assemble).toBeDisabled();
  await expect(engineer).toBeDisabled();
  // A visually reconstructed product still needs manufacturer-confirmed options.
  await page.getByRole("checkbox", {name:/Product appearance/}).check();
  await page.getByRole("checkbox", {name:/Measured outer dimensions/}).check();
  await expect(assemble).toBeDisabled();
  await page.getByRole("button", {name:/Save draft/}).click();
  await page.reload();
  await studioSection(page,"Products").click();
  await page.getByRole("button", {name:"Edit Photo-only armchair"}).click();
  await studioSection(page,"Configurator Builder").click();
  await expect(assemble).toBeDisabled();
  await expect(engineer).toBeDisabled();
  await studioSection(page,"Publishing").click();
  const href = await page.getByRole("link", {name:/Open saved draft in Create/}).getAttribute("href");
  await page.goto(href!);
  await expect(page.getByRole("button", {name:"assemble",exact:true})).toBeDisabled();
  await expect(page.getByRole("button", {name:"engineer",exact:true})).toBeDisabled();
});

test("Revoking a required specification disables previously enabled Assemble", async ({page})=>{
  await noWebgl(page);
  await page.goto("/studio");
  await studioSection(page,"Products").click();
  await page.getByRole("button", {name:/Add product draft/}).click();
  await page.getByLabel("Product name", {exact:true}).fill("Modular organiser sample");
  await studioSection(page,"Configurator Builder").click();
  const fields = [
    "Product appearance", "Measured outer dimensions", "Available finishes and options",
    "Prices for available choices", "Individual component geometry",
    "Measured attachment points", "Compatibility rules", "Component pricing",
  ];
  for(const field of fields)await page.getByRole("checkbox",{name:new RegExp(field)}).check();
  await page.getByRole("checkbox",{name:/^assemble$/i}).check();
  await expect(page.getByRole("checkbox",{name:/^assemble$/i})).toBeChecked();
  await page.getByRole("checkbox",{name:/Compatibility rules/}).uncheck();
  await expect(page.getByRole("checkbox",{name:/^assemble$/i})).toBeDisabled();
  await expect(page.getByRole("checkbox",{name:/^assemble$/i})).not.toBeChecked();
  await page.getByRole("button",{name:/Save draft/}).click();
  await expect(page.getByRole("status")).toContainText("saved on this browser only");
});
