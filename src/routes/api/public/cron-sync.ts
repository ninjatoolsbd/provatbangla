import { createFileRoute } from "@tanstack/react-router";

/**
 * দিনে একবার (বা যেকোনো সময়) কল করলে সোর্স সাইট থেকে নতুন নিউজ এনে রিরাইট করে সাইটে বসায়।
 * কল: /api/public/cron-sync?token=<auto_cron_token>
 * ড্রাই-রান (কিছু সেভ হবে না, শুধু প্রিভিউ): &dry=1
 */
export const Route = createFileRoute("/api/public/cron-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const dryRun = ["1", "true", "yes"].includes(
          (url.searchParams.get("dry") ?? url.searchParams.get("dryRun") ?? "").toLowerCase(),
        );
        const { adminCloud: supabaseAdmin } = await import("@/lib/admin-cloud-client.server");
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
        
        // Update the last_run_at setting for visibility
        await admin.from("site_settings").upsert(
          { key: "auto_last_cron_run", value: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

        // Cloudflare Worker-এ এক কলে সীমিত সংখ্যক সাবরিকোয়েস্ট চলে, তাই ক্রন প্রতিটি সোর্সের জন্য
        // আলাদা কল করে (&source=<id>&limit=1) — প্রতি কলে একটি করে খবর।
        const sourceId = url.searchParams.get("source") || undefined;
        const limitRaw = Number(url.searchParams.get("limit") || "");
        const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 5) : undefined;

        if (sourceId) {
          const { data: enabledRow } = await admin
            .from("site_settings")
            .select("value")
            .eq("key", "auto_enabled")
            .maybeSingle();
          if (enabledRow?.value === "false") {
            return Response.json({ created: 0, skipped: 0, failed: 0, details: [{ title: "অটোমেশন", status: "disabled" }] });
          }
        }

        const { runAutoSync } = await import("@/lib/auto-news.server");
        const result = await runAutoSync({
          ...(dryRun ? { dryRun: true } : {}),
          ...(sourceId ? { sourceId } : {}),
          ...(limit ? { limit } : {}),
        });
        return Response.json(result);
      },
    },
  },
});
