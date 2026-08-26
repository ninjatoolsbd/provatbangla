import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireCloudAuth } from "@/lib/cloud-auth.middleware";

/** Builds a prompt that describes the actual subject of the article. */
function buildPrompt(title: string, body: string) {
  return [
    "Create a photorealistic press photograph for a Bangladeshi newspaper article.",
    "The photo must visually depict the real subject of this news story.",
    "",
    `Headline (Bangla): ${title}`,
    `Story details (Bangla): ${body.slice(0, 700)}`,
    "",
    "Requirements: real-life documentary news photography in Bangladesh, authentic local people,",
    "clothing, architecture and environment matching the story; natural light; 35mm editorial look;",
    "sharp focus; wide 16:9 framing.",
    "Absolutely no readable text anywhere: no signboards, banners, posters, captions, logos or watermarks.",
    "No collage, no illustration, no text overlay.",
  ].join("\n");
}

/** Regenerates a topic-relevant AI image for one post and saves it. */
export const regeneratePostImage = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((input: unknown) => z.object({ postId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: post, error } = await context.supabase
      .from("posts")
      .select("id,title,excerpt,content")
      .eq("id", data.postId)
      .single();
    if (error || !post) throw new Error(error?.message ?? "নিউজ পাওয়া যায়নি।");

    const { generateNewsImage } = await import("@/lib/news-image.server");
    const { buildRelevantImagePrompt } = await import("@/lib/image-prompt.server");
    const body = `${post.excerpt ?? ""} ${post.content ?? ""}`.replace(/<[^>]+>/g, " ");
    const scene = await buildRelevantImagePrompt({ title: post.title, description: body });
    const imageUrl = await generateNewsImage(buildPrompt(post.title, scene));
    if (!imageUrl) throw new Error("ছবি বানানো যায়নি — AI ক্রেডিট/কোটা শেষ হতে পারে।");


    const { error: upErr } = await context.supabase
      .from("posts")
      .update({ image_url: imageUrl })
      .eq("id", post.id);
    if (upErr) throw new Error(upErr.message);

    return { imageUrl };
  });
