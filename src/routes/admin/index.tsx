import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  FileText,
  CheckCircle2,
  FileEdit,
  FolderTree,
  MessageSquare,
  Mail,
  Users,
  Image,
  RefreshCw,
} from "lucide-react";

import { fetchAllPostsForAdmin, fetchPostCounts, banglaDateTime } from "@/lib/posts";
import { countRows, listRows } from "@/lib/cms";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ওভারভিউ — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "প্রকাশিত ও ড্রাফট নিউজের সারসংক্ষেপ ও সাম্প্রতিক কার্যক্রম।" },
      { property: "og:title", content: "ওভারভিউ — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "নিউজ পরিসংখ্যান ও সাম্প্রতিক কার্যক্রম।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

function useCount(table: string) {
  const q = useQuery({
    queryKey: ["cms", table],
    queryFn: () => listRows(table, { column: "created_at", ascending: false }),
    retry: false,
  });
  return q.data ?? [];
}

function useTableCount(table: string) {
  const q = useQuery({
    queryKey: ["cms-count", table],
    queryFn: () => countRows(table),
    retry: false,
  });
  return q.data ?? 0;
}

const AUTO_KEY = "admin-auto-refresh";
const AUTO_INTERVAL_MS = 3 * 60 * 1000;

function Overview() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const { role, userId } = useAuth();
  const posts = useQuery({ 
    queryKey: ["admin-posts", role, userId], 
    queryFn: async () => {
      const data = await fetchAllPostsForAdmin();
      if (role === "editor" && userId) {
        return data.filter(p => (p as any).author_id === userId);
      }
      return data;
    }
  });
  const counts = useQuery({ 
    queryKey: ["admin-post-counts", role, userId], 
    queryFn: async () => {
      const data = await fetchPostCounts();
      // Note: fetchPostCounts would ideally be role-aware on server, 
      // but if not, the post list query above handles visibility.
      return data;
    }, 
    retry: false 
  });

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
      setLastRefreshed(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  useEffect(() => {
    setAutoRefresh(window.localStorage.getItem(AUTO_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void refreshAll();
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshAll]);

  function toggleAuto() {
    setAutoRefresh((prev) => {
      const next = !prev;
      window.localStorage.setItem(AUTO_KEY, next ? "1" : "0");
      return next;
    });
  }


  const all = posts.data ?? [];
  const totals = counts.data ?? {
    total: all.length,
    published: all.filter((p) => p.status === "published").length,
    drafts: all.filter((p) => p.status !== "published").length,
  };

  const cats = useCount("categories");
  const comments = useCount("comments");
  const messages = useCount("contact_messages");
  const subscribers = useTableCount("subscribers");
  const media = useTableCount("media");

  const stats = [
    { label: "মোট নিউজ", value: totals.total, icon: FileText },
    { label: "প্রকাশিত", value: totals.published, icon: CheckCircle2 },
    { label: "ড্রাফট", value: totals.drafts, icon: FileEdit },
    { label: "ক্যাটাগরি", value: cats.length, icon: FolderTree },
    {
      label: "অপেক্ষমাণ মন্তব্য",
      value: comments.filter((c) => c["status"] === "pending").length,
      icon: MessageSquare,
    },
    {
      label: "অপঠিত বার্তা",
      value: messages.filter((m) => !m["is_read"]).length,
      icon: Mail,
    },
    { label: "নিউজলেটার গ্রাহক", value: subscribers, icon: Users },
    { label: "মিডিয়া ফাইল", value: media, icon: Image },
  ];


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-bold text-primary">ওভারভিউ</h1>
        <div className="flex flex-wrap items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground">
              সর্বশেষ আপডেট: {lastRefreshed.toLocaleTimeString("bn-BD")}
            </span>
          )}
          <button
            type="button"
            onClick={toggleAuto}
            aria-pressed={autoRefresh}
            title="প্রতি ৩ মিনিটে স্বয়ংক্রিয়ভাবে সংখ্যা আপডেট হবে"
            className={`flex items-center gap-2 border px-3 py-2 text-sm font-medium ${
              autoRefresh
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`size-2 rounded-full ${autoRefresh ? "animate-pulse bg-primary" : "bg-muted-foreground/50"}`}
            />
            অটো রিফ্রেশ {autoRefresh ? "চালু" : "বন্ধ"}
          </button>
          <button
            type="button"
            onClick={refreshAll}
            disabled={refreshing || posts.isFetching || counts.isFetching}
            className="flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw
              className={`size-4 ${refreshing || posts.isFetching || counts.isFetching ? "animate-spin" : ""}`}
            />
            রিফ্রেশ
          </button>

          <Link
            to="/admin/write"
            search={{ id: undefined }}
            className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            নতুন নিউজ লিখুন
          </Link>
        </div>
      </div>


      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-background">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-bold text-primary">সাম্প্রতিক নিউজ</h2>
        </div>
        <div className="divide-y divide-border">
          {all.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.status === "published" ? "প্রকাশিত" : "ড্রাফট"} ·{" "}
                  {banglaDateTime(p.published_at ?? p.created_at)}
                </p>
              </div>
              <Link
                to="/admin/write"
                search={{ id: p.id }}
                className="shrink-0 text-xs text-primary hover:underline"
              >
                এডিট
              </Link>
            </div>
          ))}
          {all.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">এখনো কোনো নিউজ নেই।</p>
          )}
        </div>
      </div>
    </div>
  );
}
