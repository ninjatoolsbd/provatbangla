import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/deployment-check")({
  server: {
    handlers: {
      GET: async () => {
        const config = {
          hasSupabaseUrl: !!process.env["MY_SUPABASE_URL"],
          hasSupabaseKey: !!process.env["MY_SUPABASE_PUBLISHABLE_KEY"],
          nodeVersion: process.version,
          env: Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("VITE")),
          timestamp: new Date().toISOString(),
        };
        
        return new Response(JSON.stringify(config, null, 2), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
