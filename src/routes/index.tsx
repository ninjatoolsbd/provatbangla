import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  GridCard,
  LeadCard,
  ListRow,
  SectionHeading,
  SplitLead,
  ThumbRow,
} from "@/components/news-cards";
import { articles, byCategory, categories, categoryName } from "@/lib/news-data";
import type { Article } from "@/lib/news-data";
import { cn } from "@/lib/utils";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function StoryTabs({ video, photo }: { video: Article[]; photo: Article[] }) {
  const [tab, setTab] = useState<"video" | "photo">("video");
  const list = tab === "video" ? video : photo;

  return (
    <div className="border border-border">
      <div className="flex items-center gap-6 border-b border-border px-3">
        {(
          [
            ["video", "ভিডিও স্টোরি"],
            ["photo", "ফটো স্টোরি"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px border-b-2 py-2.5 font-display text-[17px] font-bold",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto p-3">
        {list.map((a) => (
          <Link
            key={a.id}
            to="/news/$id"
            params={{ id: String(a.id) }}
            className="group relative block w-[190px] shrink-0 overflow-hidden"
          >
            <img
              src={a.image}
              alt={a.title}
              className="aspect-[9/14] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            {tab === "video" && (
              <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-foreground/85">
                <Play className="size-5 fill-primary text-primary" />
              </span>
            )}
            <span className="absolute right-2 bottom-2 left-2 font-display text-[15px] leading-snug font-bold text-ink-foreground">
              {a.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const national = byCategory("jatiyo");
  const lead = national[0];
  const crime = byCategory("apradh");
  const world = byCategory("antorjatik");
  const latest = articles.slice(0, 10);
  const popular = [...articles].slice(10, 15);
  const midLead = world[1] ?? articles[3];
  const midList = [crime[0], world[0], national[3], world[1], national[4]].filter(
    Boolean,
  ) as Article[];
  const sub = [crime[0], national[2], national[1], national[3], national[4], crime[1]].filter(
    Boolean,
  ) as Article[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <BreakingTicker />


      <main className="mx-auto max-w-[1240px] px-4 py-5">
        <section className="grid gap-6 lg:grid-cols-12">
          {/* left: hero + 6 cards */}
          <div className="lg:col-span-5 xl:col-span-6">
            {lead && <SplitLead article={lead} />}
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {sub.map((a) => (
                <GridCard key={a.id} article={a} compact />
              ))}
            </div>
          </div>

          {/* middle: photo lead + thumb list */}
          <div className="lg:col-span-4 xl:col-span-3">
            {midLead && (
              <article className="group">
                <Link
                  to="/news/$id"
                  params={{ id: String(midLead.id) }}
                  className="block overflow-hidden"
                >
                  <img
                    src={midLead.image}
                    alt={midLead.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <Link to="/news/$id" params={{ id: String(midLead.id) }}>
                  <h2 className="mt-2.5 border-b border-border pb-3 font-display text-[21px] leading-snug font-bold group-hover:text-primary">
                    {midLead.title}
                  </h2>
                </Link>
              </article>
            )}
            <div>
              {midList.map((a) => (
                <ThumbRow key={a.id} article={a} />
              ))}
            </div>
          </div>

          {/* right: story tabs + ad */}
          <div className="lg:col-span-3">
            <StoryTabs video={articles.slice(0, 5)} photo={articles.slice(5, 10)} />
            <div className="mt-5 flex h-64 items-center justify-center bg-secondary text-xs text-muted-foreground">
              বিজ্ঞাপন
            </div>
          </div>
        </section>

        <div className="my-8 flex h-24 items-center justify-center bg-secondary text-xs text-muted-foreground">
          বিজ্ঞাপন
        </div>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <SectionHeading title={categoryName("apradh")} slug="apradh" />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">{crime[0] && <LeadCard article={crime[0]} />}</div>
              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                {crime.slice(1).map((a) => (
                  <GridCard key={a.id} article={a} compact />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <SectionHeading title="সর্বাধিক পঠিত" />
            {popular.map((a, i) => (
              <ListRow key={a.id} article={a} index={i} />
            ))}
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
