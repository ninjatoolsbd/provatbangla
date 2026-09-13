/**
 * Worker-নিরাপদ ওয়াটারমার্ক: WASM (photon) দিয়ে ছবির নিচ-ডানে লোগো বসানো হয়।
 * কোনো AI কোটার উপর নির্ভর করে না।
 */

export async function stampWatermark(
  baseBytes: Uint8Array,
  logoBytes: Uint8Array,
): Promise<{ bytes: Uint8Array; type: string } | null> {
  try {
    const photon = await import("@cf-wasm/photon");
    const { PhotonImage, resize, watermark, SamplingFilter } = photon;

    const base = PhotonImage.new_from_byteslice(baseBytes);
    const logoRaw = PhotonImage.new_from_byteslice(logoBytes);

    const baseW = base.get_width();
    const baseH = base.get_height();

    // লোগোর প্রস্থ ছবির ~১৬%
    const targetW = Math.max(48, Math.round(baseW * 0.16));
    const ratio = logoRaw.get_height() / Math.max(1, logoRaw.get_width());
    const targetH = Math.max(24, Math.round(targetW * ratio));

    const logo = resize(logoRaw, targetW, targetH, SamplingFilter.Lanczos3);

    const pad = Math.round(baseW * 0.02);
    const x = Math.max(0, baseW - targetW - pad);
    const y = Math.max(0, baseH - targetH - pad);

    watermark(base, logo, BigInt(x), BigInt(y));

    const bytes = base.get_bytes_jpeg(88);

    base.free?.();
    logo.free?.();
    logoRaw.free?.();

    if (!bytes || bytes.length === 0) return null;
    return { bytes: new Uint8Array(bytes), type: "image/jpeg" };
  } catch (error) {
    console.error("photon watermark failed:", error);
    return null;
  }
}
