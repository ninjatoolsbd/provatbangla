import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { db, deleteRow, insertRow, listRows, updateRow, type Row } from "@/lib/cms";

export const Route = createFileRoute("/admin/polls")({
  head: () => ({
    meta: [
      { title: "জরিপ — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "পাঠক জরিপ তৈরি ও ফলাফল দেখা।" },
      { property: "og:title", content: "জরিপ — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "পাঠক জরিপ ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PollsPage,
});

async function fetchVotes() {
  const { data, error } = await db.from("poll_votes").select("poll_id, option_index");
  if (error) throw error;
  return (data ?? []) as { poll_id: string; option_index: number }[];
}

function PollsPage() {
  const qc = useQueryClient();
  const polls = useQuery({
    queryKey: ["cms", "polls"],
    queryFn: () => listRows("polls", { column: "created_at", ascending: false }),
  });
  const votes = useQuery({ queryKey: ["cms", "poll_votes"], queryFn: fetchVotes });

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("হ্যাঁ\nনা\nমন্তব্য নেই");

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["cms", "polls"] });
    void qc.invalidateQueries({ queryKey: ["cms", "poll_votes"] });
  };

  const create = useMutation({
    mutationFn: () =>
      insertRow("polls", {
        question,
        options: options.split("\n").map((s) => s.trim()).filter(Boolean),
        is_active: true,
      }),
    onSuccess: () => {
      toast.success("জরিপ তৈরি হয়েছে");
      setQuestion("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateRow("polls", id, { is_active: active }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("polls", id),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const countFor = (pollId: string, index: number) =>
    (votes.data ?? []).filter((v) => v.poll_id === pollId && v.option_index === index).length;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[22px] font-bold text-primary">পাঠক জরিপ</h1>

      <div className="space-y-3 border border-border bg-background p-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">প্রশ্ন</span>
          <input
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="আপনার মতামত কী?"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            অপশন (প্রতি লাইনে একটি)
          </span>
          <textarea
            rows={4}
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={!question.trim() || create.isPending}
          onClick={() => create.mutate()}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          <Plus className="size-4" /> জরিপ যোগ করুন
        </button>
      </div>

      <div className="space-y-3">
        {(polls.data ?? []).map((p: Row) => {
          const opts = (p["options"] as string[]) ?? [];
          const total = opts.reduce((sum, _o, i) => sum + countFor(String(p["id"]), i), 0);
          return (
            <div key={String(p["id"])} className="border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-sm font-bold">{String(p["question"])}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(p["is_active"])}
                      onChange={(e) =>
                        toggle.mutate({ id: String(p["id"]), active: e.target.checked })
                      }
                    />
                    সক্রিয়
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("মুছে ফেলবেন?")) remove.mutate(String(p["id"]));
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="ডিলিট"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {opts.map((o, i) => {
                  const c = countFor(String(p["id"]), i);
                  const pct = total ? Math.round((c / total) * 100) : 0;
                  return (
                    <div key={`${String(p["id"])}-${i}`}>
                      <div className="flex justify-between text-xs">
                        <span>{o}</span>
                        <span className="text-muted-foreground">
                          {c} ভোট · {pct}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 bg-muted">
                        <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">মোট ভোট: {total}</p>
              </div>
            </div>
          );
        })}
        {(polls.data ?? []).length === 0 && (
          <p className="border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
            এখনো কোনো জরিপ নেই।
          </p>
        )}
      </div>
    </div>
  );
}
