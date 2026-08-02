import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { rewriteNews } from "@/lib/news.functions";
import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, slugify, banglaDateTime, type Post } from "@/lib/posts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "নিউজ লিখুন — কালবেলা অ্যাডমিন" },
      { name: "description", content: "AI রিরাইট সহ নিউজ লেখা ও প্রকাশের অ্যাডমিন প্যানেল।" },
      { property: "og:title", content: "নিউজ লিখুন — কালবেলা অ্যাডমিন" },
      { property: "og:description", content: "AI রিরাইট সহ নিউজ লেখা ও প্রকাশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Version = {
  label: string;
  title: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
};

function AdminPage() {
  const { isAdmin, loading, email } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rewrite = useServerFn(rewriteNews);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kicker, setKicker] = useState("");
  const [category, setCategory] = useState("jatiyo");
  const [imageUrl, setImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tone, setTone] = useState<"news" | "analysis" | "short">("news");
  const [variantCount, setVariantCount] = useState(1);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/auth" });
  }, [loading, isAdmin, navigate]);

  const postsQuery = useQuery({
    queryKey: ["admin-posts"],
    queryFn: fetchAllPostsForAdmin,
    enabled: isAdmin,
  });

  const rewriteMutation = useMutation({
    mutationFn: async () =>
      rewrite({ data: { title, content, category, tone, variants: variantCount } }),
    onSuccess: (res) => {
      setVersions(res.versions);
      const first = res.versions[0];
      if (first) applyVersion(first);
      toast.success("AI রিরাইট সম্পন্ন হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function applyVersion(v: Version) {
    setTitle(v.title);
    setExcerpt(v.excerpt);
    setContent(v.content);
    setSeoTitle(v.seo_title);
    setSeoDesc(v.seo_description);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setKicker("");
    setImageUrl("");
    setExcerpt("");
    setContent("");
    setSeoTitle("");
    setSeoDesc("");
    setVersions([]);
  }

  function loadPost(p: Post) {
    setEditingId(p.id);
    setTitle(p.title);
    setKicker(p.kicker ?? "");
    setCategory(p.category);
    setImageUrl(p.image_url ?? "");
    setExcerpt(p.excerpt);
    setContent(p.content);
    setSeoTitle(p.seo_title ?? "");
    setSeoDesc(p.seo_description ?? "");
    setVersions([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const payload = {
        title,
        kicker: kicker || null,
        category,
        image_url: imageUrl || null,
        excerpt: excerpt || content.slice(0, 180),
        content,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };
      if (editingId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editingId);
        if (error) throw error;
        return editingId;
      }
      const { data, error } = await supabase
        .from("posts")
        .insert({ ...payload, slug: slugify(title) })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (_id, status) => {
      toast.success(status === "published" ? "নিউজ লাইভ হয়েছে" : "ড্রাফট সংরক্ষিত হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      if (status === "published") resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["published-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const canRewrite = title.trim().length > 0 && content.trim().length > 20;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-2">
          <h1 className="font-display text-[22px] font-bold text-primary">নিউজ লিখুন</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{email}</span>
            <button
              className="hover:text-primary"
              onClick={async () => {
                await supabase.auth.signOut();
                void navigate({ to: "/" });
              }}
            >
              লগআউট
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-8">
            <div className="space-y-2">
              <Label htmlFor="title">টাইটেল</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="নিউজের শিরোনাম"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="kicker">কিকার (ঐচ্ছিক)</Label>
                <Input id="kicker" value={kicker} onChange={(e) => setKicker(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ক্যাটাগরি</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">ছবির লিংক (ঐচ্ছিক)</Label>
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">মূল কনটেন্ট</Label>
              <Textarea
                id="content"
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="এখানে নিউজের মূল লেখা লিখুন..."
              />
            </div>

            <div className="flex flex-wrap items-end gap-3 border border-border p-3">
              <div className="space-y-2">
                <Label>রিরাইট ধরন</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">সংবাদ</SelectItem>
                    <SelectItem value="analysis">বিশ্লেষণ</SelectItem>
                    <SelectItem value="short">সংক্ষিপ্ত</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ভার্সন সংখ্যা</Label>
                <Select
                  value={String(variantCount)}
                  onValueChange={(v) => setVariantCount(Number(v))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">১টি</SelectItem>
                    <SelectItem value="2">২টি</SelectItem>
                    <SelectItem value="3">৩টি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => rewriteMutation.mutate()}
                disabled={!canRewrite || rewriteMutation.isPending}
              >
                {rewriteMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                রিরাইট করুন
              </Button>
            </div>

            {versions.length > 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {versions.map((v, i) => (
                  <div key={i} className="border border-border p-3">
                    <p className="font-display text-sm font-bold text-primary">{v.label}</p>
                    <p className="mt-1 font-display text-[15px] font-bold">{v.title}</p>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{v.excerpt}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => applyVersion(v)}
                    >
                      এই ভার্সনটি ব্যবহার করুন
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="excerpt">সারসংক্ষেপ</Label>
              <Textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO টাইটেল</Label>
                <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDesc">SEO ডেসক্রিপশন</Label>
                <Input id="seoDesc" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => saveMutation.mutate("published")}
                disabled={!title || !content || saveMutation.isPending}
              >
                পাবলিশ
              </Button>
              <Button
                variant="secondary"
                onClick={() => saveMutation.mutate("draft")}
                disabled={!title || saveMutation.isPending}
              >
                ড্রাফট সেভ
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>
                  নতুন নিউজ
                </Button>
              )}
            </div>
          </section>

          <aside className="lg:col-span-4">
            <h2 className="mb-3 border-b-2 border-primary pb-1 font-display text-[18px] font-bold text-primary">
              সব নিউজ
            </h2>
            <div className="space-y-3">
              {postsQuery.data?.map((p) => (
                <div key={p.id} className="border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="text-left font-display text-[15px] font-bold hover:text-primary"
                      onClick={() => loadPost(p)}
                    >
                      {p.title}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="shrink-0 text-muted-foreground hover:text-primary"
                      aria-label="মুছুন"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.status === "published" ? "প্রকাশিত" : "ড্রাফট"} ·{" "}
                    {banglaDateTime(p.published_at ?? p.created_at)}
                  </p>
                  {p.status === "published" && p.slug && (
                    <Link
                      to="/post/$slug"
                      params={{ slug: p.slug }}
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      সাইটে দেখুন →
                    </Link>
                  )}
                </div>
              ))}
              {postsQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">এখনো কোনো নিউজ নেই।</p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
