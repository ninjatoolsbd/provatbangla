import { describe, expect, it } from "vitest";
import { removeLogoBackground } from "./watermark-alpha";

describe("background-free watermark logos", () => {
  it("removes opaque white backing", () => {
    const pixels = new Uint8Array([255, 255, 255, 255, 235, 235, 235, 255]);
    removeLogoBackground(pixels);
    expect(Array.from(pixels)).toEqual([255, 255, 255, 0, 235, 235, 235, 0]);
  });
  it("preserves transparent pixels and the red and green logo colors", () => {
    const pixels = new Uint8ClampedArray([255, 255, 255, 0, 237, 28, 36, 255, 11, 93, 42, 180]);
    const original = Array.from(pixels);
    removeLogoBackground(pixels);
    expect(Array.from(pixels)).toEqual(original);
  });
});