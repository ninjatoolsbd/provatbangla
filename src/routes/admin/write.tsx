import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Eye, Loader2, Sparkles, Upload, X, Wand2, Image as ImageIcon, Facebook, Twitter, Instagram, Copy, CheckCircle2, Download } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/use-auth";
import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, slugify } from "@/lib/posts";
import { RichTextEditor } from "@/components/rich-text-editor";
import { fetchSettings } from "@/lib/cms";
import logoAsset from "@/lib/logo";
import { generateAndDownloadPhotocard } from "@/lib/photocard-render";

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
  
  const [category, setCategory] = useState("bangladesh");
  const [imageUrl, setImageUrl] = useState("");
  
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [autoGenAttempted, setAutoGenAttempted] = useState(false);
  const [authorId, setAuthorId] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [shareInfo, setShareInfo] = useState<{ url: string; title: string; image: string | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const siteSettings = useQuery({ queryKey: ["cms", "settings"], queryFn: fetchSettings });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authorsQuery = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data || []) as { id: string; display_name: string | null; email: string | null }[];
    },
  });


  const postsQuery = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAllPostsForAdmin });

  useEffect(() => {
    if (!id || !postsQuery.data) return;
    const p = postsQuery.data.find((x) => x.id === id);
    if (!p || editingId === p.id) return;
    
    // Only set these values if the user hasn't started editing
    // or if we are switching to a completely different news item
    setEditingId(p.id);
    setTitle(p.title);
    
    setCategory(p.category);
    setImageUrl(p.image_url ?? "");
    
    setContent(p.content);
    setSeoTitle(p.seo_title ?? "");
    setSeoDesc(p.seo_description ?? "");
    setAuthorId(p.author_id || "");
    setAuthorName(p.author_name || "");
  }, [id, postsQuery.data]); // Removed editingId from deps to prevent re-runs on same ID

  // Default author to current user when starting a brand-new post
  useEffect(() => {
    if (editingId || authorId) return;
    const currentUserId = auth.userId;
    if (currentUserId) {
      setAuthorId(currentUserId);
      setAuthorName(String(auth.displayName || (auth.email ? auth.email.split("@")[0] : "অজানা")));
    }
  }, [editingId, auth.userId, auth.displayName, auth.email]);

  function applyVersion(v: Version) {
    setTitle(v.title);
    
    setContent(v.content);
    setSeoTitle(v.seo_title);
    setSeoDesc(v.seo_description);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    
    setImageUrl("");
    
    setContent("");
    setSeoTitle("");
    setSeoDesc("");
    const currentUserId = auth.userId;
    setAuthorId(currentUserId || "");
    setAuthorName(String(auth.displayName || (auth.email ? auth.email.split("@")[0] : "অজানা")));
  }

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const selectedAuthorId = authorId || auth.userId || null;
      const selectedAuthorName = String(authorName || auth.displayName || (auth.email ? auth.email.split("@")[0] : "অজানা"));
      const payload = {
        title,
        
        category,
        image_url: imageUrl || null,
        excerpt: stripHtml(content).slice(0, 180),
        content,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        author_id: selectedAuthorId,
        author_name: selectedAuthorName,
      };
      if (editingId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editingId);
        if (error) throw error;
        const { data: row } = await supabase.from("posts").select("slug").eq("id", editingId).single();
        return { id: editingId, slug: (row?.slug as string) || slugify(title), title };
      }
      const { data, error } = await supabase
        .from("posts")
        .insert({
          ...payload,
          slug: slugify(title),
        })
        .select("id, slug")
        .single();
      if (error) throw error;
      return { id: data.id as string, slug: (data.slug as string) || slugify(title), title };
    },
    onSuccess: (res, status) => {
      toast.success(status === "published" ? "নিউজ লাইভ হয়েছে" : "ড্রাফট সংরক্ষিত হয়েছে");
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      
      if (status === "published") {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setShareInfo({ url: `${origin}/post/${res.slug}`, title: res.title, image: imageUrl || null });
        resetForm();
      } else {
        // If it was a draft save and we weren't editing, set the ID so we don't insert a duplicate next time
        if (!editingId) {
          setEditingId(res.id);
        }
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = String(reader.result);
          resolve(res.slice(res.indexOf(",") + 1));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { uploadMedia } = await import("@/lib/media.functions");
      const res = await uploadMedia({
        data: {
          name: file.name,
          contentType: file.type || "image/jpeg",
          dataBase64: base64,
        },
      });

      setImageUrl(res.url);
      toast.success("ছবি আপলোড সফল হয়েছে");
    } catch (error: any) {
      toast.error("আপলোড ব্যর্থ হয়েছে: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAutoMetadata = async () => {
    if (!title || content.length < 100) return;
    
    try {
      setIsGeneratingMetadata(true);
      const { generateMetadata } = await import("@/lib/news-metadata.functions");
      const result = await generateMetadata({
        data: { title, content }
      });
      
      // Only fill if current field is empty (to avoid overwriting user edits)
      
      if (!seoTitle) setSeoTitle(result.seo_title);
      if (!seoDesc) setSeoDesc(result.seo_description);
      
      // Auto select category if it's still default or empty
      if (category === "bangladesh" || !category) {
        setCategory(result.category);
      }
      
      toast.success("মেটাডেটা ও ক্যাটাগরি অটো-জেনারেট হয়েছে");
    } catch (error: any) {
      console.error("Metadata generation failed:", error);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  // Debounced effect for auto-generation when title and content are typed
  useEffect(() => {
    if (editingId || autoGenAttempted || !title || content.length < 300) return;
    
    const timer = setTimeout(() => {
      handleAutoMetadata();
      setAutoGenAttempted(true); // Only auto-attempt once per new post session
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [title, content, editingId, autoGenAttempted]);

  const stripHtml = (html: string) => {
    return html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  const wordCount = content.trim() ? stripHtml(content).trim().split(/\s+/).length : 0;
  const charCount = stripHtml(content).length;

  const handleRewrite = async () => {
    if (!content || content.length < 50) {
      toast.error("নিউজ রিরাইট করতে কমপক্ষে ৫০টি অক্ষর প্রয়োজন");
      return;
    }

    try {
      setIsRewriting(true);
      const { rewriteNews } = await import("@/lib/news.functions");
      const result = await rewriteNews({
        data: { 
          title, 
          content: stripHtml(content),
          tone: "news",
          variants: 1
        }
      });
      
      if (result?.versions?.[0]?.content) {
        setContent(result.versions[0].content);
        toast.success("নিউজ সফলভাবে রিরাইট করা হয়েছে");
      }
    } catch (error: any) {
      console.error("Rewrite failed:", error);
      toast.error("রিরাইট করতে সমস্যা হয়েছে");
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="pb-10">
      {/* Top bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="min-w-0">
          <h1 className="font-display text-[20px] font-bold text-primary">
            {editingId ? "নিউজ এডিট করুন" : "নতুন নিউজ লিখুন"}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {editingId ? `স্লাগ: ${slugify(title) || "—"}` : "খসড়া তৈরি করুন, তারপর প্রকাশ করুন"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editingId && (
            <Button asChild variant="outline" size="sm">
              <a href={`/post/${slugify(title)}?preview=true`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 size-4" />
                প্রিভিউ
              </a>
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveMutation.mutate("draft")}
            disabled={!title || saveMutation.isPending}
          >
            ড্রাফট সেভ
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate("published")}
            disabled={!title || !content || saveMutation.isPending}
          >
            {saveMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            পাবলিশ
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main editor column */}
        <div className="space-y-5">
          <div className="border border-border bg-card p-4 shadow-sm">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="এখানে শিরোনাম লিখুন..."
              className="h-auto border-0 px-0 font-display text-[24px] font-bold shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">মূল কনটেন্ট</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-primary hover:text-primary"
                  onClick={handleRewrite}
                  disabled={isRewriting || content.length < 50}
                  title="AI দিয়ে রিরাইট করুন"
                >
                  {isRewriting ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {wordCount} শব্দ · {charCount} অক্ষর
              </span>
            </div>
            <RichTextEditor
              content={content}
              onChange={setContent}
            />
          </div>


          <div className="border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-secondary/30 px-4 py-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              SEO সেটিংস
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoTitle">SEO টাইটেল</Label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 text-primary hover:text-primary"
                    onClick={handleAutoMetadata}
                    disabled={isGeneratingMetadata || !title || content.length < 100}
                    title="AI দিয়ে অটো-জেনারেট করুন"
                  >
                    {isGeneratingMetadata ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                  </Button>
                </div>
                <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">{(seoTitle || title).length}/60 অক্ষর</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoDesc">SEO ডেসক্রিপশন</Label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 text-primary hover:text-primary"
                    onClick={handleAutoMetadata}
                    disabled={isGeneratingMetadata || !title || content.length < 100}
                    title="AI দিয়ে অটো-জেনারেট করুন"
                  >
                    {isGeneratingMetadata ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                  </Button>
                </div>
                <Textarea id="seoDesc" rows={2} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">{(seoDesc || stripHtml(content).slice(0, 160)).length}/160 অক্ষর</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-[84px] lg:self-start">
          <div className="border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-secondary/30 px-4 py-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              প্রকাশ
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">স্ট্যাটাস</span>
                <span className="font-bold">{editingId ? "সংরক্ষিত" : "নতুন খসড়া"}</span>
              </div>
              <div className="space-y-2">
                <span className="text-muted-foreground">লেখক</span>
                <Select
                  value={authorId}
                  onValueChange={(value) => {
                    const selected = authorsQuery.data?.find((a) => a.id === value);
                    setAuthorId(value);
                    setAuthorName(selected?.display_name || selected?.email || "অজানা");
                  }}
                  disabled={authorsQuery.isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="লেখক নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {authorsQuery.data?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.display_name || a.email || "অজানা"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  onClick={() => saveMutation.mutate("published")}
                  disabled={!title || !content || saveMutation.isPending}
                >
                  পাবলিশ
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={resetForm}>
                    নতুন
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
              <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">ক্যাটাগরি</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-primary hover:text-primary"
                onClick={handleAutoMetadata}
                disabled={isGeneratingMetadata || !title || content.length < 100}
                title="AI দিয়ে ক্যাটাগরি ডিটেক্ট করুন"
              >
                {isGeneratingMetadata ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
              </Button>
            </div>
            <div className="p-4">
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
          </div>

          <div className="border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-secondary/30 px-4 py-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              ফিচার ইমেজ
            </div>
            <div className="space-y-2 p-4">
              {imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden border border-border">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 rounded-full bg-primary p-1 text-primary-foreground shadow-lg"
                    aria-label="ছবি মুছুন"
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
                    <Loader2 className="size-7 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="mb-2 size-7 text-primary" />
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
              <Input
                id="image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="অথবা ছবির ইউআরএল..."
                className="h-8 text-xs"
              />
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={!!shareInfo} onOpenChange={(o) => { if (!o) { setShareInfo(null); setCopied(false); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <CheckCircle2 className="size-5 text-primary" />
              নিউজ সফলভাবে প্রকাশিত হয়েছে
            </DialogTitle>
            <DialogDescription>সোশ্যাল মিডিয়ায় শেয়ার করুন</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 py-2">
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareInfo?.url ?? "")}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              aria-label="ফেসবুকে শেয়ার"
              className="grid size-11 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Facebook className="size-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareInfo?.url ?? "")}&text=${encodeURIComponent(shareInfo?.title ?? "")}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              aria-label="টুইটারে শেয়ার"
              className="grid size-11 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Twitter className="size-5" />
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareInfo?.url ?? "");
                  toast.success("লিঙ্ক কপি হয়েছে — ইনস্টাগ্রামে পেস্ট করুন");
                } catch {
                  toast.error("কপি করা যায়নি");
                }
                window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
              }}
              aria-label="ইনস্টাগ্রামে শেয়ার"
              className="grid size-11 place-items-center rounded-full bg-secondary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Instagram className="size-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Input readOnly value={shareInfo?.url ?? ""} className="h-9 text-xs" />
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareInfo?.url ?? "");
                  setCopied(true);
                  toast.success("ইউআরএল কপি হয়েছে");
                } catch {
                  toast.error("কপি করা যায়নি");
                }
              }}
            >
              {copied ? <CheckCircle2 className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
              {copied ? "কপি হয়েছে" : "কপি"}
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={cardBusy}
            onClick={async () => {
              if (!shareInfo) return;
              setCardBusy(true);
              try {
                await generateAndDownloadPhotocard({
                  title: shareInfo.title,
                  imageUrl: shareInfo.image,
                  watermarkLogoUrl: siteSettings.data?.["watermark_logo_url"] || logoAsset.url,
                });
                toast.success("ফটোকার্ড ডাউনলোড হয়েছে");
              } catch {
                toast.error("ফটোকার্ড তৈরি করা যায়নি");
              } finally {
                setCardBusy(false);
              }
            }}
          >
            {cardBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
            ফটোকার্ড জেনারেট করুন
          </Button>
        </DialogContent>
      </Dialog>
    </div>

  );
}
