/**
 * সোর্স ইমেজ নামানো → AI দিয়ে মডিফাই → লোগো ওয়াটারমার্ক → R2-তে আপলোড।
 * Worker রানটাইমে sharp/canvas নেই, তাই ওয়াটারমার্কও Gemini image edit দিয়ে বসানো হয়।
 */

import { getFromR2, uploadToR2 } from "@/lib/r2.server";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] ?? 0);
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
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
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
  } catch {
    return null;
  }
}

/**
 * সোর্স ছবি নিয়ে AI-মডিফাই + ওয়াটারমার্ক বসিয়ে R2-তে রাখে।
 * ব্যর্থ হলে অন্তত মূল ছবিটাই R2-তে মিরর করে রাখে; তাতেও ব্যর্থ হলে null।
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

  if (opts.aiModify) {
    const logo = opts.logoUrl ? await fetchBytes(opts.logoUrl) : null;
    const parts: GeminiParts = [
      {
        text: [
          "Re-render this news photograph as an original editorial illustration-style photo:",
          "keep the same subject, scene and composition, but change lighting, colour grading and fine details",
          "so it is visually distinct from the original. Photorealistic, 16:9, no text.",
          logo
            ? "Then composite the provided logo as a small semi-transparent watermark in the bottom-right corner."
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
      { inlineData: { mimeType, data: bytesToBase64(source.bytes) } },
    ];
    if (logo) {
      parts.push({
        inlineData: {
          mimeType: logo.type.startsWith("image/") ? logo.type : "image/png",
          data: bytesToBase64(logo.bytes),
        },
      });
    }
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
