import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tv, Play, Radio, Share2, Info } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

const channels = [
  {
    id: "btv",
    name: "বিটিভি লাইভ",
    url: "https://www.btvlive.gov.bd/channel/BTV-News?autoplay=1&mute=1",
    isYoutube: false,
    color: "#990000",
    description: "বাংলাদেশ টেলিভিশন (বিটিভি) বাংলাদেশের রাষ্ট্রীয় টেলিভিশন সংস্থা।"
  },
  {
    id: "ntv",
    name: "এনটিভি",
    url: "https://www.youtube.com/embed/WAH0A6-f258?si=w23-EMeFpSgxsqKy&autoplay=1&mute=1",
    isYoutube: true,
    color: "#006600",
    description: "এনটিভি বাংলাদেশের একটি বেসরকারি টেলিভিশন চ্যানেল।"
  },
  {
    id: "channel24",
    name: "চ্যানেল ২৪",
    url: "https://www.youtube.com/embed/hjQluVY6EzQ?si=xO6TBSJTqzOLX9_s&autoplay=1&mute=1",
    isYoutube: true,
    color: "#CC0000",
    description: "চ্যানেল ২৪ বাংলাদেশের একটি জনপ্রিয় সংবাদভিত্তিক টেলিভিশন চ্যানেল।"
  },
  {
    id: "rtv",
    name: "আরটিভি লাইভ",
    url: "https://www.youtube.com/embed/PtztZQi5hCg?si=sOxiaL6vPNUovcyh&autoplay=1&mute=1",
    isYoutube: true,
    color: "#003399",
    description: "আরটিভি একটি বাংলাদেশি স্যাটেলাইট টেলিভিশন চ্যানেল।"
  },
  {
    id: "71tv",
    name: "৭১ টিভি",
    url: "https://www.youtube.com/embed/9L9ymmaPIS0?si=NKC15SV0HWcGD6JM&autoplay=1&mute=1",
    isYoutube: true,
    color: "#333333",
    description: "একাত্তর টিভি বাংলাদেশের একটি সংবাদভিত্তিক টেলিভিশন চ্যানেল।"
  }
];

export const Route = createFileRoute("/live-tv/")({
  head: () => ({
    meta: [
      { title: "লাইভ টিভি — প্রভাতবাংলা" },
      {
        name: "description",
        content: "সরাসরি দেখুন বাংলাদেশের জনপ্রিয় সব টেলিভিশন চ্যানেল প্রভাতবাংলা লাইভ টিভিতে।",
      },
      { property: "og:title", content: "লাইভ টিভি — প্রভাতবাংলা" },
      { property: "og:description", content: "সরাসরি দেখুন বাংলাদেশের জনপ্রিয় সব টেলিভিশন চ্যানেল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveTvPage,
});

function LiveTvPage() {
  const [activeChannel, setActiveChannel] = useState(channels[0]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <SiteHeader />
      
      <main className="mx-auto max-w-[1360px] px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center gap-3 border-b-2 border-primary pb-3">
          <div className="bg-primary p-2 text-white">
            <Tv className="size-6" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">লাইভ টিভি</h1>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="kb-live-dot size-2 rounded-full bg-primary" />
              সরাসরি সম্প্রচার
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Player Section */}
          <div className="lg:col-span-9">
            <div className="overflow-hidden rounded-lg border border-border bg-black shadow-2xl">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <span className="kb-live-dot size-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(237,28,36,0.8)]" />
                  <span className="font-display text-lg font-bold">{activeChannel?.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-slate-400 transition-colors hover:text-white" aria-label="শেয়ার">
                    <Share2 className="size-5" />
                  </button>
                  <button className="text-slate-400 transition-colors hover:text-white" aria-label="তথ্য">
                    <Info className="size-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative aspect-video w-full bg-slate-950">
                {activeChannel?.isYoutube ? (
                  <iframe
                    key={activeChannel?.id}
                    src={activeChannel?.url}
                    title={activeChannel?.name}
                    className="absolute inset-0 h-full w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="h-full w-full overflow-hidden">
                    <iframe
                      key={activeChannel?.id}
                      src={activeChannel?.url}
                      title={activeChannel?.name}
                      className="absolute inset-0 h-full w-full"
                      style={{ top: '-85px', height: 'calc(100% + 85px)' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-display text-xl font-extrabold text-slate-900">{activeChannel?.name} সম্পর্কে</h2>
              <p className="text-slate-600 leading-relaxed">{activeChannel?.description}</p>
            </div>
          </div>

          {/* Channel Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-border px-4 py-3">
                  <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Radio className="size-4 text-primary" />
                    চ্যানেল তালিকা
                  </h2>
                </div>
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel)}
                      className={cn(
                        "flex w-full items-center gap-4 px-4 py-4 text-left transition-all duration-200 hover:bg-slate-50",
                        activeChannel.id === channel.id ? "bg-slate-50 border-l-4 border-primary" : "border-l-4 border-transparent"
                      )}
                    >
                      <div 
                        className="flex size-12 shrink-0 items-center justify-center rounded-lg shadow-sm"
                        style={{ backgroundColor: channel.color }}
                      >
                        <Play className={cn("size-6 text-white", activeChannel.id === channel.id ? "animate-pulse" : "")} />
                      </div>
                      <div className="min-w-0">
                        <span className={cn(
                          "block font-display text-[15px] font-extrabold transition-colors",
                          activeChannel.id === channel.id ? "text-primary" : "text-slate-900"
                        )}>
                          {channel.name}
                        </span>
                        <span className="mt-0.5 block text-xs font-bold text-slate-500 uppercase tracking-tighter">
                          Live Now
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Banner */}
              <div className="rounded-lg bg-primary p-6 text-white shadow-md">
                <h3 className="font-display text-lg font-extrabold">আপনার প্রিয় চ্যানেল নেই?</h3>
                <p className="mt-2 text-sm text-white/80">আমাদের জানান, আমরা যুক্ত করার চেষ্টা করব।</p>
                <button className="mt-4 w-full rounded-md bg-white py-2 text-sm font-bold text-primary hover:bg-slate-50 transition-colors">
                  যোগাযোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
