import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Newspaper, Trash2, Wand2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  EPAPER_CATEGORIES,
  EpaperSheet,
  bnDate,
  bnNum,
  buildEpaperPages,
  type EpaperPost,
} from "@/components/epaper-sheet";

export const Route = createFileRoute("/admin/epaper")({
  head: () => ({
    meta: [
      { title: "ই-পেপার জেনারেটর — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "সাইটের খবর থেকে সাপ্তাহিক ই-পেপার তৈরি করুন।" },
      { property: "og:title", content: "ই-পেপার জেনারেটর — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "সাইটের খবর থেকে সাপ্তাহিক ই-পেপার তৈরি করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EpaperGenerator,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);
const POST_COLS = "id,title,excerpt,content,category,image_url,slug,view_count,published_at,created_at";

type Edition = { id: string; title: string; edition_date: string; post_ids: string[]; week_start: string | null; week_end: string | null };

function EpaperGenerator() {
  const [from, setFrom] = useState(iso(new Date(Date.now() - 6 * 86400000)));
  const [to, setTo] = useState(iso(new Date()));
  const [posts, setPosts] = useState<EpaperPost[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editions, setEditions] = useState<Edition[]>([]);

  const loadEditions = async () => {
    const { data } = await supabase
      .from("epaper_editions")
      .select("id,title,edition_date,post_ids,week_start,week_end")
      .order("edition_date", { ascending: false })
      .limit(30);
    setEditions((data as Edition[]) ?? []);
  };
  useEffect(() => {
    loadEditions();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(POST_COLS)
      .eq("status", "published")
      .gte("created_at", `${from}T00:00:00`)
      .lte("created_at", `${to}T23:59:59`)
      .order("view_count", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) return toast.error("খবর আনা যায়নি: " + error.message);
    const list = (data as EpaperPost[]) ?? [];
    setPosts(list);
    // auto-pick: top 7 overall + up to 6 per category, max 40
    const pick = new Set<string>();
    list.slice(0, 7).forEach((p) => pick.add(p.id));
    const perCat = new Map<string, number>();
    for (const p of list) {
      if (pick.size >= 40) break;
      const c = perCat.get(p.category) ?? 0;
      if (c < 6 && !pick.has(p.id)) {
        pick.add(p.id);
        perCat.set(p.category, c + 1);
      }
    }
    setSelected(pick);
    if (!list.length) toast.info("এই সময়ে কোনো প্রকাশিত খবর নেই।");
  };

  const chosen = useMemo(() => posts.filter((p) => selected.has(p.id)), [posts, selected]);
  const pages = useMemo(() => buildEpaperPages(chosen), [chosen]);
  const dateLabel = `${bnDate(from)} – ${bnDate(to)}`;

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const publish = async () => {
    if (!chosen.length) return toast.error("অন্তত একটি খবর বাছাই করুন।");
    setSaving(true);
    const { error } = await supabase.from("epaper_editions").insert({
      title: `প্রভাতবাংলা সাপ্তাহিক ই-পেপার`,
      edition_date: to,
      week_start: from,
      week_end: to,
      post_ids: chosen.map((p) => p.id),
      cover_url: chosen.find((p) => p.image_url)?.image_url ?? null,
      is_published: true,
    });
    setSaving(false);
    if (error) return toast.error("সংরক্ষণ হয়নি: " + error.message);
    toast.success("ই-পেপার প্রকাশিত হয়েছে!");
    loadEditions();
  };

  const remove = async (id: string) => {
    if (!confirm("এই সংখ্যাটি মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("epaper_editions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadEditions();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Newspaper className="size-6 text-primary" /> ই-পেপার জেনারেটর
        </h1>
        <p className="text-sm text-muted-foreground">
          সপ্তাহের খবর বেছে এক ক্লিকে ই-পেপার তৈরি ও প্রকাশ করুন। পাঠকেরা হোমপেজ ও ই-পেপার পাতায় দেখবেন, PDF হিসেবেও নামাতে পারবেন।
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <label className="text-sm font-semibold">
          শুরু
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded border border-input bg-background px-2 py-1.5" />
        </label>
        <label className="text-sm font-semibold">
          শেষ
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded border border-input bg-background px-2 py-1.5" />
        </label>
        <Button onClick={loadPosts} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />} খবর আনুন ও বাছাই করুন
        </Button>
        {chosen.length > 0 && (
          <Button onClick={publish} disabled={saving} variant="default" className="ml-auto">
            {saving && <Loader2 className="size-4 animate-spin" />} ই-পেপার প্রকাশ করুন ({bnNum(chosen.length)} খবর, {bnNum(pages.length)} পাতা)
          </Button>
        )}
      </div>

      {posts.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="max-h-[80vh] overflow-y-auto rounded-lg border border-border bg-card p-3 lg:col-span-4">
            <div className="mb-2 text-sm font-bold">খবর বাছাই ({bnNum(selected.size)}/{bnNum(posts.length)})</div>
            {posts.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-start gap-2 border-b border-border py-2 text-sm">
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1" />
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {EPAPER_CATEGORIES[p.category] ?? p.category} · {bnNum(p.view_count)} বার পড়া
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="space-y-6 bg-muted p-3 lg:col-span-8">
            <div className="text-sm font-bold">প্রিভিউ</div>
            {pages.map((pg) => (
              <EpaperSheet key={pg.no} page={pg} date={dateLabel} total={pages.length} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 font-display text-lg font-bold">প্রকাশিত সংখ্যা</h2>
        {editions.length === 0 && <p className="text-sm text-muted-foreground">এখনো কোনো সংখ্যা নেই।</p>}
        {editions.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm">
            <Link to="/epaper" search={{ id: e.id }} className="font-semibold hover:text-primary">
              {e.week_start ? `${bnDate(e.week_start)} – ` : ""}
              {bnDate(e.edition_date)} · {bnNum(e.post_ids?.length ?? 0)} খবর
            </Link>
            <Button size="sm" variant="ghost" onClick={() => remove(e.id)} aria-label="মুছুন">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
