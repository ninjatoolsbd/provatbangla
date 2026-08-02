import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Facebook, Link2, Twitter } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GridCard, Meta, SectionHeading } from "@/components/news-cards";
import { categoryName, getArticle, related } from "@/lib/news-data";

export const Route = createFileRoute("/news/$id")({
  loader: ({ params }) => {
    const article = getArticle(Number(params.id));
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "সংবাদটি পাওয়া যায়নি — প্রভাতবাংলা" }, { name: "robots", content: "noindex" }] };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — প্রভাতবাংলা` },
        { name: "description", content: article.excerpt.slice(0, 155) },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt.slice(0, 155) },
        { property: "og:image", content: article.image },
        { name: "twitter:image", content: article.image },
      ],
    };
  },
  component: NewsPage,
});

function NewsPage() {
  const { article } = Route.useLoaderData();
  const more = related(article);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <nav className="mb-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            প্রচ্ছদ
          </Link>
          <span className="mx-2">/</span>
          <Link
            to="/category/$slug"
            params={{ slug: article.category }}
            className="hover:text-primary"
          >
            {categoryName(article.category)}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl">
              {article.kicker && <span className="block text-lg text-primary">{article.kicker}</span>}
              {article.title}
            </h1>
            <Meta article={article} />

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">শেয়ার:</span>
              <span className="rounded-full bg-secondary p-2">
                <Facebook className="size-4" />
              </span>
              <span className="rounded-full bg-secondary p-2">
                <Twitter className="size-4" />
              </span>
              <span className="rounded-full bg-secondary p-2">
                <Link2 className="size-4" />
              </span>
            </div>

            <img
              src={article.image}
              alt={article.title}
              className="mt-5 aspect-[16/9] w-full rounded-md object-cover"
            />
            <p className="mt-2 text-xs text-muted-foreground">ছবি: প্রতীকী (ডেমো)</p>

            <div className="mt-6 space-y-4 text-[17px] leading-[1.9] text-foreground/90">
              <p className="font-semibold">{article.excerpt}</p>
              {article.body.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          <aside className="lg:col-span-4">
            <SectionHeading title="সম্পর্কিত খবর" slug={article.category} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {more.map((a) => (
                <GridCard key={a.id} article={a} compact />
              ))}
            </div>
            <div className="mt-6 flex h-60 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
              বিজ্ঞাপন
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
