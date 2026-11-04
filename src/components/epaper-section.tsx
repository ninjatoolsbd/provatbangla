import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";

import { bnDate, bnNum, buildEpaperPages, snippet } from "@/components/epaper-sheet";
import { editionLabel, loadEpaper } from "@/lib/epaper-data";
import logoAsset from "@/lib/logo";

export function EpaperSection() {
  const { data } = useQuery({ queryKey: ["epaper-latest"], queryFn: () => loadEpaper() });
  const edition = data?.edition;
  const pages = data ? buildEpaperPages(data.posts) : [];
  if (!edition || !pages.length) return null;
  const label = editionLabel(edition, bnDate);
  const [lead, ...rest] = pages[0].posts;

  return (
    <section className="mt-8 border-y border-border bg-secondary/50 py-6">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-2">
          <div className="flex items-center gap-2">
            <Newspaper className="size-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold">প্রভাতবাংলা ই-পেপার</h2>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <Link to="/epaper" className="bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">
            ই-পেপার পড়ুন
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          <Link to="/epaper" className="group block border border-border bg-card p-4 lg:col-span-5">
            <img src={logoAsset.url} alt="প্রভাতবাংলা" className="mx-auto h-10 w-auto" />
            <div className="my-2 border-y border-foreground/40 py-0.5 text-center text-[10px] font-semibold">{label}</div>
            {lead && (
              <>
                <h3 className="font-display text-xl font-extrabold leading-tight group-hover:text-primary">{lead.title}</h3>
                {lead.image_url && <img src={lead.image_url} alt={lead.title} loading="lazy" className="my-2 aspect-video w-full object-cover" />}
                <p className="text-xs text-muted-foreground">{snippet(lead, 160)}</p>
              </>
            )}
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
            {pages.slice(0, 6).map((pg) => (
              <Link key={pg.no} to="/epaper" className="border border-border bg-card p-2 hover:shadow-md">
                <span className="text-[11px] font-bold text-primary">পৃষ্ঠা {bnNum(pg.no)} · {pg.label}</span>
                <ul className="mt-1 space-y-1">
                  {(pg.no === 1 ? rest : pg.posts).slice(0, 3).map((p) => (
                    <li key={p.id} className="line-clamp-2 text-xs font-semibold">{p.title}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
