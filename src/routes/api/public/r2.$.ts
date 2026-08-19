import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rawPath = (params as { _splat?: string })._splat ?? "";
        const key = decodeURIComponent(rawPath);
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
        
        const { getFromR2 } = await import("@/lib/r2.server");
        const res = await getFromR2(key);
        
        if (!res) return new Response("Not found", { status: 404 });

        // Return the response directly to avoid body streaming issues
        // We must clone the response to modify headers if it was returned directly from fetch
        const newResponse = new Response(res.body, res);
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        return newResponse;
      },
    },
  },
});
