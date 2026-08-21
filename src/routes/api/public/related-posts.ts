import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createPublicServerClient } from "@/lib/supabase-public";

export const Route = createFileRoute("/api/public/related-posts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const category = url.searchParams.get("category") || "";
          const excludeSlug = url.searchParams.get("excludeSlug") || "";
          const limit = parseInt(url.searchParams.get("limit") || "6", 10);

          const supabase = createPublicServerClient();
          
          const { data: posts, error } = await supabase
            .from("posts")
            .select("id, title, slug, image_url, category, published_at, created_at, author_name, excerpt")
            .eq("status", "published")
            .eq("category", category)
            .neq("slug", excludeSlug)
            .order("published_at", { ascending: false })
            .limit(limit);

          if (error) {
            console.error("Supabase error in related posts API:", error);
            return Response.json([]);
          }
          
          return Response.json((posts || []).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            image_url: p.image_url,
            category: p.category,
            published_at: p.published_at,
            created_at: p.created_at,
            author_name: p.author_name,
            excerpt: p.excerpt
          })));
        } catch (err: any) {
          console.error("Critical error in related posts API:", err);
          return Response.json([]);
        }
      },
    },
  },
});
