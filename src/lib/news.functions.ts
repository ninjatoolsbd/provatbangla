import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const rewriteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().default("jatiyo"),
        tone: z.enum(["news", "analysis", "short"]).default("news"),
        variants: z.number().int().min(1).max(3).default(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("শুধু অ্যাডমিন এই সুবিধা ব্যবহার করতে পারবেন।");

    const { runRewrite } = await import("@/lib/news-rewrite.server");
    return runRewrite(data);
  });
