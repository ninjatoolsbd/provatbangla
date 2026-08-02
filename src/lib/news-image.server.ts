import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

/** Generates a news illustration with Lovable AI and stores it in the backend bucket. */
export async function generateNewsImage(prompt: string): Promise<string | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [
          {
            role: "user",
            content: `Photorealistic editorial news photograph, 16:9, no text or watermark: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
        stream: false,
      }),
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as ImagesResponse;
    const b64 = pickImageData(payload);
    if (!b64) return null;

    const bytes = base64ToBytes(b64);
    const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
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
