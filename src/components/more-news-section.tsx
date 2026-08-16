import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewsImage } from "@/components/news-cards";
import { fetchPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";

export function MoreNewsSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { data: posts = [] } = useQuery({
    queryKey: ["more-news-section"],
    queryFn: async () => {
      const result = await fetchPublishedPosts(12);
      if (result.length === 0) {
        // Fallback demo data
        return Array.from({ length: 6 }).map((_, i) => ({
          id: `demo-${i}`,
          title: i % 2 === 0 
            ? "অস্ট্রেলিয়ার মাটিতে টাইগারদের ঐতিহাসিক টেস্ট জয়: ডারউইনে ৯ উইকেটে হারল অজিরা"
            : "দিনব্যাপী সফরে সড়কপথে কিশোরগঞ্জে প্রধানমন্ত্রী তারেক রহমান",
          slug: `demo-${i}`,
          image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
          published_at: new Date().toISOString()
        }));
      }
      return result;
    },
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toBanglaDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const bnDate = date.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    const bnTime = date.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "numeric", hour12: true });
    return `${bnDate} এ ${bnTime}`;
  };

  return (
    <section className="mt-12 bg-[#0F172A] py-10 text-white">
      <div className="mx-auto max-w-[1360px] px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">আরও খবর</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/post/$slug"
              params={{ slug: post.slug || String(post.id) }}
              className="w-[300px] shrink-0 scroll-snap-align-start group"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-800 shadow-lg">
                <NewsImage
                  src={post.image_url}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="line-clamp-2 font-display text-[17px] font-bold leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-[13px] text-slate-400">
                  {toBanglaDateTime(post.published_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
