import { expect, test } from "@playwright/test";

async function fallback(page: import("@playwright/test").Page) {
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

test("shared pastel planes remain decorative, use restrained scroll transforms and follow desktop borders", async ({
  page,
}) => {
  await fallback(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const depth = page.locator(".nx-atmosphere-depth");
  await expect(depth).toHaveAttribute("aria-hidden", "true");
  await expect(depth).toHaveCSS("pointer-events", "none");
  const supported = await page.evaluate(() =>
    CSS.supports("animation-timeline: scroll()"),
  );
  const middle = page.locator(".nx-atmosphere-middle");
  const before = await middle.evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  if (supported) {
    const movement = await middle.evaluate(
      (e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).m42,
    );
    expect(movement).toBeLessThan(-20);
    expect(movement).toBeGreaterThanOrEqual(-38.1);
    expect(
      await middle.evaluate((e) => getComputedStyle(e).transform),
    ).not.toBe(before);
  }
  await page.evaluate(() => scrollTo(0, 0));
  const header = page.locator(".nx-header");
  await header.hover({ position: { x: 15, y: 15 } });
  await expect(header).toHaveAttribute("data-pastel-hover", "true");
  await expect
    .poll(() => header.evaluate((e) => getComputedStyle(e, "::after").opacity))
    .toBe("0.65");
  await expect(header).toHaveCSS("--nx-cursor-x", /px/);
  await page.mouse.move(500, 230);
  await expect(header).not.toHaveAttribute("data-pastel-hover");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation menu" }),
  ).toBeFocused();
  for (const route of ["/explore", "/community"]) {
    await page.goto(route);
    await expect(page.locator(".nx-atmosphere-depth")).toHaveCount(1);
  }
  await page.goto("/explore");
  await page.getByRole("button", { name: "Workspace", exact: true }).click();
  await expect(page.locator(".nx-product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Explore Contour desk organiser" })
    .click();
  await expect(
    page.getByRole("link", { name: "Personalise in Create" }),
  ).toBeVisible();
});

test("reduced motion and touch remain static; workshops and Studio are isolated", async ({
  page,
  browser,
}) => {
  await fallback(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".nx-atmosphere-middle")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.locator(".nx-header").hover();
  await expect(page.locator("[data-pastel-hover]")).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 700));
  await expect(page.locator(".nx-atmosphere-middle")).toHaveCSS(
    "transform",
    "none",
  );
  for (const route of [
    "/create",
    "/studio",
    "/configure",
    "/exhibition",
    "/manufacturers",
  ]) {
    await page.goto(route);
    await expect(page.locator(".nx-atmosphere-depth")).toHaveCount(0);
  }
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 375, height: 812 },
  });
  const mobile = await context.newPage();
  await fallback(mobile);
  for (const route of ["/", "/explore", "/community"]) {
    await mobile.goto(route);
    await mobile.locator(".nx-header").dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: 100,
      clientY: 30,
    });
    await expect(mobile.locator("[data-pastel-hover]")).toHaveCount(0);
    expect(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await context.close();
});
