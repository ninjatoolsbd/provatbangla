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

async function fromCloudflare(prompt: string) {
  const { fetchSettings } = await import("./cms");
  const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
  const tokensStr = settings["CLOUDFLARE_API_TOKEN"] || process.env["CLOUDFLARE_API_TOKEN"] || "";
  const tokens = tokensStr.split(",").map(t => t.trim()).filter(Boolean);
  const accountId = settings["CLOUDFLARE_ACCOUNT_ID"] || process.env["CLOUDFLARE_ACCOUNT_ID"] || "0d889fc022ab5086c334140058a43637";
  
  if (tokens.length === 0) return null;

  for (const token of tokens) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt }),
      });
      
      if (res.status === 429 || res.status === 401) {
        console.warn(`Cloudflare Token failing (Status ${res.status}), trying next...`);
        continue;
      }
      
      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const payload = await res.json() as { result?: { image?: string } | string };
        const encoded = typeof payload.result === "string" ? payload.result : payload.result?.image;
        if (encoded) return `data:image/png;base64,${encoded}`;
        continue;
      }

      const bytes = new Uint8Array(await res.arrayBuffer());
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      if (!isPng && !isJpeg) continue;
      return `data:${isJpeg ? "image/jpeg" : "image/png"};base64,${Buffer.from(bytes).toString("base64")}`;
    } catch (e) {
      console.error("Cloudflare attempt failed:", e);
      continue;
    }
  }
  return null;
}

async function fromPollinations(prompt: string) {
  const { fetchSettings } = await import("./cms");
  const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
  const keysStr = settings["POLLINATIONS_API_KEY"] || process.env["POLLINATIONS_API_KEY"] || "";
  const keys = keysStr.split(",").map(k => k.trim()).filter(Boolean);
  
  // Even if no keys, Pollinations often works without one, but we'll prioritize list if provided
  const attemptKeys = keys.length > 0 ? keys : [null];

  for (const key of attemptKeys) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&private=true&enhance=false&model=flux`;
      const res = await fetch(url, {
        headers: key ? { Authorization: `Bearer ${key}` } : {},
      });
      if (res.status === 429 || res.status === 401) continue;
      if (!res.ok) continue;
      return url; 
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function generateNewsImage(prompt: string): Promise<string | null> {

  const fullPrompt = `${prompt} -- Real-life professional news photography, shot on 35mm lens, f/2.8, sharp focus, natural daylight, authentic Bangladeshi atmosphere, 8k resolution, cinematic, realistic skin textures, high detail, no text, no blur, editorial style.`;
  try {
    const { fetchSettings } = await import("./cms");
    const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;
    const priorityStr = settings["image_gen_priority"] ?? "cloudflare,pollinations";
    const priority = priorityStr
      .split(",")
      .map((provider) => provider.trim())
      .filter((provider) => provider === "cloudflare" || provider === "pollinations");

    let b64: string | null = null;

    for (const provider of priority) {
      if (provider === "cloudflare") {
        b64 = await fromCloudflare(fullPrompt).catch(() => null);
      }
      else if (provider === "pollinations") {
        b64 = await fromPollinations(fullPrompt).catch(() => null);
      }
      if (b64) break;
    }

    if (!b64) return null;

    // If it's already a full URL (from Blackbox), just return it
    if (b64.startsWith("http") && !b64.includes("data:")) {
      return b64;
    }

    const bytes = base64ToBytes(b64);
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isPng && !isJpeg) return null;

    const contentType = isJpeg ? "image/jpeg" : "image/png";
    const extension = isJpeg ? "jpg" : "png";
    const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { uploadToR2 } = await import("@/lib/r2.server");
    const r2Url = await uploadToR2(`news/${path}`, bytes, contentType);
    if (r2Url) return r2Url;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType, upsert: false });
    if (error) return null;

    return `/api/public/news-image/${path}`;

  } catch {
    return null;
  }
}

export const NEWS_IMAGE_BUCKET = BUCKET;
