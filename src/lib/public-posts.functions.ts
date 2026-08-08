import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { createPublicServerClient } from "@/integrations/my-supabase/client";

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
    if (error) throw new Error(error.message);
    return post;
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
    if (error) throw new Error(error.message);
    return post;
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
    if (error) throw new Error(error.message);
    return posts || [];
  });
