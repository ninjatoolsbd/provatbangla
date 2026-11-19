import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSection } from "@/components/epaper-section";
import { BreakingTicker } from "@/components/breaking-ticker";
import { LatestPosts } from "@/components/latest-posts";
import { PhotoGallery, VideoStrip, VideoGallery } from "@/components/home-widgets";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";
import { DivisionMap } from "@/components/division-map";
import { AdBanner } from "@/components/ad-banner";
import { HomeSection } from "@/components/home-section";
import { BottomWidgets } from "@/components/bottom-widgets";
import { MoreNewsSection } from "@/components/more-news-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "প্রভাতবাংলা — সর্বশেষ বাংলা সংবাদ, জাতীয় ও আন্তর্জাতিক খবর" },
      {
        name: "description",
        content:
          "প্রভাতবাংলা: রাজনীতি, অর্থনীতি, আন্তর্জাতিক, খেলা, বিনোদন ও শিক্ষা বিষয়ক সর্বশেষ সংবাদ। বাংলাদেশ ও বিশ্বের সত্য সংবাদ সবার আগে পেতে প্রভাতবাংলার সাথেই থাকুন।",
      },
      { property: "og:title", content: "প্রভাতবাংলা — সর্বশেষ বাংলা সংবাদ পোর্টাল" },
      {
        property: "og:description",
        content: "বাংলাদেশ ও বিশ্বের সত্য ও নির্ভরযোগ্য সংবাদ সবার আগে পেতে প্রভাতবাংলার সাথেই থাকুন।",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "bn_BD" },
      { property: "og:site_name", content: "প্রভাতবাংলা" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ProvatBangla" },
    ],
  }),
  component: Home,
});

/** Placeholder that reserves a section's height so nothing jumps while it loads. */
function SectionSkeleton() {
  return (
    <section className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 h-6 w-40 animate-pulse rounded bg-muted/40" />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[16/10] w-full animate-pulse rounded-lg bg-muted/30" />
            <div className="h-4 w-full animate-pulse rounded bg-muted/30" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted/20" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { data: photoPosts = [] } = useSuspenseQuery({
    queryKey: ["home-photo-gallery"],
    queryFn: async () => {
      try {
        return (await getHomeSectionPosts({ data: { category: "photo-gallery", limit: 12 } })) ?? [];
      } catch {
        return [];
      }
    },
  });

  const { data: videoPosts = [] } = useSuspenseQuery({
    queryKey: ["home-video-gallery"],
    queryFn: async () => {
      try {
      const posts = await getHomeSectionPosts({ data: { category: "video", limit: 24 } });
      if (posts.length === 0) {
        const { articles } = await import("@/lib/news-data");
        return articles.filter(a => a.category === "video-gallery").map(a => ({
          id: String(a.id),
          title: a.title,
          slug: `demo-${a.id}`,
          image_url: a.image,
          category: a.category,
          status: "published"
        }));
      }
      return posts;
      } catch {
        // Also tolerate transport failures before the server handler can run.
        return [];
      }
    },
  });

  const mappedPhotoPosts = photoPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    image: p.image_url,
    slug: p.slug
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4">
        {/* HERO Section using LatestPosts or similar logic - currently LatestPosts covers published items */}
        <LatestPosts />

        <div className="my-10">
          <AdBanner index={0} className="h-28 rounded-xl" />
        </div>



        {/* Home Sections populated from DB — each streams in on its own */}
        {[
          { title: "বাংলাদেশ", slug: "bangladesh", layout: "national" as const },
          { title: "আন্তর্জাতিক", slug: "antorjatik", layout: "national" as const },
          { title: "রাজনীতি", slug: "politics", layout: "politics" as const },
          
          { title: "শিক্ষা", slug: "shikkha", layout: "economy" as const },
        ].map((s) => (
          <Suspense key={s.slug} fallback={<SectionSkeleton />}>
            <HomeSection title={s.title} slug={s.slug} layout={s.layout} />
          </Suspense>
        ))}

        <div className="my-10">
          <AdBanner index={1} className="h-28 rounded-xl" />
        </div>


        {/* Division Map moved here so it appears after the first few sections */}
        <section>
          <DivisionMap />
        </section>

        {[
          { title: "চলনবিল", slug: "cholonbil" },
          { title: "খেলা", slug: "khela" },
          { title: "বিনোদন", slug: "binodon" },
          { title: "অপরাধ", slug: "apradh" },
          { title: "স্বাস্থ্য", slug: "health" },
          { title: "অর্থনীতি", slug: "orthoniti" },
        ].map((s) => (
          <Suspense key={s.slug} fallback={<SectionSkeleton />}>
            <HomeSection title={s.title} slug={s.slug} layout="grid" />
          </Suspense>
        ))}

        {/* চাকরি সেকশন — ভিডিও সেকশনের ঠিক আগে */}
        <Suspense fallback={<SectionSkeleton />}>
          <HomeSection title="চাকরি" slug="chakri" layout="politics" />
        </Suspense>

        {/* Video Strip removed and merged into Photo Gallery below */}

        <BottomWidgets />
      </main>

      {/* VideoStrip (Live TV section) removed from homepage as per user request */}
      
      <VideoGallery items={videoPosts} />

      {/* Photo Gallery connected to DB */}
      <PhotoGallery items={mappedPhotoPosts} />



      <EpaperSection />

      <SiteFooter />
    </div>
  );
}
