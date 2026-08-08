import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSection } from "@/components/epaper-section";
import { BreakingTicker } from "@/components/breaking-ticker";
import { LatestPosts } from "@/components/latest-posts";
import { PhotoGallery } from "@/components/home-widgets";
import { DivisionMap } from "@/components/division-map";
import { AdBanner } from "@/components/ad-banner";
import { HomeSection } from "@/components/home-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "প্রভাতবাংলা — সর্বশেষ বাংলা সংবাদ, জাতীয় ও আন্তর্জাতিক খবর" },
      {
        name: "description",
        content:
          "জাতীয়, রাজনীতি, খেলা, বিনোদন, অর্থনীতি ও আন্তর্জাতিক অঙ্গনের সর্বশেষ বাংলা সংবাদ এক জায়গায়।",
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

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4">
        {/* HERO Section using LatestPosts or similar logic - currently LatestPosts covers published items */}
        <LatestPosts limit={10} />

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
           <HomeSection title="চাকরি" slug="chakri" layout="politics" />
           <HomeSection title="শিক্ষা" slug="shikkha" layout="economy" />
           <HomeSection title="চলনবিল" slug="cholonbil" layout="grid" />
           <HomeSection title="খেলা" slug="khela" layout="grid" />
           <HomeSection title="বিনোদন" slug="binodon" layout="grid" />
           <HomeSection title="অপরাধ" slug="apradh" layout="grid" />
           <HomeSection title="স্বাস্থ্য" slug="health" layout="grid" />
           <HomeSection title="অর্থনীতি" slug="orthoniti" layout="grid" />
        </Suspense>
      </main>

      <EpaperSection />

      {/* Photo Gallery - could also be connected to DB if needed, but for now placeholder logic or first few posts */}
      <PhotoGallery items={[]} />

      <SiteFooter />
    </div>
  );
}
