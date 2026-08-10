import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSection } from "@/components/epaper-section";
import { BreakingTicker } from "@/components/breaking-ticker";
import { LatestPosts } from "@/components/latest-posts";
import { PhotoGallery, VideoStrip } from "@/components/home-widgets";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";
import { DivisionMap } from "@/components/division-map";
import { AdBanner } from "@/components/ad-banner";
import { HomeSection } from "@/components/home-section";
import { BottomWidgets } from "@/components/bottom-widgets";

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

function Home() {
  const { data: photoPosts = [] } = useSuspenseQuery({
    queryKey: ["home-photo-gallery"],
    queryFn: () => getHomeSectionPosts({ data: { category: "photo-gallery", limit: 12 } }),
  });

  const { data: videoPosts = [] } = useSuspenseQuery({
    queryKey: ["home-video-gallery"],
    queryFn: async () => {
      const posts = await getHomeSectionPosts({ data: { category: "video-gallery", limit: 24 } });
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

        <div className="my-6">
          <AdBanner index={0} className="h-24" />
        </div>

        {/* Division Map */}
        <section>
          <DivisionMap />
        </section>

        {/* Home Sections populated from DB */}
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
           <HomeSection title="বাংলাদেশ" slug="bangladesh" layout="national" />
           <HomeSection title="আন্তর্জাতিক" slug="antorjatik" layout="national" />
           <HomeSection title="রাজনীতি" slug="politics" layout="politics" />
           <HomeSection title="চাকরি" slug="chakri" layout="politics" />
           <HomeSection title="শিক্ষা" slug="shikkha" layout="economy" />
           <HomeSection title="চলনবিল" slug="cholonbil" layout="grid" />
           <HomeSection title="খেলা" slug="khela" layout="grid" />
           <HomeSection title="বিনোদন" slug="binodon" layout="grid" />
           <HomeSection title="অপরাধ" slug="apradh" layout="grid" />
           <HomeSection title="স্বাস্থ্য" slug="health" layout="grid" />
           <HomeSection title="অর্থনীতি" slug="orthoniti" layout="grid" />
        </Suspense>

        {/* Video Section integrated from reference user-uploads://file-17 */}
        <VideoStrip items={videoPosts} />

        <BottomWidgets />
      </main>

      <EpaperSection />

      {/* Photo Gallery connected to DB */}
      <PhotoGallery items={mappedPhotoPosts} />

      <SiteFooter />
    </div>
  );
}
