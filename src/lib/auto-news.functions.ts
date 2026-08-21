import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(context: any) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("শুধু অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।");
}


export const runAutoImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sourceId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(10).optional(),
        dryRun: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { runAutoSync } = await import("@/lib/auto-news.server");
    return runAutoSync({
      ...(data.sourceId ? { sourceId: data.sourceId } : {}),
      ...(data.limit ? { limit: data.limit } : {}),
      ...(data.dryRun ? { dryRun: true } : {}),
    });
  });

const previewSchema = z.object({
  sourceId: z.string().uuid(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  sourceTitle: z.string(),
  title: z.string().min(3),
  
  excerpt: z.string().default(""),
  content: z.string().min(20),
  seo_title: z.string().default(""),
  seo_description: z.string().default(""),
  category: z.string().min(1),
  imageUrl: z.string().nullable().default(null),
  sourceImage: z.string().nullable().default(null),
  status: z.enum(["draft", "published"]).optional(),
});

/** ড্রাই-রানের প্রিভিউ নিশ্চিত করে সাইটে সেভ করে। */
export const publishAutoPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => previewSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { publishPreview } = await import("@/lib/auto-news.server");
    return publishPreview(data);
  });

export const previewSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ siteUrl: z.string().url(), limit: z.number().int().min(1).max(20).default(5) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { discoverLatest } = await import("@/lib/source-fetch.server");
    return discoverLatest(data.siteUrl, data.limit);
  });
