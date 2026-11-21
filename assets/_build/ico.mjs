// Packs PNG files into a .ico (PNG-compressed entries, Vista+).
// Usage: node ico.mjs out.ico a.png b.png ...
import { readFileSync, writeFileSync } from 'node:fs';
const [, , out, ...pngs] = process.argv;
const imgs = pngs.map((p) => readFileSync(p));
const head = Buffer.alloc(6 + 16 * imgs.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let off = head.length;
imgs.forEach((b, i) => {
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), e = 6 + i * 16;
  head.writeUInt8(w >= 256 ? 0 : w, e); head.writeUInt8(h >= 256 ? 0 : h, e + 1);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(b.length, e + 8); head.writeUInt32LE(off, e + 12); off += b.length;
});
writeFileSync(out, Buffer.concat([head, ...imgs]));
