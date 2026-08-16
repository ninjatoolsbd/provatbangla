import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, ChevronRight, Home, Languages, Menu, Newspaper, Search, Share2, X } from "lucide-react";
import { useState, useEffect } from "react";

import { categories } from "@/lib/news-data";
import logoAsset from "@/assets/logo.png.asset.json";

const utility = [
  { icon: Newspaper, label: "আজকের পত্রিকা", to: "/newspaper" },
  { icon: BookOpen, label: "ই-পেপার", to: "/epaper" },
  { icon: Newspaper, label: "ম্যাগাজিন", to: "/magazine" },
  { icon: Bell, label: "আর্কাইভ", to: "/archive" },
  { icon: Share2, label: "সোশ্যাল মিডিয়া", to: "/social" },
  { icon: Languages, label: "বাংলা কনভার্টার", to: "/converter" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
      <div 
        className={`mx-auto flex max-w-[1360px] items-center gap-6 px-4 transition-all duration-300 ${
          isScrolled ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none" : "h-[90px] py-4"
        }`}
      >
        <button
          className="p-1 lg:hidden text-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-90">
          <img 
            src={logoAsset.url} 
            alt="প্রভাতবাংলা" 
            className="h-14 w-auto object-contain sm:h-16" 
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

        <div className="ml-auto flex items-center gap-3 xl:ml-0">
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

      <div className="border-y border-border">
        <div className={`mx-auto hidden max-w-[1360px] items-center justify-center gap-1 px-4 lg:flex transition-all duration-300 ${isScrolled ? 'py-1' : ''}`}>
          {isScrolled && (
            <Link to="/" className="mr-4 flex shrink-0 items-center animate-in fade-in slide-in-from-left-2 duration-300">
              <img 
                src={logoAsset.url} 
                alt="প্রভাতবাংলা" 
                className="h-8 w-auto object-contain" 
              />
            </Link>
          )}
          <Link
            to="/"
            className={`flex items-center px-3 py-2.5 text-[15px] font-bold transition-all duration-300 hover:scale-110 hover:text-primary ${isScrolled ? 'py-1.5' : 'py-2.5'}`}
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
              className={`kb-underline px-3 py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors hover:text-primary ${isScrolled ? 'py-3' : 'py-2.5'}`}
              activeProps={{ className: "text-primary" }}
            >
              {c.name}
            </Link>
          ))}
          <div className="relative group">
            <Link
              to="/category/$slug"
              params={{ slug: 'onnanno' }}
              className="kb-underline px-3 py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors hover:text-primary flex items-center gap-1"
              activeProps={{ className: "text-primary" }}
            >
              অন্যান্য
              <ChevronRight className="size-3.5 rotate-90" />
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
