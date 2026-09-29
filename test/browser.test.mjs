import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { build, root } from "../tools/build.mjs";
import { createPreviewServer } from "../tools/serve.mjs";
const require = createRequire(import.meta.url);
await build();

test(
  "English/Korean site works on desktop and mobile under a GitHub Pages subpath",
  { timeout: 90000 },
  async (t) => {
    const server = createPreviewServer({ prefix: "/pdflistener/" });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}/pdflistener/`;
    const browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH,
      headless: true,
    });
    t.after(async () => {
      await browser.close();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
      reducedMotion: "reduce",
    });
    // Test instrumentation runs before navigation; the site's CSP stays enabled.
    await page.addInitScript({ path: require.resolve("axe-core/axe.min.js") });
    const errors = [],
      failed = [],
      external = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(r.url());
    });
    page.on("request", (r) => {
      if (!r.url().startsWith(base)) external.push(r.url());
    });
    const folder = path.join(root, "test-results");
    await fs.mkdir(folder, { recursive: true });
    for (const [lang, route] of [
      ["en", ""],
      ["ko", "ko/"],
    ]) {
      await page.goto(base + route);
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      const audit = [];
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${lang} overflows at ${width}`,
        );
        if (width === 390 || width === 1440) {
          // Paint the lazy screenshot and wait for fonts before taking a full-page capture.
          await page.locator(".app-shot").scrollIntoViewIfNeeded();
          await page.locator(".app-shot img").evaluate((img) => img.decode());
          await page.evaluate(async () => {
            await document.fonts.ready;
            scrollTo(0, 0);
            await new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            );
          });
          await page.screenshot({
            path: path.join(folder, `${lang}-${width}.png`),
            fullPage: true,
          });
        }
        if (width === 390 || width === 1440) {
          const result = await page.evaluate(() =>
            axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            }),
          );
          audit.push({
            width,
            violations: result.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => n.target),
            })),
          });
        }
      }
      assert.ok(
        audit.every((r) => r.violations.length === 0),
        JSON.stringify(audit, null, 2),
      );
      const mode = page.locator("#paper-mode");
      await mode.click();
      assert.equal(await mode.getAttribute("aria-pressed"), "false");
      assert.equal(
        await page.locator("[data-excluded]").first().isVisible(),
        true,
      );
      await mode.click();
      assert.equal(
        await page.locator("[data-excluded]").first().isVisible(),
        false,
      );
      await page.locator("[data-listen]").click();
      await page.waitForFunction(
        () => document.querySelector("audio").currentTime > 0.15,
      );
      await page.locator("#play-sample").click();
      assert.equal(await page.locator("audio").evaluate((a) => a.paused), true);
      await page.locator(".sentence").nth(2).click();
      await page.waitForFunction(
        () =>
          document.querySelector("audio").currentTime >=
          Number(document.querySelectorAll(".sentence")[2].dataset.start),
      );
      await page.locator("#sample-speed").selectOption("1.5");
      assert.equal(
        await page.locator("audio").evaluate((a) => a.playbackRate),
        1.5,
      );
      await page.locator("#play-sample").click();
      await page.locator("details").nth(2).locator("summary").click();
      assert.equal(
        await page.locator("details").nth(2).getAttribute("open"),
        "",
      );
      await page
        .locator(".languages a")
        .filter({ hasText: lang === "en" ? "한국어" : "EN" })
        .click();
      assert.equal(
        await page.locator("html").getAttribute("lang"),
        lang === "en" ? "ko" : "en",
      );
      await page.goto(base + route + "licenses/");
      await page.setViewportSize({ width: 320, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const legalAudit = await page.evaluate(() =>
        axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        }),
      );
      assert.deepEqual(
        legalAudit.violations.map((v) => v.id),
        [],
      );
    }
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".skip-link")
        .evaluate((a) => a === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.ok(page.url().endsWith("#main"));
    const noJS = await browser.newPage({ javaScriptEnabled: false });
    await noJS.goto(base + "ko/");
    assert.match(await noJS.locator("h1").innerText(), /귀 기울이는/);
    await noJS.locator(".languages a[lang=en]").click();
    assert.equal(await noJS.locator("html").getAttribute("lang"), "en");
    await noJS.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    assert.deepEqual(external, []);
    await fs.writeFile(
      path.join(folder, "verification.json"),
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          widths: [320, 390, 768, 1024, 1440],
          languages: ["en", "ko"],
          playback: true,
          seeking: true,
          keyboard: true,
          noJavaScript: true,
          axeViolations: 0,
          consoleErrors: errors,
          failedRequests: failed,
          externalRequests: external,
        },
        null,
        2,
      ) + "\n",
    );
  },
);
