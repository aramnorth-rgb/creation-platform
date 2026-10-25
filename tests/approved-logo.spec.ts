import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

const originalHash =
  "07affe16a544709628bd482ceaab2af5eaf4753ab58975c2ade12c48ce7f2ac7";
test("V2 preserves approved assets and serves the responsive pastel header logo", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  const response = await request.get("/brand/nitorix-logo.png");
  expect(response.ok()).toBe(true);
  expect(
    createHash("sha256")
      .update(await response.body())
      .digest("hex"),
  ).toBe(originalHash);
  const pastel = await request.get("/brand/nitorix-logo-pastel.webp");
  expect(pastel.ok()).toBe(true);
  expect((await pastel.body()).length).toBeLessThan(200000);
  expect(
    createHash("sha256")
      .update(await pastel.body())
      .digest("hex"),
  ).toBe("c5371a36f2f3e33c391a5cfed0e61516c17b4260d74dd3eb956ecd161e38c887");
  const web = await request.get("/brand/nitorix-logo.webp");
  expect(
    createHash("sha256")
      .update(await web.body())
      .digest("hex"),
  ).toBe("f9c8b8f2fd2c46a048e414811da7d38169051477024b84edf413a73024ea84ac");
  expect((await web.body()).length).toBeLessThan(
    (await response.body()).length * 0.25,
  );
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
  expect(
    await page.evaluate(async () => {
      const load = async (src: string) => {
        const image = new Image();
        image.src = src;
        await image.decode();
        return image;
      };
      const [master, web] = await Promise.all([
        load("/brand/nitorix-logo.png"),
        load("/brand/nitorix-logo.webp"),
      ]);
      const a = document.createElement("canvas"),
        b = document.createElement("canvas");
      a.width = b.width = 1175;
      a.height = b.height = 439;
      const ac = a.getContext("2d")!,
        bc = b.getContext("2d")!;
      ac.drawImage(master, 438, 140, 1175, 439, 0, 0, 1175, 439);
      bc.drawImage(web, 0, 0);
      const source = ac.getImageData(0, 0, 1175, 439).data,
        output = bc.getImageData(0, 0, 1175, 439).data;
      return source.every((n, i) => n === output[i]);
    }),
  ).toBe(true);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/explore",
      "/create",
      "/community",
      "/manufacturers",
      "/studio",
    ]) {
      await page.goto(route);
      const logo = page.locator(".nx-header .nx-approved-logo");
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute(
        "src",
        "/brand/nitorix-logo-pastel.webp",
      );
      await expect(logo).not.toHaveAttribute("srcset", /.+/);
      const result = await logo.evaluate((img: HTMLImageElement) => {
        const b = img.getBoundingClientRect(),
          s = getComputedStyle(img);
        return {
          ratio: b.width / b.height,
          width: b.width,
          right: b.right,
          left: b.left,
          filter: s.filter,
          blend: s.mixBlendMode,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          fit: s.objectFit,
          transform: s.transform,
        };
      });
      expect(Math.abs(result.ratio - 1137 / 300)).toBeLessThan(0.002);
      expect(result.width).toBeGreaterThanOrEqual(175);
      expect(result.width).toBeLessThanOrEqual(230);
      expect(result.left).toBeCloseTo(width * 0.055, 0);
      expect(result.left).toBeGreaterThanOrEqual(0);
      expect(result.right).toBeLessThanOrEqual(width);
      expect(result.filter).toBe("none");
      expect(result.blend).toBe("darken");
      expect(result.naturalWidth).toBe(1137);
      expect(result.naturalHeight).toBe(300);
      expect(result.fit).toBe("contain");
      expect(result.transform).toBe("none");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const count =
        route === "/studio" ? 1 : route === "/manufacturers" ? 3 : 2;
      await expect(page.locator(".nx-approved-logo")).toHaveCount(count);
      if (route !== "/studio") {
        await expect(
          page.locator(".nx-footer .nx-approved-logo"),
        ).toHaveAttribute("src", "/brand/nitorix-logo.webp");
      }
    }
  }
  await page.goto("/exhibition");
  await expect(page.locator(".nx-approved-logo")).toHaveCount(0);
  await expect(page.locator("header .wordmark")).toContainText("NITORIX");
});
