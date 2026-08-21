import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const photocardSchema = z.object({
  postId: z.string().uuid(),
});

export const generatePostPhotocard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => photocardSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    
    // Also allow moderators or authors to generate their own? 
    // For now, let's keep it restricted as per previous patterns or broad if needed.
    // The user said "admin panel", so admin check is safe.
    if (!isAdmin) {
       // Check if author
       const { data: post } = await context.supabase.from("posts").select("author_id").eq("id", data.postId).single();
       if (post?.author_id !== context.userId) {
         throw new Error("আপনার এই নিউজটির ফটোকোর্ড জেনারেট করার অনুমতি নেই।");
       }
    }

    const { runPhotocardGeneration } = await import("@/lib/photocard.server");
    return runPhotocardGeneration(data.postId);
  });
