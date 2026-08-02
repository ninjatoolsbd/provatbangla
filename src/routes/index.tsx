import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GridCard, LeadCard, ListRow, SectionHeading } from "@/components/news-cards";
import { articles, byCategory, categories, categoryName } from "@/lib/news-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "কালবেলা — সর্বশেষ বাংলা সংবাদ, জাতীয় ও আন্তর্জাতিক খবর" },
      {
        name: "description",
        content:
          "জাতীয়, রাজনীতি, খেলা, বিনোদন, অর্থনীতি ও আন্তর্জাতিক অঙ্গনের সর্বশেষ বাংলা সংবাদ এক জায়গায়। (ডেমো সংবাদ পোর্টাল)",
      },
      { property: "og:title", content: "কালবেলা — সর্বশেষ বাংলা সংবাদ" },
      {
        property: "og:description",
        content: "বাংলাদেশ ও বিশ্বের সব খবর — জাতীয়, রাজনীতি, খেলা, বিনোদন ও অর্থনীতি।",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [lead, ...restNational] = byCategory("jatiyo");
  const crime = byCategory("apradh");
  const latest = articles.slice(0, 8);
  const popular = [...articles].slice(10, 15);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-secondary">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2">
          <span className="shrink-0 rounded-sm bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            সর্বশেষ
          </span>
          <div className="marquee-mask relative flex-1 overflow-hidden">
            <div className="marquee flex gap-8 whitespace-nowrap">
              {[...latest, ...latest].map((a, i) => (
                <Link
                  key={`${a.id}-${i}`}
                  to="/news/$id"
                  params={{ id: String(a.id) }}
                  className="text-sm hover:text-primary"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">{lead && <LeadCard article={lead} />}</div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {restNational.slice(0, 2).map((a) => (
              <GridCard key={a.id} article={a} />
            ))}
          </div>

          <aside className="lg:col-span-12">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <SectionHeading title="সর্বশেষ খবর" />
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {latest.slice(1, 7).map((a) => (
                    <GridCard key={a.id} article={a} compact />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4">
                <SectionHeading title="সর্বাধিক পঠিত" />
                <div>
                  {popular.map((a, i) => (
                    <ListRow key={a.id} article={a} index={i} />
                  ))}
                </div>
                <div className="mt-5 flex h-60 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
                  বিজ্ঞাপন
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10">
          <SectionHeading title={categoryName("apradh")} slug="apradh" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">{crime[0] && <LeadCard article={crime[0]} />}</div>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              {crime.slice(1).map((a) => (
                <GridCard key={a.id} article={a} compact />
              ))}
            </div>
          </div>
        </section>

        {categories
          .filter((c) => !["jatiyo", "apradh"].includes(c.slug))
          .map((c) => {
            const list = byCategory(c.slug);
            if (list.length === 0) return null;
            return (
              <section key={c.slug} className="mt-10">
                <SectionHeading title={c.name} slug={c.slug} />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {list.slice(0, 4).map((a) => (
                    <GridCard key={a.id} article={a} compact />
                  ))}
                </div>
              </section>
            );
          })}
      </main>

      <SiteFooter />
    </div>
  );
}
