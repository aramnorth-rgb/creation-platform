import { expect, test } from "@playwright/test";

test("gallery selection, navigation focus, FAQs and account notice", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Extraordinary.",
  );
  await page.getByRole("button", { name: /The Ember Light/ }).click();
  await expect(
    page.getByRole("heading", { name: "The Ember Light" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /The Ember Light/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Common Ground Works")).toBeVisible();
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (const name of [
    "Customise",
    "Assemble",
    "Engineer",
    "How It Works",
    "FAQ",
    "Account",
  ]) {
    await expect(
      dialog.getByRole("link", { name: new RegExp(name) }),
    ).toBeVisible();
  }
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: /Account/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close navigation menu" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: /Account/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "Accounts are not available",
  );
  await page.getByText("Can I buy these creations?").click();
  await expect(
    page.getByText(/No purchases or real orders are supported/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile WebGL fallback and reduced-motion preference", async ({
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
    page.getByText("Still-life preview · 3D unavailable"),
  ).toBeVisible();
  await page.getByRole("button", { name: /The Continuum Form/ }).click();
  await expect(
    page.getByRole("heading", { name: "The Continuum Form" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close navigation menu" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("WebGL renders and motion can be paused", async ({ page }) => {
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pause rotation" });
  await expect(pause).toBeVisible();
  await expect(page.locator(".scene canvas")).toBeVisible();
  await pause.click();
  await expect(
    page.getByRole("button", { name: "Resume rotation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", {
      name: "Rotation disabled by reduced-motion preference",
    }),
  ).toBeDisabled();
});
