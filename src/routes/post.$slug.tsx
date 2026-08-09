import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsImage } from "@/components/news-cards";
import { categoryName } from "@/lib/news-data";
import { banglaDateTime, paragraphs, type Post } from "@/lib/posts";
import { getPublishedPost, getPostForPreview } from "@/lib/public-posts.functions";

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-4 py-6">
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
          <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl">
            {post.kicker && <span className="block text-lg text-primary">{post.kicker}</span>}
            {post.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{categoryName(post.category)}</span>
            <span>•</span>
            <span>{post.author_name}</span>
            <span>•</span>
            <span>{banglaDateTime(post.published_at ?? post.created_at)}</span>
          </div>

          {post.image_url && (
            <NewsImage
              src={post.image_url}
              alt={post.title}
              className="mt-5 aspect-[16/9] w-full object-cover"
              loading="eager"
            />
          )}

          <div className="mt-6 space-y-4 text-[17px] leading-[1.9] text-foreground/90">
            <p className="font-semibold">{post.excerpt}</p>
            {paragraphs(post.content).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}