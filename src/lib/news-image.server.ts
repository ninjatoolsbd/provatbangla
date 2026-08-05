import { supabaseAdmin } from "@/integrations/my-supabase/client.server";

const BUCKET = "news-images";

function base64ToBytes(b64: string) {
  const clean = b64.includes(",") ? (b64.split(",")[1] ?? "") : b64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

type ImagesResponse = {
  data?: { b64_json?: string; url?: string }[];
  choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
};

function pickImageData(payload: ImagesResponse) {
  const direct = payload.data?.[0];
  if (direct?.b64_json) return direct.b64_json;
  if (direct?.url?.startsWith("data:")) return direct.url;
  const fromChat = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (fromChat) return fromChat;
  return null;
}

async function fromBlackbox(fullPrompt: string) {
  const key = process.env["BLACKBOX_API_KEY"];
  if (!key) return null;
  const res = await fetch("https://api.blackbox.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "flux-pro",
      messages: [{ role: "user", content: fullPrompt }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const urlMatch = text.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) return urlMatch[0];
  
  return pickImageData(data as any);
}

/** Generates a news illustration based on user-defined priority. */
export async function generateNewsImage(prompt: string): Promise<string | null> {
  const fullPrompt = `Photorealistic editorial news photograph, 16:9, no text or watermark: ${prompt}`;
  try {
    const { fetchSettings } = await import("./cms");
    const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
    const priorityStr = settings["image_gen_priority"] ?? "blackbox";
    const priority = priorityStr.split(",").filter(p => p === "blackbox");

    let b64: string | null = null;

    for (const provider of priority) {
      if (provider === "blackbox") {
        b64 = await fromBlackbox(fullPrompt).catch(() => null);
      }
      if (b64) break;
    }

    if (!b64) return null;

    // If it's already a full URL (from Blackbox), just return it
    if (b64.startsWith("http") && !b64.includes("data:")) {
      return b64;
    }

    const bytes = base64ToBytes(b64);
    const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

    const { uploadToR2 } = await import("@/lib/r2.server");
    const r2Url = await uploadToR2(`news/${path}`, bytes, "image/png");
    if (r2Url) return r2Url;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/png", upsert: false });
    if (error) return null;

    return `/api/public/news-image/${path}`;

  } catch {
    return null;
  }
}

export const NEWS_IMAGE_BUCKET = BUCKET;
