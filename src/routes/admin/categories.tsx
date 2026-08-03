import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin } from "@/lib/posts";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "ক্যাটাগরি — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "ক্যাটাগরি অনুযায়ী প্রকাশিত ও ড্রাফট নিউজের সংখ্যা।" },
      { property: "og:title", content: "ক্যাটাগরি — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "ক্যাটাগরিভিত্তিক নিউজ পরিসংখ্যান।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const posts = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });
  const all = posts.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[22px] font-bold text-primary">ক্যাটাগরি</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const rows = all.filter((p) => p.category === c.slug);
          const pub = rows.filter((p) => p.status === "published").length;
          return (
            <div key={c.slug} className="border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-bold">{c.name}</p>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="text-xs text-primary hover:underline"
                >
                  সাইটে দেখুন
                </Link>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                মোট {rows.length} · প্রকাশিত {pub} · ড্রাফট {rows.length - pub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
