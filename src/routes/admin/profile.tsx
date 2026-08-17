import { createFileRoute } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/my-supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "আমার প্রোফাইল — প্রভাতবাংলা অ্যাডমিন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId, email, displayName: initialName, role } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialName) setDisplayName(initialName);
  }, [initialName]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;
      toast.success("প্রোফাইল আপডেট হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-[22px] font-bold text-primary">আমার প্রোফাইল</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          আপনার ব্যক্তিগত তথ্য ও রোল দেখুন।
        </p>
      </div>

      <div className="border border-border bg-background p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">নাম</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
            <Input value={email ?? ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">রোল</label>
            <div className="inline-block bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
              {role === 'admin' ? 'অ্যাডমিন' : role === 'editor' ? 'অথর' : 'ইউজার'}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              সেভ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
