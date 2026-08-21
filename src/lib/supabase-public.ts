// Stateless publishable-key Supabase client for server-side public reads.
// Reads env inside the function so it stays safe to import from route/function modules.
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export function createPublicServerClient() {
  const url =
    process.env["SUPABASE_URL"] ?? (import.meta.env as Record<string, string | undefined>)["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    (import.meta.env as Record<string, string | undefined>)["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY.");
  return createClient<Database>(url, key, {
    global: { fetch: supabaseFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
