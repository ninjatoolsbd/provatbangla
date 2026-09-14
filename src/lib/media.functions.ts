import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: z.string().min(1),
  // লোগো/গ্রাফিক আপলোডে ওয়াটারমার্ক বসানো যাবে না
  skipWatermark: z.boolean().optional(),
});

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { uploadToR2 } = await import("@/lib/r2.server");
    const binary = atob(data.dataBase64);
    let bytes: Uint8Array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    let contentType = data.contentType;

    // ছবি হলে আপলোডের আগেই লোগো ওয়াটারমার্ক বসানো হয় (পেজে আলাদা ওভারলে নেই)
    if (contentType.startsWith("image/") && !data.skipWatermark) {
      try {
        const { fetchSettings } = await import("@/lib/cms");
        const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
        const { resolveAssetUrl } = await import("@/lib/news-media.server");
        const logoUrl = await resolveAssetUrl(settings["watermark_logo_url"] || "/logo.jpg");
        const logoRes = await fetch(logoUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (logoRes.ok) {
          const logoBytes = new Uint8Array(await logoRes.arrayBuffer());
          const { stampWatermark } = await import("@/lib/watermark.server");
          const stamped = await stampWatermark(bytes, logoBytes);
          if (stamped) {
            bytes = stamped.bytes;
            contentType = stamped.type;
          }
        }
      } catch {
        /* ওয়াটারমার্ক ব্যর্থ হলে মূল ছবিই আপলোড হয় */
      }
    }

    let safe = data.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    // ওয়াটারমার্কের পর ফরম্যাট বদলালে এক্সটেনশনও মিলিয়ে দেওয়া হয়
    if (contentType !== data.contentType && contentType === "image/jpeg") {
      safe = safe.replace(/\.[a-zA-Z0-9]+$/, "") + ".jpg";
    }
    const key = `media/${Date.now()}-${safe}`;
    const url = await uploadToR2(key, bytes, contentType);
    if (!url) throw new Error("R2 আপলোড ব্যর্থ হয়েছে");
    return { url, key, size: bytes.length };
  });
