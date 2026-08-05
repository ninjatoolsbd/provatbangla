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

async function fromLovable(fullPrompt: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [{ role: "user", content: fullPrompt }],
      modalities: ["image", "text"],
      stream: false,
    }),
  });
  if (!res.ok) return null;
  return pickImageData((await res.json()) as ImagesResponse);
}

async function fromGemini(fullPrompt: string) {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) return null;
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      }),
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) return part.inlineData.data;
  }
  return null;
}

/** Generates a news illustration based on user-defined priority. */
export async function generateNewsImage(prompt: string): Promise<string | null> {
  const fullPrompt = `Photorealistic editorial news photograph, 16:9, no text or watermark: ${prompt}`;
  try {
    const { fetchSettings } = await import("./cms");
    const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
    const priorityStr = settings["image_gen_priority"] ?? "gemini,lovable";
    const priority = priorityStr.split(",").filter(Boolean);

    let b64: string | null = null;

    for (const provider of priority) {
      if (provider === "gemini") {
        b64 = await fromGemini(fullPrompt).catch(() => null);
      } else if (provider === "lovable") {
        b64 = await fromLovable(fullPrompt).catch(() => null);
      }
      if (b64) break;
    }

    if (!b64) return null;


    const bytes = base64ToBytes(b64);
    const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;

    // Prefer Cloudflare R2 when configured, fall back to backend storage.
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

