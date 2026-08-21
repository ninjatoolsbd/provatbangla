// Public backend configuration for the project's own Supabase instance.
// Values are injected at build time from MY_SUPABASE_* project secrets
// (see vite.config.ts). URL + publishable key are public by design.
declare const __MY_SUPABASE_URL__: string | undefined;
declare const __MY_SUPABASE_PUBLISHABLE_KEY__: string | undefined;

declare global {
  interface Window {
    __MY_SUPABASE_CONFIG__?: {
      url?: string;
      publishableKey?: string;
    };
  }
}

// Public fallbacks: URL + publishable key are public by design. They keep the
// app working on hosts (e.g. Cloudflare Workers) where build-time env vars
// were not configured — otherwise SSR throws and every page fails to load.
const FALLBACK_URL = "https://twqgyregrrqgwxyhglsg.supabase.co";
const FALLBACK_PUBLISHABLE_KEY = "sb_publishable_WcD-YUXN8p7-wCIOTCZeYQ_plJq9E6j";

function pick(
  injected: string | undefined,
  runtimeValue: string | undefined,
  viteKey: string,
  nodeKey: string,
  fallback: string,
): string {
  if (injected) return injected;
  if (runtimeValue) return runtimeValue;
  const fromVite = (import.meta.env as Record<string, string | undefined>)[viteKey];
  if (fromVite) return fromVite;
  if (typeof process !== "undefined" && process.env?.[nodeKey]) return process.env[nodeKey] as string;
  return fallback;
}

export const MY_SUPABASE_URL = pick(
  typeof __MY_SUPABASE_URL__ !== "undefined" ? __MY_SUPABASE_URL__ : undefined,
  typeof window !== "undefined" ? window.__MY_SUPABASE_CONFIG__?.url : undefined,
  "VITE_MY_SUPABASE_URL",
  "MY_SUPABASE_URL",
  FALLBACK_URL,
);

export const MY_SUPABASE_PUBLISHABLE_KEY = pick(
  typeof __MY_SUPABASE_PUBLISHABLE_KEY__ !== "undefined" ? __MY_SUPABASE_PUBLISHABLE_KEY__ : undefined,
  typeof window !== "undefined" ? window.__MY_SUPABASE_CONFIG__?.publishableKey : undefined,
  "VITE_MY_SUPABASE_PUBLISHABLE_KEY",
  "MY_SUPABASE_PUBLISHABLE_KEY",
  FALLBACK_PUBLISHABLE_KEY,
);


export function assertPublicConfig() {
  if (!MY_SUPABASE_URL || !MY_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing MY_SUPABASE_URL / MY_SUPABASE_PUBLISHABLE_KEY. Add them as project secrets.",
    );
  }
}

/** New-style Supabase keys are opaque strings, not bearer JWTs. */
export function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function supabaseFetch(key: string): typeof fetch {
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
