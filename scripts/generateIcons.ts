/**
 * Icon generator for the v0.1 PWA install. Renders an SVG with the
 * "KC" wordmark at the three sizes / variants the manifest needs and
 * emits PNGs to /public/icons/.
 *
 * Run via:  npm run generate-icons
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '..', 'public', 'icons');

// Square icon SVG. The maskable variant uses a "safe zone" of ~80% so
// platforms that crop the icon to a circle still show the wordmark.
function iconSvg(size: number, safeZonePct: number): string {
  const bg = '#1a1a1a';
  const fg = '#f0c040';
  // The text is centred. Font size scales with the safe zone.
  const safeSize = size * safeZonePct;
  const fontSize = Math.round(safeSize * 0.5);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <g>
    <text
      x="50%"
      y="50%"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="700"
      font-size="${fontSize}"
      fill="${fg}"
    >KC</text>
  </g>
</svg>`;
}

interface IconSpec {
  filename: string;
  size: number;
  safeZonePct: number;
}

const SPECS: IconSpec[] = [
  { filename: 'icon-192.png', size: 192, safeZonePct: 1.0 },
  { filename: 'icon-512.png', size: 512, safeZonePct: 1.0 },
  { filename: 'icon-512-maskable.png', size: 512, safeZonePct: 0.8 },
];

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const spec of SPECS) {
    const svg = Buffer.from(iconSvg(spec.size, spec.safeZonePct));
    const out = path.join(OUT_DIR, spec.filename);
    await sharp(svg).png().toFile(out);
    console.log(`✓ ${spec.filename} (${spec.size}x${spec.size})`);
  }
  // Also emit the apple-touch-icon at 180 — what iOS Safari prefers.
  const appleSvg = Buffer.from(iconSvg(180, 1.0));
  await sharp(appleSvg)
    .png()
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // And a 32x32 favicon so the browser tab doesn't 404.
  const favSvg = Buffer.from(iconSvg(32, 1.0));
  await sharp(favSvg).png().toFile(path.join(OUT_DIR, 'favicon-32.png'));
  console.log('✓ favicon-32.png (32x32)');

  // Save the source SVG too so future tweaks don't need this script's
  // exact size/colour values.
  await writeFile(path.join(OUT_DIR, 'icon-source.svg'), iconSvg(512, 1.0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
