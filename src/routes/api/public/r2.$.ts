import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rawPath = (params as { _splat?: string })._splat ?? "";
        if (!rawPath || rawPath.includes("..")) return new Response("Not found", { status: 404 });
        
        // Use decodeURIComponent to handle potential URL encoding in the path
        const key = decodeURIComponent(rawPath);
        
        try {
          const { getFromR2 } = await import("@/lib/r2.server");
          const res = await getFromR2(key);
          
          if (!res) {
            console.error(`[R2 Proxy] Key not found or error fetching: ${key}`);
            return new Response("Not found", { status: 404 });
          }

          // Return the response directly to avoid body streaming issues
          // We must clone the response to modify headers if it was returned directly from fetch
          const newResponse = new Response(res.body, res);
          newResponse.headers.set("Access-Control-Allow-Origin", "*");
          newResponse.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
          return newResponse;
        } catch (err) {
          console.error(`[R2 Proxy] Critical error for key ${key}:`, err);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
