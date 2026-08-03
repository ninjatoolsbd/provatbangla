// Browser Supabase client for the project's OWN Supabase instance.
// Import: import { supabase } from "@/integrations/my-supabase/client";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import {
  MY_SUPABASE_PUBLISHABLE_KEY,
  MY_SUPABASE_URL,
  assertPublicConfig,
  supabaseFetch,
} from "./config";

function create() {
  assertPublicConfig();
  return createClient<Database>(MY_SUPABASE_URL, MY_SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: supabaseFetch(MY_SUPABASE_PUBLISHABLE_KEY) },
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _client: ReturnType<typeof create> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof create>, {
  get(_, prop, receiver) {
    if (!_client) _client = create();
    return Reflect.get(_client, prop, receiver);
  },
});

/** Stateless publishable client for server-side public reads. */
export function createPublicServerClient() {
  assertPublicConfig();
  return createClient<Database>(MY_SUPABASE_URL, MY_SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: supabaseFetch(MY_SUPABASE_PUBLISHABLE_KEY) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
