import { supabaseAdmin } from "@/integrations/my-supabase/client.server";
import { uploadToR2 } from "@/lib/r2.server";
import frameAsset from "@/assets/photocard-frame.png.asset.json";

const SITE_ORIGIN = "https://cheer-collective-code.lovable.app";

/** Template geometry (matches the provided poster template). */
const CARD_W = 1086;
const CARD_H = 1448;
const WIN_X = 26;
const WIN_Y = 23;
const WIN_W = 1034;
const WIN_H = 680;

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const banglaDate = (iso: string) => {
  const d = new Date(iso);
  const digits = "০১২৩৪৫৬৭৮৯";
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
  ];
  const bn = (n: number) => String(n).split("").map((c) => digits[Number(c)]).join("");
  return `${bn(d.getDate())} ${months[d.getMonth()]}, ${bn(d.getFullYear())}`;
};

export async function runPhotocardGeneration(postId: string) {
  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    throw new Error("নিউজ পাওয়া যায়নি");
  }

  const imageUrl = post.image_url || `${SITE_ORIGIN}/og-image.png`;
  const frameUrl = `${SITE_ORIGIN}${frameAsset.url}`;
  const title = escapeXml(post.title ?? "");
  const dateText = escapeXml(banglaDate(post.published_at || post.created_at || new Date().toISOString()));

  const svg = `<svg width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="win"><rect x="${WIN_X}" y="${WIN_Y}" width="${WIN_W}" height="${WIN_H}" /></clipPath>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.88)" />
    </linearGradient>
  </defs>

  <rect width="${CARD_W}" height="${CARD_H}" fill="#8f0101" />

  <g clip-path="url(#win)">
    <image href="${escapeXml(imageUrl)}" x="${WIN_X}" y="${WIN_Y}" width="${WIN_W}" height="${WIN_H}" preserveAspectRatio="xMidYMid slice" />
    <rect x="${WIN_X}" y="${WIN_Y + WIN_H - 320}" width="${WIN_W}" height="320" fill="url(#shade)" />
    <foreignObject x="${WIN_X + 30}" y="${WIN_Y + WIN_H - 265}" width="${WIN_W - 60}" height="235">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#ffffff;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;font-size:52px;font-weight:700;line-height:1.35;text-shadow:0 2px 10px rgba(0,0,0,.6);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${title}</div>
    </foreignObject>
  </g>

  <!-- Date badge -->
  <g>
    <rect x="716" y="52" width="318" height="72" rx="36" fill="#ed1c24" />
    <text x="875" y="103" text-anchor="middle" fill="#ffffff" font-family="'SolaimanLipi','Noto Sans Bengali',sans-serif" font-size="34" font-weight="700">${dateText}</text>
  </g>

  <!-- Template frame on top (photo window is transparent) -->
  <image href="${escapeXml(frameUrl)}" x="0" y="0" width="${CARD_W}" height="${CARD_H}" />
</svg>`;

  const bytes = new TextEncoder().encode(svg);
  const key = `photocards/${postId}-${Date.now()}.svg`;
  const photocardUrl = await uploadToR2(key, bytes, "image/svg+xml");

  if (!photocardUrl) {
    throw new Error("ফটোকোর্ড আপলোড ব্যর্থ হয়েছে");
  }

  const { error: updateError } = await supabaseAdmin
    .from("posts")
    .update({ photocard_url: photocardUrl } as any)
    .eq("id", postId);

  if (updateError) {
    console.error("Database update error:", updateError);
  }

  return { photocardUrl };
}
