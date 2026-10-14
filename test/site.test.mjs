import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import config from "../site.config.mjs";
import { build, root, validateConfig } from "../tools/build.mjs";
import { content } from "../src/content.mjs";
import { render } from "../src/template.mjs";
import { createPreviewServer } from "../tools/serve.mjs";
import { fontFiles, verifyFonts } from "../tools/fonts.mjs";
const out = await build();

test("static English/Korean pages keep all local resources within a Pages project subpath", async () => {
  for (const route of ["", "ko/", "licenses/", "ko/licenses/", "privacy/", "ko/privacy/"]) {
    const html = await fs.readFile(path.join(out, route, "index.html"), "utf8");
    assert.match(
      html,
      new RegExp(`<html lang="${route.startsWith("ko") ? "ko" : "en"}">`),
    );
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(html, /undefined|localhost|127\.0\.0\.1|\/Users\//);
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="ko"/);
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const url = new URL(href, `https://test.example/pdflistener/${route}`);
      if (url.protocol === "mailto:") {
        assert.equal(href, `mailto:${config.contactEmail}`);
        continue;
      }
      if (url.origin !== "https://test.example") {
        assert.equal(url.protocol, "https:");
        continue;
      }
      assert.ok(url.pathname.startsWith("/pdflistener/"), href);
      let file = path.join(out, url.pathname.slice("/pdflistener/".length));
      if (url.pathname.endsWith("/")) file = path.join(file, "index.html");
      const data = await fs.readFile(file);
      if (url.hash)
        assert.ok(
          data.toString().includes(`id="${url.hash.slice(1)}"`),
          `${route}: ${href}`,
        );
    }
  }
});

test("app installation links are restricted to the official App Store listing", () => {
  assert.doesNotThrow(() => validateConfig(config));
  for (const url of [
    "https://github.com/example/repo/releases/download/v1/app.zip",
    "https://apps.apple.com.evil.example/app/id6817984584",
    "https://apps.apple.com/app/id123456789",
    "javascript:alert(1)",
    "https://user:secret@apps.apple.com/app/id6817984584",
  ]) {
    const invalid = structuredClone(config);
    invalid.release.appStoreUrl = url;
    assert.throws(() => validateConfig(invalid));
  }
  const legacy = structuredClone(config);
  legacy.release.downloadUrl = "https://example.org/app.zip";
  assert.throws(() => validateConfig(legacy), /Direct app downloads/);
  const invalidSource = structuredClone(config);
  invalidSource.release.legacySourceUrl = "http://example.org/source.zip";
  assert.throws(() => validateConfig(invalidSource), /HTTPS/);
});

test("both languages have complete content and the demo uses valid original PCM audio", async () => {
  assert.deepEqual(
    Object.keys(content.en).sort(),
    Object.keys(content.ko).sort(),
  );
  const wav = await fs.readFile(path.join(root, "assets/sample.wav"));
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt16LE(20), 1);
  assert.equal(wav.readUInt16LE(34), 16);
  const duration = wav.readUInt32LE(40) / wav.readUInt32LE(28);
  const sample = JSON.parse(
    await fs.readFile(path.join(root, "assets/sample.json"), "utf8"),
  );
  assert.ok(duration > 10 && duration < 60);
  assert.ok(Math.abs(duration - sample.duration) < 0.01);
  let end = 0;
  for (const segment of sample.segments) {
    assert.equal(segment.start, end);
    assert.ok(segment.end > segment.start);
    end = segment.end;
  }
  assert.equal(end, sample.duration);
});

test("both languages direct installs to App Store and keep historical source separate", async () => {
  const sample = JSON.parse(await fs.readFile(path.join(root, "assets/sample.json"), "utf8"));
  for (const lang of ["en", "ko"]) {
    const home = render(lang, false, config, sample);
    const legal = render(lang, true, config, sample);
    for (const html of [home, legal]) {
      assert.ok(html.includes(`href="${config.release.appStoreUrl}"`));
      assert.doesNotMatch(html, /arm64\.zip|SHA-256:|Developer ID|notarized|공증|응용 프로그램 폴더/);
      for (const [, href, label] of html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs)) {
        if (label.includes(content[lang].download)) assert.equal(href, config.release.appStoreUrl);
      }
    }
    assert.ok(home.includes(content[lang].faqs.at(-1)[1]));
    assert.ok(!home.includes(config.release.legacySourceUrl));
    assert.ok(legal.includes(`href="${config.release.legacySourceUrl}"`));
    assert.ok(legal.includes(content[lang].legacySources));
    assert.ok(legal.includes(content[lang].legalSources));
    assert.ok(legal.includes(`href="${config.release.legacyTermsUrl}"`));
  }
});

