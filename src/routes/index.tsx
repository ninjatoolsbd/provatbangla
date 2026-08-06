import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSection } from "@/components/epaper-section";
import { BreakingTicker } from "@/components/breaking-ticker";
import { LatestPosts } from "@/components/latest-posts";
import { Reveal } from "@/components/reveal";
import {
  ArchiveCalendar,
  BarHeading,
  DistrictSearch,
  EpaperCard,
  LatestPopularTabs,
  OpinionColumn,
  PhotoGallery,
  PollWidget,
  SocialFollow,
  VideoStrip,
} from "@/components/home-widgets";
import { DivisionMap } from "@/components/division-map";
import { AdBanner } from "@/components/ad-banner";
import { GridCard, LeadCard, SplitLead, ThumbRow } from "@/components/news-cards";
import { articles, byCategory } from "@/lib/news-data";
import type { Article } from "@/lib/news-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "প্রভাতবাংলা — সর্বশেষ বাংলা সংবাদ, জাতীয় ও আন্তর্জাতিক খবর" },
      {
        name: "description",
        content:
          "জাতীয়, রাজনীতি, খেলা, বিনোদন, অর্থনীতি ও আন্তর্জাতিক অঙ্গনের সর্বশেষ বাংলা সংবাদ এক জায়গায়। (ডেমো সংবাদ পোর্টাল)",
      },
      { property: "og:title", content: "প্রভাতবাংলা — সর্বশেষ বাংলা সংবাদ" },
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
    <div className="border border-border bg-card">
      <div className="flex border-b border-border">
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
              "flex-1 py-2.5 font-display text-[15px] font-bold transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {/* kalbela: horizontal rail of portrait (9:16) story cards */}
      <div className="flex snap-x gap-2 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.slice(0, 6).map((a) => (
          <Link
            key={a.id}
            to="/news/$id"
            params={{ id: String(a.id) }}
            className="group relative block w-[62%] shrink-0 snap-start overflow-hidden"
          >
            <img
              src={a.image}
              alt={a.title}
              className="aspect-[9/16] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            {tab === "video" && (
              <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-foreground/85">
                <Play className="size-4 fill-primary text-primary transition-transform duration-300 group-hover:scale-125" />
              </span>
            )}
            <span className="absolute right-2 bottom-2 left-2 line-clamp-3 font-display text-[14px] leading-snug font-bold text-ink-foreground">
              {a.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}


