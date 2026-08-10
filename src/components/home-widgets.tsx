import { Link } from "@tanstack/react-router";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Play,
  Search,
  Youtube,
} from "lucide-react";
import { useRef, useState, useMemo } from "react";

import type { Article } from "@/lib/news-data";
import { cn } from "@/lib/utils";
import { NewsImage } from "@/components/news-cards";

/* ---------- shared red section bar (kalbela style) ---------- */
export function BarHeading({
  title,
  slug,
  arrows,
  className,
}: {
  title: string;
  slug?: string;
  arrows?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-center justify-between border-b border-border pb-1.5",
        className,
      )}
    >
      <h2 className="relative flex items-center gap-2 font-display text-[20px] font-bold text-foreground">
        <span className="inline-block h-[18px] w-[5px] bg-primary" />
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {slug && (
          <Link
            to="/category/$slug"
            params={{ slug }}
            className="kb-underline text-xs font-bold text-muted-foreground hover:text-primary"
          >
            সব খবর →
          </Link>
        )}
        {arrows && (
          <span className="grid size-6 place-items-center rounded-full border border-border text-muted-foreground">
            <ChevronRight className="size-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- horizontal scroller (video strip) - user-uploads://file-17 style ---------- */
export function VideoStrip({ items }: { items: any[] }) {
  const [activeTab, setActiveTab] = useState("video-news");
  const ref = useRef<HTMLDivElement>(null);
  
  const nudge = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const tabs = [
    { id: "video-news", label: "ভিডিও সংবাদ", keyword: "সংবাদ" },
    { id: "video-ent", label: "ভিডিও বিনোদন", keyword: "বিনোদন" },
    { id: "talk-show", label: "বাংলা টকশো", keyword: "টকশো" },
  ];

  const filteredItems = useMemo(() => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (!currentTab) return items;
    
    // Filter by keyword in title if no specific metadata is available
    return items.filter(item => 
      item.title.includes(currentTab.keyword) || 
      (items.length < 10) // fallback if too few items
    );
  }, [items, activeTab]);

  return (
    <section className="mt-10 bg-[#0F0F0F] text-white">
      <div className="mx-auto max-w-[1360px] px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Column: Live TV Box */}
          <div className="lg:col-span-1">
            <div className="h-full border-[10px] border-[#990000] bg-[#990000] p-1">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  লাইভ টিভি
                </h2>
                <div className="h-1 w-24 bg-white/30" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-white">
                <div className="flex h-full w-full flex-col items-center justify-center p-4">
                  <div className="relative flex flex-col items-center">
                    {/* Simplified Live Logo Replica */}
                    <div className="flex flex-col items-center">
                       <div className="relative mb-2">
                         <div className="h-4 w-12 rounded-t-full border-t-4 border-primary" />
                         <div className="mt-1 h-3 w-8 rounded-t-full border-t-4 border-primary" />
                         <div className="mt-1 h-2 w-4 rounded-full bg-primary mx-auto" />
                       </div>
                       <span className="text-4xl font-black tracking-tighter text-primary">LIVE</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/20 text-white">
                       <Play className="h-6 w-6 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 px-2 text-[11px] font-bold text-white/90">Live From Somoy TV</p>
            </div>
          </div>

          {/* Right Column: Tabs and Slider */}
          <div className="lg:col-span-3">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-bold transition-colors",
                    activeTab === tab.id 
                      ? "bg-primary text-white" 
                      : "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              {filteredItems.length > 0 ? (
                <div
                  ref={ref}
                  className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {filteredItems.map((item) => (
                    <Link
                      key={item.id}
                      to="/post/$slug"
                      params={{ slug: item.slug || `demo-${item.id}` }}
                      className="w-[280px] shrink-0 snap-start group/item"
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <NewsImage
                          src={item.image_url || item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-black/20 text-white backdrop-blur-sm transition-transform group-hover/item:scale-110">
                              <Play className="h-4 w-4 fill-white" />
                           </div>
                        </div>
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-tight text-white transition-colors group-hover/item:text-primary">
                        {item.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-[280px] shrink-0 bg-[#2A2A2A] aspect-video animate-pulse rounded-sm" />
                  ))}
                </div>
              )}

              {/* Navigation Arrows */}
              <button
                onClick={() => nudge(-1)}
                className="absolute -left-4 top-[35%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-primary group-hover:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => nudge(1)}
                className="absolute -right-4 top-[35%] z-10 hidden h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-primary group-hover:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link
                to="/category/$slug"
                params={{ slug: "video-gallery" }}
                className="inline-flex items-center gap-2 bg-primary px-5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 rounded-l-full relative overflow-hidden"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-white/20" />
                সকল ভিডিও দেখুন →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- opinion / মতামত with author chips ---------- */
export function OpinionColumn({ items }: { items: Article[] }) {
  return (
    <div>
      <BarHeading title="শিল্প ও সাহিত্য" slug="shilpo-sahitto" />
      <div className="divide-y divide-border border-t border-border">
        {items.slice(0, 3).map((a) => (
          <Link
            key={a.id}
            to="/post/$slug"
            params={{ slug: (a as any).slug ?? String(a.id) }}
            className="group flex gap-3 bg-secondary/50 px-3 py-3 transition-colors hover:bg-secondary"
          >
            <NewsImage
              src={a.image}
              alt={a.author ?? ""}
              className="size-14 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
              loading="lazy"
            />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-primary">{a.author}</span>
              <h3 className="mt-1 line-clamp-2 font-display text-[15px] leading-snug font-bold transition-colors group-hover:text-primary">
                {a.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- online poll ---------- */
export function PollWidget({ cover }: { cover?: Article | undefined }) {
  const options = ["হ্যাঁ", "না", "মন্তব্য নেই"];
  const [picked, setPicked] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <div>
      <BarHeading title="অনলাইন জরিপ" />
      <div className="border border-border bg-card p-3">
        {cover && (
          <NewsImage
            src={cover.image}
            alt={cover.title}
            className="aspect-[16/9] w-full object-cover"
            loading="lazy"
          />
        )}
        <p className="mt-3 font-display text-[15px] leading-snug font-bold">
          নাগরিক সেবার মান বাড়াতে ডিজিটাল ব্যবস্থাপনা কি যথেষ্ট বলে আপনি মনে করেন?
        </p>
        <div className="mt-3 space-y-2">
          {options.map((o) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-sm transition-colors hover:border-primary"
            >
              <input
                type="radio"
                name="kb-poll"
                checked={picked === o}
                onChange={() => setPicked(o)}
                className="accent-primary"
              />
              {o}
            </label>
          ))}
        </div>
        <button
          onClick={() => picked && setSent(true)}
          className="mt-3 w-full bg-primary py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={!picked}
        >
          {sent ? "ধন্যবাদ, ভোট গৃহীত হয়েছে" : "ভোট দিন"}
        </button>
        <div className="mt-3 flex items-center justify-center gap-3 border-t border-border pt-3 text-muted-foreground">
          {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
            <span
              key={i}
              className="grid size-7 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Icon className="size-3.5" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- সর্বশেষ / জনপ্রিয় tabs ---------- */
export function LatestPopularTabs({
  latest,
  popular,
}: {
  latest: Article[];
  popular: Article[];
}) {
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const list = tab === "latest" ? latest : popular;

  return (
    <div className="border border-border bg-card">
      <div className="flex border-b border-border">
        {(
          [
            ["latest", "সর্বশেষ"],
            ["popular", "জনপ্রিয়"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "flex-1 py-2.5 font-display text-[16px] font-bold transition-colors",
              tab === k
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="max-h-[430px] divide-y divide-border overflow-y-auto">
        {list.map((a) => (
          <li key={a.id}>
            <Link
              to="/post/$slug"
              params={{ slug: (a as any).slug ?? String(a.id) }}
              className="group block px-3 py-2.5"
            >
              <span className="block text-[11px] text-muted-foreground">{a.time}</span>
              <span className="mt-0.5 line-clamp-2 block font-display text-[14.5px] leading-snug font-bold transition-colors group-hover:text-primary">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-border p-2 text-center">
        <Link to="/category/$slug" params={{ slug: "bangladesh" }} className="text-xs font-bold text-primary">
          আরও পড়ুন →
        </Link>
      </div>
    </div>
  );
}

/* ---------- district search widget ---------- */
export function DistrictSearch() {
  return (
    <div className="border border-border bg-card p-3">
      <h3 className="mb-3 font-display text-[16px] font-bold">আপনার এলাকার খবর</h3>
      <div className="space-y-2">
        <select className="w-full border border-border bg-background px-2 py-2 text-sm">
          <option>বিভাগ</option>
          {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ"].map(
            (d) => (
              <option key={d}>{d}</option>
            ),
          )}
        </select>
        <select className="w-full border border-border bg-background px-2 py-2 text-sm">
          <option>জেলা</option>
          <option>ঢাকা</option>
          <option>গাজীপুর</option>
          <option>নারায়ণগঞ্জ</option>
        </select>
        <button className="flex w-full items-center justify-center gap-2 bg-primary py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
          <Search className="size-4" /> খুঁজুন
        </button>
      </div>
    </div>
  );
}

/* ---------- e-paper card ---------- */
export function EpaperCard({ cover }: { cover?: Article | undefined }) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between bg-primary px-3 py-2 text-primary-foreground">
        <span className="font-display text-sm font-bold">ই-পেপার</span>
        <span className="text-[11px]">আজকের পত্রিকা</span>
      </div>
      <div className="p-3">
        <NewsImage
          src="https://epaper.kalbela.com/2026/08/02/2nd-Edition/pages/page01.jpg"
          alt="আজকের ই-পেপার"
          className="aspect-[3/4] w-full border border-border object-cover"
          loading="lazy"
        />
        <button className="mt-3 w-full border border-primary py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
          ই-পেপার পড়ুন
        </button>
      </div>
    </div>
  );
}

/* ---------- calendar / archive ---------- */
export function ArchiveCalendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const bn = (n: number) =>
    String(n)
      .split("")
      .map((d) => "০১২৩৪৫৬৭৮৯"[Number(d)])
      .join("");

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between bg-secondary px-3 py-2">
        <span className="font-display text-sm font-bold">আর্কাইভ</span>
        <span className="text-[11px] text-muted-foreground">আগস্ট ২০২৬</span>
      </div>
      <div className="grid grid-cols-7 gap-1 p-3 text-center text-[11px]">
        {["শ", "র", "সো", "ম", "বু", "বৃ", "শু"].map((d) => (
          <span key={d} className="font-bold text-primary">
            {d}
          </span>
        ))}
        {days.map((d) => (
          <span
            key={d}
            className={cn(
              "cursor-pointer rounded-sm py-1 transition-colors hover:bg-primary hover:text-primary-foreground",
              d === 2 && "bg-primary text-primary-foreground",
            )}
          >
            {bn(d)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- social follow ---------- */
export function SocialFollow() {
  const rows = [
    { Icon: Facebook, label: "ফেসবুক", value: "১.২ মি" },
    { Icon: Youtube, label: "ইউটিউব", value: "৮.৫ লাখ" },
    { Icon: Instagram, label: "ইনস্টাগ্রাম", value: "৩.১ লাখ" },
    { Icon: Linkedin, label: "লিংকডইন", value: "৯০ হাজার" },
  ];
  return (
    <div className="border border-border bg-card">
      <div className="bg-secondary px-3 py-2 font-display text-sm font-bold">অনুসরণ করুন</div>
      <ul className="divide-y divide-border">
        {rows.map(({ Icon, label, value }) => (
          <li
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-secondary/60"
          >
            <Icon className="size-4 text-primary" />
            <span className="flex-1 font-semibold">{label}</span>
            <span className="text-xs text-muted-foreground">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- dark photo gallery band ---------- */
export function PhotoGallery({ items }: { items: any[] }) {
  const [active, setActive] = useState(0);
  const main = items[active] ?? items[0];
  if (!main) return null;

  return (
    <section className="mt-10 bg-ink py-8 text-ink-foreground">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="mb-4 flex items-center gap-2 border-b border-ink-foreground/20 pb-2">
          <Camera className="size-4 text-primary" />
          <h2 className="font-display text-[20px] font-bold">ফটোগ্যালারি</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative lg:col-span-2">
            <NewsImage
              src={main.image}
              alt={main.title}
              className="aspect-[16/9] w-full object-cover"
              loading="lazy"
            />
            <span className="absolute right-0 bottom-0 left-0 bg-ink/70 p-3 font-display text-[16px] font-bold">
              {main.title}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {items.slice(0, 2).map((a, i) => (
              <button
                key={a.id}
                onClick={() => setActive(i)}
                className="group relative block text-left"
              >
                <NewsImage
                  src={a.image}
                  alt={a.title}
                  className="aspect-[16/9] w-full object-cover transition-opacity group-hover:opacity-80"
                  loading="lazy"
                />
                <span className="absolute right-0 bottom-0 left-0 line-clamp-2 bg-ink/70 p-2 text-[13px] font-bold">
                  {a.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((a, i) => (
            <button key={a.id} onClick={() => setActive(i)} className="shrink-0">
              <NewsImage
                src={a.image}
                alt=""
                className={cn(
                  "h-14 w-24 object-cover transition-all",
                  i === active ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100",
                )}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
