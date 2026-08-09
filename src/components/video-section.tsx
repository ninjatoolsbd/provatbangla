import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Play, ChevronRight } from "lucide-react";
import { fetchPublishedPosts } from "@/lib/posts";
import { NewsImage } from "@/components/news-cards";

export function VideoSection() {
  const { data: posts = [] } = useQuery({
    queryKey: ["video-gallery-posts"],
    queryFn: () => fetchPublishedPosts(10, "video"),
  });

  if (posts.length === 0) return null;

  return (
    <section className="mt-8 overflow-hidden bg-[#1a1a1a] text-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-red-600"></span>
          </span>
          ভিডিও গ্যালারি
        </h2>
        <Link
          to="/category/$slug"
          params={{ slug: "video" }}
          className="flex items-center gap-1 bg-red-700 px-4 py-1.5 text-sm font-bold transition-colors hover:bg-red-800"
        >
          সকল ভিডিও দেখুন <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/post/$slug"
            params={{ slug: post.slug ?? "" }}
            className="group w-[280px] shrink-0 sm:w-[320px]"
          >
            <div className="relative aspect-video overflow-hidden rounded-sm">
              <NewsImage
                src={post.image_url}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="grid size-12 place-items-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="size-6 fill-white text-white" />
                </div>
              </div>
            </div>
            <h3 className="mt-3 line-clamp-2 font-display text-[16px] leading-snug font-bold transition-colors group-hover:text-red-400">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
