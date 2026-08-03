import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/my-supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(context: any) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("শুধু অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।");
}


export const runAutoImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sourceId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { runAutoSync } = await import("@/lib/auto-news.server");
    return runAutoSync({
      ...(data.sourceId ? { sourceId: data.sourceId } : {}),
      ...(data.limit ? { limit: data.limit } : {}),
    });
  });

export const previewSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ siteUrl: z.string().url(), limit: z.number().int().min(1).max(20).default(5) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { discoverLatest } = await import("@/lib/source-fetch.server");
    return discoverLatest(data.siteUrl, data.limit);
  });
