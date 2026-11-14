/**
 * Génère public/images/og-default.png (1200x630) — image Open Graph du site.
 * Usage : node scripts/generate-og.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="rgba(120,170,255,0.10)"/>
    </pattern>
    <radialGradient id="glow1" cx="20%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="textgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#050B14"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="rgba(120,170,255,0.18)" stroke-width="2"/>

  <!-- terminal hint -->
  <rect x="90" y="110" width="330" height="54" rx="12" fill="#0A1526" stroke="rgba(120,170,255,0.25)"/>
  <circle cx="118" cy="137" r="6" fill="#F87171" opacity="0.7"/>
  <circle cx="138" cy="137" r="6" fill="#FBBF24" opacity="0.7"/>
  <circle cx="158" cy="137" r="6" fill="#34D399" opacity="0.7"/>
  <text x="185" y="143" font-family="monospace" font-size="18" fill="#93A7C4">grace@noc: ~</text>

  <text x="90" y="255" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#E8EFFA" letter-spacing="4">INGENIEUR EN RESEAUX ET SYSTEMES INFORMATIQUES</text>

  <text x="90" y="330" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="64" fill="#E8EFFA">Grace a&#768; Dieu MOLEMBE</text>

  <text x="90" y="395" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="34" fill="url(#textgrad)">Network &amp; Systems Engineer</text>

  <text x="90" y="455" font-family="monospace" font-size="21" fill="#93A7C4">Infrastructure Automation · Linux · DevSecOps · Cybersecurity</text>

  <rect x="90" y="510" width="8" height="8" fill="#34D399"/>
  <text x="112" y="520" font-family="monospace" font-size="18" fill="#34D399">systems operational — portfolio engineering</text>
</svg>`;

mkdirSync(join(root, "public", "images"), { recursive: true });

await sharp(Buffer.from(svg)).png().toFile(join(root, "public", "images", "og-default.png"));
console.log("og-default.png généré");
