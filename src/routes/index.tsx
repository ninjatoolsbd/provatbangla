import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSection } from "@/components/epaper-section";
import { BreakingTicker } from "@/components/breaking-ticker";
import { LatestPosts } from "@/components/latest-posts";
import { PhotoGallery, LatestPopularTabs } from "@/components/home-widgets";
import { VideoSection } from "@/components/video-section";

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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BreakingTicker />

      <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4 bg-background">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Hero & Latest */}
          <div className="lg:col-span-9">
            <LatestPosts limit={10} />
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-3 space-y-6">
            <LatestPopularTabs latest={[]} popular={[]} />
            <AdBanner index={1} className="h-64" />
          </div>
        </div>

        <div className="my-6">
          <AdBanner index={0} className="h-24" />
        </div>

        {/* Home Sections with Two-Col Layout matching your screenshots */}
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
           <HomeSection 
             title="বাংলাদেশ" 
             slug="bangladesh" 
             layout="two-col-with-side" 
             sideCategory="islam"
             sideTitle="ইসলাম"
           />
           
           <VideoSection />

           <HomeSection 
             title="চলনবিল" 
             slug="cholonbil" 
             layout="two-col-with-side" 
             sideCategory="health"
             sideTitle="স্বাস্থ্য"
           />

            <div className="grid gap-6 mt-8 lg:grid-cols-3">
              <HomeSection title="আন্তর্জাতিক" slug="antorjatik" layout="grid" />
              <HomeSection title="রাজনীতি" slug="politics" layout="grid" />
              <HomeSection title="খেলাধুলা" slug="khela" layout="grid" />
            </div>

           <HomeSection title="অপরাধ" slug="apradh" layout="grid" />
           
            <section className="mt-10 border-t border-border pt-10">
              <DivisionMap />
            </section>
        </Suspense>
      </main>

      <EpaperSection />
      <PhotoGallery items={[]} />
      <SiteFooter />
    </div>
  );
}

