/**
 * Worker-নিরাপদ ওয়াটারমার্ক: jpeg-js + pngjs (খাঁটি JS) দিয়ে ছবির নিচ-ডানে লোগো বসায়।
 * WASM/নেটিভ বাইনারি ছাড়াই চলে, তাই লাইভ সার্ভারে ভাঙে না।
 * সমর্থন: JPEG ও PNG ইনপুট; অন্য ফরম্যাট হলে null ফেরত দেয়।
 */

import jpeg from "jpeg-js";
import { PNG } from "pngjs";

type Rgba = { width: number; height: number; data: Uint8Array };

function decodeImage(bytes: Uint8Array): Rgba | null {
  try {
    // JPEG: FF D8
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      const decoded = jpeg.decode(bytes, { maxMemoryUsageInMB: 512 });
      if (!decoded?.data) return null;
      return { width: decoded.width, height: decoded.height, data: new Uint8Array(decoded.data) };
    }
    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      const png = PNG.sync.read(Buffer.from(bytes));
      return { width: png.width, height: png.height, data: new Uint8Array(png.data) };
    }
    return null;
  } catch {
    return null;
  }
}

/** বিলিনিয়ার রিসাইজ (RGBA)। */
function resizeRgba(img: Rgba, targetW: number, targetH: number): Rgba {
  const out = new Uint8Array(targetW * targetH * 4);
  const xRatio = img.width / targetW;
  const yRatio = img.height / targetH;
  for (let y = 0; y < targetH; y += 1) {
    const srcY = y * yRatio;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(y0 + 1, img.height - 1);
    const fy = srcY - y0;
    for (let x = 0; x < targetW; x += 1) {
      const srcX = x * xRatio;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, img.width - 1);
      const fx = srcX - x0;
      const di = (y * targetW + x) * 4;
      for (let c = 0; c < 4; c += 1) {
        const p00 = img.data[(y0 * img.width + x0) * 4 + c] ?? 0;
        const p01 = img.data[(y0 * img.width + x1) * 4 + c] ?? 0;
        const p10 = img.data[(y1 * img.width + x0) * 4 + c] ?? 0;
        const p11 = img.data[(y1 * img.width + x1) * 4 + c] ?? 0;
        out[di + c] = Math.round(
          p00 * (1 - fx) * (1 - fy) + p01 * fx * (1 - fy) + p10 * (1 - fx) * fy + p11 * fx * fy,
        );
      }
    }
  }
  return { width: targetW, height: targetH, data: out };
}

/** লোগোকে বেস ছবির (x, y)-এ আলফা-ব্লেন্ড করে বসায়। */
function composite(base: Rgba, logo: Rgba, offsetX: number, offsetY: number) {
  for (let ly = 0; ly < logo.height; ly += 1) {
    const by = offsetY + ly;
    if (by < 0 || by >= base.height) continue;
    for (let lx = 0; lx < logo.width; lx += 1) {
      const bx = offsetX + lx;
      if (bx < 0 || bx >= base.width) continue;
      const li = (ly * logo.width + lx) * 4;
      const alpha = (logo.data[li + 3] ?? 0) / 255;
      if (alpha === 0) continue;
      const bi = (by * base.width + bx) * 4;
      for (let c = 0; c < 3; c += 1) {
        base.data[bi + c] = Math.round(
          (logo.data[li + c] ?? 0) * alpha + (base.data[bi + c] ?? 0) * (1 - alpha),
        );
      }
      base.data[bi + 3] = 255;
    }
  }
}

export async function stampWatermark(
  baseBytes: Uint8Array,
  logoBytes: Uint8Array,
): Promise<{ bytes: Uint8Array; type: string } | null> {
  try {
    const base = decodeImage(baseBytes);
    const logoRaw = decodeImage(logoBytes);
    if (!base || !logoRaw || base.width < 64 || base.height < 64) return null;

    // লোগোর প্রস্থ ছবির ~১৬%
    const targetW = Math.max(48, Math.round(base.width * 0.16));
    const ratio = logoRaw.height / Math.max(1, logoRaw.width);
    const targetH = Math.max(24, Math.round(targetW * ratio));
    const logo = resizeRgba(logoRaw, targetW, targetH);

    const pad = Math.round(base.width * 0.02);
    const x = Math.max(0, base.width - targetW - pad);
    const y = Math.max(0, base.height - targetH - pad);

    composite(base, logo, x, y);

    const encoded = jpeg.encode(
      { data: Buffer.from(base.data), width: base.width, height: base.height },
      88,
    );
    if (!encoded?.data || encoded.data.length === 0) return null;
    return { bytes: new Uint8Array(encoded.data), type: "image/jpeg" };
  } catch (error) {
    console.error("watermark failed:", error);
    return null;
  }
}
