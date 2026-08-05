import { z } from "zod";

import { generateTextWithFallback, type ProviderName } from "./ai-providers.server";
import { generateNewsImage } from "./news-image.server";

export const GenerateInput = z.object({
  prompt: z.string().min(3),
  details: z.string().default(""),
  referenceUrl: z.string().optional(),
  category: z.string().default("bangladesh"),
  tone: z.enum(["news", "analysis", "short"]).default("news"),
  withImage: z.boolean().default(true),
  autoPublish: z.boolean().default(true),
  provider: z.enum(["auto", "gemini", "openrouter", "groq"]).default("auto"),
});

export type GenerateInputType = z.infer<typeof GenerateInput>;

const Article = z.object({
  title: z.string().min(1),
  kicker: z.string().default(""),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  seo_title: z.string().default(""),
  seo_description: z.string().default(""),
  image_prompt: z.string().default(""),
});

const toneHint: Record<string, string> = {
  news: "সংবাদভিত্তিক, নিরপেক্ষ ও পেশাদার রিপোর্টিং ভঙ্গি",
  analysis: "বিশ্লেষণধর্মী ও প্রেক্ষাপট ব্যাখ্যাসহ ভঙ্গি",
  short: "সংক্ষিপ্ত ও দ্রুত পাঠযোগ্য ভঙ্গি",
};

export async function runGenerate(data: GenerateInputType) {
  let referenceContent = "";
  let referenceImage: string | null = null;
  if (data.referenceUrl) {
    try {
      const { fetchArticle } = await import("./source-fetch.server");
      const article = await fetchArticle(data.referenceUrl);
      if (article.body) {
        referenceContent = `\n\nরেফারেন্স ইউআরএল থেকে সংগৃহীত তথ্য:\n${article.body.slice(0, 8000)}`;
      }
      if (article.image) {
        referenceImage = article.image;
      }
    } catch (e) {
      console.error("Failed to fetch reference URL:", e);
    }
  }

  const system = [
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক ও রিপোর্টার।",
    "সবসময় শুধুমাত্র একটি বৈধ JSON অবজেক্ট আউটপুট দেবে।",
    "অত্যন্ত গুরুত্বপূর্ণ: তোমার উত্তরে কোনো টেক্সট, ভূমিকা বা মার্কডাউন (যেমন ```json) থাকবে না। শুধুমাত্র '{' দিয়ে শুরু এবং '}' দিয়ে শেষ করবে।",
    "টেক্সটের ভেতরে যদি ডাবল কোট (\") ব্যবহারের প্রয়োজন হয়, তবে অবশ্যই সেটি এস্কেপ (\\\") করবে। উদাহরণ: \"তিনি বলেন, \\\"সবকিছু ঠিক আছে\\\"।\"",
    "আউটপুটটি অবশ্যই এমনভাবে দেবে যাতে JSON.parse সরাসরি কাজ করে।",
  ].join(" ");

  const prompt = [
    "নিচের নির্দেশনা অনুযায়ী একটি সম্পূর্ণ বাংলা সংবাদ প্রতিবেদন লেখো এবং JSON ফরম্যাটে উত্তর দাও:",
    "",
    "JSON Structure:",
    "{",
    '  "title": "নিখুঁত ও আকর্ষণীয় শিরোনাম",',
    '  "kicker": "ছোট কিউয়ার্ড (যেমন: রাজনীতি, খেলা)",',
    '  "excerpt": "খবরের একটি ছোট সারাংশ",',
    '  "content": "বিস্তারিত খবর (কমপক্ষে ৫০০ শব্দ)। অনুচ্ছেদগুলো \\n\\n দিয়ে আলাদা করো।",',
    '  "seo_title": "SEO টাইটেল (৬০ অক্ষর)",',
    '  "seo_description": "SEO ডেসক্রিপশন (১৫০ অক্ষর)",',
    '  "image_prompt": "English description for an image relevant to this news"',
    "}",
    "",
    "শর্তাবলী:",
    `- ভঙ্গি: ${toneHint[data.tone]}।`,
    "- ভাষা: শুদ্ধ ও পেশাদার বাংলা।",
    "- কোনো প্রকার অতিরিক্ত কথা বা ফরম্যাটিং ছাড়া সরাসরি JSON দাও।",
    "",
    `বিভাগ: ${data.category}`,
    `নিউজ প্রম্পট/টাইটেল: ${data.prompt}`,
    data.details ? `অতিরিক্ত তথ্য: ${data.details}` : "",
    referenceContent,
  ]
    .filter(Boolean)
    .join("\n");

  const { text, provider } = await generateTextWithFallback({
    system,
    prompt,
    json: true, // Use provider's JSON handling if possible
    preferred: data.provider as any,
  });

  // Manual cleaning of common AI formatting errors before parsing
  let cleanedText = text.trim();
  // Remove markdown code blocks if present
  cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
  // Find the first { and last } to isolate JSON
  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
  }

  // Advanced sanitization for JSON
  function sanitizeForJson(str: string) {
    // 1. Remove control characters (except common ones handled below)
    let s = str.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
    
    // 2. Fix unescaped backslashes (but not already escaped ones)
    // This is tricky, usually it's easier to let the AI try to handle it or use a library
    // But for common news text, newlines are the main issue.
    return s;
  }

  cleanedText = sanitizeForJson(cleanedText);

  let parsed: z.infer<typeof Article>;
  try {
    const rawJson = JSON.parse(cleanedText);
    parsed = Article.parse(rawJson);
  } catch (e) {
    console.error("Manual JSON Parse Error:", e, "Cleaned Text:", cleanedText);
    // If double quotes inside values were the issue, try a desperate regex fix for common structures
    try {
      // Look for keys and try to wrap values more strictly? Risky.
      // Better to just report the error and suggest a retry.
      throw e;
    } catch {
      throw new Error(`AI সঠিক ফরম্যাটে উত্তর দেয়নি (JSON Parse Error)। আবার চেষ্টা করুন। বিস্তারিত: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  let imageUrl: string | null = null;
  if (data.withImage) {
    const imagePrompt = referenceImage 
    ? `Reference Image Context: This is a photo from the original source. Create a new, similar, high-quality professional news version of this scene: ${parsed.image_prompt}`
    : parsed.image_prompt;
    
    imageUrl = await generateNewsImage(imagePrompt || parsed.title);
  }

  return { article: parsed, imageUrl, provider };
}
