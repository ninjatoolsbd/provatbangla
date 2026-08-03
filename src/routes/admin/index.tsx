import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, PenSquare, CheckCircle2, FileEdit } from "lucide-react";

import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, banglaDateTime } from "@/lib/posts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ওভারভিউ — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "প্রকাশিত ও ড্রাফট নিউজের সারসংক্ষেপ ও সাম্প্রতিক কার্যক্রম।" },
      { property: "og:title", content: "ওভারভিউ — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "নিউজ পরিসংখ্যান ও সাম্প্রতিক কার্যক্রম।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const posts = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });
  const all = posts.data ?? [];
  const published = all.filter((p) => p.status === "published");
  const drafts = all.filter((p) => p.status !== "published");
  const usedCats = new Set(all.map((p) => p.category)).size;

  const stats = [
    { label: "মোট নিউজ", value: all.length, icon: FileText },
    { label: "প্রকাশিত", value: published.length, icon: CheckCircle2 },
    { label: "ড্রাফট", value: drafts.length, icon: FileEdit },
    { label: "ব্যবহৃত ক্যাটাগরি", value: `${usedCats}/${categories.length}`, icon: PenSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-bold text-primary">ওভারভিউ</h1>
        <Link
          to="/admin/write"
          className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          নতুন নিউজ লিখুন
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-background">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-bold text-primary">সাম্প্রতিক নিউজ</h2>
        </div>
        <div className="divide-y divide-border">
          {all.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.status === "published" ? "প্রকাশিত" : "ড্রাফট"} ·{" "}
                  {banglaDateTime(p.published_at ?? p.created_at)}
                </p>
              </div>
              <Link
                to="/admin/write"
                search={{ id: p.id }}
                className="shrink-0 text-xs text-primary hover:underline"
              >
                এডিট
              </Link>
            </div>
          ))}
          {all.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">এখনো কোনো নিউজ নেই।</p>
          )}
        </div>
      </div>
    </div>
  );
}
