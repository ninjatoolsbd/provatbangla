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

    // Never let a slow or failing lookup trap the UI on a spinner.
    const withTimeout = <T,>(p: PromiseLike<T>, ms: number, fallback: T) =>
      Promise.race([
        Promise.resolve(p),
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
      ]);

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
        const [rolesRes, profileRes] = await withTimeout(
          Promise.all([
            supabase.from("user_roles").select("role").eq("user_id", uid),
            supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle(),
          ]),
          10_000,
          [{ data: null }, { data: null }] as any,
        );
        if (!active) return;
        const roles = ((rolesRes?.data ?? []) as { role: AppRole }[]).map((r) => r.role);
        setDisplayName(profileRes?.data?.display_name || meta?.display_name || null);
        setRole(
          roles.includes("admin") ? "admin" : roles.includes("editor") ? "editor" : "user",
        );
      } catch (err) {
        console.error("Failed to load user role", err);
        if (active) setRole("user");
      } finally {
        if (active) setLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user?.id ?? null, session?.user?.email ?? null, session?.user?.user_metadata).catch(
        () => active && setLoading(false),
      );
    });

    void supabase.auth
      .getSession()
      .then(({ data }) =>
        load(data.session?.user?.id ?? null, data.session?.user?.email ?? null, data.session?.user?.user_metadata),
      )
      .catch(() => active && setLoading(false));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  return { userId, email, displayName, role, isAdmin, isEditor, canAccessAdmin: isAdmin || isEditor, loading };
}
