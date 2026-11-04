import logoAsset from "@/lib/logo";

export type EpaperPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  slug: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
};

export const EPAPER_CATEGORIES: Record<string, string> = {
  jatiyo: "জাতীয়",
  rajniti: "রাজনীতি",
  sarabangla: "সারাবাংলা",
  antorjatik: "আন্তর্জাতিক",
  khela: "খেলা",
  binodon: "বিনোদন",
  arthonity: "অর্থনীতি",
  prajukti: "প্রযুক্তি",
  shikkha: "শিক্ষা",
  sasthyo: "স্বাস্থ্য",
  oporadh: "অপরাধ",
  motamot: "মতামত",
};

export const bnNum = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)] ?? d);

export const bnDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });

const plain = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const snippet = (p: EpaperPost, len: number) => {
  const t = plain(p.content || p.excerpt || "");
  return t.length > len ? t.slice(0, len).trim() + "…" : t;
};

export type EpaperPageData = { no: number; label: string; posts: EpaperPost[] };

/** Splits selected posts into newspaper pages: front page, category pages, last page. */
export function buildEpaperPages(posts: EpaperPost[]): EpaperPageData[] {
  if (!posts.length) return [];
  const sorted = [...posts].sort((a, b) => b.view_count - a.view_count);
  const front = sorted.slice(0, 7);
  const rest = sorted.slice(7);
  const pages: EpaperPageData[] = [{ no: 1, label: "প্রথম পাতা", posts: front }];
  const groups = new Map<string, EpaperPost[]>();
  for (const p of rest) {
    const k = EPAPER_CATEGORIES[p.category] ?? "অন্যান্য";
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  let leftovers: EpaperPost[] = [];
  for (const [label, list] of groups) {
    if (list.length < 3) {
      leftovers = leftovers.concat(list);
      continue;
    }
    for (let i = 0; i < list.length; i += 6) {
      pages.push({ no: pages.length + 1, label, posts: list.slice(i, i + 6) });
    }
  }
  for (let i = 0; i < leftovers.length; i += 6) {
    pages.push({ no: pages.length + 1, label: "বিবিধ", posts: leftovers.slice(i, i + 6) });
  }
  const last = pages[pages.length - 1];
  if (pages.length > 1 && last) last.label = `শেষ পাতা · ${last.label}`;
  return pages;
}

function Story({ p, size }: { p: EpaperPost; size: "lead" | "mid" | "small" }) {
  const head =
    size === "lead" ? "text-3xl md:text-4xl" : size === "mid" ? "text-xl" : "text-base";
  const len = size === "lead" ? 700 : size === "mid" ? 320 : 180;
  return (
    <article className="break-inside-avoid border-b border-foreground/20 pb-3 mb-3">
      <h3 className={`font-display font-extrabold leading-tight ${head}`}>{p.title}</h3>
      {p.image_url && size !== "small" && (
        <img
          src={p.image_url}
          alt={p.title}
          loading="lazy"
          className={`my-2 w-full object-cover ${size === "lead" ? "aspect-[16/9]" : "aspect-[4/3]"}`}
        />
      )}
      <p className="text-justify text-[13px] leading-relaxed text-foreground/85">{snippet(p, len)}</p>
    </article>
  );
}

export function EpaperSheet({
  page,
  date,
  total,
}: {
  page: EpaperPageData;
  date: string;
  total: number;
}) {
  const [lead, ...others] = page.posts;
  const isFront = page.no === 1;
  return (
    <div className="epaper-sheet mx-auto w-full max-w-[900px] bg-card p-5 text-foreground shadow-lg md:p-8">
      {isFront ? (
        <header className="mb-4 border-b-4 border-double border-foreground pb-3 text-center">
          <img src={logoAsset.url} alt="প্রভাতবাংলা" className="mx-auto h-16 w-auto object-contain md:h-20" />
          <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-foreground/40 pt-1 text-xs font-semibold">
            <span>সাপ্তাহিক ই-পেপার</span>
            <span>{date}</span>
            <span>www.provatbanglanews.com</span>
          </div>
        </header>
      ) : (
        <header className="mb-4 flex items-center justify-between border-b-2 border-primary pb-2 text-xs font-semibold">
          <span>প্রভাতবাংলা · {date}</span>
          <span className="bg-primary px-3 py-1 font-display text-sm font-bold text-primary-foreground">
            {page.label}
          </span>
          <span>পৃষ্ঠা {bnNum(page.no)}</span>
        </header>
      )}
      {lead && <Story p={lead} size={isFront ? "lead" : "mid"} />}
      <div className="columns-1 gap-5 sm:columns-2 md:columns-3 [column-rule:1px_solid_hsl(0_0%_80%)]">
        {others.map((p, i) => (
          <Story key={p.id} p={p} size={i < 2 ? "mid" : "small"} />
        ))}
      </div>
      <footer className="mt-3 border-t border-foreground/40 pt-1 text-center text-[11px] text-muted-foreground">
        পৃষ্ঠা {bnNum(page.no)} / {bnNum(total)} · প্রভাতবাংলা
      </footer>
    </div>
  );
}
