/**
 * সোর্স ইমেজ নামানো → লোগো ওয়াটারমার্ক → R2-তে আপলোড।
 * Worker রানটাইমে sharp/canvas নেই, তাই ওয়াটারমার্ক Gemini image edit দিয়ে বসানো হয়।
 */

import { getFromR2, uploadToR2 } from "@/lib/r2.server";

function bytesToBase64(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

function base64ToBytes(b64: string) {
  const clean = b64.includes(",") ? (b64.split(",")[1] ?? "") : b64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  try {
    if (url.startsWith("/api/public/r2/")) {
      const res = await getFromR2(url.replace("/api/public/r2/", ""));
      if (!res) return null;
      return {
        bytes: new Uint8Array(await res.arrayBuffer()),
        type: res.headers.get("content-type") ?? "image/png",
      };
    }
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    return {
      bytes: new Uint8Array(await res.arrayBuffer()),
      type: res.headers.get("content-type") ?? "image/jpeg",
    };
  } catch {
    return null;
  }
}

type GeminiParts = ({ text: string } | { inlineData: { mimeType: string; data: string } })[];

async function geminiEdit(parts: GeminiParts): Promise<Uint8Array | null> {
  const { fetchSettings } = await import("./cms");
  const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
  
  // Try all 5 Gemini keys from settings
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const k = settings[`GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (k?.trim()) keys.push(k.trim());
  }
  
  if (keys.length === 0) {
    const legacy = settings["GEMINI_API_KEY"] || process.env["GEMINI_API_KEY"];
    if (legacy) keys.push(...legacy.split(",").map(k => k.trim()).filter(Boolean));
  }

  if (keys.length === 0) return null;

  for (const key of keys) {
    try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
    };
    for (const part of data.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) return base64ToBytes(part.inlineData.data);
    }
      return null;
    } catch (e) {
      console.error(`Gemini watermark failed with key ${key.slice(0, 5)}...:`, e);
      continue; // Try next key
    }
  }
  return null;
}

/**
 * সোর্স ছবি নিয়ে ওয়াটারমার্ক বসিয়ে R2-তে রাখে।
 * ব্যবহারকারী এখন আর AI দিয়ে ছবি রিরাইট করতে চান না, শুধু ওয়াটারমার্ক চান।
 */
export async function processSourceImage(opts: {
  imageUrl: string;
  logoUrl?: string | undefined;
  aiModify: boolean;
}): Promise<string | null> {
  const source = await fetchBytes(opts.imageUrl);
  if (!source) return null;

  const mimeType = source.type.startsWith("image/") ? source.type : "image/jpeg";
  let finalBytes: Uint8Array | null = null;
  let finalType = mimeType;

  // লোগো থাকলে সেটা ওয়াটারমার্ক হিসেবে বসানো হবে
  const logo = opts.logoUrl ? await fetchBytes(opts.logoUrl) : null;
  if (logo) {
    const parts: GeminiParts = [
      {
        text: `Apply the second image (logo) as a watermark to the first image (base photo).
1. Place the logo in the bottom-right corner.
2. Padding: Leave 20 pixels of space from the right and bottom edges.
3. Size: Resize the logo to be clearly visible, approximately 15% of the base image width.
4. Transparency: The logo should be 80-90% opaque (almost solid but slightly blended).
5. Output: Return ONLY the raw image data. No text.`,
      },
      { inlineData: { mimeType: mimeType, data: bytesToBase64(source.bytes) } },
      {
        inlineData: {
          mimeType: logo.type.startsWith("image/") ? logo.type : "image/png",
          data: bytesToBase64(logo.bytes),
        },
      },
    ];
    const edited = await geminiEdit(parts);
    if (edited) {
      finalBytes = edited;
      finalType = "image/png";
    }
  }

  if (!finalBytes) finalBytes = source.bytes;

  const ext = finalType.includes("png") ? "png" : finalType.includes("webp") ? "webp" : "jpg";
  const key = `auto-news/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadToR2(key, finalBytes, finalType);
}
