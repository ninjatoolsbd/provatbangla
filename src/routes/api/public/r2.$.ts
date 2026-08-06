import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = (params as { _splat?: string })._splat ?? "";
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
        
        const { getFromR2 } = await import("@/lib/r2.server");
        const res = await getFromR2(key);
        
        if (!res) return new Response("Not found", { status: 404 });

        // Clone the response to modify headers if needed, ensuring correct display
        const newRes = new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: new Headers(res.headers),
        });
        
        // Ensure standard browser behavior for images
        newRes.headers.set("Access-Control-Allow-Origin", "*");
        
        return newRes;
      },
    },
  },
});
