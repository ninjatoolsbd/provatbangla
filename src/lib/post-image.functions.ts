import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/my-supabase/auth-middleware";

/** Builds a detailed visual description in English for the image generator. */
async function buildVisualPrompt(title: string, body: string) {
  const { generateTextWithFallback } = await import("@/lib/ai-providers.server");
  
  const system = "You are a professional photo editor for a Bangladeshi news agency. Your task is to describe a specific, realistic, and highly relevant news photograph in English based on a Bengali article. The description should be for an image generator (like DALL-E or Imagen).";
  
  const prompt = [
    "Analyze this news article and describe one single, powerful, photorealistic news image that perfectly illustrates the main event.",
    "",
    `Headline: ${title}`,
    `Body Snippet: ${body.slice(0, 1000)}`,
    "",
    "Instructions:",
    "1. Focus on the core subject: if it's a protest, describe protesters; if it's an accident, describe the scene; if it's a politician, describe them in a professional setting.",
    "2. Mention Bangladeshi context: authentic faces, clothing (saree, lungi, panjabi), environment (dhaka streets, rural villages, local architecture).",
    "3. Use photographic terms: 'editorial photography', 'wide angle', 'documentary style', 'natural lighting'.",
    "4. NO TEXT: Explicitly state that there should be no text, watermarks, or logos.",
    "5. Be descriptive but concise (3-4 sentences).",
    "",
    "Output ONLY the English description. No preamble.",
  ].join("\n");

  try {
    const { text } = await generateTextWithFallback({ system, prompt });
    return text;
  } catch (e) {
    console.error("Failed to generate visual prompt, using fallback logic:", e);
    return `A realistic news photograph in Bangladesh showing: ${title}`;
  }
}

/** Regenerates a topic-relevant AI image for one post and saves it. */
export const regeneratePostImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ postId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: post, error } = await context.supabase
      .from("posts")
      .select("id,title,excerpt,content")
      .eq("id", data.postId)
      .single();
    if (error || !post) throw new Error(error?.message ?? "নিউজ পাওয়া যায়নি।");

    const { generateNewsImage } = await import("@/lib/news-image.server");
    const body = `${post.excerpt ?? ""} ${post.content ?? ""}`.replace(/<[^>]+>/g, " ");
    const imageUrl = await generateNewsImage(buildPrompt(post.title, body));
    if (!imageUrl) throw new Error("ছবি বানানো যায়নি — AI ক্রেডিট/কোটা শেষ হতে পারে।");

    const { error: upErr } = await context.supabase
      .from("posts")
      .update({ image_url: imageUrl })
      .eq("id", post.id);
    if (upErr) throw new Error(upErr.message);

    return { imageUrl };
  });
