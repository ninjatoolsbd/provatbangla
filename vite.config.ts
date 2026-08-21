// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The app talks to the project's OWN Supabase instance. URL + publishable key
// are public values, injected at build time from MY_SUPABASE_* project secrets
// so they survive workspace/environment changes.
export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pin Nitro to the Cloudflare Pages preset so the GitHub-connected Pages build
  // produces the expected `_worker.js` + static asset layout.
  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
  vite: {
    define: {
      __MY_SUPABASE_URL__: JSON.stringify(process.env["MY_SUPABASE_URL"] ?? ""),
      __MY_SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(
        process.env["MY_SUPABASE_PUBLISHABLE_KEY"] ?? "",
      ),
    },
  },
});
