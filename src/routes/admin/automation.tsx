import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Bot, ExternalLink, Eye, Play, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { publishAutoPreview, runAutoImport } from "@/lib/auto-news.functions";
import {
  deleteRow,
  fetchSettings,
  insertRow,
  listRows,
  saveSetting,
  updateRow,
  type Row,
} from "@/lib/cms";
import { uploadMedia } from "@/lib/media.functions";
import { categories } from "@/lib/news-data";
import logoAsset from "@/lib/logo";

export const Route = createFileRoute("/admin/automation")({
  head: () => ({
    meta: [
      { title: "অটো নিউজ — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "সোর্স সাইট থেকে অটো রিরাইট ও পাবলিশ ব্যবস্থাপনা।" },
      { property: "og:title", content: "অটো নিউজ — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "অটোমেটিক নিউজ কালেকশন সেটিংস।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AutomationPage,
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

function AutomationPage() {
  const qc = useQueryClient();
  const logoInput = useRef<HTMLInputElement>(null);
  const [newSource, setNewSource] = useState({ name: "", site_url: "", per_run: 5, category: "", lang: "bn" });
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<
    { title: string; status: string; message?: string }[] | null
  >(null);
  type Preview = Awaited<ReturnType<typeof runAutoImport>> extends { previews?: (infer P)[] }
    ? P
    : never;
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [publishing, setPublishing] = useState<string | null>(null);

  const sources = useQuery({
    queryKey: ["cms", "auto_sources"],
    queryFn: () => listRows("auto_sources", { column: "created_at", ascending: true }),
  });
  const items = useQuery({
    queryKey: ["cms", "auto_items"],
    queryFn: () => listRows("auto_items", { column: "created_at", ascending: false }, 40),
  });
  const settings = useQuery({ queryKey: ["cms", "settings"], queryFn: fetchSettings });

  const cfg = settings.data ?? {};

  const setSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => saveSetting(key, value),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cms", "settings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const addSource = useMutation({
    mutationFn: async () => {
      const values: Row = {
        name: newSource.name,
        site_url: newSource.site_url.replace(/\/+$/, ""),
        per_run: newSource.per_run,
        category: newSource.category || "auto",
        lang: newSource.lang,
        enabled: true,
      };
      return insertRow("auto_sources", values);
    },
    onSuccess: () => {
      setNewSource({ name: "", site_url: "", per_run: 5, category: "", lang: "bn" });
      toast.success("সোর্স যোগ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "auto_sources"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSource = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateRow("auto_sources", id, { enabled }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cms", "auto_sources"] }),
  });

  const removeSource = useMutation({
    mutationFn: (id: string) => deleteRow("auto_sources", id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["cms", "auto_sources"] }),
  });

  const run = async (sourceId?: string, dryRun = false) => {
    setRunning(true);
    setLastRun(null);
    if (dryRun) setPreviews([]);
    try {
      const res = await runAutoImport({
        // ম্যানুয়াল রান সবসময় চলবে, অটোমেশন টগল বন্ধ থাকলেও
        data: { ...(sourceId ? { sourceId } : {}), ...(dryRun ? { dryRun: true } : {}), force: true },
      });
      setLastRun(res.details);
      if (dryRun) {
        setPreviews((res.previews ?? []) as Preview[]);
        toast.success(`${res.created}টি প্রিভিউ তৈরি হয়েছে — কিছুই সেভ হয়নি`);
      } else if (res.created === 0 && res.skipped === 0 && res.failed === 0) {
        toast.warning("কোনো নতুন খবর পাওয়া যায়নি — সোর্সগুলোতে সাম্প্রতিক (৪৮ ঘণ্টার) খবর নেই বা লিংক খোলা যায়নি");
      } else {
        toast.success(`${res.created} নতুন, ${res.skipped} আগেই ছিল, ${res.failed} ব্যর্থ`);
      }
      void qc.invalidateQueries({ queryKey: ["cms", "auto_items"] });
      void qc.invalidateQueries({ queryKey: ["cms", "auto_sources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "রান ব্যর্থ");
    } finally {
      setRunning(false);
    }
  };

  const confirmPreview = async (p: Preview, status: "draft" | "published") => {
    setPublishing(p.sourceUrl);
    try {
      await publishAutoPreview({ data: { ...p, status } });
      setPreviews((list) => list.filter((x) => x.sourceUrl !== p.sourceUrl));
      toast.success(status === "published" ? "পাবলিশ হয়েছে" : "ড্রাফটে সেভ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "auto_items"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "সেভ ব্যর্থ");
    } finally {
      setPublishing(null);
    }
  };

  const updatePreview = (url: string, patch: Partial<Preview>) =>
    setPreviews((list) => list.map((p) => (p.sourceUrl === url ? { ...p, ...patch } : p)));

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataBase64 = await toBase64(file);
      const res = await uploadMedia({
        data: {
          name: file.name,
          contentType: file.type || "image/png",
          dataBase64,
          skipWatermark: true,
        },
      });
      await saveSetting("watermark_logo_url", res.url);
      toast.success("লোগো সেট হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "আপলোড ব্যর্থ");
    }
  };

  const cronUrl = `${typeof window === "undefined" ? "" : window.location.origin}/api/public/cron-sync?token=${cfg["auto_cron_token"] ?? ""}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold text-primary">অটো নিউজ কালেকশন</h1>
          <p className="text-sm text-muted-foreground">
            আপনার পছন্দের নিউজ সাইট থেকে অটোমেটিক সংবাদ সংগ্রহ করুন। শুধু সাইটের লিংক দিন, বাকি কাজ AI করবে।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={running}
            onClick={() => void run(undefined, true)}
            className="flex items-center gap-2 border border-border px-4 py-2 text-sm disabled:opacity-60"
          >
            <Eye className="size-4" /> {running ? "চলছে…" : "ড্রাই-রান (প্রিভিউ)"}
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => void run()}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            <Play className="size-4" /> {running ? "চলছে…" : "এখনই চালান"}
          </button>
        </div>
      </div>

      {/* সেটিংস */}
      <section className="grid gap-4 border border-border bg-background p-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-base font-bold">সেটিংস</h2>
          {(
            [
              ["auto_enabled", "অটোমেশন চালু"],
              ["auto_image_ai", "ছবি AI দিয়ে মডিফাই + ওয়াটারমার্ক"],
              ["auto_spin_rewriter", "Spin Rewriter ব্যবহার করুন", true],
              ["auto_credit", "নিউজের শেষে সোর্স ক্রেডিট", true],
            ] as const
          ).filter(item => !item[2]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(cfg[key] ?? "true") !== "false"}
                onChange={(e) => setSetting.mutate({ key, value: String(e.target.checked) })}
              />
              {label}
            </label>
          ))}

          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">পাবলিশ মোড</span>
            <select
              value={cfg["auto_mode"] ?? "draft"}
              onChange={(e) => setSetting.mutate({ key: "auto_mode", value: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="draft">ড্রাফট (আমি রিভিউ করে পাবলিশ করব)</option>
              <option value="publish">সরাসরি পাবলিশ</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-base font-bold">ওয়াটারমার্ক লোগো</h2>
          <div className="flex items-center gap-3">
            {(cfg["watermark_logo_url"] || logoAsset.url) ? (
              <img
                src={cfg["watermark_logo_url"] || logoAsset.url}
                alt="ওয়াটারমার্ক লোগো"
                className="h-12 w-auto border border-border bg-muted object-contain p-1"
              />
            ) : (
              <span className="text-sm text-muted-foreground">এখনো লোগো দেওয়া হয়নি</span>
            )}
            <button
              type="button"
              onClick={() => logoInput.current?.click()}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm"
            >
              <Upload className="size-4" /> লোগো আপলোড
            </button>
            <input
              ref={logoInput}
              type="file"
              accept="image/png,image/webp,image/jpeg"
              className="hidden"
              onChange={(e) => void uploadLogo(e.target.files?.[0])}
            />
          </div>

          <h2 className="pt-2 font-display text-base font-bold">অটোমেশন স্ট্যাটাস</h2>
          <div className="flex flex-col gap-2 rounded-sm border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">লাস্ট ক্রন রান:</span>
              <span className="font-mono font-medium">
                {cfg["auto_last_cron_run"] 
                  ? new Date(cfg["auto_last_cron_run"]).toLocaleString('bn-BD') 
                  : "এখনো চলেনি"}
              </span>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">দৈনিক ক্রন লিংক</span>
              <p className="text-[10px] leading-tight text-muted-foreground">
                নিচের লিঙ্কে প্রতিদিন একবার হিট করলে অটো-সিঙ্ক চলবে। এটি আপনার হোস্টিং বা ক্রন সার্ভারে (যেমন: cron-job.org) সেট করুন।
              </p>
              <div className="mt-1 flex gap-2">
                <input
                  readOnly
                  value={cronUrl}
                  className="w-full border border-border bg-background px-2 py-1 text-[10px] font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(cronUrl);
                    toast.success("কপি হয়েছে");
                  }}
                  className="shrink-0 border border-border bg-background px-2 py-1 text-[10px] hover:bg-muted"
                >
                  কপি
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* সোর্স */}
      <section className="border border-border bg-background p-4">
        <h2 className="mb-3 font-display text-base font-bold">সোর্স সাইট</h2>
        <div className="space-y-2">
          {(sources.data ?? []).map((s: Row) => (
            <div
              key={String(s["id"])}
              className="flex flex-wrap items-center gap-3 border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={Boolean(s["enabled"])}
                onChange={(e) =>
                  toggleSource.mutate({ id: String(s["id"]), enabled: e.target.checked })
                }
              />
              <div className="flex flex-col">
                <span className="font-semibold">
                  {String(s["name"])} 
                  <span className="ml-2 text-[10px] px-1 bg-muted rounded">
                    {s["lang"] === "en" ? "EN → BN" : "BN"}
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">{String(s["category"] || "auto")}</span>
              </div>
              <span className="text-xs text-muted-foreground">{String(s["site_url"])}</span>
              <span className="text-xs text-muted-foreground">
                প্রতি রানে {String(s["per_run"])}টি
              </span>
              {s["last_status"] ? (
                <span className="text-xs text-muted-foreground">· {String(s["last_status"])}</span>
              ) : null}
              <span className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  disabled={running}
                  onClick={() => void run(String(s["id"]), true)}
                  className="flex items-center gap-1 border border-border px-2 py-1 text-xs disabled:opacity-60"
                >
                  <Eye className="size-3.5" /> ড্রাই-রান
                </button>
                <button
                  type="button"
                  disabled={running}
                  onClick={() => void run(String(s["id"]))}
                  className="flex items-center gap-1 border border-border px-2 py-1 text-xs disabled:opacity-60"
                >
                  <Bot className="size-3.5" /> রান
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("সোর্স মুছে ফেলবেন?")) removeSource.mutate(String(s["id"]));
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="ডিলিট"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={newSource.lang}
            onChange={(e) => setNewSource({ ...newSource, lang: e.target.value })}
            className="border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="bn">বাংলা সোর্স</option>
            <option value="en">ইংরেজি সোর্স (বাংলায় অনুবাদ হবে)</option>
          </select>
          <input
            placeholder="সাইটের নাম (যেমন: প্রথম আলো)"
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            className="border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="নিউজ সাইটের মূল লিংক (যেমন: https://prothomalo.com)"
            value={newSource.site_url}
            onChange={(e) => setNewSource({ ...newSource, site_url: e.target.value })}
            className="w-full min-w-0 flex-1 sm:min-w-[240px] border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={newSource.category}
            onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
            className="border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus:text-foreground"
          >
            <option value="">অটো ক্যাটাগরি (AI সিলেক্ট করবে)</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={10}
            value={newSource.per_run}
            onChange={(e) => setNewSource({ ...newSource, per_run: Number(e.target.value) })}
            className="w-20 border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!newSource.name || !newSource.site_url || !newSource.lang}
            onClick={() => addSource.mutate()}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            <Plus className="size-4" /> যোগ করুন
          </button>
        </div>
      </section>

      {previews.length > 0 && (
        <section className="space-y-4 border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold">ড্রাই-রান প্রিভিউ</h2>
              <p className="text-xs text-muted-foreground">
                কিছুই সেভ হয়নি। লেখা ও ছবি দেখে নিশ্চিত হয়ে তবেই পাবলিশ বা ড্রাফট করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviews([])}
              className="border border-border px-3 py-1.5 text-xs"
            >
              প্রিভিউ বাতিল
            </button>
          </div>

          {previews.map((p) => (
            <article key={p.sourceUrl} className="grid gap-4 border border-border p-3 md:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center border border-dashed border-border text-xs text-muted-foreground">
                    ছবি নেই
                  </div>
                )}
                {p.sourceImage ? (
                  <a
                    href={p.sourceImage}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[11px] text-muted-foreground underline"
                  >
                    সোর্স ছবি দেখুন
                  </a>
                ) : null}
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-[11px] text-muted-foreground underline"
                >
                  {p.sourceName} — মূল নিউজ
                </a>
              </div>

              <div className="space-y-2">
                <input
                  value={p.title}
                  onChange={(e) => updatePreview(p.sourceUrl, { title: e.target.value } as Partial<Preview>)}
                  className="w-full border border-border bg-background px-2 py-1.5 font-display text-base font-bold"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    value={p.category}
                    placeholder="ক্যাটাগরি"
                    onChange={(e) => updatePreview(p.sourceUrl, { category: e.target.value } as Partial<Preview>)}
                    className="w-40 border border-border bg-background px-2 py-1 text-xs"
                  />
                </div>
                <textarea
                  value={p.content}
                  rows={8}
                  onChange={(e) => updatePreview(p.sourceUrl, { content: e.target.value } as Partial<Preview>)}
                  className="w-full border border-border bg-background px-2 py-1.5 text-sm leading-7"
                />
                <p className="text-[11px] text-muted-foreground">
                  SEO: {p.seo_title || "—"} · {p.seo_description || "—"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={publishing === p.sourceUrl}
                    onClick={() => void confirmPreview(p, "published")}
                    className="bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-60"
                  >
                    পাবলিশ করুন
                  </button>
                  <button
                    type="button"
                    disabled={publishing === p.sourceUrl}
                    onClick={() => void confirmPreview(p, "draft")}
                    className="border border-border px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    ড্রাফটে রাখুন
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviews((list) => list.filter((x) => x.sourceUrl !== p.sourceUrl))
                    }
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive"
                  >
                    বাদ দিন
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {lastRun && lastRun.length > 0 && (
        <section className="border border-border bg-background p-4">
          <h2 className="mb-2 font-display text-base font-bold">সর্বশেষ রান</h2>
          <ul className="space-y-1 text-sm">
            {lastRun.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className={
                    d.status === "failed" ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  [{d.status}]
                </span>
                <span className="truncate">{d.title}</span>
                {d.message ? (
                  <span className="truncate text-xs text-muted-foreground">— {d.message}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border border-border bg-background p-4">
        <h2 className="mb-2 font-display text-base font-bold">সাম্প্রতিক অটো আইটেম</h2>
        <div className="space-y-1 text-sm">
          {(items.data ?? []).map((it: Row) => (
            <div
              key={String(it["id"])}
              className="flex min-w-0 items-start gap-2 border-b border-border py-2.5"
            >
              <span
                className={
                  String(it["status"]) === "failed"
                    ? "mt-0.5 shrink-0 text-xs text-destructive"
                    : "mt-0.5 shrink-0 text-xs text-muted-foreground"
                }
              >
                [{String(it["status"])}]
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-5">
                  {String(it["source_title"] ?? "শিরোনাম পাওয়া যায়নি")}
                </p>
                <a
                  href={String(it["source_url"])}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex w-fit max-w-full items-start gap-1 text-xs text-primary underline underline-offset-2"
                  title={String(it["source_url"])}
                >
                  <ExternalLink className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                  <span className="break-all">{String(it["source_url"])}</span>
                </a>
                {it["message"] ? (
                  <p className="mt-1 text-xs leading-5 text-destructive">
                    সমস্যা: {String(it["message"])}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          {(items.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">এখনো কিছু আনা হয়নি।</p>
          )}
        </div>
      </section>
    </div>
  );
}
