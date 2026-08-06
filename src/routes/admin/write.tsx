import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

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
import { supabase } from "@/integrations/my-supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateNews, rewriteNews } from "@/lib/news.functions";
import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, slugify } from "@/lib/posts";

export const Route = createFileRoute("/admin/write")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search['id'] === "string" ? (search['id'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "নিউজ লিখুন — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "AI রিরাইট ও জেনারেশন সহ নিউজ লেখা ও প্রকাশের এডিটর।" },
      { property: "og:title", content: "নিউজ লিখুন — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "AI রিরাইট সহ নিউজ লেখা ও প্রকাশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WritePage,
});

type Version = {
  label: string;
  title: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
};

function WritePage() {
  const { id } = Route.useSearch();
  const queryClient = useQueryClient();
  const auth = useAuth();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kicker, setKicker] = useState("");
  const [category, setCategory] = useState("bangladesh");
  const [imageUrl, setImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postsQuery = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });

  useEffect(() => {
    if (!id || !postsQuery.data) return;
    const p = postsQuery.data.find((x) => x.id === id);
    if (!p || editingId === p.id) return;
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
  }, [id, postsQuery.data, editingId]);

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

  const generateMutation = useMutation({
    mutationFn: async () =>
      generate({
        data: {
          prompt: genPrompt,
          details: genDetails,
          referenceUrl: genReferenceUrl,
          category: genCategory,
          tone: genTone,
          withImage: genImage,
          autoPublish: genAutoPublish,
          provider: genProvider as "auto" | "blackbox",
        },
      }),
    onSuccess: (res) => {
      setEditingId(null);
      setTitle(res.article.title);
      setKicker(res.article.kicker ?? "");
      setCategory(genCategory);
      setImageUrl(res.imageUrl ?? "");
      setExcerpt(res.article.excerpt);
      setContent(res.article.content);
      setSeoTitle(res.article.seo_title ?? "");
      setSeoDesc(res.article.seo_description ?? "");
      setVersions([]);
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      toast.success(
        res.postId
          ? `নিউজ তৈরি ও লাইভ হয়েছে (${res.provider})`
          : `নিউজ তৈরি হয়েছে (${res.provider}) — নিচে এডিট করে পাবলিশ করুন`,
      );
      if (!res.imageUrl && genImage) {
        toast.error("ছবি তৈরি বা সংরক্ষণ করা যায়নি। নিউজ তৈরি হয়েছে, তবে ছবি যোগ হয়নি।");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        .insert({
          ...payload,
          slug: slugify(title),
          author_id: auth.userId,
          ...(auth.email ? { author_name: auth.email.split("@")[0] } : {}),
        })
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from("news-media")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("news-media")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("ছবি আপলোড সফল হয়েছে");
    } catch (error: any) {
      toast.error("আপলোড ব্যর্থ হয়েছে: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const canRewrite = title.trim().length > 0 && content.trim().length > 20;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-bold text-primary">নিউজ লিখুন</h1>
      </div>



      <section className="space-y-4">
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
            <Label>ফিচার ইমেজ</Label>
            <div className="flex flex-col gap-2">
              {imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden border-2 border-primary/30">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-primary/30 bg-secondary/20 transition-colors hover:bg-secondary/40"
                >
                  {isUploading ? (
                    <Loader2 className="size-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="mb-2 size-8 text-primary" />
                      <span className="text-sm font-bold text-primary">ছবি আপলোড করুন</span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="অথবা সরাসরি ছবির ইউআরএল দিন..."
                  className="h-8 text-xs"
                />
              </div>
            </div>
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
    </div>
  );
}
