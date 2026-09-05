import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "user";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const withTimeout = async <T,>(p: PromiseLike<T>, fallback: T): Promise<T> => {
      let timer: ReturnType<typeof setTimeout>;
      const guard = new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), 8000);
      });
      try {
        return await Promise.race([Promise.resolve(p), guard]);
      } finally {
        clearTimeout(timer!);
      }
    };

    const load = async (uid: string | null, mail: string | null, meta: any) => {
      if (!active) return;
      setUserId(uid);
      setEmail(mail);
      setDisplayName(meta?.display_name || null);
      if (!uid) {
        setRole(null);
        setLoading(false);
        return;
      }
      try {
        const [rolesRes, profileRes] = await Promise.all([
          withTimeout(
            supabase.from("user_roles").select("role").eq("user_id", uid),
            { data: null } as any,
          ),
          withTimeout(
            supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle(),
            { data: null } as any,
          ),
        ]);
        if (!active) return;
        const roles = ((rolesRes?.data ?? []) as { role: AppRole }[]).map((r) => r.role);
        setDisplayName(profileRes?.data?.display_name || meta?.display_name || null);
        setRole(
          roles.includes("admin") ? "admin" : roles.includes("editor") ? "editor" : "user",
        );
      } catch {
        if (!active) return;
        setRole("user");
      } finally {
        if (active) setLoading(false);
      }
    };


    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user?.id ?? null, session?.user?.email ?? null, session?.user?.user_metadata);
    });

    void supabase.auth.getSession().then(({ data }) => {
      void load(data.session?.user?.id ?? null, data.session?.user?.email ?? null, data.session?.user?.user_metadata);
    });

    // safety: never keep the screen stuck on the spinner
    const bail = setTimeout(() => {
      if (active) setLoading(false);
    }, 10000);

    return () => {
      active = false;
      clearTimeout(bail);
      sub.subscription.unsubscribe();
    };

  }, []);

  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  return { userId, email, displayName, role, isAdmin, isEditor, canAccessAdmin: isAdmin || isEditor, loading };
}
