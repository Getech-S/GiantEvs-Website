/**
 * Builds public/media/texture-lattice.png from the design's background layer.
 *
 *   node scripts/build-texture-mask.mjs path/to/Layer.png
 *
 * The source PNG carries its artwork entirely in an 0..5 alpha channel (the RGB
 * is a flat #009966), which renders as a ~2% tint over white. Two things happen
 * here:
 *
 * 1. The alpha is INVERTED and written as a MASK rather than a picture.
 *    Inverted because of how the source reads: its alpha-5 regions are the
 *    tinted *field* and its alpha-0 regions are the untinted *lines*, which on
 *    the original white page render as white lines over a faint green field.
 *    The lines are therefore the lighter element, so on a black section they
 *    are what carries the light — hence mask = 255 - alpha.
 *
 *    Storing it as a mask (rather than a picture) also means one asset can be
 *    tinted per section by colouring the element underneath it.
 *
 * 2. The result is stacked with a vertically mirrored copy. The source is a
 *    one-off composition with no repeat period (autocorrelation finds no
 *    minimum, so it cannot tile as-is); mirroring makes the doubled tile's top
 *    and bottom edges identical, so `mask-repeat: repeat` never shows a seam
 *    however tall a section grows.
 *
 * Requires: sharp (already a Next.js dependency).
 */
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'media', 'texture-lattice.png');
const src = process.argv[2];

if (!src) {
  console.error('usage: node scripts/build-texture-mask.mjs path/to/Layer.png');
  process.exit(1);
}

const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const alphas = new Set();
for (let i = channels - 1; i < data.length; i += channels) alphas.add(data[i]);
const peak = Math.max(...alphas);
console.log(`source: ${width}x${height}, alpha values present: ${[...alphas].sort((a, b) => a - b).join(', ')}`);

// Grey+alpha buffer: white everywhere, alpha carrying the normalised pattern.
const mask = Buffer.alloc(width * height * 2);
for (let p = 0; p < width * height; p++) {
  mask[p * 2] = 255;
  mask[p * 2 + 1] = 255 - Math.round((data[p * channels + channels - 1] / peak) * 255);
}

const top = await sharp(mask, { raw: { width, height, channels: 2 } }).png().toBuffer();
const mirrored = await sharp(top).flip().toBuffer();

await sharp({
  create: { width, height: height * 2, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
})
  .composite([
    { input: top, top: 0, left: 0 },
    { input: mirrored, top: height, left: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`wrote ${OUT} (${width}x${height * 2}, ${statSync(OUT).size.toLocaleString()} bytes)`);
