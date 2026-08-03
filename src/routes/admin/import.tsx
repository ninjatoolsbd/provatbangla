import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { categories } from "@/lib/news-data";
import { collectCategories, guessCategory, parseWxr, type WpPost } from "@/lib/wp-import";
import { importWpPosts } from "@/lib/wp-import.functions";

export const Route = createFileRoute("/admin/import")({
  component: ImportPage,
});

function ImportPage() {
  const runImport = useServerFn(importWpPosts);
  const queryClient = useQueryClient();

  const [posts, setPosts] = useState<WpPost[]>([]);
  const [fileName, setFileName] = useState("");
  const [map, setMap] = useState<Record<string, string>>({});
  const [mirrorImages, setMirrorImages] = useState(true);
  const [skipExisting, setSkipExisting] = useState(true);
  const [onlyPublished, setOnlyPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(
    null,
  );

  const wpCats = collectCategories(posts);

  async function onFile(file: File) {
    setResult(null);
    try {
      const xml = await file.text();
      const parsed = parseWxr(xml);
      if (parsed.length === 0) {
        toast.error("ফাইলে কোনো পোস্ট পাওয়া যায়নি।");
        return;
      }
      setPosts(parsed);
      setFileName(file.name);
      const initial: Record<string, string> = {};
      for (const c of collectCategories(parsed)) initial[c] = guessCategory(c);
      setMap(initial);
      toast.success(`${parsed.length}টি নিউজ পাওয়া গেছে`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const selected = onlyPublished ? posts.filter((p) => p.status === "published") : posts;

  async function startImport() {
    setBusy(true);
    setResult(null);
    setProgress({ done: 0, total: selected.length });
    const totals = { imported: 0, skipped: 0, errors: [] as string[] };
    const batchSize = 10;

    try {
      for (let i = 0; i < selected.length; i += batchSize) {
        const chunk = selected.slice(i, i + batchSize).map((p) => ({
          title: p.title,
          slug: p.slug,
          content: p.contentHtml,
          excerpt: p.excerpt,
          category: map[p.categoryNames[0] ?? ""] ?? guessCategory(p.categoryNames[0] ?? ""),
          imageUrl: p.imageUrl,
          authorName: p.authorName,
          status: p.status,
          publishedAt: p.publishedAt,
        }));
        const res = await runImport({ data: { items: chunk, mirrorImages, skipExisting } });
        totals.imported += res.imported;
        totals.skipped += res.skipped;
        totals.errors.push(...res.errors);
        setProgress({ done: Math.min(i + batchSize, selected.length), total: selected.length });
      }
      setResult(totals);
      toast.success(`${totals.imported}টি নিউজ ইমপোর্ট হয়েছে`);
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["published-posts"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-bold text-primary">বাল্ক নিউজ ইমপোর্ট</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          WordPress থেকে Tools → Export দিয়ে নেওয়া XML (WXR) ফাইল আপলোড করুন — শিরোনাম, কনটেন্ট,
          ক্যাটাগরি, ছবি ও প্রকাশের তারিখসহ সব নিউজ চলে আসবে।
        </p>
      </div>

      <div className="border border-border bg-card p-5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border px-4 py-10 text-center hover:border-primary">
          <Upload className="size-6 text-primary" />
          <span className="text-sm font-medium">XML ফাইল বেছে নিন</span>
          <span className="text-xs text-muted-foreground">
            {fileName || "WordPress export (.xml)"}
          </span>
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>
      </div>

      {posts.length > 0 && (
        <>
          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-base font-bold">ক্যাটাগরি ম্যাপিং</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              WordPress ক্যাটাগরিগুলো আপনার সাইটের কোন ক্যাটাগরিতে যাবে ঠিক করুন।
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {wpCats.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-sm">{c}</span>
                  <select
                    value={map[c] ?? "onnanno"}
                    onChange={(e) => setMap((m) => ({ ...m, [c]: e.target.value }))}
                    className="border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {categories
                      .filter((x) => x.slug !== "sorboshesh")
                      .map((x) => (
                        <option key={x.slug} value={x.slug}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-base font-bold">অপশন</h2>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mirrorImages}
                  onChange={(e) => setMirrorImages(e.target.checked)}
                />
                ছবি ডাউনলোড করে নিজের স্টোরেজে (R2) রাখুন
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={(e) => setSkipExisting(e.target.checked)}
                />
                একই স্লাগের নিউজ থাকলে বাদ দিন (ডুপ্লিকেট এড়াতে)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyPublished}
                  onChange={(e) => setOnlyPublished(e.target.checked)}
                />
                শুধু প্রকাশিত (published) নিউজ আনুন
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy || selected.length === 0}
                onClick={() => void startImport()}
                className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {selected.length}টি নিউজ ইমপোর্ট করুন
              </button>
              {busy && (
                <span className="text-sm text-muted-foreground">
                  {progress.done}/{progress.total} সম্পন্ন…
                </span>
              )}
            </div>

            {result && (
              <div className="mt-4 border border-border bg-muted/40 p-3 text-sm">
                <p>
                  ইমপোর্ট: <strong>{result.imported}</strong> · বাদ পড়েছে:{" "}
                  <strong>{result.skipped}</strong> · ব্যর্থ:{" "}
                  <strong>{result.errors.length}</strong>
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-auto pl-5 text-xs text-destructive">
                    {result.errors.slice(0, 20).map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="border border-border bg-card">
            <h2 className="border-b border-border px-5 py-3 font-display text-base font-bold">
              প্রিভিউ ({selected.length})
            </h2>
            <div className="max-h-[420px] overflow-auto divide-y divide-border">
              {selected.slice(0, 100).map((p) => (
                <div key={p.wpId + p.slug} className="flex items-center gap-3 px-5 py-2.5">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="size-12 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="size-12 shrink-0 bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.categoryNames.join(", ") || "—"} · {p.status} ·{" "}
                      {p.publishedAt?.slice(0, 10) ?? "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
