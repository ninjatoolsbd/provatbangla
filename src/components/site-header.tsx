import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, Home, Languages, Menu, Newspaper, Search, Share2, X } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/logo.png.asset.json";

import { categories } from "@/lib/news-data";

const utility = [
  { icon: Newspaper, label: "আজকের পত্রিকা" },
  { icon: BookOpen, label: "ই-পেপার" },
  { icon: Newspaper, label: "ম্যাগাজিন" },
  { icon: BookOpen, label: "আর্কাইভ" },
  { icon: Share2, label: "সোশ্যাল মিডিয়া" },
  { icon: Languages, label: "বাংলা কনভার্টার" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background shadow-[0_1px_0_0_var(--border)]">
      <div className="mx-auto flex max-w-[1240px] items-center gap-6 px-4 py-3">
        <button
          className="p-1 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.03]">
          <img 
            src={logoAsset.url} 
            alt="প্রভাতবাংলা" 
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 xl:flex">
          {utility.map((u) => (
            <span
              key={u.label}
              className="kb-underline flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-foreground/80 transition-colors hover:text-primary"
            >
              <u.icon className="size-4 text-muted-foreground" />
              {u.label}
            </span>
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
        <div className="mx-auto hidden max-w-[1240px] items-center justify-center gap-1 px-4 lg:flex">
          <Link
            to="/"
            className="flex items-center px-3 py-2.5 text-[15px] font-bold transition-transform duration-300 hover:scale-110 hover:text-primary"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary" }}
            aria-label="প্রচ্ছদ"
          >
            <Home className="size-[18px]" />
          </Link>
          {categories.filter(c => ![
            'health', 'probas', 'orthoniti', 'ain-adalat', 
            'motamot', 'bishesh-protibedon', 'photo-gallery', 'onnanno'
          ].includes(c.slug)).map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="kb-underline px-3 py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors hover:text-primary"
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
              <Menu className="size-3.5" />
            </Link>
            <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-card border border-border shadow-lg py-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {categories.filter(c => [
                'health', 'probas', 'orthoniti', 'ain-adalat', 
                'motamot', 'bishesh-protibedon', 'photo-gallery', 'onnanno'
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
