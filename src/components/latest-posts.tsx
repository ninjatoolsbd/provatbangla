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
    // Manually sort to prioritize 'sorboshesh' category
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
  
  const sidePosts = data.slice(1, 4);
  const sliderPosts = data.slice(4);

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Section: Main + Sidebar (Matching user-uploads://file-22) */}
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
                  <h2 className="font-display text-[26px] font-bold leading-[1.3] text-[#F37021] transition-colors group-hover:text-primary lg:text-[30px]">
                    {mainPost.title} <span className="text-[14px] ml-1 opacity-60 text-slate-400">↙</span>
                  </h2>
                </Link>
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">
                  {mainPost.excerpt || (mainPost.content ? mainPost.content.replace(/<[^>]*>/g, '').slice(0, 250) + "..." : "")}
                </p>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Right Section: Small Text List with Thumbnail at Top */}
        <div className="lg:col-span-4 border-l border-slate-100 pl-6 flex flex-col">
          {sidePosts.map((p, i) => (
            <Reveal key={p.id} delay={100 + i * 50}>
              <article className="group mb-5 pb-5 border-b border-slate-50 last:border-0 last:mb-0 last:pb-0">
                {i === 0 && p.image_url && (
                   <Link to="/post/$slug" params={{ slug: p.slug ?? "" }} className="block mb-4 overflow-hidden rounded-sm">
                     <NewsImage src={p.image_url} alt={p.title} className="aspect-[16/9] w-full object-cover" />
                   </Link>
                )}
                <div className="flex flex-col gap-1">
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h3 className="line-clamp-3 font-display text-[17px] font-bold leading-[1.4] text-slate-800 group-hover:text-primary">
                      {p.category === 'sorboshesh' && <span className="text-[#F37021] mr-2">সর্বশেষ •</span>}
                      {p.title} <span className="text-[12px] opacity-40">↙</span>
                    </h3>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Slider Section: Horizontal Scrollable Grid */}
        {sliderPosts.length > 0 && (
          <div className="lg:col-span-12 mt-6 relative group/slider">
            <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-6">
               <h3 className="font-display text-lg font-bold text-slate-800">সর্বশেষ খবর</h3>
               <div className="flex gap-2">
                  <button 
                    onClick={() => scroll("left")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => scroll("right")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            >
              {sliderPosts.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <article className="group w-[280px] shrink-0 snap-start bg-white p-0">
                    {p.image_url && (
                      <Link
                        to="/post/$slug"
                        params={{ slug: p.slug ?? "" }}
                        className="mb-3 block overflow-hidden rounded-sm shadow-sm"
                      >
                        <NewsImage
                          src={p.image_url}
                          alt={p.title}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    )}
                    <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                      <h4 className="line-clamp-3 font-display text-[16px] font-bold leading-[1.4] text-slate-800 transition-colors group-hover:text-primary">
                        {p.title} <span className="text-[12px] opacity-40">↙</span>
                      </h4>
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}