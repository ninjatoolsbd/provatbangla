import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, Save, ArrowDown, ArrowUp } from "lucide-react";

import { fetchSettings, saveSetting } from "@/lib/cms";

export const Route = createFileRoute("/admin/settings/image-gen")({
  head: () => ({
    meta: [
      { title: "ইমেজ জেনারেশন সেটিংস — প্রভাতবাংলা অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImageGenSettingsPage,
});

function ImageGenSettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["cms", "settings"], queryFn: fetchSettings });
  const cfg = settings.data ?? {};

  const setSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => saveSetting(key, value),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cms", "settings"] });
      toast.success("সেটিংস সেভ হয়েছে");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Default priority: gemini, lovable
  const priorityStr = cfg["image_gen_priority"] ?? "gemini,lovable";
  const priority = priorityStr.split(",").filter(Boolean);

  const move = (index: number, direction: "up" | "down") => {
    const newPriority = [...priority];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPriority.length) return;

    const temp = newPriority[index]!;
    newPriority[index] = newPriority[targetIndex]!;
    newPriority[targetIndex] = temp;

    setSetting.mutate({ key: "image_gen_priority", value: newPriority.join(",") });
  };

  const providers: Record<string, { label: string; desc: string }> = {
    gemini: {
      label: "Google Gemini",
      desc: "আপনার নিজস্ব GEMINI_API_KEY ব্যবহার করে (সাশ্রয়ী)।",
    },
    lovable: {
      label: "Lovable AI",
      desc: "প্ল্যাটফর্মের ডিফল্ট ইমেজ জেনারেশন ব্যাকআপ।",
    },
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">ইমেজ জেনারেশন সেটিংস</h1>
        <p className="text-sm text-muted-foreground">
          অটো নিউজ বা নিউজ এডিটরে ছবি তৈরির জন্য কোন AI আগে ব্যবহার হবে তা নির্ধারণ করুন।
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Image className="size-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">প্রাধান্য তালিকা (Priority)</h2>
        </div>

        <div className="space-y-3 pt-2">
          {priority.map((p, idx) => {
            const info = providers[p] ?? { label: p, desc: "" };
            return (
              <div
                key={p}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{info.label}</div>
                    <div className="text-xs text-muted-foreground">{info.desc}</div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => move(idx, "up")}
                    className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-30"
                    title="উপরে নিন"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    disabled={idx === priority.length - 1}
                    onClick={() => move(idx, "down")}
                    className="rounded-md border border-border p-2 hover:bg-muted disabled:opacity-30"
                    title="নিচে নিন"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
          <p>
            <strong>টিপস:</strong> আপনার যদি নিজস্ব Gemini API Key সেট করা থাকে, তবে Gemini-কে ১ নম্বরে রাখা সাশ্রয়ী।
            যদি কোনো কারণে প্রথম অপশনটি কাজ না করে, তবে স্বয়ংক্রিয়ভাবে পরবর্তী অপশনটি চেষ্টা করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
