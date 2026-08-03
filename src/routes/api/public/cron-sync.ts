import { createFileRoute } from "@tanstack/react-router";

/**
 * দিনে একবার (বা যেকোনো সময়) কল করলে সোর্স সাইট থেকে নতুন নিউজ এনে রিরাইট করে সাইটে বসায়।
 * কল: /api/public/cron-sync?token=<auto_cron_token>
 */
export const Route = createFileRoute("/api/public/cron-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token") ?? "";
        const { supabaseAdmin } = await import("@/integrations/my-supabase/client.server");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = supabaseAdmin as any;

        const { data: row } = await admin
          .from("site_settings")
          .select("value")
          .eq("key", "auto_cron_token")
          .maybeSingle();
        const expected = (row?.value as string | undefined) ?? "";

        if (!expected || token !== expected) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { runAutoSync } = await import("@/lib/auto-news.server");
        const result = await runAutoSync();
        return Response.json(result);
      },
    },
  },
});
