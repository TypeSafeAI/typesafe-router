import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("sharing PNG and demo capture do not submit classification requests", async ({ page, request }, testInfo) => {
  const blockedEvaluations: string[] = [];
  // The app legitimately reads configuration with GET. Never allow a capture
  // regression to submit an evaluation, even if a server key were configured.
  await page.route("**/api/route", async (route) => {
    const method = route.request().method();
    if (method !== "GET" && method !== "HEAD") {
      blockedEvaluations.push(method);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  const configuration = page.waitForResponse((response) =>
    new URL(response.url()).pathname === "/api/route" && response.request().method() === "GET"
  );
  await page.goto("/");
  const status = await configuration;
  expect(status.status()).toBe(200);
  expect(await status.json()).toMatchObject({ live: false });
  await expect(page.getByRole("status").filter({ hasText: "Demo mode" })).toBeVisible();
  const fixture = "Explain a TypeScript type error in a synthetic example.";
  await page.getByRole("textbox", { name: "User input", exact: true }).fill(fixture);

  const og = page.locator('meta[property="og:image"]').first();
  const twitter = page.locator('meta[name="twitter:image"]').first();
  await expect(og).toHaveAttribute("content", /opengraph-image/);
  await expect(twitter).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /unofficial/i);
  for (const [name, meta] of [["og", og], ["twitter", twitter]] as const) {
    const url = new URL((await meta.getAttribute("content"))!);
    expect(url.origin).toBe("https://route.jev.works");
    // Assert the public origin above, but fetch the image from this tested build.
    const response = await request.get(url.pathname + url.search);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const bytes = await response.body();
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
    const path = testInfo.outputPath(`generated-${name}.png`);
    await writeFile(path, bytes);
    await testInfo.attach(name, { path, contentType: "image/png" });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: testInfo.outputPath("router-desktop.png"), animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("router-mobile.png"), animations: "disabled" });
  expect(blockedEvaluations).toEqual([]);
  const provenance = testInfo.outputPath("provenance.json");
  await writeFile(provenance, JSON.stringify({
    commit: process.env.GITHUB_SHA ?? "local-unrecorded", route: "/", fixture,
    desktop: { width: 1440, height: 960 }, mobile: { width: 390, height: 844 },
    mode: "verified no-key demo; configuration GET allowed; evaluation methods blocked",
    evaluationAttempts: blockedEvaluations.length,
    environment: "local Playwright server, not production"
  }, null, 2));
  await testInfo.attach("capture provenance", { path: provenance, contentType: "application/json" });
});
