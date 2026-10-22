import { expect, test } from "@playwright/test";

test("exhibition cycles every ten seconds, manual selection resets the clock, pause stops cycling", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Pause exhibition" }),
  ).toBeEnabled();
  await expect(page.locator(".scene canvas")).toBeVisible();
  await page.clock.fastForward(10010);
  await expect(page.getByRole("heading", { name: "Glide / 02" })).toBeVisible();
  await page.getByRole("button", { name: "Feature Halo / 04" }).click();
  await expect(page.getByRole("heading", { name: "Halo / 04" })).toBeVisible();
  await expect(page.getByText("Nia Okafor")).toBeVisible();
  await page.clock.fastForward(9000);
  await expect(page.getByRole("heading", { name: "Halo / 04" })).toBeVisible();
  await page.clock.fastForward(1010);
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeVisible();
  await page.getByRole("button", { name: "Pause exhibition" }).click();
  await page.clock.fastForward(30000);
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Resume exhibition" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
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
    "Extraordinary",
  );
  expect(errors).toEqual([]);
});

test("accessible menu, local community interactions and fictional disclosures", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: /How it works/ }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close navigation menu" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Assemble" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build your possibilities",
  );
  await page.getByRole("button", { name: /Back to exhibition/ }).click();
  await page.getByRole("button", { name: /Appreciate this idea/ }).click();
  await expect(
    page.getByRole("button", { name: /Appreciated/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("textbox", { name: /Add to the conversation/ })
    .fill("A beautiful concept for a slower adventure.");
  await page.getByRole("button", { name: "Add local comment" }).click();
  await expect(
    page.getByText("A beautiful concept for a slower adventure."),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("not published");
  await page.getByRole("button", { name: "Feature Glide / 02" }).click();
  await expect(
    page.getByText("A beautiful concept for a slower adventure."),
  ).not.toBeVisible();
  await page.getByText("Is this a real marketplace?").click();
  await expect(page.getByText(/There are no real customers/)).toBeVisible();
});

test("mobile no-WebGL fallback, reduced motion and all workspace controls", async ({
  page,
}) => {
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
  await page.goto("/");
  await expect(
    page.getByText("Illustrated preview · WebGL unavailable"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Motion disabled by reduced-motion preference",
    }),
  ).toBeDisabled();
  await page.clock.install();
  await page.clock.fastForward(30000);
  await expect(page.getByRole("heading", { name: "Atlas / 01" })).toBeVisible();
  await page.getByRole("button", { name: "Feature Fold / 03" }).click();
  await expect(page.getByRole("heading", { name: "Fold / 03" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
  await page.getByRole("slider", { name: "Body length" }).fill("8");
  await expect(page.getByRole("img", { name: /8 metres/ })).toBeVisible();
  expect(
    await page.locator(".still-model g").first().getAttribute("transform"),
  ).toContain("scale(1.176");
});
