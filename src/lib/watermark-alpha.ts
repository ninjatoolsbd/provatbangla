/** Remove white backing from legacy logos while preserving existing transparency. */
export function removeLogoBackground(pixels: Uint8Array | Uint8ClampedArray): void {
  for (let i = 0; i < pixels.length; i += 4) {
    const lightestChannelFloor = Math.min(pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0);
    const alpha = pixels[i + 3] ?? 0;
    if (lightestChannelFloor >= 235) pixels[i + 3] = 0;
    else if (lightestChannelFloor > 200) {
      pixels[i + 3] = Math.round(alpha * (235 - lightestChannelFloor) / 35);
    }
  }
}