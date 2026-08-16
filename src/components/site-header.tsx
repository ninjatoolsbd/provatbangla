import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, ChevronRight, Home, Languages, Menu, Newspaper, Search, Share2, Tv, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { categories } from "@/lib/news-data";
import logoAsset from "@/assets/logo.png.asset.json";

const utility = [
  { icon: BookOpen, label: "ই-পেপার", to: "/epaper" },
  { icon: Newspaper, label: "ম্যাগাজিন", to: "/magazine" },
  { icon: Tv, label: "লাইভ টিভি", to: "/live-tv" },
  { icon: Share2, label: "সোশ্যাল মিডিয়া", to: "/social" },
  { icon: Bell, label: "আর্কাইভ", to: "/archive" },
  { icon: Languages, label: "English", to: "/english" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const banglaDate = useMemo(() => {
    const date = new Date();
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    
    const banglaNumbers: Record<string, string> = {
      "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
    };

    const toBanglaNum = (num: number) => num.toString().split("").map(d => banglaNumbers[d] || d).join("");
    
    const day = days[date.getDay()];
    const dateNum = toBanglaNum(date.getDate());
    const month = months[date.getMonth()];
    const year = toBanglaNum(date.getFullYear());
    
    return `${day}, ${dateNum} ${month} ${year}`;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
      {/* Top Header - Hides on Scroll */}
      <div 
        className={`mx-auto flex max-w-[1360px] items-center gap-4 px-4 transition-all duration-300 ease-in-out sm:gap-6 ${
          isScrolled ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none" : "h-[64px] py-2 sm:h-[80px] sm:py-3"
        }`}
      >
        <button
          className="p-1 lg:hidden text-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-90 max-w-[160px] sm:max-w-[220px]">
          <img 
            src={logoAsset.url} 
            alt="প্রভাতবাংলা" 
            className="h-auto w-full max-h-[36px] object-contain sm:max-h-[44px]" 
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 xl:flex">
          {utility.map((u) => (
            <Link
              key={u.label}
              to={u.to as any}
              className="kb-underline flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-slate-700 transition-colors hover:text-primary"
            >
              <u.icon className="size-4 text-muted-foreground" />
              {u.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 xl:ml-0">
          <div className="hidden text-[13px] font-medium text-slate-500 xl:block border-r pr-4 border-border mr-1">
            {banglaDate}
          </div>
          <button
            className="rounded-full border border-border p-2 transition-all duration-300 hover:rotate-6 hover:scale-110 hover:border-primary hover:text-primary"
            aria-label="অনুসন্ধান"
          >
            <Search className="size-4" />
          </button>
          <button className="relative rounded-full border border-border p-2 transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary" aria-label="নোটিফিকেশন">
            <Bell className="size-4" />
            <span className="kb-live-dot absolute top-1 right-1 size-2 rounded-full bg-primary text-primary" />
          </button>
        </div>
      </div>

      {/* Main Navigation - Stays Sticky */}
      <div className="border-y border-border bg-white">
        <div className={`mx-auto flex max-w-[1360px] items-center justify-between lg:justify-center gap-1 px-4 transition-all duration-300 ${isScrolled ? 'py-1 min-h-[50px]' : ''}`}>
          
          {/* Mobile Menu Button - Visible when scrolled on mobile */}
          <button
            className={`p-1 lg:hidden text-slate-800 transition-all duration-300 ${isScrolled ? 'block' : 'hidden'}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="মেনু"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          {/* Scrolled Logo */}
          {isScrolled && (
            <Link to="/" className="mr-auto lg:mr-4 flex shrink-0 items-center animate-in fade-in slide-in-from-left-2 duration-300 max-w-[120px] sm:max-w-[140px]">
              <img 
                src={logoAsset.url} 
                alt="প্রভাতবাংলা" 
                className="h-auto w-full max-h-[28px] object-contain" 
              />
            </Link>
          )}

          {/* Desktop Nav Items */}
          <div className="hidden items-center justify-center lg:flex">
            <Link
              to="/"
              className={`flex items-center px-3 text-[15px] font-bold transition-all duration-300 hover:scale-110 hover:text-primary ${isScrolled ? 'py-2' : 'py-2.5'}`}
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
                className={`kb-underline px-3 text-[15px] font-bold whitespace-nowrap transition-all duration-300 hover:text-primary ${isScrolled ? 'py-2' : 'py-2.5'}`}
                activeProps={{ className: "text-primary" }}
              >
                {c.name}
              </Link>
            ))}

            <div className="relative group">
              <Link
                to="/category/$slug"
                params={{ slug: 'onnanno' }}
                className={`kb-underline px-3 text-[15px] font-bold whitespace-nowrap transition-all duration-300 hover:text-primary flex items-center gap-1 ${isScrolled ? 'py-2' : 'py-2.5'}`}
                activeProps={{ className: "text-primary" }}
              >
                অন্যান্য
                <ChevronRight className={`transition-all duration-300 rotate-90 ${isScrolled ? 'size-3' : 'size-3.5'}`} />
              </Link>
              <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-card border border-border shadow-lg py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {categories.filter(c => [
                  'health', 'probas', 'orthoniti', 'ain-adalat', 
                  'motamot', 'bishesh-protibedon', 'photo-gallery'
                ].includes(c.slug)).map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="block px-4 py-2 text-[14px] font-bold hover:bg-accent hover:text-primary transition-colors"
                    activeProps={{ className: "text-primary bg-accent" }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Scrolled Search/Utility */}
          {isScrolled && (
            <div className="ml-auto flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
              <button
                className="p-1.5 transition-colors hover:text-primary"
                aria-label="অনুসন্ধান"
              >
                <Search className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Nav Menu */}
        {open && (
          <div className="kb-slide-down grid grid-cols-2 gap-px bg-border lg:hidden">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="bg-background px-4 py-2.5 text-sm font-bold"
            >
              প্রচ্ছদ
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="bg-background px-4 py-2.5 text-sm font-bold"
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
