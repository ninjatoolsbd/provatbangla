import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteRow, listRows, updateRow, type Row } from "@/lib/cms";
import { banglaDateTime } from "@/lib/posts";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ বার্তা — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "পাঠকের পাঠানো যোগাযোগ বার্তার ইনবক্স।" },
      { property: "og:title", content: "যোগাযোগ বার্তা — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "যোগাযোগ ইনবক্স।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["cms", "contact_messages"],
    queryFn: () => listRows("contact_messages", { column: "created_at", ascending: false }),
  });
  const refresh = () => void qc.invalidateQueries({ queryKey: ["cms", "contact_messages"] });

  const toggleRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      updateRow("contact_messages", id, { is_read: read }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("contact_messages", id),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];
  const unread = rows.filter((r: Row) => !r["is_read"]).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[22px] font-bold text-primary">যোগাযোগ বার্তা</h1>
        <p className="text-sm text-muted-foreground">অপঠিত {unread} · মোট {rows.length}</p>
      </div>

      <div className="divide-y divide-border border border-border bg-background">
        {rows.map((m: Row) => (
          <div key={String(m["id"])} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">
                {String(m["subject"] || "বিষয় নেই")}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">{String(m["message"])}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {String(m["name"])} · {String(m["email"] ?? "")} {m["phone"] ? `· ${String(m["phone"])}` : ""} ·{" "}
                {banglaDateTime(String(m["created_at"]))}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toggleRead.mutate({ id: String(m["id"]), read: !m["is_read"] })
                }
                className="text-muted-foreground hover:text-primary"
                aria-label="পঠিত টগল"
              >
                {m["is_read"] ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("মুছে ফেলবেন?")) remove.mutate(String(m["id"]));
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
          <p className="px-4 py-6 text-sm text-muted-foreground">কোনো বার্তা নেই।</p>
        )}
      </div>
    </div>
  );
}
