import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Bot, Play, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { runAutoImport } from "@/lib/auto-news.functions";
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
  const [newSource, setNewSource] = useState({ name: "", site_url: "", per_run: 5 });
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<
    { title: string; status: string; message?: string }[] | null
  >(null);

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
    mutationFn: () =>
      insertRow("auto_sources", {
        name: newSource.name,
        site_url: newSource.site_url.replace(/\/+$/, ""),
        per_run: newSource.per_run,
        category: "auto",
      }),
    onSuccess: () => {
      setNewSource({ name: "", site_url: "", per_run: 5 });
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

  const run = async (sourceId?: string) => {
    setRunning(true);
    setLastRun(null);
    try {
      const res = await runAutoImport({ data: sourceId ? { sourceId } : {} });
      setLastRun(res.details);
      toast.success(`${res.created} নতুন, ${res.skipped} আগেই ছিল, ${res.failed} ব্যর্থ`);
      void qc.invalidateQueries({ queryKey: ["cms", "auto_items"] });
      void qc.invalidateQueries({ queryKey: ["cms", "auto_sources"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "রান ব্যর্থ");
    } finally {
      setRunning(false);
    }
  };

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataBase64 = await toBase64(file);
      const res = await uploadMedia({
        data: { name: file.name, contentType: file.type || "image/png", dataBase64 },
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
            সোর্স সাইট থেকে নতুন নিউজ → AI রিরাইট → ছবি মডিফাই ও ওয়াটারমার্ক → সাইটে প্রকাশ।
          </p>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={() => void run()}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          <Play className="size-4" /> {running ? "চলছে…" : "এখনই চালান"}
        </button>
      </div>

      {/* সেটিংস */}
      <section className="grid gap-4 border border-border bg-background p-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-base font-bold">সেটিংস</h2>
          {(
            [
              ["auto_enabled", "অটোমেশন চালু"],
              ["auto_image_ai", "ছবি AI দিয়ে মডিফাই + ওয়াটারমার্ক"],
              ["auto_credit", "নিউজের শেষে সোর্স ক্রেডিট"],
            ] as const
          ).map(([key, label]) => (
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
            {cfg["watermark_logo_url"] ? (
              <img
                src={cfg["watermark_logo_url"]}
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

          <h2 className="pt-2 font-display text-base font-bold">দৈনিক ক্রন লিংক</h2>
          <p className="text-xs text-muted-foreground">
            দিনে একবার এই লিংকে হিট করলেই অটো-সিঙ্ক চলবে (cron-job.org বা pg_cron)।
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={cronUrl}
              className="w-full border border-border bg-muted px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(cronUrl);
                toast.success("কপি হয়েছে");
              }}
              className="shrink-0 border border-border px-3 text-xs"
            >
              কপি
            </button>
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
              <span className="font-semibold">{String(s["name"])}</span>
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
          <input
            placeholder="সোর্সের নাম"
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            className="border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="https://example.com"
            value={newSource.site_url}
            onChange={(e) => setNewSource({ ...newSource, site_url: e.target.value })}
            className="min-w-[240px] flex-1 border border-border bg-background px-3 py-2 text-sm"
          />
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
            disabled={!newSource.name || !newSource.site_url}
            onClick={() => addSource.mutate()}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          >
            <Plus className="size-4" /> যোগ করুন
          </button>
        </div>
      </section>

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
            <div key={String(it["id"])} className="flex gap-2 border-b border-border py-1.5">
              <span
                className={
                  String(it["status"]) === "failed"
                    ? "shrink-0 text-xs text-destructive"
                    : "shrink-0 text-xs text-muted-foreground"
                }
              >
                [{String(it["status"])}]
              </span>
              <span className="truncate">{String(it["source_title"] ?? it["source_url"])}</span>
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
