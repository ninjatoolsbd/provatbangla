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
import { useRef, useState, useMemo, useEffect } from "react";

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
  const liveTvRef = useRef<HTMLDivElement>(null);
  
  const nudge = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const scrollToLiveTv = () => {
    if (liveTvRef.current) {
      liveTvRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (liveTvRef.current) {
        const element = liveTvRef.current;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 100; // Offset to keep some context above
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    };

    // Try multiple times to catch the right moment after hydration and rendering
    const t1 = setTimeout(handleScroll, 100);
    const t2 = setTimeout(handleScroll, 800);
    const t3 = setTimeout(handleScroll, 2000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
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
        <div className="mx-auto max-w-[1360px] px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-block h-[24px] w-[6px] bg-primary" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">লাইভ টিভি</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Live TV Box 1 */}
            <div className="border-[10px] border-[#990000] bg-[#990000] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  বিটিভি লাইভ
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                {/* Lazy loaded iframe to improve page load performance */}
                <iframe
                  src="https://www.btvlive.gov.bd/channel/BTV-News?autoplay=1&mute=1"
                  title="BTV News Live"
                  className="absolute inset-0 h-full w-full"
                  style={{ top: '-85px', height: 'calc(100% + 85px)' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>

            {/* Live TV Box 2 (NTV) */}
            <div className="border-[10px] border-[#006600] bg-[#006600] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  এনটিভি
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                <iframe
                  src="https://www.youtube.com/embed/D1N5sp_pv_M?si=-0g1NTSFhctb-I0D&autoplay=1&mute=1"
                  title="NTV Live"
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>
            
            {/* Live TV Box 3 (Channel 24) */}
            <div className="border-[10px] border-[#CC0000] bg-[#CC0000] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  চ্যানেল ২৪
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                <iframe
                  src="https://www.youtube.com/embed/rzC3S-0niV0?si=coIEKVknbnd02SkY&autoplay=1&mute=1"
                  title="YouTube video player"
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>

            {/* Live TV Box 4 (RTV) */}
            <div className="border-[10px] border-[#003399] bg-[#003399] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  আরটিভি লাইভ
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                <iframe
                  src="https://www.youtube.com/embed/PtztZQi5hCg?si=sOxiaL6vPNUovcyh&autoplay=1&mute=1"
                  title="YouTube video player"
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>

            {/* Live TV Box 5 (71 TV) */}
            <div className="border-[10px] border-[#333333] bg-[#333333] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  ৭১ টিভি
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                <iframe
                  src="https://www.youtube.com/embed/9L9ymmaPIS0?si=NKC15SV0HWcGD6JM&autoplay=1&mute=1"
                  title="71 TV Live"
                  className="absolute inset-0 h-full w-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>

            {/* Live TV Box 6 (Sananda TV) */}
            <div className="border-[10px] border-[#660066] bg-[#660066] p-1 shadow-lg h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between px-2 text-white">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  সানন্দা টিভি
                </h2>
                <div className="h-1 w-10 bg-white/20 rounded-full" />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-sm shadow-inner group/player flex-grow">
                <video
                  className="absolute inset-0 h-full w-full"
                  controls
                  autoPlay
                  muted
                  playsInline
                >
                  <source src="https://live.sanandatelevision.in/sananda/index.m3u8" type="application/x-mpegURL" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-2 px-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/90 italic">সরাসরি সম্প্রচার</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video section removed from standalone position as requested */}
    </>
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
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Large Main Feature */}
          <div className="relative lg:col-span-2">
            <Link 
              to="/post/$slug" 
              params={{ slug: main.slug || String(main.id) }} 
              className="group relative block overflow-hidden rounded-lg shadow-2xl"
            >
              <NewsImage
                src={main.image}
                alt={main.title}
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-primary/20">
                    <Play className="h-4 w-4 fill-white" />
                  </div>
                  <span className="bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-sm">গ্যালারি</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-tight text-white group-hover:text-primary transition-colors">
                  {main.title}
                </h3>
              </div>
            </Link>
          </div>

          {/* Side Grid Items */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {items.slice(1, 5).map((a) => (
                <Link
                  key={a.id}
                  to="/post/$slug"
                  params={{ slug: a.slug || String(a.id) }}
                  className="group relative block overflow-hidden rounded-md bg-[#1A1A1A] border border-white/5 shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <NewsImage
                      src={a.image}
                      alt={a.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                        <Play className="h-3 w-3 fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="line-clamp-2 text-sm font-bold leading-snug text-white/90 group-hover:text-primary transition-colors">
                      {a.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] scrollbar-thumb-primary/50">
          {items.map((a, i) => (
            <button 
              key={a.id} 
              onClick={() => setActive(i)} 
              className="shrink-0 transition-transform hover:-translate-y-1"
            >
              <div className={cn(
                "relative h-16 w-28 overflow-hidden rounded-md border-2 transition-all",
                i === active ? "border-primary scale-105 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" : "border-white/10 opacity-60 hover:opacity-100"
              )}>
                <NewsImage
                  src={a.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {i === active && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Play className="h-4 w-4 fill-white animate-pulse" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
