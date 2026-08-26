import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCloudAuth } from "@/lib/cloud-auth.middleware";

const itemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().default(""),
  content: z.string().default(""),
  excerpt: z.string().default(""),
  category: z.string().default("onnanno"),
  imageUrl: z.string().nullable().default(null),
  authorName: z.string().default("প্রতিবেদক"),
  status: z.enum(["published", "draft"]).default("published"),
  publishedAt: z.string().nullable().default(null),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(25),
  mirrorImages: z.boolean().default(true),
  skipExisting: z.boolean().default(true),
});

function normalizeSlug(raw: string, title: string) {
  const base = (raw || title)
    .trim()
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  return base || `news-${Math.random().toString(36).slice(2, 8)}`;
}

/** Downloads a remote image and stores it in R2. Falls back to the original URL. */
async function mirrorImage(url: string): Promise<string | null> {
  try {
    const { uploadToR2, isR2Configured } = await import("@/lib/r2.server");
    if (!isR2Configured()) return url;
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!res.ok) return url;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return url;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > 8_000_000) return url;
    const name = (url.split("/").pop() ?? "image.jpg").split("?")[0]!;
    const safe = name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `wp-import/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`;
    return (await uploadToR2(key, bytes, type)) ?? url;
  } catch {
    return url;
  }
}

export const importWpPosts = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("শুধু অ্যাডমিন ইমপোর্ট করতে পারবেন।");

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of data.items) {
      try {
        const slug = normalizeSlug(item.slug, item.title);

        if (data.skipExisting) {
          const { data: existing } = await context.supabase
            .from("posts")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          if (existing) {
            skipped += 1;
            continue;
          }
        }

        let image = item.imageUrl;
        if (image && data.mirrorImages) image = await mirrorImage(image);

        const { error } = await context.supabase.from("posts").insert({
          title: item.title,
          slug: data.skipExisting ? slug : `${slug}-${Math.random().toString(36).slice(2, 6)}`,
          
          category: item.category,
          image_url: image,
          excerpt: item.excerpt.slice(0, 500),
          content: item.content,
          seo_title: item.title.slice(0, 60),
          seo_description: item.excerpt.slice(0, 155),
          status: item.status,
          author_id: context.userId,
          author_name: item.authorName,
          published_at:
            item.status === "published"
              ? (item.publishedAt ?? new Date().toISOString())
              : null,
        });
        if (error) throw new Error(error.message);
        imported += 1;
      } catch (e) {
        errors.push(`${item.title}: ${(e as Error).message}`);
      }
    }

    return { imported, skipped, errors };
  });
