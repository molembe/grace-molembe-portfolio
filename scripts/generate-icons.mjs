/**
 * Génère les icônes PNG du projet (PWA + Apple touch icon) à partir de
 * src/app/icon.svg — source de vérité unique de l'identité visuelle.
 *
 * Usage : bun scripts/generate-icons.mjs
 */
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "src", "app", "icon.svg");
const OUT_DIR = path.join(ROOT, "public", "icons");
const APP_DIR = path.join(ROOT, "src", "app");

const TARGETS = [
  { file: path.join(OUT_DIR, "icon-192.png"), size: 192 },
  { file: path.join(OUT_DIR, "icon-512.png"), size: 512 },
  { file: path.join(APP_DIR, "apple-icon.png"), size: 180 },
];

await mkdir(OUT_DIR, { recursive: true });
const svg = readFileSync(SOURCE, "utf8");

for (const { file, size } of TARGETS) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`✓ ${path.relative(ROOT, file)} (${size}×${size})`);
}
