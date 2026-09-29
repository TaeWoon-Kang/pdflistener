import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import config from "../site.config.mjs";
import { build, root, validateConfig } from "../tools/build.mjs";
import { content } from "../src/content.mjs";
import { render } from "../src/template.mjs";
import { createPreviewServer } from "../tools/serve.mjs";
const out = await build();

test("static English/Korean pages keep all local resources within a Pages project subpath", async () => {
  for (const route of ["", "ko/", "licenses/", "ko/licenses/"]) {
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

test("public download cannot be advertised before release verification and valid source/terms URLs", () => {
  assert.doesNotThrow(() => validateConfig(config));
  const ready = structuredClone(config);
  ready.release.publicReady = true;
  assert.throws(() => validateConfig(ready), /verification/);
  Object.assign(ready.release, {
    developerIDSigned: true,
    notarized: true,
    licenseReviewComplete: true,
  });
  assert.throws(() => validateConfig(ready));
  Object.assign(ready.release, {
    downloadUrl: "https://example.org/app.zip",
    sourceUrl: "https://example.org/source.zip",
    termsUrl: "https://example.org/terms",
    sha256: "a".repeat(64),
  });
  assert.doesNotThrow(() => validateConfig(ready));
  ready.release.downloadUrl = "javascript:alert(1)";
  assert.throws(() => validateConfig(ready), /HTTPS/);
  const pending = structuredClone(config);
  pending.release.downloadUrl = "https://example.org/app.zip";
  assert.throws(() => validateConfig(pending), /pending/);
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

test("publishing updates download, FAQ and legal copy in both languages", async () => {
  const ready = structuredClone(config);
  Object.assign(ready.release, {
    publicReady: true,
    developerIDSigned: true,
    notarized: true,
    licenseReviewComplete: true,
    downloadUrl: "https://example.org/app.zip",
    sourceUrl: "https://example.org/source.zip",
    termsUrl: "https://example.org/terms",
    sha256: "a".repeat(64),
  });
  const sample = JSON.parse(
    await fs.readFile(path.join(root, "assets/sample.json"), "utf8"),
  );
  for (const lang of ["en", "ko"]) {
    const home = render(lang, false, ready, sample),
      legal = render(lang, true, ready, sample);
    for (const html of [home, legal]) {
      assert.ok(html.includes('href="https://example.org/app.zip"'));
      assert.ok(html.includes('href="https://example.org/source.zip"'));
      assert.ok(html.includes('href="https://example.org/terms"'));
      assert.ok(!html.includes(content[lang].pending));
      assert.ok(!html.includes(content[lang].releaseDetail));
    }
    assert.ok(home.includes(content[lang].publishedFAQ));
    assert.ok(!home.includes(content[lang].faqs.at(-1)[1]));
    assert.ok(legal.includes(content[lang].publishedSources));
    assert.ok(!legal.includes(content[lang].legalSources));
    assert.ok(!legal.includes(content[lang].legalStatus));
  }
});

test("deployment includes only public site files and stays below the 3MB asset budget", async () => {
  const allowed = new Set([
    "index.html",
    "ko/index.html",
    "licenses/index.html",
    "ko/licenses/index.html",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
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

test("preview server supports audio ranges and cannot expose project source", async (t) => {
  const server = createPreviewServer({ prefix: "/pdflistener/" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
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
