import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/my-supabase/client";
import { NewsImage } from "@/components/news-cards";
import { Reveal } from "@/components/reveal";
import { banglaDateTime, Post } from "@/lib/posts";
import { ChevronLeft, ChevronRight } from "lucide-react";

async function fetchFilteredPosts(limit = 20, category?: string) {
  let q = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (category) {
    q = q.eq("category", category);
  }

  const { data, error } = await q.limit(limit);
  if (error) throw error;

  let posts = (data ?? []) as Post[];
  
  if (!category) {
    posts.sort((a, b) => {
      if (a.category === 'sorboshesh' && b.category !== 'sorboshesh') return -1;
      if (a.category !== 'sorboshesh' && b.category === 'sorboshesh') return 1;
      return 0;
    });
  }

  return posts;
}

export function LatestPosts({ category }: { category?: string }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { data = [] } = useQuery({
    queryKey: ["sorboshesh-hero-posts", category ?? "all"],
    queryFn: () => fetchFilteredPosts(20, category),
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

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
                    width="400"
                    height="250"
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
  
  const sidePosts = data.slice(1, 6); // Right sidebar posts (increased to 5)
  const secondaryPosts = data.slice(6, 9); // Three-column grid posts
  const sliderPosts = data.slice(9); // Slider posts

  return (
    <section className="mb-12">
      {/* Top Section: Hero + Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left: Featured Hero */}
        <div className="lg:col-span-8">
          <Reveal delay={0}>
            <article className="group relative overflow-hidden rounded-md bg-slate-50 transition-all hover:bg-white hover:shadow-xl">
              <div className="relative">
                {mainPost.image_url && (
                  <Link
                    to="/post/$slug"
                    params={{ slug: mainPost.slug ?? "" }}
                    className="block aspect-[16/9] overflow-hidden"
                  >
                    <NewsImage
                      src={mainPost.image_url}
                      alt={mainPost.title}
                      className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      loading="eager"
                      width="800"
                      height="450"
                    />
                  </Link>
                )}
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                    প্রধান সংবাদ
                  </span>
                </div>
              </div>
              
              <div className="p-6 lg:p-8">
                <Link to="/post/$slug" params={{ slug: mainPost.slug ?? "" }}>
                  <h2 className="font-display text-2xl font-extrabold leading-[1.2] text-slate-900 transition-colors group-hover:text-primary lg:text-[42px]">
                    {mainPost.title}
                  </h2>
                </Link>
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>{banglaDateTime(mainPost.published_at)}</span>
                </div>
                <p className="mt-6 line-clamp-3 text-lg leading-relaxed text-slate-600">
                  {mainPost.excerpt || (mainPost.content ? mainPost.content.replace(/<[^>]*>/g, '').slice(0, 220) : "")}
                </p>
                <Link 
                  to="/post/$slug" 
                  params={{ slug: mainPost.slug ?? "" }}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline"
                >
                  বিস্তারিত পড়ুন
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Right: Sidebar Feed */}
        <div className="lg:col-span-4 flex flex-col border border-slate-100 rounded-md bg-slate-50/50 p-4">
          <div className="flex flex-col gap-6 h-full">
            <h3 className="flex items-center gap-3 font-display text-[22px] font-bold text-slate-900 shrink-0">
              <span className="h-[22px] w-[5px] bg-primary"></span>
              খবরগুলো পড়ুন
            </h3>
            <div className="flex-1 space-y-5 overflow-hidden">
              {sidePosts.map((p, i) => (
                <Reveal key={p.id} delay={100 + i * 50}>
                  <article className="group grid grid-cols-3 gap-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="col-span-1">
                      {p.image_url && (
                        <Link to="/post/$slug" params={{ slug: p.slug ?? "" }} className="block overflow-hidden rounded-sm shadow-sm">
                          <NewsImage 
                            src={p.image_url} 
                            alt={p.title} 
                            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            width="100"
                            height="100"
                          />
                        </Link>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                        <h3 className="line-clamp-2 font-display text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">
                          {p.title}
                        </h3>
                      </Link>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {banglaDateTime(p.published_at)}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Secondary Grid */}
      {secondaryPosts.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {secondaryPosts.map((p, i) => (
            <Reveal key={p.id} delay={200 + i * 50}>
              <article className="group flex flex-col gap-4 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-lg hover:ring-primary/20">
                {p.image_url && (
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }} className="block overflow-hidden rounded-lg">
                    <NewsImage
                      src={p.image_url}
                      alt={p.title}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width="400"
                      height="225"
                    />
                  </Link>
                )}
                <div>
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-slate-900 group-hover:text-primary">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {p.excerpt || (p.content ? p.content.replace(/<[^>]*>/g, '').slice(0, 100) : "")}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {/* Bottom: Infinite-style Slider */}
      {sliderPosts.length > 0 && (
        <div className="mt-16 overflow-hidden bg-slate-900 px-6 py-12 rounded-3xl shadow-2xl lg:px-12">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-display text-2xl font-black text-white">আরও খবর</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => scroll("left")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-primary hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-primary hover:scale-110 active:scale-95"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          >
            {sliderPosts.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <article className="group w-[320px] shrink-0 snap-start">
                  {p.image_url && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: p.slug ?? "" }}
                      className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-xl"
                    >
                      <NewsImage
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        width="320"
                        height="200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                  )}
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h4 className="line-clamp-2 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-primary-foreground">
                      {p.title}
                    </h4>
                  </Link>
                  <div className="mt-2 text-sm text-slate-400">
                    {banglaDateTime(p.published_at)}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}