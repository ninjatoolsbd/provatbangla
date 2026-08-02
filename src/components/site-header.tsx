import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { banglaDate, categories } from "@/lib/news-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between px-4 text-xs text-muted-foreground">
          <span>{banglaDate}</span>
          <div className="hidden gap-4 sm:flex">
            <Link to="/category/$slug" params={{ slug: "motamot" }} className="hover:text-primary">
              মতামত
            </Link>
            <span>ই-পেপার</span>
            <span>আর্কাইভ</span>
            <span>যোগাযোগ</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4">
        <button
          className="rounded-md border border-border p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            কালবেলা
          </span>
          <span className="mt-1 text-[10px] tracking-[0.35em] text-muted-foreground">
            DEMO NEWS
          </span>
        </Link>

        <div className="hidden h-16 w-[420px] items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground lg:flex">
          বিজ্ঞাপন
        </div>

        <button className="rounded-md border border-border p-2" aria-label="অনুসন্ধান">
          <Search className="size-5" />
        </button>
      </div>

      <nav className="bg-primary text-primary-foreground">
        <div className="mx-auto hidden max-w-[1200px] items-center gap-1 overflow-x-auto px-4 lg:flex">
          <Link
            to="/"
            className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap hover:bg-primary-hover"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-primary-hover" }}
          >
            প্রচ্ছদ
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="px-3 py-2.5 text-sm font-semibold whitespace-nowrap hover:bg-primary-hover"
              activeProps={{ className: "bg-primary-hover" }}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {open && (
          <div className="grid grid-cols-2 gap-px bg-primary-hover lg:hidden">
            <Link to="/" onClick={() => setOpen(false)} className="bg-primary px-4 py-2.5 text-sm font-semibold">
              প্রচ্ছদ
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="bg-primary px-4 py-2.5 text-sm font-semibold"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
