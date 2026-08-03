import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, insertRow, listRows, type Row } from "@/lib/cms";
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

  const list = useQuery({
    queryKey: ["cms", "media"],
    queryFn: () => listRows("media", { column: "created_at", ascending: false }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("media", id),
    onSuccess: () => {
      toast.success("তালিকা থেকে মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "media"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold text-primary">মিডিয়া লাইব্রেরি</h1>
          <p className="text-sm text-muted-foreground">মোট {rows.length} ফাইল · স্টোরেজ: Cloudflare R2</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          <Upload className="size-4" /> {busy ? "আপলোড হচ্ছে…" : "ছবি আপলোড"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {rows.map((m: Row) => (
          <figure key={String(m["id"])} className="border border-border bg-background">
            <img
              src={String(m["url"])}
              alt={String(m["file_name"] ?? "মিডিয়া ফাইল")}
              loading="lazy"
              className="h-32 w-full object-cover"
            />
            <figcaption className="flex items-center justify-between gap-2 px-2 py-1.5">
              <span className="truncate text-[11px] text-muted-foreground">
                {String(m["file_name"] ?? "")}
              </span>
              <span className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(String(m["url"]));
                    toast.success("লিংক কপি হয়েছে");
                  }}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="লিংক কপি"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("মুছে ফেলবেন?")) remove.mutate(String(m["id"]));
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="ডিলিট"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </figcaption>
          </figure>
        ))}
        {rows.length === 0 && (
          <p className="border border-border bg-background px-4 py-6 text-sm text-muted-foreground sm:col-span-3 xl:col-span-5">
            এখনো কোনো ফাইল নেই।
          </p>
        )}
      </div>
    </div>
  );
}
