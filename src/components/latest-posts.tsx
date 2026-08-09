import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/my-supabase/client";
import { SectionHeading, NewsImage } from "@/components/news-cards";
import { Reveal } from "@/components/reveal";
import { categoryName } from "@/lib/news-data";
import { banglaDateTime, Post } from "@/lib/posts";

async function fetchFilteredPosts(limit = 12, category?: string) {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    q = q.eq("category", category);
  } else {
    // If no category specified, fallback to sorboshesh or general news
    // To ensure the section isn't empty, we'll try to get ANY latest news if the filtered one is empty
    // But initially, let's look for these key categories
    q = q.in("category", ["sorboshesh", "bangladesh", "apradh", "politics", "international"]);
  }

  const { data, error } = await q.limit(limit);
  if (error) throw error;

  // FALLBACK: If we got nothing from specific categories, just get the absolute latest published posts
  if (!data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    return (fallbackData ?? []) as Post[];
  }

  return (data ?? []) as Post[];
}

export function LatestPosts({ category }: { category?: string }) {
  const { data = [] } = useQuery({
    queryKey: ["sorboshesh-hero-posts", category ?? "all"],
    queryFn: () => fetchFilteredPosts(12, category),
  });

  if (!data || data.length === 0) return null;

  // For category-specific view, use a simpler grid
  if (category) {
    return (
      <div className="mb-10 grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((p, i) => (
          <Reveal key={p.id} delay={i * 50}>
            <article className="group">
              {p.image_url && (
                <Link to="/post/$slug" params={{ slug: p.slug ?? "" }} className="block overflow-hidden rounded-sm">
                  <NewsImage
                    src={p.image_url}
                    alt={p.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
              )}
              <div className="mt-3">
                <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                  <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-tight group-hover:text-primary">
                    {p.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{banglaDateTime(p.published_at)}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    );
  }

  const mainPost = data[0];
  if (!mainPost) return null;

  const sidePosts = data.slice(1, 6);
  const bottomPosts = data.slice(6, 9);

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Section: Big Feature + Bottom Grid */}
        <div className="lg:col-span-8">
          <Reveal delay={0}>
            <article className="group">
              {mainPost.image_url && (
                <Link
                  to="/post/$slug"
                  params={{ slug: mainPost.slug ?? "" }}
                  className="block overflow-hidden"
                >
                  <NewsImage
                    src={mainPost.image_url}
                    alt={mainPost.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </Link>
              )}
              <div className="mt-5">
                <Link to="/post/$slug" params={{ slug: mainPost.slug ?? "" }}>
                  <h2 className="font-display text-[30px] font-bold leading-[1.15] text-[#D0021B] transition-colors group-hover:text-primary lg:text-[36px]">
                    {mainPost.title}
                  </h2>
                </Link>
                <p className="mt-4 line-clamp-4 text-[16px] leading-relaxed text-[#333]">
                  {mainPost.excerpt}
                </p>
              </div>
            </article>
          </Reveal>

          {/* Bottom 3 Grid Items (Matching user-uploads://file-18) */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {bottomPosts.map((p, i) => (
              <Reveal key={p.id} delay={200 + i * 50}>
                <article className="group">
                  {p.image_url && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: p.slug ?? "" }}
                      className="mb-3 block overflow-hidden"
                    >
                      <NewsImage
                        src={p.image_url}
                        alt={p.title}
                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  )}
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h4 className="line-clamp-3 font-display text-[17px] font-bold leading-tight transition-colors group-hover:text-primary">
                      {p.title}
                    </h4>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Right Section: Small List with Images */}
        <div className="lg:col-span-4 lg:border-l lg:border-border lg:pl-8">
          <div className="space-y-6">
            {sidePosts.map((p, i) => (
              <Reveal key={p.id} delay={100 + i * 50}>
                <article className="group flex items-start gap-4">
                  {p.image_url && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: p.slug ?? "" }}
                      className="block h-16 w-28 shrink-0 overflow-hidden shadow-sm"
                    >
                      <NewsImage
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                      <h3 className="line-clamp-2 font-display text-[16px] font-bold leading-[1.3] text-[#1a1a1a] transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
