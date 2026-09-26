import { expect, test } from "@playwright/test";

test("sharing metadata serves an actual public PNG without routing a request", async ({ page, request }, testInfo) => {
  await page.goto("/");
  const og = page.locator('meta[property="og:image"]').first();
  const twitter = page.locator('meta[name="twitter:image"]').first();
  await expect(og).toHaveAttribute("content", /opengraph-image/);
  await expect(twitter).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /unofficial/i);
  for (const meta of [og, twitter]) {
    const url = new URL((await meta.getAttribute("content"))!);
    const response = await request.get(url.pathname + url.search);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    const bytes = await response.body();
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
    await testInfo.attach("generated-og.png", { body: bytes, contentType: "image/png" });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath("router-overview.png"), animations: "disabled" });
  await testInfo.attach("provenance.json", {
    body: Buffer.from(JSON.stringify({ commit: process.env.GITHUB_SHA ?? "local-unrecorded", route: "/", viewport: page.viewportSize(), mode: "no-key demo; no route request submitted", environment: "local Playwright server, not production" }, null, 2)),
    contentType: "application/json",
  });
});
