import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/my-supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "সেটিংস — প্রভাতবাংলা অ্যাডমিন" },
      { name: "description", content: "অ্যাকাউন্ট তথ্য, সাইট কনফিগারেশন ও লগআউট।" },
      { property: "og:title", content: "সেটিংস — প্রভাতবাংলা অ্যাডমিন" },
      { property: "og:description", content: "অ্যাডমিন অ্যাকাউন্ট ও সাইট সেটিংস।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { email, userId } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-[22px] font-bold text-primary">সেটিংস</h1>

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
            <dd className="font-medium">অ্যাডমিন</dd>
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
