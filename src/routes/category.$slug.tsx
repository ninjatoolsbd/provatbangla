import { createFileRoute, notFound } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GridCard, LeadCard, SectionHeading } from "@/components/news-cards";
import { byCategory, categories, categoryName } from "@/lib/news-data";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const exists = categories.some((c) => c.slug === params.slug);
    if (!exists) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const name = categoryName(params.slug);
    return {
      meta: [
        { title: `${name} — কালবেলা` },
        { name: "description", content: `${name} বিভাগের সর্বশেষ বাংলা সংবাদ ও প্রতিবেদন।` },
        { property: "og:title", content: `${name} — কালবেলা` },
        { property: "og:description", content: `${name} বিভাগের সর্বশেষ খবর।` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const list = byCategory(slug);
  const [lead, ...rest] = list;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <SectionHeading title={categoryName(slug)} />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">{lead && <LeadCard article={lead} />}</div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {rest.slice(0, 2).map((a) => (
              <GridCard key={a.id} article={a} compact />
            ))}
          </div>
        </div>

        {rest.length > 2 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rest.slice(2).map((a) => (
              <GridCard key={a.id} article={a} compact />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
