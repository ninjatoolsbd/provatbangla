import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলা সম্পাদকীয় প্যানেলে প্রবেশ করুন।" },
      { property: "og:title", content: "অ্যাডমিন লগইন — প্রভাতবাংলা" },
      { property: "og:description", content: "প্রভাতবাংলা সম্পাদকীয় প্যানেলে প্রবেশ করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে।");
        if (data.session) void navigate({ to: "/admin" });
        else setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "কিছু একটা ভুল হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-14">
        <h1 className="font-display text-2xl font-bold">
          {isSignup ? "অ্যাডমিন অ্যাকাউন্ট তৈরি" : "অ্যাডমিন লগইন"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          প্রথম যে অ্যাকাউন্টটি তৈরি হবে সেটিই স্বয়ংক্রিয়ভাবে অ্যাডমিন হবে।
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 border border-border p-5">
          <div className="space-y-2">
            <Label htmlFor="email">ইমেইল</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "অপেক্ষা করুন..." : isSignup ? "সাইন আপ" : "লগইন"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsSignup((v) => !v)}
            className="text-sm text-primary hover:underline"
          >
            {isSignup ? "অ্যাকাউন্ট আছে? লগইন করুন" : "অ্যাকাউন্ট নেই? সাইন আপ করুন"}
          </button>
          {!isSignup && (
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast.error("আগে ইমেইল লিখুন");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/auth?mode=login`,
                });
                if (error) toast.error(error.message);
                else toast.success("পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে।");
              }}
              className="text-sm text-muted-foreground hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          )}
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
