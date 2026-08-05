import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/my-supabase/auth-middleware";

export const rewriteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().default("bangladesh"),
        tone: z.enum(["news", "analysis", "short"]).default("news"),
        variants: z.number().int().min(1).max(3).default(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("শুধু অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।");

    const { runRewrite } = await import("@/lib/news-rewrite.server");
    return runRewrite(data);
  });

export const generateNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        prompt: z.string().min(3),
        details: z.string().default(""),
        referenceUrl: z.string().optional(),
        category: z.string().default("bangladesh"),
        tone: z.enum(["news", "analysis", "short"]).default("news"),
        withImage: z.boolean().default(true),
        autoPublish: z.boolean().default(true),
        provider: z.enum(["auto", "frase", "nichesss"]).default("auto"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("শুধু অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।");

    const { runGenerate } = await import("@/lib/news-generate.server");
    const { slugify } = await import("@/lib/post-utils");
    const { article, imageUrl, provider } = await runGenerate(data);

    let postId: string | null = null;
    let slug: string | null = null;

    if (data.autoPublish) {
      slug = slugify(article.title);
      const { data: inserted, error } = await context.supabase
        .from("posts")
        .insert({
          title: article.title,
          slug,
          kicker: article.kicker || null,
          category: data.category,
          image_url: imageUrl,
          excerpt: article.excerpt,
          content: article.content,
          seo_title: article.seo_title || null,
          seo_description: article.seo_description || null,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      postId = inserted.id;
    }

    return { article, imageUrl, provider, postId, slug };
  });

