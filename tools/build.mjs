import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../site.config.mjs";
import { render } from "../src/template.mjs";
export const root = fileURLToPath(new URL("../", import.meta.url));
export function validateConfig(value) {
  const https = (value) => {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password)
      throw new Error("Use public HTTPS URLs without credentials");
  };
  https(value.url);
  https(value.repository);
  if (new URL(value.url).search || new URL(value.url).hash)
    throw new Error("Site URL must not include a query or fragment");
  if (!value.url.endsWith("/")) throw new Error("Site URL must end with /");
  const r = value.release;
  if (r.publicReady) {
    if (
      ![r.developerIDSigned, r.notarized, r.licenseReviewComplete].every(
        (x) => x === true,
      )
    )
      throw new Error(
        "Finish signing, notarization and license verification before enabling the public download",
      );
    for (const key of ["downloadUrl", "sourceUrl", "termsUrl"]) https(r[key]);
    if (!/^[a-f0-9]{64}$/.test(r.sha256))
      throw new Error("Provide the verified download SHA-256");
  } else if (r.downloadUrl)
    throw new Error(
      "Do not configure a public download URL while release verification is pending",
    );
}
export async function build() {
  validateConfig(config);
  const out = path.join(root, "dist");
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });
  const sample = JSON.parse(
    await fs.readFile(path.join(root, "assets/sample.json"), "utf8"),
  );
  // An explicit allowlist keeps repository files, credentials and app binaries out.
  await fs.mkdir(path.join(out, "assets"), { recursive: true });
  for (const name of [
    "icon.png",
    "app-preview.png",
    "share.png",
    "sample.wav",
    "sample.json",
  ]) {
    await fs.copyFile(
      path.join(root, "assets", name),
      path.join(out, "assets", name),
    );
  }
  for (const name of ["site.css", "site.js"])
    await fs.copyFile(
      path.join(root, "src", name),
      path.join(out, "assets", name),
    );
  const routes = [
    ["en", false, ""],
    ["ko", false, "ko"],
    ["en", true, "licenses"],
    ["ko", true, "ko/licenses"],
  ];
  for (const [lang, legal, route] of routes) {
    await fs.mkdir(path.join(out, route), { recursive: true });
    await fs.writeFile(
      path.join(out, route, "index.html"),
      render(lang, legal, config, sample),
    );
  }
  await fs.writeFile(path.join(out, ".nojekyll"), "");
  await fs.writeFile(
    path.join(out, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", config.url)}\n`,
  );
  await fs.writeFile(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([, , route]) => `<url><loc>${new URL(route ? route + "/" : "", config.url)}</loc></url>`).join("")}</urlset>\n`,
  );
  return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(`Built ${await build()}`);
