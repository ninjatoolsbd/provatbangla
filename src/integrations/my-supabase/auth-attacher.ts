// Attaches the current user's bearer token from the project's OWN Supabase
// instance to every server-function call.
import { createMiddleware } from "@tanstack/react-start";

import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    if (typeof window !== "undefined") {
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? undefined;
      } catch (err) {
        console.warn("Supabase session fetch failed in auth-attacher:", err);
        token = undefined;
      }
    }
    
    // Explicitly merge the new header instead of potentially overwriting context
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  },
);
