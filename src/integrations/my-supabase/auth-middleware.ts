// Auth middleware for the project's OWN Supabase instance.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { supabaseFetch } from "./config";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env["MY_SUPABASE_URL"];
    const key = process.env["MY_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      throw new Error("Missing MY_SUPABASE_URL / MY_SUPABASE_PUBLISHABLE_KEY project secrets.");
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No bearer token provided");
    }
    const token = authHeader.slice("Bearer ".length);
    if (!token || token.split(".").length !== 3) {
      throw new Error("Unauthorized: Invalid token");
    }

    const supabase = createClient<Database>(url, key, {
      global: {
        fetch: supabaseFetch(key),
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) {
      throw new Error("Unauthorized: Invalid token");
    }

    return next({
      context: { supabase, userId: data.claims.sub, claims: data.claims },
    });
  },
);
