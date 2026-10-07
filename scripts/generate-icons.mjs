#!/usr/bin/env node
// Generates the favicon, Apple touch icon and PWA icons from one SVG design.
// Usage: npm run icons   (uses sharp, which ships with Next.js)
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const out = (...p) => path.join(root, ...p);

const gradient = `<defs><linearGradient id="g" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#db2777"/></linearGradient></defs>`;
const bars = `
  <rect x="112" y="272" width="56" height="128" rx="28" fill="#fff" fill-opacity="0.7"/>
  <rect x="200" y="192" width="56" height="208" rx="28" fill="#fff" fill-opacity="0.85"/>
  <rect x="288" y="128" width="56" height="272" rx="28" fill="#fff"/>
  <rect x="376" y="224" width="56" height="176" rx="28" fill="#fff" fill-opacity="0.8"/>`;

// Rounded app icon (favicon, "any" purpose icons).
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradient}<rect width="512" height="512" rx="144" fill="url(#g)"/>${bars}</svg>`;
// Full-bleed icon with the artwork inside the maskable safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradient}<rect width="512" height="512" fill="url(#g)"/><g transform="translate(256 256) scale(0.62) translate(-272 -264)">${bars}</g></svg>`;
// Apple adds its own rounding, so the touch icon is square too.
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${gradient}<rect width="512" height="512" fill="url(#g)"/><g transform="translate(256 256) scale(0.8) translate(-272 -264)">${bars}</g></svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

function ico(images) {
  // ICO container with embedded PNGs (supported by every modern browser).
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

mkdirSync(out("public", "icons"), { recursive: true });

writeFileSync(out("src", "app", "icon.svg"), icon);
writeFileSync(out("public", "icon.svg"), icon);
writeFileSync(out("src", "app", "apple-icon.png"), await png(apple, 180));
writeFileSync(out("public", "icons", "icon-192.png"), await png(icon, 192));
writeFileSync(out("public", "icons", "icon-512.png"), await png(icon, 512));
writeFileSync(out("public", "icons", "maskable-192.png"), await png(maskable, 192));
writeFileSync(out("public", "icons", "maskable-512.png"), await png(maskable, 512));
writeFileSync(
  out("src", "app", "favicon.ico"),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(icon, size) })))),
);

console.log("✔ Icons written to src/app and public/icons");
