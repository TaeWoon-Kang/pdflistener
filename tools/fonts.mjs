import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export const fontFiles = ["Pretendard-SemiBold.woff2", "OFL-Pretendard.txt"];

// Check the original font and its complete notice together before publishing.
export async function verifyFonts(directory) {
  const manifest = JSON.parse(
    await fs.readFile(path.join(directory, "provenance.json"), "utf8"),
  );
  if (
    manifest.license !== "OFL-1.1" ||
    !Array.isArray(manifest.files) ||
    manifest.files.length !== fontFiles.length ||
    fontFiles.some(
      (name) => !manifest.files.some((entry) => entry.file === name),
    )
  )
    throw new Error("Font manifest must include the font and its OFL notice");
  for (const entry of manifest.files) {
    const data = await fs.readFile(path.join(directory, entry.file));
    if (
      data.length !== entry.bytes ||
      createHash("sha256").update(data).digest("hex") !== entry.sha256
    )
      throw new Error(`Font integrity mismatch: ${entry.file}`);
  }
}
