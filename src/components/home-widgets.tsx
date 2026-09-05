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
  ArrowRight,
  Clock,
} from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";

import type { Article } from "@/lib/news-data";
import { cn } from "@/lib/utils";
import { NewsImage } from "@/components/news-cards";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

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
        "mb-4 flex items-center justify-between border-b-2 border-primary/20 pb-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-6 w-1.5 rounded-full bg-primary" />
        <h2 className="font-display text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-[24px]">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {slug && (
          <Link
            to="/category/$slug"
            params={{ slug }}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 transition-colors hover:text-primary"
          >
            সব খবর
            <ChevronRight className="h-4 w-4 rounded-full border border-slate-200 p-0.5 group-hover:border-primary" />
          </Link>
        )}
        {arrows && (
          <span className="grid size-8 place-items-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-primary hover:text-primary">
            <ChevronRight className="size-4" />
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
  const liveTvRef = useRef<HTMLDivElement>(null);
  
  const nudge = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const scrollToLiveTv = () => {
    if (liveTvRef.current) {
      liveTvRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    // Auto-scroll logic removed as user wants the page to load from the top normally
  }, []);

  const tabs = [
    { id: "video-news", label: "ভিডিও সংবাদ", keyword: "সংবাদ" },
    { id: "video-ent", label: "ভিডিও বিনোদন", keyword: "বিনোদন" },
    { id: "talk-show", label: "বাংলা টকশো", keyword: "টকশো" },
  ];

  const filteredItems = useMemo(() => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (!currentTab) return items;
    
    // Filter by keyword in title if no specific metadata is available
    const filtered = items.filter(item => 
      item.title.includes(currentTab.keyword)
    );
    
    // If no specific keyword match, just show different slice of items for demo
    if (filtered.length === 0 && items.length > 0) {
      const index = tabs.findIndex(t => t.id === activeTab);
      const start = (index * 4) % items.length;
      return [...items.slice(start), ...items.slice(0, start)].slice(0, 8);
    }
    
    return filtered;
  }, [items, activeTab]);

  return (
    <>
      {/* ---------- Live TV Section ---------- */}
      <section ref={liveTvRef} className="mt-10 bg-[#0F0F0F] text-white">
        <div className="mx-auto max-w-[1360px] px-3 py-6 sm:px-4 sm:py-8">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span className="inline-block h-[24px] w-[6px] bg-primary animate-pulse" />
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight sm:text-2xl">লাইভ টিভি</h2>
          </div>
          <LiveTvPlayers />
        </div>
      </section>


      {/* Video section removed from standalone position as requested */}
    </>
  );
}

/* ---------- Video Section (Kalbela Style) - user-uploads://file-73 ---------- */
export function VideoGallery({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-10 mb-10 border-t border-border pt-8">
      <div className="mx-auto max-w-[1360px] px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-orange-500 via-pink-600 to-purple-600 text-white">
              <Play className="h-3 w-3 fill-white" />
            </div>
            <h2 className="font-display text-[22px] font-bold text-slate-900">ভিডিও</h2>
          </div>
          <Link
            to="/category/$slug"
            params={{ slug: "video" }}
            className="flex items-center gap-1 text-[15px] font-bold text-slate-800 hover:text-primary transition-colors"
          >
            সব ভিডিও <ArrowRight className="h-4 w-4 rounded-full border border-slate-800 p-0.5" />
          </Link>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to="/post/$slug"
              params={{ slug: item.slug || String(item.id) }}
              className="group flex flex-col gap-3"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
                <NewsImage
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-xl ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-5 w-5 fill-slate-900 ml-0.5" />
                  </div>
                </div>

                {/* Bottom Red/Gradient Bar with Logo */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-900/90 to-transparent flex items-end p-2">
                  <div className="flex w-full items-center justify-between">
                    <div className="h-4 w-16 bg-white/20 rounded backdrop-blur-sm" />
                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter opacity-80">কালবেলা</div>
                  </div>
                </div>

                {/* Center Text (As seen in ref - maybe title or specific tag) */}
                <div className="absolute bottom-4 left-0 right-0 text-center px-2">
                   <p className="line-clamp-2 font-display text-[14px] font-bold text-white drop-shadow-lg leading-tight">
                     {item.title}
                   </p>
                </div>
              </div>

              {/* Info Area */}
              <div className="flex flex-col gap-1.5 px-1">
                <h3 className="line-clamp-2 font-display text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                {item.published_at && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(item.published_at), {
                        addSuffix: true,
                        locale: bn,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
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
        {items.slice(0, 4).map((a) => (
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
          width="300"
          height="400"
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
  if (!items || items.length === 0) return null;

  const next = () => setActive((prev) => (prev + 1) % items.length);
  const prev = () => setActive((prev) => (prev - 1 + items.length) % items.length);

  // Helper to get relative item
  const getItem = (offset: number) => {
    const index = (active + offset + items.length) % items.length;
    return items[index];
  };

  const leftItem = getItem(-1);
  const mainItem = getItem(0);
  const rightItem = getItem(1);

  return (
    <section className="mt-10 mb-10 overflow-hidden">
      <div className="mx-auto max-w-[1360px] px-4">
        {/* Header - matching file-75 style */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-[24px] font-bold text-slate-900">ফটোগ্যালারি</h2>
          <Link
            to="/category/$slug"
            params={{ slug: "photo-gallery" }}
            className="flex items-center gap-1 text-[15px] text-slate-600 hover:text-primary transition-colors"
          >
            আরও <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Slider Layout - matching file-75 3-item view */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-8 min-h-[400px]">
          
          {/* Left Item (Partial/Side) */}
          <div className="hidden sm:block w-1/4 opacity-40 transition-all duration-500 scale-90 blur-[1px]">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <NewsImage
                src={leftItem.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-center font-display text-sm text-slate-500">
              {leftItem.published_at ? new Date(leftItem.published_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : "১৬ আগস্ট, ২০২৪"}
            </p>
          </div>

          {/* Main Item (Center) */}
          <div className="w-full sm:w-1/2 z-10 transition-all duration-500 scale-105 sm:scale-110">
            <Link 
              to="/post/$slug"
              params={{ slug: mainItem.slug || String(mainItem.id) }}
              className="group relative block overflow-hidden rounded-xl shadow-2xl"
            >
              <NewsImage
                src={mainItem.image}
                alt={mainItem.title}
                className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <p className="mt-6 text-center font-display text-[18px] font-bold text-slate-800">
              {mainItem.published_at ? new Date(mainItem.published_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : "১৫ আগস্ট, ২০২৪"}
            </p>
          </div>

          {/* Right Item (Partial/Side) */}
          <div className="hidden sm:block w-1/4 opacity-40 transition-all duration-500 scale-90 blur-[1px]">
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <NewsImage
                src={rightItem.image}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-center font-display text-sm text-slate-500">
              {rightItem.published_at ? new Date(rightItem.published_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : "১৪ আগস্ট, ২০২৪"}
            </p>
          </div>

          {/* Navigation Arrows - matching red circular style in file-75 */}
          <button 
            onClick={prev}
            className="absolute left-0 sm:left-[22%] top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-0 sm:right-[22%] top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots Indicator - matching file-75 bottom dots */}
        <div className="mt-10 flex justify-center gap-2">
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                active === i ? "bg-blue-600 w-4" : "bg-slate-300"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


