import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/r2/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = (params as { _splat?: string })._splat ?? "";
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
        const { getFromR2 } = await import("@/lib/r2.server");
        const res = await getFromR2(key);
        return res ?? new Response("Not found", { status: 404 });
      },
    },
  },
});
