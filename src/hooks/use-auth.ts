import { useEffect, useState } from "react";

import { supabase } from "@/integrations/my-supabase/client";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (uid: string | null, mail: string | null) => {
      if (!active) return;
      setUserId(uid);
      setEmail(mail);
      if (!uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(Boolean(data));
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

  return { userId, email, isAdmin, loading };
}
