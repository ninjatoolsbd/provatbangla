import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Printer } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { epaperPages } from "@/components/epaper-section";
import { EpaperPage } from "@/components/epaper-page";


const bn = (n: number | string) =>
  String(n)
    .split("")
    .map((d) => ("০১২৩৪৫৬৭৮৯"[Number(d)] ?? d))
    .join("");

export const Route = createFileRoute("/epaper")({
  head: () => ({
    meta: [
      { title: "কালবেলা ই-পেপার — আজকের পত্রিকার সব পাতা" },
      {
        name: "description",
        content:
          "কালবেলা ই-পেপারে আজকের ছাপা পত্রিকার প্রথম পাতা থেকে শেষ পাতা পর্যন্ত সব পৃষ্ঠা পড়ুন। (ডেমো)",
      },
      { property: "og:title", content: "কালবেলা ই-পেপার" },
      { property: "og:description", content: "আজকের ছাপা পত্রিকার সব পাতা এক জায়গায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EpaperPage,
});

function EpaperPage() {
  const [active, setActive] = useState(0);
  const page = epaperPages[active]!;
  const img = articles[(active + 3) % articles.length]?.image ?? "";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-2">
          <h1 className="font-display text-2xl font-extrabold">কালবেলা ই-পেপার</h1>
          <span className="text-sm text-muted-foreground">২ আগস্ট ২০২৬, রোববার</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <aside className="min-w-0 lg:col-span-3">
            <div className="border border-border bg-card">
              <div className="bg-secondary px-3 py-2 font-display text-sm font-bold">পাতাসমূহ</div>
              <ul className="divide-y divide-border">
                {epaperPages.map((p, i) => (
                  <li key={p.no}>
                    <button
                      onClick={() => setActive(i)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                        i === active ? "bg-primary text-primary-foreground hover:bg-primary" : ""
                      }`}
                    >
                      <span className="font-bold">{bn(p.no)}</span>
                      <span>{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-bold">
                পৃষ্ঠা {bn(page.no)} — {page.label}
              </span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 border border-border px-2 py-1 text-xs font-semibold transition-colors hover:bg-secondary">
                  <Printer className="size-3.5" /> প্রিন্ট
                </button>
                <button className="flex items-center gap-1 border border-border px-2 py-1 text-xs font-semibold transition-colors hover:bg-secondary">
                  <Download className="size-3.5" /> ডাউনলোড
                </button>
              </div>
            </div>
            <div className="border border-border bg-card p-3">
              <div className="mx-auto w-full max-w-[720px]">
                <EpaperPage pageNo={page.no} label={page.label} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
