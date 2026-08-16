import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as React from "react";
import { Facebook, MessageCircle, Send, Twitter, Linkedin, Share2, User, Clock, MapPin } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsImage, GridCard } from "@/components/news-cards";
import { categoryName } from "@/lib/news-data";
import { banglaDateTime, paragraphs, type Post, fetchPublishedPosts } from "@/lib/posts";
import { getPublishedPost, getPostForPreview } from "@/lib/public-posts.functions";
import { getRelatedPosts } from "@/lib/related-posts.functions";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type PostSearch = {
  preview?: boolean;
};

export const Route = createFileRoute("/post/$slug")({
  validateSearch: (search: Record<string, unknown>): PostSearch => {
    return {
      preview: search['preview'] === "true" || search['preview'] === true,
    };
  },
  loaderDeps: ({ search: { preview } }) => ({ preview }),
  loader: async ({ params, deps: { preview } }) => {
    let post;
    const decodedSlug = decodeURIComponent(params.slug);
    try {
      if (preview) {
        post = await getPostForPreview({ data: { slug: decodedSlug } });
      } else {
        post = await getPublishedPost({ data: { slug: decodedSlug } });
      }
    } catch (e) {
      console.error("Loader fetch error:", e);
      // Fallback for demo news or not found
      throw notFound();
    }
    
    if (!post) throw notFound();
    return { post: post as Post, isPreview: !!preview };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "সংবাদটি পাওয়া যায়নি — প্রভাতবাংলা" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post;
    const title = p.seo_title || `${p.title} — প্রভাতবাংলা`;
    const desc = (p.seo_description || p.excerpt).slice(0, 155);
    const canonical = `https://provatbangla.com/post/${p.slug}`;
    
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: p.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "article:published_time", content: p.published_at || p.created_at },
        { property: "article:section", content: p.category },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p.image_url?.startsWith("https://")
          ? [
              { property: "og:image", content: p.image_url },
              { name: "twitter:image", content: p.image_url },
            ]
          : []),
      ],
      links: [
        { rel: "canonical", href: canonical }
      ]
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, isPreview } = Route.useLoaderData();
  const [activeTab, setActiveTab] = React.useState<"latest" | "popular">("latest");

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-posts", post.slug, post.category],
    queryFn: async () => {
      const url = new URL("/api/public/related-posts", window.location.origin);
      url.searchParams.set("category", post.category);
      url.searchParams.set("excludeSlug", post.slug || "");
      url.searchParams.set("limit", "12");
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["post-sidebar-latest"],
    queryFn: () => fetchPublishedPosts(10),
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["post-sidebar-popular"],
    queryFn: () => fetchPublishedPosts(10, undefined, "popular"),
  });

  const sidebarPosts = activeTab === "latest" ? latestPosts : popularPosts;

  const toBanglaNumber = (n: number) => {
    return String(n).split("").map(d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]).join("");
  };

  const mappedRelated = (relatedPosts as any[]).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.image_url,
    category: p.category,
    time: new Date(p.published_at || p.created_at).toLocaleDateString("bn-BD"),
  }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-9">
            {isPreview && (
              <div className="mb-6 rounded-md bg-yellow-100 p-3 text-center text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                এটি একটি প্রিভিউ। এই নিউজটি এখনও প্রকাশিত হয়নি।
              </div>
            )}
            
            <nav className="mb-3 flex items-center gap-2 text-[14px] text-muted-foreground">
              <Link to="/" className="text-[#b20000]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                to="/category/$slug"
                params={{ slug: post.category }}
                className="hover:text-primary"
              >
                {categoryName(post.category)}
              </Link>
            </nav>

            <article className="border border-border bg-card p-4 sm:p-5">
              <h1 className="font-display text-[24px] font-bold leading-[1.3] text-slate-900 sm:text-[32px] lg:text-[38px] mb-4">
                {post.kicker && (
                  <span className="mb-1 block text-lg text-primary">
                    {post.kicker}
                  </span>
                )}
                {post.title}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center justify-between border-y border-slate-100 py-3 mb-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <Link to="/" className="font-bold text-[#1a73e8] hover:underline">
                      {post.author_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>
                      {banglaDateTime(post.published_at ?? post.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90">
                    <Facebook className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DA1F2] text-white hover:opacity-90">
                    <Twitter className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-white hover:opacity-90">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {post.image_url && (
                <div className="mb-5">
                  <NewsImage
                    src={post.image_url}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover"
                    loading="eager"
                  />
                  {(post as any).image_caption && (
                    <p className="mt-2 text-sm text-muted-foreground italic border-b border-slate-100 pb-2">
                      {(post as any).image_caption}
                    </p>
                  )}
                </div>
              )}

              <div className="post-content mb-8 text-[18px] leading-[1.8] text-slate-800 space-y-5">
                <div className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{(post as any).location || "ঢাকা"}, প্রতিনিধি:</span>
                </div>
                {post.excerpt && <p className="font-bold text-[19px] leading-[1.7]">{post.excerpt}</p>}
                {paragraphs(post.content).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Tags/Categories */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 mt-8">
                <span className="flex h-8 items-center bg-black px-3 text-[13px] font-bold text-white">
                  ফ্রিডম নিউজ সর্বশেষ
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link to="/" className="flex h-8 items-center border border-slate-200 bg-slate-50 px-3 text-[13px] hover:bg-slate-100">
                    {categoryName(post.category)}
                  </Link>
                  <Link to="/" className="flex h-8 items-center border border-slate-200 bg-slate-50 px-3 text-[13px] hover:bg-slate-100">
                    বিশেষ প্রতিবেদন
                  </Link>
                  <Link to="/" className="flex h-8 items-center border border-slate-200 bg-slate-50 px-3 text-[13px] hover:bg-slate-100">
                    বাংলাদেশ
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="space-y-6">
              {/* Latest in category list style */}
              <div className="border border-slate-200 bg-white p-3">
                 <div className="relative mb-4 flex h-[32px] items-center border-y-[3px] border-black bg-white">
                  <div className="h-[18px] w-[18px] bg-black" />
                  <h3 className="ml-2 font-display text-[16px] font-bold text-black leading-none">
                    সর্বশেষ - {categoryName(post.category)}
                  </h3>
                  <div className="ml-auto h-[18px] w-2.5 bg-black" />
                </div>
                <div className="space-y-0">
                  {latestPosts.slice(0, 5).map((p) => (
                    <Link key={p.id} to="/post/$slug" params={{ slug: p.slug || "" }} className="group flex items-start gap-2 border-b border-dotted border-slate-200 py-3 last:border-0">
                      <div className="mt-1 flex gap-0.5">
                        <span className="h-1.5 w-1.5 rotate-45 border-r border-b border-black" />
                        <span className="h-1.5 w-1.5 rotate-45 border-r border-b border-black -ml-1" />
                      </div>
                      <h4 className="font-display text-[15px] font-bold leading-tight group-hover:text-primary">
                        {p.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Most Read style */}
              <div className="border border-slate-200 bg-white p-3">
                 <div className="relative mb-4 flex h-[32px] items-center border-y-[3px] border-black bg-white">
                  <div className="h-[18px] w-[18px] bg-black" />
                  <h3 className="ml-2 font-display text-[16px] font-bold text-black leading-none">
                    সর্বোচ্চ পঠিত - {categoryName(post.category)}
                  </h3>
                  <div className="ml-auto h-[18px] w-2.5 bg-black" />
                </div>
                {popularPosts[0] && (
                  <Link to="/post/$slug" params={{ slug: popularPosts[0].slug || "" }} className="group block mb-4">
                    <NewsImage src={popularPosts[0].image_url || ""} alt={popularPosts[0].title} className="aspect-video w-full object-cover mb-2" />
                    <h4 className="font-display text-[15px] font-bold leading-tight group-hover:text-primary">
                      {popularPosts[0].title}
                    </h4>
                  </Link>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {popularPosts.slice(1, 5).map((p) => (
                    <Link key={p.id} to="/post/$slug" params={{ slug: p.slug || "" }} className="group block">
                      <NewsImage src={p.image_url || ""} alt={p.title} className="aspect-[4/3] w-full object-cover mb-1.5" />
                      <h4 className="line-clamp-3 font-display text-[13px] font-bold leading-tight group-hover:text-primary">
                        {p.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Selected for you style (Red Header) */}
              <div>
                <div className="mb-4 bg-[#b20000] py-2 px-3 text-center text-[18px] font-bold text-white shadow-sm">
                  আপনার জন্য নির্বাচিত
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {relatedPosts.slice(0, 10).map((p: any) => (
                    <Link key={p.id} to="/post/$slug" params={{ slug: p.slug || "" }} className="group relative aspect-[4/3] overflow-hidden">
                      <NewsImage src={p.image_url || ""} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2">
                        <h4 className="line-clamp-3 font-display text-[12px] font-bold leading-tight text-white group-hover:text-primary">
                          {p.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Full Width "Aro Khobor" Section */}
        <div className="mt-8 border border-border bg-card p-4">
          <div className="relative mb-6 flex h-[32px] items-center border-y-[3px] border-black bg-white">
            <div className="h-[18px] w-[18px] bg-black" />
            <h3 className="ml-2 font-display text-[18px] font-bold text-black leading-none">
              আরও খবর
            </h3>
            <div className="ml-auto h-[18px] w-2.5 bg-black" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {relatedPosts.slice(0, 12).map((a: any) => (
              <Link key={a.id} to="/post/$slug" params={{ slug: a.slug || "" }} className="group block">
                <NewsImage src={a.image_url || ""} alt={a.title} className="aspect-[16/9] w-full object-cover mb-2" />
                <h4 className="line-clamp-2 font-display text-[15px] font-bold leading-snug group-hover:text-primary">
                  {a.title}
                </h4>
                <span className="mt-1 block text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> {categoryName(a.category)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
