import { supabaseAdmin } from "./src/integrations/my-supabase/client.server";
import { regeneratePostImage } from "./src/lib/post-image.functions";

async function run() {
  try {
    const result = await (regeneratePostImage as any).handler({ 
      data: { postId: "e296a15b-fbf1-4351-8340-5e0014240956" },
      context: { supabase: supabaseAdmin }
    });
    console.log("Success:", result);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
