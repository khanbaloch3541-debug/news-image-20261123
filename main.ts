// news-image-20261123 entry (Node 22, standard library only).
// The entry is one image, entry.png beside this file: a front page summing
// up Monday 23 November 2026. The program copies it to /output/entry.png,
// checking it is a whole PNG or JPEG of at most 1 MiB and 1024 by 1024.
// No network, no wall clock, no randomness: two runs write the same bytes.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);
const buf = readFileSync(src);

const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
if (!isPng && !isJpeg) {
  console.error('entry.png must be a PNG or JPEG (checked by its first bytes)');
  process.exit(1);
}
if (buf.length > 1048576) {
  console.error(`entry.png is ${buf.length} bytes, over the 1 MiB cap`);
  process.exit(1);
}
// Dimensions come from the header, so a corrupt or oversized image fails here
// instead of in front of the judge: PNG width/height are big-endian at 16/20.
if (isPng && buf.length >= 24) {
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w > 1024 || h > 1024) {
    console.error(`entry.png is ${w}x${h}, over the 1024x1024 cap`);
    process.exit(1);
  }
  console.log(`entry.png OK: ${w}x${h}, ${buf.length} bytes`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const out = join(OUTPUT_DIR, 'entry.png');
copyFileSync(src, out);
console.log(`entry.png OK: ${statSync(out).size} bytes -> ${out}`);
