import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rawPath = (params as { _splat?: string })._splat ?? "";
        if (!rawPath || rawPath.includes("..")) return new Response("Not found", { status: 404 });
        
        // We MUST preserve the raw path for R2 but handle the browser's potential double encoding
        // If the path contains '%', it's already encoded
        const key = rawPath.includes('%') ? decodeURIComponent(rawPath) : rawPath;
        
        try {
          const { getFromR2 } = await import("@/lib/r2.server");
          const res = await getFromR2(key);
          
          if (!res) {
            console.error(`[R2 Proxy] Key not found: ${key}`);
            return new Response("Not found", { status: 404 });
          }

          // Important: Clone the response to add new headers correctly
          const newResponse = new Response(res.body, res);
          newResponse.headers.set("Access-Control-Allow-Origin", "*");
          newResponse.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
          newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
          
          return newResponse;
        } catch (err) {
          console.error(`[R2 Proxy] Error for key ${key}:`, err);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
