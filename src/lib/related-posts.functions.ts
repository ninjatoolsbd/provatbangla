import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicServerClient } from "@/integrations/my-supabase/client";

export const getRelatedPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => 
    z.object({ 
      category: z.string(),
      excludeSlug: z.string(),
      limit: z.number().default(6) 
    }).parse(input)
  )
  .handler(async ({ data }) => {
    try {
      const supabase = createPublicServerClient();
      
      const { data: posts, error } = await supabase
        .from("posts")
        .select("id, title, slug, image_url, category, published_at, created_at, author_name, excerpt")
        .eq("status", "published")
        .eq("category", data.category)
        .neq("slug", data.excludeSlug)
        .order("published_at", { ascending: false })
        .limit(data.limit);

      if (error) {
        console.error("Supabase error in getRelatedPosts:", error);
        throw new Error(error.message);
      }
      
      // Return a plain POJO array
      return (posts || []).map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        image_url: p.image_url,
        category: p.category,
        published_at: p.published_at,
        created_at: p.created_at,
        author_name: p.author_name,
        excerpt: p.excerpt
      }));
    } catch (err: any) {
      console.error("Error in getRelatedPosts handler:", err);
      throw new Error(err.message || "Failed to fetch related posts");
    }
  });
