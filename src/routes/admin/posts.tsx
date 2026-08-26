import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, CheckSquare, Copy, Eye, FileCheck, FolderEdit, ImageOff, ImagePlus, Loader2, Search, Sparkles, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/lib/news-data";
import { fetchAllPostsForAdmin, banglaDateTime } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { cn } from "@/lib/utils";


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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showMissingImages, setShowMissingImages] = useState(false);
  
  const { role, userId } = useAuth();
  const postsQuery = useQuery({ 
    queryKey: ["admin-posts", role, userId], 
    queryFn: async () => {
      const data = await fetchAllPostsForAdmin();
      if (role === "editor" && userId) {
        return data.filter(p => (p as any).author_id === userId);
      }
      return data;
    }
  });

  const allPosts = postsQuery.data ?? [];

  // Group by title to find duplicates
  const duplicateTitles = new Set<string>();
  if (showDuplicates) {
    const titleCounts = new Map<string, number>();
    allPosts.forEach(p => {
      const normalized = p.title.trim().toLowerCase();
      titleCounts.set(normalized, (titleCounts.get(normalized) || 0) + 1);
    });
    titleCounts.forEach((count, title) => {
      if (count > 1) duplicateTitles.add(title);
    });
  }

  const rows = allPosts.filter((p) => {
    if (showDuplicates) {
      return duplicateTitles.has(p.title.trim().toLowerCase());
    }

    if (showMissingImages) {
      return !p.image_url || p.image_url.trim() === "";
    }

    const matchesQuery = p.title.toLowerCase().includes(q.trim().toLowerCase());
    const matchesStatus = status === "all" || p.status === status;
    const matchesCategory = cat === "all" || p.category === cat;
    
    let matchesDate = true;
    if (date) {
      const pDate = new Date(p.created_at);
      matchesDate = 
        pDate.getFullYear() === date.getFullYear() &&
        pDate.getMonth() === date.getMonth() &&
        pDate.getDate() === date.getDate();
    }

    return matchesQuery && matchesStatus && matchesCategory && matchesDate;
  });


  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("posts").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selectedIds.length} টি নিউজ মুছে ফেলা হয়েছে`);
      setSelectedIds([]);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkUpdateCategory = useMutation({
    mutationFn: async ({ ids, category }: { ids: string[]; category: string }) => {
      const { error } = await supabase.from("posts").update({ category }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const catName = categories.find((c) => c.slug === variables.category)?.name || variables.category;
      toast.success(`${selectedIds.length} টি নিউজের ক্যাটাগরি '${catName}' এ পরিবর্তন করা হয়েছে`);
      setSelectedIds([]);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkPublish = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selectedIds.length} টি নিউজ প্রকাশিত করা হয়েছে`);
      setSelectedIds([]);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSelection = (id: string) => {

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">সব নিউজ</h1>
          <p className="text-sm text-muted-foreground">আপনার সাইটের সব নিউজ এখান থেকে ম্যানেজ করুন।</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={showDuplicates ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowDuplicates(!showDuplicates);
              setShowMissingImages(false);
            }}
            className={cn(showDuplicates && "bg-amber-600 hover:bg-amber-700")}
          >
            <Copy className="mr-2 size-4" />
            {showDuplicates ? "সব নিউজ দেখুন" : "ডুপ্লিকেট নিউজ খুঁজুন"}
          </Button>

          <Button
            variant={showMissingImages ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowMissingImages(!showMissingImages);
              setShowDuplicates(false);
            }}
            className={cn(showMissingImages && "bg-red-600 hover:bg-red-700")}
          >
            <ImageOff className="mr-2 size-4" />
            {showMissingImages ? "সব নিউজ দেখুন" : "ছবি নেই এমন নিউজ"}
          </Button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-primary/5">
                    <FolderEdit className="mr-2 size-4" />
                    ক্যাটাগরি সেট করুন ({selectedIds.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
                    বাল্ক ক্যাটাগরি পরিবর্তন
                  </p>
                  <div className="grid gap-1">
                    {categories.map((c) => (
                      <Button
                        key={c.slug}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-xs h-8"
                        disabled={bulkUpdateCategory.isPending}
                        onClick={() => {
                          bulkUpdateCategory.mutate({ ids: selectedIds, category: c.slug });
                        }}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                onClick={() => {
                  if (confirm(`${selectedIds.length} টি নিউজ প্রকাশিত করতে চান?`)) {
                    bulkPublish.mutate(selectedIds);
                  }
                }}
                disabled={bulkPublish.isPending}
              >
                <FileCheck className="mr-2 size-4" />
                নির্বাচিতগুলো প্রকাশ করুন ({selectedIds.length})
              </Button>


              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`${selectedIds.length} টি নিউজ মুছে ফেলতে চান?`)) {
                    bulkDelete.mutate(selectedIds);
                  }
                }}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="mr-2 size-4" />
                নির্বাচিতগুলো মুছুন ({selectedIds.length})
              </Button>
            </div>
          )}
          <Button asChild size="sm">
            <Link to="/admin/write" search={{ id: undefined }}>নিউজ লিখুন</Link>
          </Button>

        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="টাইটেল খুঁজুন..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="সব স্ট্যাটাস" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              <SelectItem value="published">প্রকাশিত</SelectItem>
              <SelectItem value="draft">ড্রাফট</SelectItem>
            </SelectContent>
          </Select>

          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger>
              <SelectValue placeholder="সব ক্যাটাগরি" />
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: bn }) : "তারিখ নির্বাচন করুন"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
              {date && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setDate(undefined)}
                  >
                    রিসেট করুন
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-4 bg-muted/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <button onClick={toggleAll} className="flex items-center shrink-0 w-6">
            {selectedIds.length === rows.length && rows.length > 0 ? (
              <CheckSquare className="size-4 text-primary" />
            ) : (
              <Square className="size-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">টাইটেল</div>
          <div className="hidden w-24 text-center sm:block shrink-0">স্ট্যাটাস</div>
          <div className="hidden w-40 text-center sm:block shrink-0 text-nowrap">তারিখ</div>
          <div className="w-56 text-right shrink-0">অ্যাকশন</div>
        </div>

        <div className="divide-y divide-border">
          {rows.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30">
              <button onClick={() => toggleSelection(p.id)} className="shrink-0 w-6">
                {selectedIds.includes(p.id) ? (
                  <CheckSquare className="size-4 text-primary" />
                ) : (
                  <Square className="size-4" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className="truncate font-display text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {categories.find((c) => c.slug === p.category)?.name ?? p.category}
                </p>
              </div>

              <div className="hidden w-24 text-center sm:block shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    p.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}
                >
                  {p.status === "published" ? "প্রকাশিত" : "ড্রাফট"}
                </span>
              </div>

              <div className="hidden w-40 text-center text-[11px] text-muted-foreground sm:block shrink-0 text-nowrap">
                {banglaDateTime(p.published_at ?? p.created_at)}
              </div>

              <div className="flex w-56 items-center justify-end gap-3 shrink-0">
                <a
                  href={p.status === "published" ? `/post/${p.slug}` : `/post/${p.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary"
                  title="ভিউ নিউজ"
                >
                  <Eye className="size-4" />
                </a>

                <CategorySuggestion postId={p.id} title={p.title} content={p.content} currentCategory={p.category} />

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="text-muted-foreground transition-colors hover:text-primary"
                      title="ক্যাটাগরি পরিবর্তন"
                    >
                      <FolderEdit className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">
                      ক্যাটাগরি সেট করুন
                    </p>
                    <div className="grid gap-1">
                      {categories.map((c) => (
                        <Button
                          key={c.slug}
                          variant={p.category === c.slug ? "default" : "ghost"}
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("posts")
                              .update({ category: c.slug })
                              .eq("id", p.id);
                            if (error) {
                              toast.error(error.message);
                            } else {
                              toast.success("ক্যাটাগরি আপডেট করা হয়েছে");
                              void qc.invalidateQueries({ queryKey: ["admin-posts"] });
                            }
                          }}
                        >
                          {c.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Link
                  to="/admin/write"
                  search={{ id: p.id }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  এডিট
                </Link>
                <button
                  onClick={() => {
                    if (confirm("আপনি কি নিশ্চিতভাবে এই নিউজটি মুছতে চান?")) {
                      del.mutate(p.id);
                    }
                  }}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {showDuplicates 
                  ? "কোনো ডুপ্লিকেট নিউজ পাওয়া যায়নি" 
                  : showMissingImages 
                    ? "সব নিউজে ছবি আছে" 
                    : "কোনো নিউজ পাওয়া যায়নি"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {showDuplicates 
                  ? "আপনার সাইটে বর্তমানে কোনো ডুপ্লিকেট টাইটেল নেই।" 
                  : showMissingImages 
                    ? "আপনার সাইটে এমন কোনো নিউজ নেই যাতে ছবি আপলোড করা হয়নি।" 
                    : "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategorySuggestion({ postId, title, content, currentCategory }: { postId: string, title: string, content: string, currentCategory: string }) {
  const qc = useQueryClient();
  const [suggestion, setSuggestion] = useState<{ slug: string, name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestion = async () => {
    try {
      setIsLoading(true);
      const { suggestCategory } = await import("@/lib/news-suggest.functions");
      const res = await suggestCategory({ data: { title, content } });
      setSuggestion({ slug: res.suggestedSlug, name: res.suggestedName });
    } catch (error) {
      console.error(error);
      toast.error("সাজেশন লোড করা যায়নি");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = async () => {
    if (!suggestion) return;
    try {
      const { error } = await supabase.from("posts").update({ category: suggestion.slug }).eq("id", postId);
      if (error) throw error;
      toast.success(`ক্যাটাগরি '${suggestion.name}' হিসেবে সেট করা হয়েছে`);
      void qc.invalidateQueries({ queryKey: ["admin-posts"] });
      setSuggestion(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={() => !suggestion && getSuggestion()}
          className={cn(
            "text-muted-foreground transition-colors hover:text-amber-500",
            suggestion && "text-amber-500"
          )}
          title="ক্যাটাগরি সাজেশন"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <h4 className="mb-2 text-xs font-bold text-foreground">AI ক্যাটাগরি সাজেশন</h4>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : suggestion ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">সুপারিশকৃত:</p>
              <p className="text-sm font-semibold">{suggestion.name}</p>
            </div>
            
            {suggestion.slug === currentCategory ? (
              <p className="text-[11px] text-green-600">এটি বর্তমানে সঠিক ক্যাটাগরিতে আছে।</p>
            ) : (
              <Button size="sm" className="w-full h-8 text-xs" onClick={applySuggestion}>
                সাজেশন গ্রহণ করুন
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="w-full h-8 text-[10px]" onClick={getSuggestion}>
              আবার চেক করুন
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">সাজেশন লোড হচ্ছে...</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
