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
    "সবসময় শুধুমাত্র বৈধ JSON আউটপুট দেবে। কোনো ভূমিকা, উপসংহার বা মার্কডাউন (যেমন ```json) ব্যবহার করবে না।",
    "অত্যন্ত গুরুত্বপূর্ণ: টেক্সটের ভেতর কোনো নতুন লাইন (Enter) ব্যবহার করবে না। প্রতিটি ফিল্ডের ভ্যালু অবশ্যই এক লাইনে হতে হবে। নতুন লাইনের প্রয়োজন হলে '\\n' (ব্যাকস্ল্যাশ এন) ব্যবহার করো।",
    "টেক্সটের ভেতরে ডাবল কোট (\") ব্যবহারের বদলে সিঙ্গেল কোট (') ব্যবহার করো।",
  ].join(" ");

  const prompt = [
    "নিচের নির্দেশনা অনুযায়ী একটি সম্পূর্ণ বাংলা সংবাদ প্রতিবেদন লেখো।",
    "নিয়ম:",
    "- ভাষা বাংলা, সাবলীল ও পেশাদার।",
    `- ${toneHint[data.tone]}।`,
    "- নিউজের দৈর্ঘ্য কমপক্ষে ৪০০-৫০০ শব্দ হতে হবে।",
    "- content-এ ৭-৮টি অনুচ্ছেদ থাকতে হবে। অনুচ্ছেদগুলো \\n\\n দিয়ে আলাদা করবে।",
    "- বাস্তব ব্যক্তির নামে মিথ্যা উদ্ধৃতি দিও না।",
    "- seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- image_prompt হবে ইংরেজিতে, খবরটির উপযোগী একটি বাস্তবধর্মী ছবির বর্ণনা।",
    "",
    "JSON ফরম্যাটে উত্তর দাও (Strict JSON):",
    '{"title":"শিরোনাম","kicker":"কিউয়ার্ড","excerpt":"সংক্ষিপ্ত সারসংক্ষেপ","content":"মূল খবর এখানে...","seo_title":"SEO শিরোনাম","seo_description":"SEO মেটা ডেসক্রিপশন","image_prompt":"English image prompt"}',
    "",
    `বিভাগ: ${data.category}`,
    `নিউজ প্রম্পট/টাইটেল: ${data.prompt}`,
    data.details ? `অতিরিক্ত তথ্য:\n${data.details}` : "",
    referenceContent,
  ]
    .filter(Boolean)
    .join("\n");

  const { text, provider } = await generateTextWithFallback({
    system,
    prompt,
    json: false, // Set to false to prevent the internal provider from trying to parse complex JSON
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

  // Final sanitization: Remove literal control characters that break JSON.parse
  cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
    if (c === '\n') return '\\n';
    if (c === '\r') return '\\r';
    if (c === '\t') return '\\t';
    return '';
  });

  let parsed: z.infer<typeof Article>;
  try {
    const rawJson = JSON.parse(cleanedText);
    parsed = Article.parse(rawJson);
  } catch (e) {
    console.error("Manual JSON Parse Error:", e, "Cleaned Text:", cleanedText);
    throw new Error(`AI সঠিক ফরম্যাটে উত্তর দেয়নি। আবার চেষ্টা করুন। (Error: ${e instanceof Error ? e.message : String(e)})`);
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
