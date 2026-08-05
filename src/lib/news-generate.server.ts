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
    "সবসময় শুধুমাত্র বৈধ JSON আউটপুট দেবে, কোনো ব্যাখ্যা বা মার্কডাউন ছাড়া।",
  ].join(" ");

  const prompt = [
    "নিচের নির্দেশনা অনুযায়ী একটি সম্পূর্ণ বাংলা সংবাদ প্রতিবেদন লেখো।",
    "নিয়ম:",
    "- ভাষা বাংলা, সাবলীল ও পেশাদার।",
    `- ${toneHint[data.tone]}।`,
    "- content-এ কমপক্ষে ৪টি অনুচ্ছেদ থাকতে হবে, প্রতিটি ফাঁকা লাইন দিয়ে আলাদা, কোনো মার্কডাউন নয়।",
    "- নিউজের দৈর্ঘ্য কমপক্ষে ১৫০ শব্দ হতে হবে।",
    "- ইন্টারনেট থেকে সংগৃহীত তথ্য (যদি থাকে) ব্যবহার করে বিস্তারিত প্রতিবেদন তৈরি করো।",
    "- বাস্তব ব্যক্তির নামে মিথ্যা উদ্ধৃতি দিও না।",
    "- seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- image_prompt হবে ইংরেজিতে, খবরটির উপযোগী একটি অত্যন্ত বাস্তবধর্মী ও প্রাসঙ্গিক (Highly Relevant) ছবির বর্ণনা। ছবির বর্ণনায় নিউজের মূল বিষয়বস্তু, স্থান এবং পরিবেশ ফুটিয়ে তুলতে হবে যাতে সেটি ২০০% প্রাসঙ্গিক হয়।",
    "",
    "শুধু এই JSON কাঠামোয় উত্তর দাও:",
    '{"title":"","kicker":"","excerpt":"","content":"","seo_title":"","seo_description":"","image_prompt":""}',
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
    json: true,
    preferred: data.provider as any,
  });

  let parsed: z.infer<typeof Article>;
  try {
    parsed = Article.parse(JSON.parse(text));
  } catch {
    throw new Error("AI সঠিক ফরম্যাটে উত্তর দেয়নি, আবার চেষ্টা করুন।");
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
