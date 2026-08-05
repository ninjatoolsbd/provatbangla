import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/my-supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchSettings, saveSetting } from "@/lib/cms";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "সেটিংস — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "সাইটের নাম, স্লোগান, যোগাযোগ ও সোশ্যাল লিংক সেটিংস।" },
      { property: "og:title", content: "সেটিংস — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "অ্যাডমিন অ্যাকাউন্ট ও সাইট কনফিগারেশন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const settingFields: { key: string; label: string; textarea?: boolean; section?: string }[] = [
  { key: "site_name", label: "সাইটের নাম", section: "site" },
  { key: "tagline", label: "স্লোগান", section: "site" },
  { key: "description", label: "সাইট বর্ণনা (SEO)", textarea: true, section: "site" },
  { key: "editor_name", label: "সম্পাদকের নাম", section: "site" },
  { key: "contact_email", label: "যোগাযোগ ইমেইল", section: "site" },
  { key: "contact_phone", label: "যোগাযোগ ফোন", section: "site" },
  { key: "address", label: "ঠিকানা", textarea: true, section: "site" },
  { key: "facebook_url", label: "ফেসবুক লিংক", section: "site" },
  { key: "youtube_url", label: "ইউটিউব লিংক", section: "site" },
  { key: "twitter_url", label: "এক্স (টুইটার) লিংক", section: "site" },
  
  // AI Keys Section
  { key: "GEMINI_API_KEY", label: "Google Gemini API Keys (কমা দিয়ে একাধিক কী দিন)", textarea: true, section: "ai" },
  { key: "OPENROUTER_API_KEY", label: "OpenRouter API Key", section: "ai" },
  { key: "GROQ_API_KEY", label: "Groq API Key", section: "ai" },
];

function SettingsPage() {
  const { email, userId, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["cms", "site_settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = async () => {
    setSaving(true);
    try {
      for (const f of settingFields) {
        await saveSetting(f.key, form[f.key] ?? "");
      }
      toast.success("সেটিংস সেভ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["cms", "site_settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "সেভ করা যায়নি");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-[22px] font-bold text-primary">সেটিংস</h1>

      <div className="space-y-6">
        {/* সাইট তথ্য */}
        <div className="space-y-3 border border-border bg-background p-4">
          <h2 className="font-display text-base font-bold">সাইট তথ্য</h2>
          {settingFields.filter(f => f.section === "site").map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs text-muted-foreground">{f.label}</span>
              {f.textarea ? (
                <textarea
                  rows={3}
                  className={input}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input
                  className={input}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>

        {/* AI API Keys */}
        <div className="space-y-3 border border-border bg-background p-4">
          <h2 className="font-display text-base font-bold text-primary">AI API কনফিগারেশন</h2>
          <p className="text-[11px] text-muted-foreground italic">
            দ্রষ্টব্য: এই কীগুলি সুরক্ষিতভাবে ডেটাবেসে সংরক্ষিত হবে। Gemini-র জন্য একাধিক কী কমা (,) দিয়ে আলাদা করে দিতে পারেন।
          </p>
          {settingFields.filter(f => f.section === "ai").map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs text-muted-foreground font-bold">{f.label}</span>
              {f.textarea ? (
                <textarea
                  rows={2}
                  className={input}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={`${f.label} এখানে দিন...`}
                />
              ) : (
                <input
                  type="password"
                  className={input}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={`${f.label} এখানে দিন...`}
                />
              )}
            </label>
          ))}
        </div>

        <Button className="w-full sm:w-auto" onClick={() => void save()} disabled={saving}>
          {saving ? "সেভ হচ্ছে…" : "সব সেটিংস সেভ করুন"}
        </Button>
      </div>

      <div className="border border-border bg-background p-4">
        <h2 className="font-display text-base font-bold">অ্যাকাউন্ট</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">ইমেইল</dt>
            <dd className="truncate font-medium">{email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">ইউজার আইডি</dt>
            <dd className="truncate font-mono text-xs">{userId}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">রোল</dt>
            <dd className="font-medium">{isAdmin ? "অ্যাডমিন" : "অথর"}</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth", search: { mode: "login" } });
          }}
        >
          লগআউট
        </Button>
      </div>

      <div className="border border-border bg-background p-4">
        <h2 className="font-display text-base font-bold">কনফিগারেশন</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>ডেটাবেস ও অথ: নিজস্ব Supabase প্রজেক্ট</li>
          <li>ছবি স্টোরেজ: Cloudflare R2 (প্রক্সি সহ)</li>
          <li>AI প্রোভাইডার: Lovable AI → Groq → Cerebras → Gemini (ফলব্যাক চেইন)</li>
        </ul>
      </div>
    </div>
  );
}
