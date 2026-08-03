import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, listRows, type Row } from "@/lib/cms";
import { banglaDateTime } from "@/lib/posts";

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "নিউজলেটার সাবস্ক্রাইবার — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "নিউজলেটার গ্রাহকদের তালিকা ও এক্সপোর্ট।" },
      { property: "og:title", content: "নিউজলেটার সাবস্ক্রাইবার — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "গ্রাহক তালিকা ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscribersPage,
});

function SubscribersPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["cms", "subscribers"],
    queryFn: () => listRows("subscribers", { column: "created_at", ascending: false }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("subscribers", id),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "subscribers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  const exportCsv = () => {
    const csv = ["email,created_at"]
      .concat(rows.map((r: Row) => `${String(r["email"])},${String(r["created_at"])}`))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold text-primary">নিউজলেটার গ্রাহক</h1>
          <p className="text-sm text-muted-foreground">মোট {rows.length} জন</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="flex items-center gap-2 border border-border px-3 py-2 text-sm disabled:opacity-50"
        >
          <Download className="size-4" /> CSV ডাউনলোড
        </button>
      </div>

      <div className="divide-y divide-border border border-border bg-background">
        {rows.map((s: Row) => (
          <div key={String(s["id"])} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm">{String(s["email"])}</p>
              <p className="text-xs text-muted-foreground">
                {banglaDateTime(String(s["created_at"]))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("মুছে ফেলবেন?")) remove.mutate(String(s["id"]));
              }}
              className="text-muted-foreground hover:text-destructive"
              aria-label="ডিলিট"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">এখনো কোনো গ্রাহক নেই।</p>
        )}
      </div>
    </div>
  );
}
