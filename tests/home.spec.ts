import { expect, test } from "@playwright/test";

test("minimal viewport and twelve-step fallback timing, keyboard selection and pause", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  // Timer/controller coverage is independent of GPU shader compilation.
  // The separate drag, asset and touch tests exercise the live WebGL scene.
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
  await page.clock.install();
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator(".fallback-object")).toBeVisible();
  // Freeze between explicit advances: software-rendered actions must not consume
  // the remaining portion of the ten-second interval in real wall-clock time.
  const virtualNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(virtualNow + 1000));
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Home");
  await expect(scene).toHaveAttribute("data-creation", "0");

  await expect(
    page.getByRole("button", { name: "Pause carousel" }),
  ).toBeEnabled();
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  expect(
    await page
      .locator(".carousel-access")
      .evaluate((e) => e.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(999);
  await expect(
    page.locator(".exhibition-heading,.exhibit-index,.exhibit-caption"),
  ).toHaveCount(0);
  await page.clock.fastForward(10010);
  await expect(scene).toHaveAttribute("data-creation", "1");
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-creation", "2");
  await page.clock.fastForward(9000);
  await expect(scene).toHaveAttribute("data-creation", "2");
  await page.clock.fastForward(1010);
  await expect(scene).toHaveAttribute("data-creation", "3");
  for (let i = 0; i < 9; i++) {
    await page.clock.fastForward(10010);
    await expect(scene).toHaveAttribute("data-creation", String((4 + i) % 12));
  }
  await page.keyboard.press("p");
  await page.clock.fastForward(30000);
  await expect(scene).toHaveAttribute("data-creation", "0");
  await expect(
    page.getByRole("button", { name: "Resume carousel" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("object drag is isolated, returns smoothly, carousel drag selects, click opens details", async ({
  page,
}) => {
  // Software WebGL plus canvas captures can be slower on shared CI machines.
  test.setTimeout(90000);
  await page.setViewportSize({ width: 720, height: 600 });
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  // Pause using keyboard, leaving the full-screen canvas in view.
  await scene.focus();
  await page.keyboard.press("p");
  await page.waitForTimeout(500);
  const box = (await scene.boundingBox())!;
  const x = box.x + box.width * 0.5,
    y = box.y + box.height * 0.62;
  const before = await scene.locator("canvas").screenshot();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 160, y - 90, { steps: 4 });
  await expect(scene).toHaveAttribute("data-object-dragging", "true");
  await expect(scene).toHaveAttribute("data-creation", "0");
  const heldDrag = await scene.locator("canvas").screenshot();
  expect(heldDrag.equals(before)).toBe(false);
  await page.mouse.up();
  await expect(scene).toHaveAttribute("data-object-dragging", "false");
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await expect(scene).toHaveAttribute("data-creation", "0");
  await page.waitForTimeout(1300);
  expect((await scene.locator("canvas").screenshot()).equals(heldDrag)).toBe(
    false,
  );
  // Empty upper canvas belongs to the carousel, independently of the object.
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.12);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.67, box.y + box.height * 0.12, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(scene).not.toHaveAttribute("data-creation", "0");
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await scene.focus();
  await page.keyboard.press("Home");
  // Wait for the actual snap to settle; software WebGL may need more than 900ms.
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-carousel-settled",
    "true",
    { timeout: 20000 },
  );
  await page.mouse.click(x, y);
  await expect(page.locator(".creation-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeVisible();
});

test("on-demand information, fictional designer profile, rating and full local comments", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  await scene.focus();
  await page.keyboard.down("Shift");
  await page.keyboard.down("ArrowUp");
  await expect(scene).toHaveAttribute("data-object-dragging", "true");
  await page.keyboard.up("ArrowUp");
  await page.keyboard.up("Shift");
  await expect(scene).toHaveAttribute("data-object-dragging", "false");
  await expect(scene).toHaveAttribute("data-creation", "0");
  const stageBefore = (await page.locator(".stage").boundingBox())!;
  const sceneBefore = (await scene.boundingBox())!;
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.keyboard.press("Enter");
  const panel = page.locator(".creation-panel");
  await expect(panel).toBeVisible();
  expect((await page.locator(".stage").boundingBox())!.height).toBe(
    stageBefore.height,
  );
  expect((await scene.boundingBox())!.width).toBe(sceneBefore.width);
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  const panelBox = (await panel.boundingBox())!;
  expect(panelBox.width).toBeLessThanOrEqual(340);
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(
    stageBefore.y + stageBefore.height,
  );
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeFocused();
  await expect(
    panel.getByLabel(/Fictional manufacturer rating: 4.4/),
  ).toBeVisible();
  const profile = page.getByRole("link", { name: /Full designer profile/ });
  await profile.click();
  const dialog = page.locator(".detail-dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Elio Mercer" }),
  ).toBeVisible();
  await expect(
    dialog.getByText(/fictional independent designer/),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(profile).toBeFocused();
  await page
    .getByRole("textbox", { name: /Add a comment/ })
    .fill("A quiet adventure, imagined beautifully.");
  await page.getByRole("button", { name: "Add local comment" }).click();
  await expect(page.getByRole("status")).toContainText("Not published");
  await expect(
    panel.getByText("A quiet adventure, imagined beautifully."),
  ).toBeVisible();
  await page.getByRole("link", { name: /Full comments/ }).click();
  await expect(
    dialog.getByText("A quiet adventure, imagined beautifully."),
  ).toBeVisible();
  await dialog
    .getByRole("textbox", { name: /Add a comment/ })
    .fill("A second local thought.");
  await dialog.getByRole("button", { name: "Add local comment" }).click();
  await expect(dialog.getByText("A second local thought.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Close creation details" }).click();
  await expect(panel).toHaveCount(0);
  expect((await page.locator(".stage").boundingBox())!.height).toBe(
    stageBefore.height,
  );
  await expect(scene).toHaveAttribute("data-creation", "0");
  await expect(scene).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Glide / 02" })).toBeVisible();
  await page.getByRole("link", { name: /Full comments/ }).click();
  await expect(
    dialog.getByText("A quiet adventure, imagined beautifully."),
  ).toHaveCount(0);
});
test("three studio modes update the model, retain options and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Creation modes" });
  await nav.getByRole("button", { name: /customise/i }).click();
  await expect(
    page.getByRole("heading", { name: "Make it yours." }),
  ).toBeFocused();
  await expect(page.locator(".scene canvas")).toBeVisible();
  await page
    .getByRole("combobox", { name: "Workshop product" })
    .selectOption("atlas");
  const before = await page.locator(".scene canvas").screenshot();
  await page.getByRole("button", { name: "Forest exterior" }).click();
  await expect(
    page.getByRole("img", { name: /Atlas motorhome preview: Forest/ }),
  ).toBeVisible();
  await page.waitForTimeout(200);
  expect(
    (await page.locator(".scene canvas").screenshot()).equals(before),
  ).toBe(false);
  await page.getByRole("button", { name: "polished", exact: true }).click();
  await nav.getByRole("button", { name: /assemble/i }).click();
  await page.getByRole("checkbox", { name: /Outdoor awning/ }).check();
  await page.getByRole("checkbox", { name: /Rear storage/ }).check();
  await page.getByRole("checkbox", { name: /Solar roof/ }).uncheck();
  await expect(
    page.getByRole("img", { name: /solar off, awning on, storage on/ }),
  ).toBeVisible();
  await expect(
    page.getByText("2 / 3 optional modules installed"),
  ).toBeVisible();
  await nav.getByRole("button", { name: /engineer/i }).click();
  const clearance = page.getByRole("slider", { name: "Ground clearance" });
  await clearance.fill("400");
  await page.getByRole("slider", { name: "Wheel diameter" }).fill("24");
  await page.getByRole("slider", { name: "Body length" }).fill("7.5");
  await page.getByRole("checkbox", { name: "Show body wireframe" }).check();
  await expect(
    page.getByRole("img", {
      name: /7.5 metres, 400 millimetres clearance, 24 inch wheels/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /wireframe on/ })).toBeVisible();
  await page.getByRole("checkbox", { name: "Workshop background" }).check();
  await expect(page.locator(".stage")).toHaveClass(/workshop/);
  await nav.getByRole("button", { name: /customise/i }).click();
  await expect(
    page.getByRole("button", { name: "Forest exterior" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "polished", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Reset design/ }).click();
  await expect(
    page.getByRole("button", { name: "Pearl exterior" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("slider", { name: "Body length" })).toHaveValue(
    "6.8",
  );
  await page.getByRole("button", { name: /Back to exhibition/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "NITORIX community showroom",
  );
  expect(errors).toEqual([]);
});

test("mobile touch gestures, cancellation, reduced motion, fallback and configurators", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.clock.install();
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator(".fallback-object")).toBeVisible();
  await page.clock.fastForward(30000);
  await expect(scene).toHaveAttribute("data-creation", "0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  // Real Chromium touch input verifies pointer capture and cancellation.
  const box = (await scene.boundingBox())!;
  const objectBox = (await scene.locator(".fallback-object").boundingBox())!;
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  const touch = async (
    type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
    x = 0,
    y = 0,
  ) =>
    client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y }],
    });
  const x = objectBox.x + objectBox.width / 2,
    y = objectBox.y + objectBox.height / 2;
  await touch("touchStart", x, y);
  await touch("touchMove", x + 65, y + 40);
  await expect(scene).toHaveAttribute("data-object-dragging", "true");
  await touch("touchEnd");
  await expect(scene).toHaveAttribute("data-creation", "0");
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await touch("touchStart", 330, box.y + 35);
  await touch("touchMove", 230, box.y + 35);
  await touch("touchCancel");
  await expect(scene).toHaveAttribute("data-creation", "0");
  await touch("touchStart", 330, box.y + 35);
  await touch("touchMove", 230, box.y + 35);
  await touch("touchEnd");
  await expect(scene).not.toHaveAttribute("data-creation", "0");
  await scene.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Creation modes" });
  for (const mode of ["customise", "assemble", "engineer"]) {
    await nav.getByRole("button", { name: new RegExp(mode, "i") }).click();
    await expect(
      page.getByRole("complementary", { name: `${mode} controls` }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("combobox", { name: "Workshop product" })
    .selectOption("atlas");
  await page.getByRole("slider", { name: "Body length" }).fill("8");
  await expect(page.getByRole("img", { name: /8 metres/ })).toBeVisible();
  expect(
    await page.locator(".still-model g").first().getAttribute("transform"),
  ).toContain("scale(1.176");
  expect(errors).toEqual([]);
});

test("navigation modal retains keyboard focus and opens all studio modes", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  const dialog = page.locator(".menu-dialog");
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "How to explore" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close navigation menu" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Engineer" }).click();
  await expect(
    page.getByRole("heading", { name: "Think in the details." }),
  ).toBeFocused();
});

