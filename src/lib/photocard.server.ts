import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { uploadToR2 } from "@/lib/r2.server";

const DEFAULT_SITE_ORIGIN = "https://cheer-collective-code.lovable.app";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function runPhotocardGeneration(postId: string, siteOrigin?: string) {
  // 1. Fetch post data
  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    throw new Error("নিউজ পাওয়া যায়নি");
  }

  // 2. Generate Photocard Image
  // Using a canvas-less approach (SVG -> PNG) or a similar technique suitable for Workers.
  // For a news portal, a photocard usually has:
  // - Background image (the news image)
  // - Dark gradient overlay at bottom
  // - News title in white (Bengali)
  // - Logo (ProvatBangla)
  
  const width = 1200;
  const height = 630;
  
  // We'll use a simple SVG template that we can return or process.
  // Since we don't have a full headless browser or heavy canvas in the worker,
  // we'll use a reliable SVG construction.
  
  const origin = (siteOrigin || DEFAULT_SITE_ORIGIN).replace(/\/$/, "");
  const imageUrl: string | null = post.image_url || null;
  const title = escapeXml(String(post.title ?? ""));
  const logoUrl = `${origin}/logo.png`;

  // SVG Template
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.85);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background Image -->
      <image href="${imageUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
      
      <!-- Gradient Overlay -->
      <rect x="0" y="${height * 0.4}" width="${width}" height="${height * 0.6}" fill="url(#grad)" />
      
      <!-- Logo -->
      <image href="${logoUrl}" x="50" y="50" width="200" height="60" preserveAspectRatio="xMinYMin meet" />
      
      <!-- News Title -->
      <foreignObject x="50" y="${height - 200}" width="${width - 100}" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: 'SolaimanLipi', sans-serif; font-size: 48px; font-weight: bold; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${title}
        </div>
      </foreignObject>
      
      <!-- Brand Name / Date -->
      <text x="50" y="${height - 40}" fill="white" font-family="sans-serif" font-size="20" font-weight="bold">প্রভাতবাংলা | প্রভাতবেলা ডট কম</text>
    </svg>
  `;

  // Ideally, we'd convert this SVG to PNG. 
  // For now, we'll store the SVG as the photocard or use a placeholder URL if we can't convert.
  // Most social platforms support SVG if served with correct MIME, but PNG is safer.
  // Since this is a worker, we'll upload the SVG directly or use an external API for PNG if required.
  // Let's stick to SVG for immediate implementation as it's lightweight.
  
  const bytes = new TextEncoder().encode(svg);
  const key = `photocards/${postId}-${Date.now()}.svg`;
  const photocardUrl = await uploadToR2(key, bytes, "image/svg+xml");

  if (!photocardUrl) {
    throw new Error("ফটোকোর্ড আপলোড ব্যর্থ হয়েছে");
  }

  // 3. Update database
  const { error: updateError } = await supabaseAdmin
    .from("posts")
    .update({ photocard_url: photocardUrl } as any)
    .eq("id", postId);

  if (updateError) {
    console.error("Database update error:", updateError);
  }

  return { photocardUrl };
}