test("deployment includes only public site files and stays below the 3MB asset budget", async () => {
  const allowed = new Set([
    "index.html",
    "ko/index.html",
    "licenses/index.html",
    "ko/licenses/index.html",
    "privacy/index.html",
    "ko/privacy/index.html",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    ...[...fontFiles, "provenance.json"].map((x) => "assets/fonts/" + x),
    ...[
      "icon.png",
      "app-preview.png",
      "share.png",
      "sample.wav",
      "sample.json",
      "site.css",
      "site.js",
    ].map((x) => "assets/" + x),
  ]);
  let bytes = 0;
  for (const name of await fs.readdir(out, { recursive: true })) {
    const stat = await fs.lstat(path.join(out, name));
    assert.ok(!stat.isSymbolicLink());
    if (stat.isFile()) {
      assert.ok(allowed.has(name), name);
      bytes += stat.size;
    }
  }
  assert.ok(bytes < 3 * 1024 * 1024, `Site is ${bytes} bytes`);
});

test("font redistribution preserves original bytes and notices and rejects missing or changed files", async (t) => {
  const fonts = path.join(out, "assets/fonts");
  await verifyFonts(fonts);
  const notice = await fs.readFile(
    path.join(fonts, "OFL-Pretendard.txt"),
    "utf8",
  );
  for (const name of [
    "Kil Hyung-jin",
    "Adobe",
    "Inter Project Authors",
    "M+ FONTS Project Authors",
    "SIL OPEN FONT LICENSE Version 1.1",
  ])
    assert.ok(notice.includes(name), name);
  for (const lang of ["en", "ko"]) {
    const html = await fs.readFile(
      path.join(
        out,
        lang === "ko" ? "ko/licenses/index.html" : "licenses/index.html",
      ),
      "utf8",
    );
    assert.ok(html.includes(content[lang].legalFonts));
    assert.match(html, /href="[^"]*assets\/fonts\/OFL-Pretendard.txt"/);
  }
  const copy = await fs.mkdtemp(path.join(os.tmpdir(), "pdflistener-fonts-"));
  t.after(() => fs.rm(copy, { recursive: true, force: true }));
  await fs.cp(fonts, copy, { recursive: true });
  for (const name of fontFiles) {
    const original = await fs.readFile(path.join(copy, name));
    await fs.writeFile(path.join(copy, name), original.subarray(1));
    await assert.rejects(verifyFonts(copy), /Font integrity mismatch/);
    await fs.rm(path.join(copy, name));
    await assert.rejects(verifyFonts(copy), { code: "ENOENT" });
    await fs.writeFile(path.join(copy, name), original);
  }
  const manifest = JSON.parse(
    await fs.readFile(path.join(copy, "provenance.json"), "utf8"),
  );
  manifest.files.pop();
  await fs.writeFile(
    path.join(copy, "provenance.json"),
    JSON.stringify(manifest),
  );
  await assert.rejects(verifyFonts(copy), /must include/);
});

test("preview server supports audio ranges and cannot expose project source", async (t) => {
  const server = createPreviewServer({ prefix: "/pdflistener/" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const fontResponse = await fetch(
    base + "/pdflistener/assets/fonts/Pretendard-SemiBold.woff2",
  );
  assert.equal(fontResponse.status, 200);
  assert.equal(fontResponse.headers.get("content-type"), "font/woff2");
  const response = await fetch(base + "/pdflistener/assets/sample.wav", {
    headers: { Range: "bytes=0-43" },
  });
  assert.equal(response.status, 206);
  assert.equal((await response.arrayBuffer()).byteLength, 44);
  assert.equal(
    (
      await fetch(base + "/pdflistener/assets/sample.wav", {
        headers: { Range: "bytes=999999999-" },
      })
    ).status,
    416,
  );
  for (const p of [
    "/site.config.mjs",
    "/pdflistener/../package.json",
    "/pdflistener/%2e%2e%2fpackage.json",
    "/pdflistener/.git/config",
  ]) {
    assert.ok([403, 404].includes((await fetch(base + p)).status), p);
  }
});
