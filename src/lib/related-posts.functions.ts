
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
    const supabase = createPublicServerClient();
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .eq("category", data.category)
      .neq("slug", data.excludeSlug)
      .order("published_at", { ascending: false })
      .limit(data.limit);

    if (error) throw new Error(error.message);
    return posts || [];
  });
