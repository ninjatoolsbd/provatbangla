import { useEffect, useState } from "react";

import { supabase } from "@/integrations/my-supabase/client";

export type AppRole = "admin" | "editor" | "user";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (uid: string | null, mail: string | null) => {
      if (!active) return;
      setUserId(uid);
      setEmail(mail);
      if (!uid) {
        setRole(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if (!active) return;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      setRole(
        roles.includes("admin") ? "admin" : roles.includes("editor") ? "editor" : "user",
      );
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user?.id ?? null, session?.user?.email ?? null);
    });

    void supabase.auth.getSession().then(({ data }) => {
      void load(data.session?.user?.id ?? null, data.session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  return { userId, email, role, isAdmin, isEditor, canAccessAdmin: isAdmin || isEditor, loading };
}
