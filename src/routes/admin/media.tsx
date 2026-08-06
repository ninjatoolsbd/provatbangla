import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, insertRow, listRows, type Row, db } from "@/lib/cms";
import { uploadMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "মিডিয়া লাইব্রেরি — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "ছবি আপলোড ও মিডিয়া ফাইল ব্যবস্থাপনা।" },
      { property: "og:title", content: "মিডিয়া লাইব্রেরি — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "ছবি আপলোড ও লাইব্রেরি।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MediaPage,
});

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
    reader.readAsDataURL(file);
  });
}

function MediaPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = useQuery({
    queryKey: ["cms", "media-merged"],
    queryFn: async () => {
      // 1. Get explicit media library uploads
      const mediaRes = await listRows("media", { column: "created_at", ascending: false });
      
      // 2. Get images already used in posts (WP imports, etc)
      const { data: postsData } = await db
        .from("posts")
        .select("id, title, image_url, created_at")
        .not("image_url", "is", null)
        .neq("image_url", "")
        .order("created_at", { ascending: false });

      // Transform post images to match media structure
      const postImages = (postsData ?? [])
        .filter((p: any) => p.image_url && !p.image_url.includes("picsum.photos")) // Ignore placeholders
        .map((p: any) => ({
          id: `post-${p.id}`,
          url: p.image_url,
          file_name: p.title,
          is_post_image: true,
          created_at: p.created_at
        }));

      // Merge and remove duplicates by URL
      const merged = [...mediaRes, ...postImages];
      const unique = Array.from(new Map(merged.map(item => [item.url, item])).values());
      
      // Sort by date
      return unique.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const remove = useMutation({
    mutationFn: async (ids: string[]) => {
      // Filter out post-origin IDs as they aren't in the 'media' table
      const mediaIds = ids.filter(id => !id.startsWith("post-"));
      
      if (mediaIds.length > 0) {
        for (const id of mediaIds) {
          await deleteRow("media", id);
        }
      }

      // Optional: if user expects post-origin images to be "deleted" from posts,
      // we would need to null out their image_url, but standard WP behavior
      // is that the media library view is read-only for post-attached images
      // unless they are explicitly in the media table.
      // For now, we just skip them to avoid the UUID error.
    },
    onSuccess: () => {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      setSelected(new Set());
      void qc.invalidateQueries({ queryKey: ["cms", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    if (confirm(`${selected.size} টি ফাইল মুছে ফেলবেন?`)) {
      remove.mutate(Array.from(selected));
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const dataBase64 = await toBase64(file);
        const res = await uploadMedia({
          data: { name: file.name, contentType: file.type || "application/octet-stream", dataBase64 },
        });
        await insertRow("media", {
          url: res.url,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: res.size,
        });
      }
      toast.success("আপলোড সম্পন্ন");
      void qc.invalidateQueries({ queryKey: ["cms", "media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "আপলোড ব্যর্থ");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="font-display text-[22px] font-bold text-primary">মিডিয়া লাইব্রেরি</h1>
          <p className="text-sm text-muted-foreground">মোট {rows.length} ফাইল · স্টোরেজ: Cloudflare R2</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 text-sm font-semibold transition-colors hover:bg-destructive/90"
            >
              <Trash2 className="size-4" /> {selected.size} টি ডিলিট করুন
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Upload className="size-4" /> {busy ? "আপলোড হচ্ছে…" : "ছবি আপলোড"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {rows.map((m: Row) => {
          const id = String(m["id"]);
          const isSelected = selected.has(id);
          return (
            <figure 
              key={id} 
              className={`relative border transition-all cursor-pointer group ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border bg-background hover:border-primary/40'}`}
              onClick={() => toggleSelect(id)}
            >
              <div className="aspect-square w-full overflow-hidden bg-muted">
                <img
                  src={String(m["url"])}
                  alt={String(m["file_name"] ?? "মিডিয়া ফাইল")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              {isSelected && (
                <div className="absolute top-2 left-2 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm animate-in zoom-in-50">
                  <span className="text-[10px] font-bold">✓</span>
                </div>
              )}

              <figcaption className="flex items-center justify-between gap-2 px-1.5 py-1 bg-background/95 backdrop-blur-sm border-t border-border">
                <span className="truncate text-[10px] text-muted-foreground font-medium">
                  {String(m["file_name"] ?? "")}
                </span>
                <span className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(String(m["url"]));
                      toast.success("লিংক কপি হয়েছে");
                    }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="লিংক কপি"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("মুছে ফেলবেন?")) remove.mutate([id]);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="ডিলিট"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </figcaption>
            </figure>
          );
        })}
        {rows.length === 0 && (
          <p className="border border-border bg-background px-4 py-6 text-sm text-muted-foreground sm:col-span-3 xl:col-span-5">
            এখনো কোনো ফাইল নেই।
          </p>
        )}
      </div>
    </div>
  );
}
