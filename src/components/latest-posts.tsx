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
  
  const sidePosts = data.slice(1, 3); // Two image items on the right
  const sliderPosts = data.slice(3); // The bottom slider


  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Section: Big Feature Post (user-uploads://file-23 style) */}
        <div className="lg:col-span-8">
          <Reveal delay={0}>
            <article className="group bg-white p-0 overflow-hidden rounded-sm">
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
              <div className="p-0 pt-3">
                <Link to="/post/$slug" params={{ slug: mainPost.slug ?? "" }}>
                  <h2 className="text-center font-display text-[22px] font-bold leading-[1.3] text-black transition-colors group-hover:text-primary lg:text-[24px]">
                    {mainPost.title}
                  </h2>
                </Link>
              </div>

            </article>
          </Reveal>
        </div>

        {/* Right Section: Two Image Posts Stacked (Matching user-uploads://file-24 perfectly) */}
        <div className="lg:col-span-4 lg:pl-4 flex flex-col space-y-6">
          {sidePosts.map((p, i) => (
            <Reveal key={p.id} delay={100 + i * 50}>
              <article className="group flex flex-col sm:flex-row lg:flex-col gap-4">
                {p.image_url && (
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }} className="block overflow-hidden rounded-sm shadow-sm w-full sm:w-1/2 lg:w-full">
                    <NewsImage 
                      src={p.image_url} 
                      alt={p.title} 
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                )}
                <div className="flex-1">
                  <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                    <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-[1.4] text-slate-900 transition-colors group-hover:text-primary">
                      {p.title}
                    </h3>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>


        {/* Bottom Slider Section: Horizontal Scrollable Grid */}
        {sliderPosts.length > 0 && (
          <div className="lg:col-span-12 mt-8 relative group/slider">
            <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-8">
               <h3 className="font-display text-xl font-bold text-slate-800 border-l-4 border-primary pl-3">সর্বশেষ সংবাদ</h3>
               <div className="flex gap-2">
                  <button 
                    onClick={() => scroll("left")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <button 
                    onClick={() => scroll("right")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
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
                        {p.title} <span className="text-[12px] opacity-40 font-normal ml-1">↙</span>
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