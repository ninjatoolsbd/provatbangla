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
      <main className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <nav className="mb-3 text-xs text-muted-foreground">
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

        <div className="grid gap-5 lg:grid-cols-12">
          <article className="border border-border bg-card p-4 sm:p-6 lg:col-span-8">
            {article.kicker && (
              <span className="mb-2 block font-display text-lg font-bold text-primary">
                {article.kicker}
              </span>
            )}
            <h1 className="font-display text-[30px] leading-[1.3] font-bold sm:text-[38px]">
              {article.title}
            </h1>
            <Meta article={article} />

            <div className="mt-4 flex items-center gap-2 border-y border-border py-2">
              <span className="text-xs text-muted-foreground">শেয়ার:</span>
              <span className="grid size-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                <Facebook className="size-4" />
              </span>
              <span className="grid size-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="size-4" />
              </span>
              <span className="grid size-8 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground">
                <Link2 className="size-4" />
              </span>
            </div>

            <figure className="mt-4">
              <img
                src={article.image}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover"
              />
              <figcaption className="mt-1.5 border-b border-border pb-2 text-xs text-muted-foreground">
                ছবি: প্রতীকী (ডেমো)
              </figcaption>
            </figure>

            <div className="kb-article mt-5 space-y-4 text-[18px] leading-[1.95] text-foreground/90">
              <p className="font-semibold">{article.excerpt}</p>
              {article.body.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-xs font-bold text-muted-foreground">ট্যাগ:</span>
              {[categoryName(article.category), article.location, "প্রভাতবাংলা"].map((t) => (
                <Link
                  key={t}
                  to="/category/$slug"
                  params={{ slug: article.category }}
                  className="border border-border bg-secondary px-2.5 py-1 text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {t}
                </Link>
              ))}
            </div>
          </article>

          <aside className="lg:col-span-4">
            <div className="border border-border bg-card p-4 lg:sticky lg:top-4">
              <SectionHeading title="সম্পর্কিত খবর" slug={article.category} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {more.slice(0, 3).map((a) => (
                  <GridCard key={a.id} article={a} compact />
                ))}
              </div>
              <div className="mt-4 flex h-[250px] items-center justify-center border border-dashed border-border bg-secondary text-xs text-muted-foreground">
                বিজ্ঞাপন
              </div>
            </div>
          </aside>
        </div>

        {/* ============ MORE FROM THIS SECTION ============ */}
        <section className="mt-5 border border-border bg-card p-4">
          <SectionHeading title={`আরও ${categoryName(article.category)}`} slug={article.category} />
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {more.slice(0, 4).map((a) => (
              <GridCard key={`b-${a.id}`} article={a} compact />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
