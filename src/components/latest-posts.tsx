import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/my-supabase/client";
import { SectionHeading, NewsImage } from "@/components/news-cards";
import { Reveal } from "@/components/reveal";
import { categoryName } from "@/lib/news-data";
import { banglaDateTime, Post } from "@/lib/posts";

async function fetchFilteredPosts(limit = 10, category?: string) {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) {
    q = q.eq("category", category);
  } else {
    // Default "Latest" view filters for specific sections as requested
    q = q.in("category", ["sorboshesh", "bangladesh", "apradh", "politics"]);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export function LatestPosts({ category }: { category?: string }) {
  const { data } = useQuery({
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
  const sidePosts = data.slice(1, 5);
  const bottomPosts = data.slice(5);

  return (
    <section className="mb-10">
      <SectionHeading title="সর্বশেষ" />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Large Post (Left) */}
        <div className="lg:col-span-8">
          <Reveal delay={0}>
            <article className="group relative">
              {mainPost.image_url && (
                <Link
                  to="/post/$slug"
                  params={{ slug: mainPost.slug ?? "" }}
                  className="block overflow-hidden rounded-sm"
                >
                  <NewsImage
                    src={mainPost.image_url}
                    alt={mainPost.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </Link>
              )}
              <div className="mt-4">
                <Link to="/post/$slug" params={{ slug: mainPost.slug ?? "" }}>
                  <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary md:text-3xl lg:text-4xl">
                    {mainPost.kicker && <span className="text-primary">{mainPost.kicker} / </span>}
                    {mainPost.title}
                  </h2>
                </Link>
                <p className="mt-3 line-clamp-3 text-base text-muted-foreground lg:text-lg">
                  {mainPost.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-primary">{categoryName(mainPost.category)}</span>
                  <span>•</span>
                  <span>{banglaDateTime(mainPost.published_at)}</span>
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Side Posts (Right) */}
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6">
            {sidePosts.map((p, i) => (
              <Reveal key={p.id} delay={100 + i * 50}>
                <article className="group flex gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                      <h3 className="line-clamp-2 font-display text-base font-bold leading-snug transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="text-primary">{categoryName(p.category)}</span>
                      <span>{banglaDateTime(p.published_at)}</span>
                    </div>
                  </div>
                  {p.image_url && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: p.slug ?? "" }}
                      className="block h-20 w-32 shrink-0 overflow-hidden rounded-sm"
                    >
                      <NewsImage
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Posts Grid */}
      {bottomPosts.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {bottomPosts.map((p, i) => (
            <Reveal key={p.id} delay={300 + i * 50}>
              <article className="group">
                {p.image_url && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: p.slug ?? "" }}
                    className="mb-3 block overflow-hidden rounded-sm"
                  >
                    <NewsImage
                      src={p.image_url}
                      alt={p.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                )}
                <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                  <h4 className="line-clamp-2 font-display text-[15px] font-bold leading-snug transition-colors group-hover:text-primary">
                    {p.title}
                  </h4>
                </Link>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {categoryName(p.category)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