/** Text-only headline list used inside section blocks (kalbela right rails). */
function TextList({ items }: { items: Article[] }) {
  return (
    <ul className="divide-y divide-border border-t border-border">
      {items.map((a) => (
        <li key={a.id}>
          <Link
            to="/news/$id"
            params={{ id: String(a.id) }}
            className="group block py-2.5 transition-transform duration-300 hover:translate-x-1"
          >
            <span className="line-clamp-2 font-display text-[15px] leading-snug font-bold transition-colors group-hover:text-primary">
              {a.kicker && <span className="text-primary">{a.kicker} / </span>}
              {a.title}
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground">{a.time}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Take n unique articles starting at offset; top up from the full pool without repeats. */
function pick(list: Article[], n: number, offset = 0): Article[] {
  const seen = new Set<number>();
  const out: Article[] = [];
  const push = (a?: Article) => {
    if (a && !seen.has(a.id) && out.length < n) {
      seen.add(a.id);
      out.push(a);
    }
  };
  list.slice(offset).forEach(push);
  list.slice(0, offset).forEach(push);
  articles.forEach(push);
  return out;
}


function Home() {
  const national = byCategory("bangladesh");
  const politics = byCategory("chakri");
  const around = byCategory("cholonbil");
  const world = byCategory("antorjatik");
  const sports = byCategory("khela");
  const ent = byCategory("binodon");
  const econ = byCategory("shikkha");
  const crime = byCategory("apradh");
  const opinion = byCategory("shilpo-sahitto");

  const lead = articles[0];
  const heroSub = articles.slice(1, 10);
  const heroMid = articles.slice(10, 12);
  const heroThumbs = articles.slice(12, 17);
  const strip = articles.slice(17, 21);
  const latest = articles.slice(0, 10);
  const popular = articles.slice(10, 20);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4">
        {/* ================= HERO ================= */}
        {lead && (
          <section className="grid gap-5 border border-border bg-card p-4 lg:grid-cols-12 lg:divide-x lg:divide-border">
            <div className="min-w-0 lg:col-span-6 lg:pr-5">
              <SplitLead article={lead} />
            <div className="mt-4 grid divide-x divide-y divide-border border-t border-border sm:grid-cols-3">
              {heroSub.map((a, i) => (
                <Reveal key={a.id} delay={i * 60} className="p-3">
                  <GridCard article={a} compact />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-3 lg:px-5">
            <div className="space-y-4">
              {heroMid.map((a) => (
                <article key={a.id} className="group">
                  <Link
                    to="/news/$id"
                    params={{ id: String(a.id) }}
                    className="block overflow-hidden"
                  >
                    <img
                      src={a.image}
                      alt={a.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                      loading="lazy"
                    />
                  </Link>
                  <Link to="/news/$id" params={{ id: String(a.id) }}>
                    <h3 className="mt-2 font-display text-[17px] leading-snug font-bold transition-colors group-hover:text-primary">
                      {a.title}
                    </h3>
                  </Link>
                </article>
              ))}
            </div>
            <div className="mt-3">
              {heroThumbs.map((a, i) => (
                <Reveal key={a.id} delay={i * 50}>
                  <ThumbRow article={a} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-3 lg:pl-5">
            <StoryTabs video={pick(articles, 5, 0)} photo={pick(articles, 5, 5)} />
            <div className="mt-4">
              <AdBanner index={2} variant="skyscraper" className="h-[600px]" />
            </div>
          </div>
          </section>
        )}

        <div className="my-6">
          <AdBanner index={0} className="h-24" />
        </div>

        {/* ================= এক ক্লিকে বিভাগের খবর ================= */}
        <section>
          <DivisionMap />
        </section>


        {/* ================= READER FAVOURITES ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="পাঠকপ্রিয়" />
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {strip.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <GridCard article={a} compact />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================= LIVE DB POSTS ================= */}
        <div className="mt-8">
          <LatestPosts />
        </div>

        {/* ================= জাতীয় ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="বাংলাদেশ" slug="bangladesh" />
          <div className="grid gap-5 lg:grid-cols-12 lg:divide-x lg:divide-border">
            {national[0] && (
              <div className="min-w-0 lg:col-span-5 lg:pr-5">
                <LeadCard article={national[0]} />
              </div>
            )}
            <div className="min-w-0 lg:col-span-4 lg:px-5">
              {pick(national, 3, 1).map((a, i) => (
                <Reveal key={a.id} delay={i * 60}>
                  <ThumbRow article={a} />
                </Reveal>
              ))}
            </div>
            <div className="min-w-0 lg:col-span-3 lg:pl-5">
              <TextList items={pick(articles, 5, 4)} />
            </div>
          </div>
        </section>

        {/* ================= রাজনীতি ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="চাকরি" slug="chakri" />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-4">
              <LeadCard article={politics[0]!} />
            </div>
            <div className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
              {pick(politics, 6, 1).map((a, i) => (
                <Reveal key={`${a.id}-${i}`} delay={i * 60}>
                  <GridCard article={a} compact />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= অর্থনীতি ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="শিক্ষা" slug="shikkha" />
          <div className="grid gap-5 lg:grid-cols-12 lg:divide-x lg:divide-border">
            <div className="min-w-0 lg:col-span-7 lg:pr-5">
              <LeadCard article={econ[0] ?? articles[3]!} />
            </div>
            <div className="min-w-0 lg:col-span-5 lg:pl-5">
              <TextList items={econ.length > 1 ? econ.slice(1) : pick(articles, 4, 8)} />
            </div>
          </div>
        </section>

        {/* ================= সারাবাংলা + district ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="চলনবিল" slug="cholonbil" />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
              {pick(around.length ? around : articles, 8).map((a, i) => (
                <Reveal key={`${a.id}-${i}`} delay={i * 50}>
                  <GridCard article={a} compact />
                </Reveal>
              ))}
            </div>
            <div className="min-w-0 space-y-4 lg:col-span-3">
              <DistrictSearch />
              <AdBanner index={4} variant="box" className="h-52" />
            </div>
          </div>
        </section>

        {/* ================= VIDEO STRIP ================= */}
        <VideoStrip items={pick(articles, 8, 3)} />

        {/* ============ OPINION | POLL | LATEST TABS ============ */}
        <section className="mt-5 grid gap-6 border border-border bg-card p-4 lg:grid-cols-3">
          <OpinionColumn items={opinion.length ? opinion : pick(articles, 3, 2)} />
          <PollWidget cover={pick(articles, 1, 9)[0]} />
          <div>
            <BarHeading title="সর্বশেষ / জনপ্রিয়" />
            <LatestPopularTabs latest={latest} popular={popular} />
          </div>
        </section>


        {/* ================= বিশ্ব + e-paper/calendar ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="আন্তর্জাতিক" slug="antorjatik" />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-9">
              <div className="grid gap-5 lg:grid-cols-12 lg:divide-x lg:divide-border">
                <div className="min-w-0 lg:col-span-5 lg:pr-5">
                  <LeadCard article={world[0] ?? articles[6]!} />
                </div>
                <div className="min-w-0 lg:col-span-7 lg:pl-5">
                  {pick(world.length ? world : articles, 4, 1).map((a, i) => (
                    <Reveal key={`${a.id}-${i}`} delay={i * 50}>
                      <ThumbRow article={a} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
            <div className="min-w-0 space-y-4 lg:col-span-3">
              <EpaperCard cover={pick(articles, 1, 11)[0]} />
              <ArchiveCalendar />
            </div>
          </div>
        </section>

        {/* ================= বিনোদন ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="বিনোদন" slug="binodon" />
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {pick(ent.length ? ent : articles, 4, 2).map((a, i) => (
              <Reveal key={`${a.id}-${i}`} delay={i * 60}>
                <GridCard article={a} compact />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================= খেলা + social ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="খেলা" slug="khela" />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-9">
              <div className="grid gap-5 lg:grid-cols-12">
                <div className="min-w-0 lg:col-span-6">
                  <LeadCard article={sports[0] ?? articles[9]!} />
                </div>
                <div className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2 lg:col-span-6">
                  {pick(sports.length ? sports : articles, 4, 1).map((a, i) => (
                    <Reveal key={`${a.id}-${i}`} delay={i * 60}>
                      <GridCard article={a} compact />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
            <div className="min-w-0 space-y-4 lg:col-span-3">
              <SocialFollow />
              <AdBanner index={5} variant="box" className="h-52" />
            </div>
          </div>
        </section>

        {/* ================= অপরাধ ================= */}
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title="অপরাধ" slug="apradh" />
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {pick(crime.length ? crime : articles, 4).map((a, i) => (
              <Reveal key={`${a.id}-${i}`} delay={i * 60}>
                <GridCard article={a} compact />
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <EpaperSection />

      {/* ================= PHOTO GALLERY (dark) ================= */}
      <PhotoGallery items={pick(articles, 6, 4)} />

      <SiteFooter />
    </div>
  );
}