test("mobile WebGL object touch rotates without choosing or opening, tap opens", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });
  const box = (await scene.boundingBox())!;
  const x = box.width / 2,
    y = box.y + box.height * 0.62;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 75, y: y - 60 }],
  });
  await expect(scene).toHaveAttribute("data-object-dragging", "true");
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(scene).toHaveAttribute("data-creation", "0");
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".creation-panel")).toBeVisible();
  expect(errors).toEqual([]);
});

test("local CC0 assets load, credits are available and missing assets fall back", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  expect((await request.get("/models/SheenChair.glb")).ok()).toBe(true);
  expect((await request.get("/models/BoomBox.glb")).ok()).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const scene = page.locator(".scene");
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  const chairLoaded = page.waitForResponse((r) =>
    r.url().endsWith("/models/SheenChair.glb"),
  );
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  expect((await chairLoaded).ok()).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.locator(".model-provenance")).toContainText("Sheen Chair");
  await expect(
    page.getByRole("link", { name: /Model credits/ }),
  ).toHaveAttribute("href", "/models/ATTRIBUTION.md");
  const credits = await request.get("/models/ATTRIBUTION.md");
  expect(credits.ok()).toBe(true);
  expect(await credits.text()).toContain("CC0");
  await page.getByRole("button", { name: "Close creation details" }).click();
  await scene.focus();
  await page.keyboard.press("Home");
  expect(errors).toEqual([]);
  await page.route("**/models/*.glb", (r) => r.abort());
  await page.reload();
  await expect(page.locator(".scene canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  await page.locator(".scene").focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Fold / 03" })).toBeVisible();
  await expect(page.locator(".scene canvas")).toBeVisible();
});

