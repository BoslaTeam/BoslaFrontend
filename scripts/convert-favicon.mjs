import { decodeIco } from 'icojs';
import PNG from 'pngjs';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'public', 'assets', 'icons', 'favicon.ico');

function rgbaToPng(rgba, w, h) {
  const png = new PNG.PNG({ width: w, height: h });
  const src = new Uint8Array(rgba);
  for (let i = 0; i < w * h; i++) {
    png.data[i * 4] = src[i * 4 + 2];
    png.data[i * 4 + 1] = src[i * 4 + 1];
    png.data[i * 4 + 2] = src[i * 4];
    png.data[i * 4 + 3] = src[i * 4 + 3];
  }
  return PNG.PNG.sync.write(png);
}

function downscale(raster, srcW, srcH, dstW, dstH) {
  const out = new Uint8Array(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const sx = Math.floor(x * srcW / dstW);
      const sy = Math.floor(y * srcH / dstH);
      const si = (sy * srcW + sx) * 4;
      const di = (y * dstW + x) * 4;
      out[di] = raster[si];
      out[di + 1] = raster[si + 1];
      out[di + 2] = raster[si + 2];
      out[di + 3] = raster[si + 3];
    }
  }
  return out;
}

try {
  const buf = await readFile(src);
  const images = await decodeIco(buf, 'image/png');
  const img = images[0];
  const raster = new Uint8Array(img.data);
  console.log(`Decoded: ${img.width}x${img.height}, bpp=${img.bpp}`);

  const sizes = [16, 32, 48, 64, img.width];
  const seen = new Set();
  for (const s of sizes) {
    if (seen.has(s)) continue;
    seen.add(s);
    const name = s === img.width ? 'favicon.png' : `favicon-${s}.png`;
    const data = s === img.width ? raster : downscale(raster, img.width, img.height, s, s);
    const pngBuf = rgbaToPng(data, s, s);
    await writeFile(join(root, 'public', 'assets', 'icons', name), pngBuf);
    console.log(`  ${img.width}x${img.height} -> ${name}`);
  }
  console.log('Done!');
} catch (err) {
  console.error('Conversion failed:', err);
}
