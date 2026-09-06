import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

function createAdminFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

/** Privileged client for verified admin actions across Lovable and Worker deployments. */
export function getAdminCloudClient() {
  const publicEnv = import.meta.env as Record<string, string | undefined>;
  const url =
    process.env["SUPABASE_URL"] ??
    process.env["MY_SUPABASE_URL"] ??
    publicEnv["VITE_SUPABASE_URL"] ??
    ADMIN_CLOUD_FALLBACK.SUPABASE_URL;
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["MY_SUPABASE_SERVICE_ROLE_KEY"] ??
    ADMIN_CLOUD_FALLBACK.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("ইউজার ব্যবস্থাপনার Cloud সংযোগ পাওয়া যায়নি। সাইটটি নতুন করে প্রকাশ করুন।");
  }

  return createClient<Database>(url, key, {
    global: { fetch: createAdminFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}