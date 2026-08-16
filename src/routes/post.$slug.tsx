import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as React from "react";
import { Facebook, MessageCircle, Send, Twitter, Linkedin, Share2 } from "lucide-react";

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
    if (preview) {
      post = await getPostForPreview({ data: { slug: params.slug } });
    } else {
      post = await getPublishedPost({ data: { slug: params.slug } });
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
  const fetchRelated = useServerFn(getRelatedPosts);
  const [activeTab, setActiveTab] = React.useState<"latest" | "popular">("latest");

  const { data: relatedPosts = [] } = useSuspenseQuery({
    queryKey: ["related-posts", post.slug],
    queryFn: () => fetchRelated({ data: { category: post.category, excludeSlug: post.slug, limit: 6 } }),
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ["post-sidebar-latest"],
    queryFn: () => fetchPublishedPosts(8),
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["post-sidebar-popular"],
    queryFn: () => fetchPublishedPosts(8, undefined, "popular"),
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
      <main className="mx-auto max-w-[1240px] px-4 py-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {isPreview && (
              <div className="mb-6 rounded-md bg-yellow-100 p-3 text-center text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                এটি একটি প্রিভিউ। এই নিউজটি এখনও প্রকাশিত হয়নি।
              </div>
            )}
            <nav className="mb-4 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                প্রচ্ছদ
              </Link>
              <span className="mx-2">/</span>
              <Link
                to="/category/$slug"
                params={{ slug: post.category }}
                className="hover:text-primary"
              >
                {categoryName(post.category)}
              </Link>
            </nav>

            <article>
              <h1 className="font-display text-2xl font-bold leading-[1.3] text-slate-900 sm:text-3xl lg:text-[42px]">
                {post.kicker && (
                  <span className="mb-1 block text-lg text-primary">
                    {post.kicker}
                  </span>
                )}
                {post.title}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center justify-between border-y border-slate-100 py-3">
                <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                  <span className="font-bold text-slate-800">{post.author_name}</span>
                  <span>•</span>
                  <span>
                    {banglaDateTime(post.published_at ?? post.created_at)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[
                    { icon: Facebook, bg: "bg-[#4267B2]" },
                    { icon: MessageCircle, bg: "bg-[#42A5F5]" },
                    { icon: Send, bg: "bg-[#00C853]" },
                    { icon: Share2, bg: "bg-slate-600" }
                  ].map((social, idx) => (
                    <button key={idx} className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white transition-all hover:scale-105", social.bg)}>
                      <social.icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {post.image_url && (
                <div className="mt-5">
                  <NewsImage
                    src={post.image_url}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover rounded-sm"
                    loading="eager"
                    width="800"
                    height="450"
                  />
                  {(post as any).image_caption && (
                    <p className="mt-2 text-sm text-muted-foreground italic">{(post as any).image_caption}</p>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-6 text-[17px] leading-[1.7] text-slate-800 sm:text-[19px] sm:leading-[1.8] post-content">
                {post.excerpt && <p className="font-bold text-slate-900">{post.excerpt}</p>}
                {paragraphs(post.content).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>

            {/* Related News Section */}
            {mappedRelated.length > 0 && (
              <div className="mt-16 border-t border-slate-200 pt-10">
                <div className="mb-8 flex items-center gap-3">
                  <span className="h-6 w-1.5 rounded-full bg-primary"></span>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    আরও পড়ুন
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mappedRelated.map((a: any, i: number) => (
                    <Reveal key={a.id} delay={i * 50}>
                      <GridCard article={a as any} compact />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              {/* Tabs Widget */}
              <div className="flex flex-col border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
                <div className="flex bg-slate-50 border-b border-slate-200">
                  <button 
                    onClick={() => setActiveTab("latest")}
                    className={cn(
                      "flex-1 py-3 text-[16px] font-bold transition-all relative",
                      activeTab === "latest" ? "text-primary bg-white border-t-2 border-primary" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    সর্বশেষ
                  </button>
                  <button 
                    onClick={() => setActiveTab("popular")}
                    className={cn(
                      "flex-1 py-3 text-[16px] font-bold transition-all relative",
                      activeTab === "popular" ? "text-primary bg-white border-t-2 border-primary" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    জনপ্রিয়
                  </button>
                </div>
                <div className="p-2 space-y-0.5 max-h-[600px] overflow-y-auto">
                  {sidebarPosts.map((p, i) => (
                    <Link
                      key={p.id}
                      to="/post/$slug"
                      params={{ slug: p.slug ?? "" }}
                      className="group flex items-start gap-3 border-b border-slate-50 py-3.5 px-3 hover:bg-slate-50 transition-colors last:border-0"
                    >
                      <span className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold mt-0.5",
                        i < 3 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
                      )}>
                        {toBanglaNumber(i + 1)}
                      </span>
                      <h4 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-slate-800 group-hover:text-primary transition-colors">
                        {p.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter or Ad Mockup */}
              <div className="rounded-lg bg-slate-900 p-6 text-white text-center">
                <h4 className="font-display text-xl font-bold mb-2">প্রভাতবাংলা নিউজলেটার</h4>
                <p className="text-sm text-slate-400 mb-4">দেশ বিদেশের সব খবর সবার আগে আপনার ইমেইলে পেতে সাবস্ক্রাইব করুন।</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="আপনার ইমেইল" className="flex-1 rounded-sm bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button className="bg-primary px-4 py-2 rounded-sm text-sm font-bold hover:bg-primary/90 transition-colors">সাবস্ক্রাইব</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}