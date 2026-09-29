// Export an original HTML composition as a social preview; not part of the build.
import fs from "node:fs/promises";
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
const asset = (name) =>
  fileURLToPath(new URL("../assets/" + name, import.meta.url));
const icon = (await fs.readFile(asset("icon.png"))).toString("base64");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<html><body style="margin:0;background:#f7f5f0;color:#272d27;font-family:Georgia,serif"><main style="padding:64px 76px"><div style="display:flex;align-items:center;gap:16px;font:600 24px -apple-system,sans-serif"><img src="data:image/png;base64,${icon}" width="56" height="56" style="border-radius:14px">PDF Listener <span style="font-size:16px;font-weight:400;color:#62665d">/ Mac</span></div><h1 style="font-size:90px;line-height:1.08;letter-spacing:-4px;font-weight:400;margin:48px 0 24px">Give your papers<br><em style="color:#805d3e">a voice.</em></h1><p style="font:22px -apple-system,sans-serif;color:#62665d">English research papers. Local speech. A little space to think.</p><div style="border-top:1px solid #d8d8ce;margin-top:38px;padding-top:20px;font:14px -apple-system,sans-serif;letter-spacing:2px">APPLE SILICON · ENGLISH & KOREAN INTERFACE</div></main></body></html>`,
  );
  await page.screenshot({ path: asset("share.png") });
} finally {
  await browser.close();
}
