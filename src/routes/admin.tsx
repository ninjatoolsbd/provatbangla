import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/my-supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ড্যাশবোর্ড — প্রভাতবাংলা" },
      { name: "description", content: "নিউজ লেখা, প্রকাশ ও ব্যবস্থাপনার অ্যাডমিন ড্যাশবোর্ড।" },
      { property: "og:title", content: "অ্যাডমিন ড্যাশবোর্ড — প্রভাতবাংলা" },
      { property: "og:description", content: "নিউজ লেখা, প্রকাশ ও ব্যবস্থাপনা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, canAccessAdmin, loading, email, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !canAccessAdmin && !userId)
      void navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, canAccessAdmin, userId, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!canAccessAdmin) {
    if (!userId) return null;
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-xl font-bold">প্রবেশাধিকার নেই</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনি <span className="font-medium">{email}</span> দিয়ে লগইন করেছেন, কিন্তু এই
            অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।
          </p>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/auth", search: { mode: "login" } });
            }}
            className="mt-5 bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            অন্য অ্যাকাউন্টে লগইন করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar email={email} isAdmin={isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-border bg-background px-3">
            <SidebarTrigger />
            <span className="font-display text-sm font-bold text-primary">অ্যাডমিন ড্যাশবোর্ড</span>
          </header>
          <main className="min-w-0 flex-1 p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
