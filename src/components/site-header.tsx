import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, ChevronDown, ChevronRight, Facebook, Home, Instagram, Languages, Linkedin, MessageCircle, Menu, Newspaper, Music2, Rss, Search, Send, Share2, Tv, Twitter, X, Youtube } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getCurrentBanglaDate } from "@/lib/posts";

import { categories } from "@/lib/news-data";
import logoAsset from "@/assets/logo.png.asset.json";

const utility = [
  { icon: BookOpen, label: "ই-পেপার", to: "/epaper" },
  { icon: Newspaper, label: "ম্যাগাজিন", to: "/magazine" },
  { icon: Tv, label: "লাইভ টিভি", to: "/live-tv" },
  { icon: Share2, label: "সোশ্যাল মিডিয়া", to: "/social", mega: true },
  { icon: Bell, label: "আর্কাইভ", to: "/archive" },
  { icon: Languages, label: "English", onClick: () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    // Toggle logic
    const currentLang = select ? select.value : (window.location.hash.includes('en') ? 'en' : 'bn');
    const targetLang = currentLang === 'en' ? 'bn' : 'en';

    if (targetLang === 'en') {
      window.location.hash = '#googtrans(bn|en)';
    } else {
      window.location.hash = '#googtrans(bn|bn)';
    }

    // Refresh to force Google Translate to pick up the hash change immediately
    window.location.reload();
  }},
];

type SocialGroup = { title: string; Icon: React.ComponentType<{ className?: string }>; iconClass: string; items: string[] };

const socialGroups: SocialGroup[][] = [
  [
    {
      title: "ফেসবুক পেজ",
      Icon: Facebook,
      iconClass: "text-[#1877F2]",
      items: ["প্রভাতবাংলা", "প্রভাতবাংলা অনলাইন", "প্রভাতবাংলা নিউজ", "provatbangla.com", "প্রভাতবাংলা ওয়ার্ল্ড", "প্রভাতবাংলা স্পোর্টস", "প্রভাতবাংলা বিনোদন", "প্রভাতবাংলা ড্রামা"],
    },
  ],
  [
    {
      title: "ইউটিউব চ্যানেল",
      Icon: Youtube,
      iconClass: "text-[#FF0000]",
      items: ["প্রভাতবাংলা নিউজ", "প্রভাতবাংলা ওয়ার্ল্ড", "প্রভাতবাংলা বিনোদন", "প্রভাতবাংলা স্পোর্টস", "প্রভাতবাংলা", "প্রভাতবাংলা ড্রামা"],
    },
  ],
  [
    { title: "টিকটক", Icon: Music2, iconClass: "text-foreground", items: ["প্রভাতবাংলা নিউজ"] },
    { title: "টিকটক", Icon: Music2, iconClass: "text-foreground", items: ["প্রভাতবাংলা বিনোদন"] },
    { title: "টুইটার", Icon: Twitter, iconClass: "text-[#1DA1F2]", items: ["প্রভাতবাংলা"] },
    { title: "ইনস্টাগ্রাম", Icon: Instagram, iconClass: "text-[#E4405F]", items: ["প্রভাতবাংলা"] },
    { title: "লিংকডইন", Icon: Linkedin, iconClass: "text-[#0A66C2]", items: ["প্রভাতবাংলা"] },
  ],
  [
    { title: "টেলিগ্রাম", Icon: Send, iconClass: "text-[#229ED9]", items: ["প্রভাতবাংলা"] },
    { title: "লাইকি", Icon: Rss, iconClass: "text-[#FF8A00]", items: ["প্রভাতবাংলা নিউজ"] },
    { title: "সাউন্ডক্লাউড পডকাস্ট", Icon: Rss, iconClass: "text-muted-foreground", items: ["প্রভাতবাংলা নিউজ"] },
    { title: "গুগল নিউজ", Icon: Newspaper, iconClass: "text-[#4285F4]", items: ["প্রভাতবাংলা"] },
  ],
  [
    { title: "ইমু", Icon: MessageCircle, iconClass: "text-[#00A0E9]", items: ["প্রভাতবাংলা"] },
    { title: "হোয়াটসঅ্যাপ", Icon: MessageCircle, iconClass: "text-[#25D366]", items: ["প্রভাতবাংলা"] },
    { title: "থ্রেডস", Icon: Instagram, iconClass: "text-foreground", items: ["প্রভাতবাংলা নিউজ"] },
  ],
];

