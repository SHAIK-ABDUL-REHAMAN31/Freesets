import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const INPUT = resolve(process.argv[2]);

// Generate sizes needed for favicons and app icons
const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
];

// First, crop the image to just the "F" logo portion (center crop, tight)
const inputBuffer = readFileSync(INPUT);
const metadata = await sharp(inputBuffer).metadata();
console.log(`Input image: ${metadata.width}x${metadata.height}`);

// The logo "F" is centered in the image. We'll trim the black background
// to get just the icon, then add a small padding for the favicon.
// Use sharp's trim to remove the black border, then resize.
const trimmed = await sharp(inputBuffer)
    .trim({ threshold: 15 }) // trim near-black pixels
    .toBuffer({ resolveWithObject: true });

console.log(`After trim: ${trimmed.info.width}x${trimmed.info.height}`);

// Now make it square by extending the shorter dimension with black background
const maxDim = Math.max(trimmed.info.width, trimmed.info.height);
const padded = await sharp(trimmed.data)
    .resize(maxDim, maxDim, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .toBuffer();

// Add ~12% padding around the icon for breathing room
const paddingPercent = 0.12;
const finalSize = Math.round(maxDim * (1 + paddingPercent * 2));
const paddedWithMargin = await sharp(padded)
    .resize(maxDim, maxDim)
    .extend({
        top: Math.round(maxDim * paddingPercent),
        bottom: Math.round(maxDim * paddingPercent),
        left: Math.round(maxDim * paddingPercent),
        right: Math.round(maxDim * paddingPercent),
        background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .toBuffer();

const publicDir = resolve('public');

for (const { size, name } of sizes) {
    const output = resolve(publicDir, name);
    await sharp(paddedWithMargin)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toFile(output);
    console.log(`✅ ${name} (${size}x${size})`);
}

// Generate ICO file (contains 16x16, 32x32, 48x48)
// ICO format: header + directory entries + image data
const icoSizes = [16, 32, 48];
const pngBuffers = [];
for (const size of icoSizes) {
    const buf = await sharp(paddedWithMargin)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .png()
        .toBuffer();
    pngBuffers.push(buf);
}

// Build ICO file
const numImages = pngBuffers.length;
const headerSize = 6;
const dirEntrySize = 16;
const dataOffset = headerSize + dirEntrySize * numImages;

// Calculate total size
let totalSize = dataOffset;
for (const buf of pngBuffers) totalSize += buf.length;

const ico = Buffer.alloc(totalSize);

// ICO Header
ico.writeUInt16LE(0, 0);     // Reserved
ico.writeUInt16LE(1, 2);     // Type: 1 = ICO
ico.writeUInt16LE(numImages, 4); // Number of images

let offset = dataOffset;
for (let i = 0; i < numImages; i++) {
    const size = icoSizes[i];
    const entryOffset = headerSize + i * dirEntrySize;
    ico.writeUInt8(size < 256 ? size : 0, entryOffset);      // Width
    ico.writeUInt8(size < 256 ? size : 0, entryOffset + 1);  // Height
    ico.writeUInt8(0, entryOffset + 2);                       // Color palette
    ico.writeUInt8(0, entryOffset + 3);                       // Reserved
    ico.writeUInt16LE(1, entryOffset + 4);                    // Color planes
    ico.writeUInt16LE(32, entryOffset + 6);                   // Bits per pixel
    ico.writeUInt32LE(pngBuffers[i].length, entryOffset + 8); // Size of image data
    ico.writeUInt32LE(offset, entryOffset + 12);              // Offset to image data

    pngBuffers[i].copy(ico, offset);
    offset += pngBuffers[i].length;
}

writeFileSync(resolve(publicDir, 'favicon.ico'), ico);
console.log('✅ favicon.ico (16+32+48)');

console.log('\n🎉 All favicons generated!');
