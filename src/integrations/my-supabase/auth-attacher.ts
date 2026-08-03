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
      } catch {
        token = undefined;
      }
    }
    return next(
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    );
  },
);
