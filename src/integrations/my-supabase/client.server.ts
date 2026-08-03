// Service-role client for the project's OWN Supabase instance. Server-only.
// Load inside handlers: const { supabaseAdmin } = await import("@/integrations/my-supabase/client.server");
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { supabaseFetch } from "./config";

function create() {
  const url = process.env["MY_SUPABASE_URL"];
  const key = process.env["MY_SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new Error("Missing MY_SUPABASE_URL / MY_SUPABASE_SERVICE_ROLE_KEY project secrets.");
  }
  return createClient<Database>(url, key, {
    global: { fetch: supabaseFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

let _admin: ReturnType<typeof create> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof create>, {
  get(_, prop, receiver) {
    if (!_admin) _admin = create();
    return Reflect.get(_admin, prop, receiver);
  },
});