test("NITORIX foreground promotional panels: tall, readable, responsive and non-blocking", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
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
  await page.goto("/");
  await expect(page).toHaveTitle(/NITORIX/);
  await expect(page.locator("header .wordmark")).toContainText("NITORIX");
  await expect(page.locator("body")).not.toContainText("form&field");
  const pair = page.locator(".promotion-pair"),
    left = page.locator(".promotion-left"),
    right = page.locator(".promotion-right");
  await expect(
    left.getByRole("heading", { name: "YOUR IMAGINATION. MADE REAL." }),
  ).toBeVisible();
  await expect(
    right.getByRole("heading", { name: "THE NEXT BIG THING? YOURS." }),
  ).toBeVisible();
  await expect(left.getByText("Design it. Make it yours.")).toBeVisible();
  await expect(
    right.getByText("Discover what our creators are building."),
  ).toBeVisible();
  await expect(pair).toHaveAttribute("data-height-ratio", "1.4");
  const stage = (await page.locator(".stage").boundingBox())!,
    l = (await left.boundingBox())!,
    r = (await right.boundingBox())!;
  expect(l.width).toBeLessThan(170);
  expect(l.height).toBeGreaterThan(l.width * 3);
  expect(Math.abs(l.height - 360 * 1.4)).toBeLessThan(12);
  expect(l.x).toBeLessThan(stage.width * 0.12);
  expect(r.x).toBeGreaterThan(stage.width * 0.84);
  expect(l.y + l.height / 2).toBeGreaterThan(stage.y + stage.height * 0.4);
  expect(l.y + l.height / 2).toBeLessThan(stage.y + stage.height * 0.6);
  expect(await left.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe(
    "none",
  );
  expect(
    await left
      .locator(".promo-spark")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  const scene = page.locator(".scene");
  await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2);
  await page.mouse.down();
  await page.mouse.move(l.x + l.width / 2 + 180, l.y + l.height / 2, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(scene).not.toHaveAttribute("data-creation", "0");
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await scene.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(page.locator(".creation-panel")).toBeVisible();
  expect((await right.boundingBox())!.x).toBeGreaterThan(1400);
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileLeft = (await left.boundingBox())!,
    mobileRight = (await right.boundingBox())!,
    info = (await page.locator(".creation-panel").boundingBox())!;
  expect(mobileLeft.height).toBeLessThan(120);
  expect(mobileLeft.x + mobileLeft.width).toBeLessThan(mobileRight.x);
  expect(mobileLeft.y).toBeGreaterThan(info.y + info.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("navigation", { name: "Creation modes" })
    .getByRole("button", { name: /customise/i })
    .click();
  await expect(pair).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Workshop product" })
    .selectOption("atlas");
  const revisionBefore = Number(
    await page.locator(".stage").getAttribute("data-configuration-revision"),
  );
  await page.getByRole("button", { name: "Forest exterior" }).click();
  expect(
    Number(
      await page.locator(".stage").getAttribute("data-configuration-revision"),
    ),
  ).toBe(revisionBefore + 1);
  await expect(page.getByRole("img", { name: /Forest/ })).toBeVisible();
});

test("WebGL showroom foreground panels leave central object and side drag controls usable", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1200, height: 850 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const scene = page.locator(".scene");
  await expect(scene.locator("canvas")).toHaveAttribute(
    "data-scene-ready",
    "true",
    { timeout: 20000 },
  );
  const box = (await scene.boundingBox())!;
  await page.mouse.move(65, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(235, box.y + box.height * 0.5, { steps: 4 });
  await page.mouse.up();
  await expect(scene).not.toHaveAttribute("data-creation", "0");
  await scene.focus();
  await page.keyboard.press("Home");
  const x = box.width / 2,
    y = box.y + box.height * 0.62;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y - 50, { steps: 4 });
  await expect(scene).toHaveAttribute("data-object-dragging", "true");
  await page.mouse.up();
  await expect(page.locator(".creation-panel")).toHaveCount(0);
  await expect(scene).toHaveAttribute("data-creation", "0");
  await page.mouse.click(x, y);
  await expect(page.locator(".creation-panel")).toBeVisible();
  expect(errors).toEqual([]);
});
