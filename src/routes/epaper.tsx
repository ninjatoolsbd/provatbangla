import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, Newspaper } from "lucide-react";
import { z } from "zod";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpaperSheet, bnDate, buildEpaperPages } from "@/components/epaper-sheet";
import { editionLabel, loadEpaper } from "@/lib/epaper-data";

export const Route = createFileRoute("/epaper")({
  validateSearch: z.object({ id: z.string().optional() }),
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: ({ deps }) => loadEpaper(deps.id),
  head: () => ({
    meta: [
      { title: "ই-পেপার — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা সাপ্তাহিক ই-পেপার — সপ্তাহের সেরা খবর সংবাদপত্রের মতো করে পড়ুন ও PDF নামান।" },
      { property: "og:title", content: "ই-পেপার — প্রভাতবাংলা" },
      { property: "og:description", content: "প্রভাতবাংলা সাপ্তাহিক ই-পেপার — সপ্তাহের সেরা খবর।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EPaperPage,
});

function EPaperPage() {
  const { editions, edition, posts } = Route.useLoaderData();
  const pages = buildEpaperPages(posts);
  const label = edition ? editionLabel(edition, bnDate) : "";

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <div className="print:hidden"><SiteHeader /></div>
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-3 print:hidden">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold">
              <Newspaper className="size-7 text-primary" /> ই-পেপার
            </h1>
            {edition && <p className="text-sm text-muted-foreground">সংখ্যা: {label}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editions.length > 1 && (
              <select
                value={edition?.id}
                onChange={(e) => (window.location.href = `/epaper?id=${e.target.value}`)}
                className="rounded border border-input bg-background px-2 py-2 text-sm"
                aria-label="পুরোনো সংখ্যা"
              >
                {editions.map((e) => (
                  <option key={e.id} value={e.id}>{editionLabel(e, bnDate)}</option>
                ))}
              </select>
            )}
            {edition && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                <Printer className="size-4" /> PDF ডাউনলোড / প্রিন্ট
              </button>
            )}
          </div>
        </div>

        {!edition || !pages.length ? (
          <div className="py-20 text-center text-muted-foreground">
            এখনো কোনো ই-পেপার প্রকাশিত হয়নি। <Link to="/" className="text-primary underline">হোমে ফিরুন</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {pages.map((pg) => (
              <div key={pg.no} className="break-after-page">
                <EpaperSheet page={pg} date={label} total={pages.length} />
              </div>
            ))}
          </div>
        )}
      </main>
      <div className="print:hidden"><SiteFooter /></div>
    </div>
  );
}
