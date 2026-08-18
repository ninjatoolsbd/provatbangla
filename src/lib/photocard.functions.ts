import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/my-supabase/auth-middleware";

const photocardSchema = z.object({
  postId: z.string().uuid(),
  config: z.any().optional(),
});

export const generatePostPhotocard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => photocardSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    
    if (!isAdmin) {
       const { data: post } = await context.supabase.from("posts").select("author_id").eq("id", data.postId).single();
       if (post?.author_id !== context.userId) {
         throw new Error("আপনার এই নিউজটির ফটোকোর্ড জেনারেট করার অনুমতি নেই।");
       }
    }

    const { runPhotocardGeneration } = await import("@/lib/photocard.server");
    return runPhotocardGeneration(data.postId);
  });

export const uploadPhotocard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ 
    postId: z.string().uuid(),
    dataBase64: z.string(),
    config: z.any().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { uploadToR2 } = await import("@/lib/r2.server");
    
    const bytes = Buffer.from(data.dataBase64, 'base64');
    const key = `photocards/${data.postId}-${Date.now()}.png`;
    const photocardUrl = await uploadToR2(key, bytes, "image/png");

    if (!photocardUrl) {
      throw new Error("ফটোকোর্ড আপলোড ব্যর্থ হয়েছে");
    }

    // Save URL and config to database
    const { error: updateError } = await context.supabase
      .from("posts")
      .update({ 
        photocard_url: photocardUrl,
        // photocard_config: data.config // Note: We might need to add this column via migration if it doesn't exist
      } as any)
      .eq("id", data.postId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return { photocardUrl };
  });
