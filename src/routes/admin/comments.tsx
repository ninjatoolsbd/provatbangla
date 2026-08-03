import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, listRows, updateRow, type Row } from "@/lib/cms";
import { banglaDateTime } from "@/lib/posts";

export const Route = createFileRoute("/admin/comments")({
  head: () => ({
    meta: [
      { title: "মন্তব্য — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "পাঠকের মন্তব্য অনুমোদন ও মডারেশন।" },
      { property: "og:title", content: "মন্তব্য — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "মন্তব্য মডারেশন প্যানেল।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommentsPage,
});

const tabs = [
  { key: "pending", label: "অপেক্ষমাণ" },
  { key: "approved", label: "অনুমোদিত" },
  { key: "rejected", label: "বাতিল" },
];

function CommentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");
  const list = useQuery({
    queryKey: ["cms", "comments"],
    queryFn: () => listRows("comments", { column: "created_at", ascending: false }),
  });

  const refresh = () => void qc.invalidateQueries({ queryKey: ["cms", "comments"] });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateRow("comments", id, { status }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("comments", id),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (list.data ?? []).filter((c: Row) => c["status"] === tab);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[22px] font-bold text-primary">পাঠকের মন্তব্য</h1>

      <div className="flex gap-2">
        {tabs.map((t) => {
          const count = (list.data ?? []).filter((c: Row) => c["status"] === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`border px-3 py-1.5 text-xs ${
                tab === t.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="border border-border bg-background divide-y divide-border">
        {rows.map((c: Row) => (
          <div key={String(c["id"])} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm">{String(c["body"])}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {String(c["name"])} · {banglaDateTime(String(c["created_at"]))}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {c["status"] !== "approved" && (
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: String(c["id"]), status: "approved" })}
                  className="text-emerald-600 hover:opacity-70"
                  aria-label="অনুমোদন"
                >
                  <Check className="size-4" />
                </button>
              )}
              {c["status"] !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: String(c["id"]), status: "rejected" })}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="বাতিল"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm("মুছে ফেলবেন?")) remove.mutate(String(c["id"]));
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label="ডিলিট"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">এই তালিকায় কিছু নেই।</p>
        )}
      </div>
    </div>
  );
}
