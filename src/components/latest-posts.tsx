import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/my-supabase/client";
import { NewsImage } from "@/components/news-cards";
import { Reveal } from "@/components/reveal";
import { banglaDateTime, Post } from "@/lib/posts";
import { categoryName } from "@/lib/news-data";

async function fetchFilteredPosts(limit = 12, category?: string) {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    q = q.eq("category", category);
  } else {
    q = q.in("category", ["sorboshesh", "bangladesh", "apradh", "politics", "international"]);
  }

  const { data, error } = await q.limit(limit);
  if (error) throw error;

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
  const sidePosts = data.slice(1, 3);
  const bottomPosts = data.slice(3, 6);

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Main Feature (Big) */}
        <div className="lg:col-span-8">
          <Reveal delay={0}>
            <article className="group bg-white p-0 shadow-sm border border-slate-100">
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
              <div className="p-5">
                <Link to="/post/$slug" params={{ slug: mainPost.slug ?? "" }}>
                  <h2 className="font-display text-[28px] font-bold leading-[1.3] text-slate-900 transition-colors group-hover:text-primary lg:text-[32px]">
                    {mainPost.title}
                  </h2>
                </Link>
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">
                  {mainPost.excerpt || mainPost.content?.replace(/<[^>]*>/g, '').slice(0, 250) + "..."}
                </p>
                <div className="mt-6 flex items-center justify-end border-t border-slate-50 pt-3">
                   <Link 
                     to="/category/$slug" 
                     params={{ slug: mainPost.category || "bangladesh" }}
                     className="flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-primary"
                   >
                     {categoryName(mainPost.category)} <span className="text-primary">|</span>
                   </Link>
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Right: Two Stacked Items (user-uploads://file-21 style) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {sidePosts.map((p, i) => (
            <Reveal key={p.id} delay={100 + i * 50}>
              <article className="group bg-white shadow-sm border border-slate-100 h-full flex flex-col">
                {p.image_url && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: p.slug ?? "" }}
                    className="block overflow-hidden"
                  >
                    <NewsImage
                      src={p.image_url}
                      alt={p.title}
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h3 className="line-clamp-3 font-display text-[18px] font-bold leading-[1.4] text-slate-800 transition-colors group-hover:text-primary">
                      {p.title}
                    </h3>
                  </Link>
                  <div className="mt-4 flex items-center justify-end border-t border-slate-50 pt-2">
                    <Link 
                      to="/category/$slug" 
                      params={{ slug: p.category || "bangladesh" }}
                      className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-primary"
                    >
                      {categoryName(p.category)} <span className="text-primary">|</span>
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Bottom 3 Grid Items (Matching user-uploads://file-21) */}
        <div className="lg:col-span-12 mt-2 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {bottomPosts.map((p, i) => (
            <Reveal key={p.id} delay={200 + i * 50}>
              <article className="group bg-white shadow-sm border border-slate-100 flex flex-col h-full">
                {p.image_url && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: p.slug ?? "" }}
                    className="block overflow-hidden"
                  >
                    <NewsImage
                      src={p.image_url}
                      alt={p.title}
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h4 className="line-clamp-3 font-display text-[17px] font-bold leading-[1.4] text-slate-800 transition-colors group-hover:text-primary">
                      {p.title}
                    </h4>
                  </Link>
                  <div className="mt-4 flex items-center justify-end border-t border-slate-50 pt-2">
                    <Link 
                      to="/category/$slug" 
                      params={{ slug: p.category || "bangladesh" }}
                      className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-primary"
                    >
                      {categoryName(p.category)} <span className="text-primary">|</span>
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}