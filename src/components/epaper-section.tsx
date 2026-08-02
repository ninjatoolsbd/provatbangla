import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

import { articles } from "@/lib/news-data";

const bn = (n: number | string) =>
  String(n)
    .split("")
    .map((d) => ("০১২৩৪৫৬৭৮৯"[Number(d)] ?? d))
    .join("");

export const epaperPages = [
  { no: 1, label: "প্রথম পাতা" },
  { no: 2, label: "দ্বিতীয় পাতা" },
  { no: 3, label: "সারাদেশ" },
  { no: 4, label: "খেলা" },
  { no: 5, label: "বিনোদন" },
  { no: 6, label: "শেষ পাতা" },
];

export function EpaperSection() {
  const today = "২ আগস্ট ২০২৬, রোববার";

  return (
    <section className="mt-8 border-y border-border bg-secondary/50 py-6">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-2">
          <div className="flex items-center gap-2">
            <Newspaper className="size-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">কালবেলা ই-পেপার</h2>
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>
          <Link
            to="/epaper"
            className="bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            সব পাতা দেখুন
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* today's front page */}
          <div className="min-w-0 lg:col-span-4">
            <Link to="/epaper" className="group block border border-border bg-card p-2">
              <div className="relative overflow-hidden">
                <div className="transition-transform duration-500 group-hover:scale-[1.03]">
                  <EpaperPage pageNo={1} label="প্রথম পাতা" date={today} />
                </div>
                <span className="absolute left-0 top-0 bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">
                  আজকের প্রথম পাতা
                </span>
              </div>
            </Link>
          </div>

          {/* page thumbs */}
          <div className="min-w-0 lg:col-span-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm font-bold">আজকের সংখ্যার পাতাসমূহ</span>
              <div className="flex gap-1">
                <button
                  aria-label="আগের"
                  className="border border-border p-1 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  aria-label="পরের"
                  className="border border-border p-1 transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {epaperPages.map((p, i) => (
                <Link
                  key={p.no}
                  to="/epaper"
                  className="group border border-border bg-card p-1.5 transition-shadow hover:shadow-md"
                >
                  <img
                    src={articles[(i + 3) % articles.length]?.image ?? ""}
                    alt={`ই-পেপার ${p.label}`}
                    className="aspect-[3/4] w-full object-cover"
                    loading="lazy"
                  />
                  <span className="mt-1.5 block text-center text-[11px] font-semibold group-hover:text-primary">
                    পৃষ্ঠা {bn(p.no)} · {p.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
