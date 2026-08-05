import { supabaseAdmin } from "./src/integrations/my-supabase/client.server";
import { generateNewsImage } from "./src/lib/news-image.server";

async function run() {
  try {
    const postId = "e296a15b-fbf1-4351-8340-5e0014240956";
    const { data: post } = await supabaseAdmin.from("posts").select("*").eq("id", postId).single();
    if (!post) return console.log("Post not found");
    
    // Manual trigger of the new logic
    const { generateTextWithFallback } = await import("./src/lib/ai-providers.server");
    const body = `${post.excerpt ?? ""} ${post.content ?? ""}`.replace(/<[^>]+>/g, " ");
    
    const system = "You are a professional photo editor for a Bangladeshi news agency. Your task is to describe a specific, realistic, and highly relevant news photograph in English based on a Bengali article.";
    const prompt = `Analyze this news article and describe one single, powerful, photorealistic news image that perfectly illustrates the main event.\n\nHeadline: ${post.title}\nBody Snippet: ${body.slice(0, 1000)}`;
    
    const { text: visualPrompt } = await generateTextWithFallback({ system, prompt });
    console.log("Visual Prompt:", visualPrompt);
    
    const imageUrl = await generateNewsImage(visualPrompt);
    console.log("Image URL:", imageUrl);
    
    if (imageUrl) {
      await supabaseAdmin.from("posts").update({ image_url: imageUrl }).eq("id", postId);
      console.log("Updated DB");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
