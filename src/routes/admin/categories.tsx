import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ResourceManager } from "@/components/admin/resource-manager";
import { fetchAllPostsForAdmin } from "@/lib/posts";
import { useCategories } from "@/lib/cms";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "ক্যাটাগরি — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "ক্যাটাগরি যোগ, এডিট ও পরিসংখ্যান।" },
      { property: "og:title", content: "ক্যাটাগরি — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "ক্যাটাগরিভিত্তিক নিউজ ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const posts = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });
  const cats = useCategories();
  const all = posts.data ?? [];

  return (
    <div className="space-y-6">
      <ResourceManager
        table="categories"
        title="ক্যাটাগরি"
        description="সাইটের মেনু ও নিউজ বিভাগ এখান থেকে নিয়ন্ত্রণ করুন।"
        order={{ column: "sort_order", ascending: true }}
        fields={[
          { name: "name", label: "নাম (বাংলা)", type: "text" },
          { name: "slug", label: "স্লাগ (ইংরেজি)", type: "text", placeholder: "jatiyo" },
          { name: "sort_order", label: "ক্রম", type: "number", defaultValue: 0 },
          { name: "is_active", label: "সক্রিয়", type: "checkbox", defaultValue: true },
        ]}
        rowTitle={(r) => `${r["name"]} (${r["slug"]})`}
        rowSubtitle={(r) => {
          const rows = all.filter((p) => p.category === r["slug"]);
          const pub = rows.filter((p) => p.status === "published").length;
          return `মোট ${rows.length} · প্রকাশিত ${pub} · ড্রাফট ${rows.length - pub}`;
        }}
      />

      <div className="border border-border bg-background p-4">
        <h2 className="font-display text-base font-bold text-primary">সাইটে দেখুন</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(cats.data ?? []).map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
