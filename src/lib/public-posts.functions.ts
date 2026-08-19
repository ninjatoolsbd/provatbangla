import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicServerClient } from "@/integrations/my-supabase/client";

function pickPostFields(p: any) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    
    excerpt: p.excerpt,
    content: p.content,
    image_url: p.image_url,
    category: p.category,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    status: p.status,
    author_name: p.author_name,
    published_at: p.published_at,
    created_at: p.created_at,
    updated_at: p.updated_at,
    location: p.location,
    image_caption: p.image_caption
  };
}

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicServerClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    
    if (error) {
      console.error("getPublishedPost error:", error);
      return null;
    }
    return pickPostFields(post);
  });

export const getPostForPreview = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicServerClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) {
      console.error("getPostForPreview error:", error);
      return null;
    }
    return pickPostFields(post);
  });

export const getHomeSectionPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => 
    z.object({ 
      category: z.string().optional(),
      limit: z.number().default(10) 
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const supabase = createPublicServerClient();
    
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (data.category && data.category !== "sorboshesh") {
      query = query.eq("category", data.category);
    }

    const { data: posts, error } = await query;
    if (error) {
      console.error("getHomeSectionPosts error:", error);
      return [];
    }
    return (posts || []).map(pickPostFields);
  });