function SocialMegaMenu() {
  return (
    <div className="invisible absolute left-1/2 top-full z-50 w-[920px] -translate-x-1/2 border border-border bg-card opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
      {socialGroups.map((row, ri) => (
        <div key={ri} className={`px-6 py-4 ${ri > 0 ? "border-t border-border" : ""}`}>
          <div className="grid grid-cols-4 gap-x-6 gap-y-3">
            {row.length === 1 ? (
              (() => {
                const g = row[0]!;
                const Icon = g.Icon;
                return (
                  <div className="col-span-4">
                    <div className="mb-2 text-[13px] font-bold text-slate-800">{g.title}</div>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                      {g.items.map((it) => (
                        <a key={it} href="#" className="flex items-center gap-2 text-[13px] text-slate-700 transition-colors hover:text-primary">
                          <Icon className={`size-4 shrink-0 ${g.iconClass}`} />
                          <span className="truncate">{it}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              row.map((g, gi) => (
                <div key={gi}>
                  <div className="mb-2 text-[13px] font-bold text-slate-800">{g.title}</div>
                  {g.items.map((it) => (
                    <a key={it} href="#" className="flex items-center gap-2 py-0.5 text-[13px] text-slate-700 transition-colors hover:text-primary">
                      <g.Icon className={`size-4 shrink-0 ${g.iconClass}`} />
                      <span className="truncate">{it}</span>
                    </a>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState("bn");
  
  // Use useMemo for stable date display that matches SSR
  const banglaDate = useMemo(() => {
    // Return empty or fixed placeholder for SSR if needed, 
    // but getCurrentBanglaDate is now more robust.
    return getCurrentBanglaDate();
  }, []); // Only compute once on mount/render

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);

    // Monitor Google Translate changes
    const checkLang = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select && select.value !== currentLang) {
        setCurrentLang(select.value || "bn");
      }
    };
    const langInterval = setInterval(checkLang, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(langInterval);
    };
  }, [currentLang]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]">
      {/* Top Header - Hides on Scroll */}
      <div 
        className={`mx-auto flex max-w-[1360px] items-center px-4 transition-all duration-300 ease-in-out sm:px-6 ${
          isScrolled ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none" : "h-[60px] py-1 sm:h-[80px] sm:py-2"
        }`}
      >
        <button
          className="mr-4 p-1 lg:hidden text-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-95 max-w-[180px] sm:max-w-[260px]">
          <img 
            src={logoAsset.url} 
            alt="প্রভাতবাংলা" 
            className="h-auto w-full max-h-[48px] object-contain sm:max-h-[58px]" 
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-between gap-3 xl:flex px-6 2xl:px-10">
          {utility.map((u) => {
            if ("mega" in u && u.mega) {
              return (
                <div key={u.label} className="group relative py-2">
                  <Link
                    to={u.to as any}
                    className="kb-underline flex cursor-pointer items-center gap-1.5 text-[14px] font-bold text-slate-700 transition-colors hover:text-primary group-hover:text-primary"
                  >
                    <u.icon className="size-[18px] text-muted-foreground group-hover:text-primary" />
                    {u.label}
                    <ChevronDown className="size-3.5" />
                  </Link>
                  <SocialMegaMenu />
                </div>
              );
            }
            
            if ('onClick' in u) {
              const isEnglish = u.label === "English";
              const isActive = isEnglish ? currentLang === 'en' : false;
              
              return (
                <button
                  key={u.label}
                  onClick={u.onClick}
                  className={`kb-underline flex cursor-pointer items-center gap-1.5 text-[14px] font-bold transition-colors hover:text-primary py-2 ${
                    isActive ? "text-primary ring-1 ring-primary/20 bg-primary/5 px-2 rounded-sm" : "text-slate-700"
                  }`}
                >
                  <u.icon className={`size-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {isEnglish && currentLang === 'en' ? "Bangla" : u.label}
                </button>
              );
            }

            return (
              <Link
                key={u.label}
                to={u.to as any}
                className="kb-underline flex cursor-pointer items-center gap-1.5 text-[14px] font-bold text-slate-700 transition-colors hover:text-primary py-2"
              >
                <u.icon className="size-[18px] text-muted-foreground" />
                {u.label}
              </Link>
            );
          })}
        </nav>


        <div className="ml-auto flex items-center gap-3 sm:gap-4 xl:ml-0">
          <div id="google_translate_element" className="google-translate-container"></div>
          
          <div className="hidden text-[14px] font-bold text-slate-700 xl:block border-r pr-4 border-border mr-1 h-5 leading-5">
            {banglaDate}
          </div>
          <button
            className="rounded-full border border-border p-2.5 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:border-primary hover:text-primary shadow-sm"
            aria-label="অনুসন্ধান"
          >
            <Search className="size-[18px]" />
          </button>
          <button className="relative rounded-full border border-border p-2.5 transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary shadow-sm" aria-label="নোটিফিকেশন">
            <Bell className="size-[18px]" />
            <span className="kb-live-dot absolute top-1.5 right-1.5 size-2.5 rounded-full bg-primary ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Main Navigation - Stays Sticky */}
      <div className="border-y border-border bg-white shadow-sm">
        <div className={`mx-auto flex max-w-[1360px] items-center px-4 transition-all duration-300 ${isScrolled ? 'py-0.5 min-h-[50px]' : ''}`}>
          
          {/* Mobile Menu Button - Left aligned when scrolled */}
          <button
            className={`mr-4 p-1 lg:hidden text-slate-800 transition-all duration-300 ${isScrolled ? '' : 'hidden'}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="মেনু"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          {/* Scrolled Logo - Standard sizing and position */}
          {isScrolled && (
            <Link to="/" className="flex shrink-0 items-center animate-in fade-in slide-in-from-left-2 duration-300 max-w-[100px] sm:max-w-[140px] mr-2 xl:mr-6">
              <img 
                src={logoAsset.url} 
                alt="প্রভাতবাংলা" 
                className="h-auto w-full max-h-[28px] sm:max-h-[34px] object-contain" 
              />
            </Link>
          )}

          {/* Desktop Nav Items - Responsive Wrapping */}
          <div className={`hidden w-full flex-1 items-center lg:flex ${isScrolled ? 'justify-start ml-2 xl:ml-4' : ''}`}>
            <div className="flex w-full flex-nowrap items-center justify-between gap-x-1">

              <Link
                to="/"
                className={`flex shrink-0 items-center px-1.5 xl:px-2 text-[14px] xl:text-[15px] font-bold transition-all duration-300 hover:scale-110 hover:text-primary ${isScrolled ? 'py-1.5' : 'py-3'}`}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary" }}
                aria-label="প্রচ্ছদ"
              >
                <Home className={`${isScrolled ? 'size-[18px]' : 'size-[20px]'} stroke-[2.5]`} />
              </Link>
              
              {categories.filter(c => ![
                'health', 'probas', 'orthoniti', 'ain-adalat', 
                'motamot', 'bishesh-protibedon', 'photo-gallery', 'onnanno'
              ].includes(c.slug)).map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className={`kb-underline px-1.5 xl:px-2 text-[13px] xl:text-[14px] font-bold whitespace-nowrap transition-all duration-300 hover:text-primary ${isScrolled ? 'py-1.5' : 'py-3'}`}
                  activeProps={{ className: "text-primary" }}
                >
                  {c.name}
                </Link>
              ))}

              <div className="relative group shrink-0">
                <Link
                  to="/category/$slug"
                  params={{ slug: 'onnanno' }}
                  className={`kb-underline px-1.5 xl:px-2 text-[13px] xl:text-[14px] font-bold whitespace-nowrap transition-all duration-300 hover:text-primary flex items-center gap-1.5 ${isScrolled ? 'py-1.5' : 'py-3'}`}
                  activeProps={{ className: "text-primary" }}
                >
                  অন্যান্য
                  <ChevronRight className={`transition-all duration-300 rotate-90 ${isScrolled ? 'size-3.5' : 'size-4'}`} />
                </Link>
                <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-card border border-border shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-200 z-[60]">
                  {categories.filter(c => [
                    'health', 'probas', 'orthoniti', 'ain-adalat', 
                    'motamot', 'bishesh-protibedon', 'photo-gallery'
                  ].includes(c.slug)).map((c) => (
                    <Link
                      key={c.slug}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="block px-3 py-2 text-[13px] xl:text-[14px] font-bold hover:bg-accent hover:text-primary transition-colors border-b border-border/50 last:border-0"
                      activeProps={{ className: "text-primary bg-accent" }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Scrolled Search/Utility */}
          {isScrolled && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300 ml-auto">
              <button
                className="p-2 transition-colors hover:text-primary rounded-full hover:bg-slate-100"
                aria-label="অনুসন্ধান"
              >
                <Search className="size-[18px]" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Nav Menu */}
        {open && (
          <div className="kb-slide-down grid grid-cols-2 gap-px bg-border lg:hidden border-t border-border shadow-inner">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="bg-background px-4 py-3 text-sm font-bold flex items-center gap-2"
            >
              <Home className="size-4" />
              প্রচ্ছদ
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="bg-background px-4 py-3 text-sm font-bold"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

