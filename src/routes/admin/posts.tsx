import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/my-supabase/client";
import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, banglaDateTime } from "@/lib/posts";


/** Placeholder/irrelevant images that should be replaced by topic-relevant AI photos. */
function needsRelevantImage(url: string | null | undefined) {
  if (!url) return true;
  return url.includes("picsum.photos") || url.includes("/ai-images/");
}

export const Route = createFileRoute("/admin/posts")({
  head: () => ({
    meta: [
      { title: "সব নিউজ — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "সব নিউজ খুঁজুন, স্ট্যাটাস বদলান, এডিট বা মুছুন।" },
      { property: "og:title", content: "সব নিউজ — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "নিউজ তালিকা ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PostsPage,
});

function PostsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);

  const postsQuery = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });

  const rows = (postsQuery.data ?? []).filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (cat === "all" || p.category === cat) &&
      p.title.toLowerCase().includes(q.trim().toLowerCase()),
  );


  const toggle = useMutation({
    mutationFn: async (p: { id: string; status: string }) => {
      const next = p.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("posts")
        .update({
          status: next,
          published_at: next === "published" ? new Date().toISOString() : null,
        })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
      void qc.invalidateQueries({ queryKey: ["published-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
      void qc.invalidateQueries({ queryKey: ["published-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-bold text-primary">সব নিউজ</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="টাইটেল খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="published">প্রকাশিত</SelectItem>
            <SelectItem value="draft">ড্রাফট</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="divide-y divide-border border border-border bg-background">
        {rows.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold">{p.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {categories.find((c) => c.slug === p.category)?.name ?? p.category} ·{" "}
                {banglaDateTime(p.published_at ?? p.created_at)}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 text-xs ${
                p.status === "published"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {p.status === "published" ? "প্রকাশিত" : "ড্রাফট"}
            </span>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => toggle.mutate({ id: p.id, status: p.status })}
            >
              {p.status === "published" ? "ড্রাফটে নিন" : "পাবলিশ"}
            </button>
            <Link to="/admin/write" search={{ id: p.id }} className="text-xs text-primary hover:underline">
              এডিট
            </Link>
            {p.status === "published" && p.slug && (
              <Link
                to="/post/$slug"
                params={{ slug: p.slug }}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                দেখুন
              </Link>
            )}
            <button
              onClick={() => del.mutate(p.id)}
              aria-label="মুছুন"
              className="text-muted-foreground hover:text-primary"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">কোনো নিউজ পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
}
