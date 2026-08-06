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
    "অত্যন্ত গুরুত্বপূর্ণ: টেক্সটের ভেতর কোনো বাস্তব নতুন লাইন (actual newline character) ব্যবহার করবে না। প্রতিটি ফিল্ডের ভ্যালু অবশ্যই এক লাইনে হতে হবে। নতুন লাইনের প্রয়োজন হলে '\\n' (ব্যাকস্ল্যাশ এন) ব্যবহার করো।",
    "কোটেশন চিহ্নের ভেতরে ডাবল কোট (\") ব্যবহারের বদলে সিঙ্গেল কোট (') ব্যবহার করো।",
    "আউটপুটটি অবশ্যই এমনভাবে দেবে যাতে JSON.parse সরাসরি কাজ করে। কোনো অতিরিক্ত টেক্সট বা মার্কডাউন ছাড়াই শুধু JSON ব্লকটি দাও।",
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
    '  "image_prompt": "English description for an image relevant to this news. Must describe the specific subject and context accurately." ',
    "}",
    "",
    "শর্তাবলী:",
    `- ভঙ্গি: ${toneHint[data.tone]}।`,
    "- ভাষা: শুদ্ধ ও পেশাদার বাংলা।",
    "- কোনো প্রকার অতিরিক্ত কথা বা ফরম্যাটিং ছাড়া সরাসরি JSON দাও।",
    "- কন্টেন্ট অবশ্যই কমপক্ষে ৫০০ শব্দের হবে। প্রতিটি তথ্য ও বিবরণ বিস্তারিতভাবে বর্ণনা করো।",
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

  // Strict cleaning for JSON
  function strictClean(str: string) {
    let s = str.trim();
    // Remove invisible control characters except \n, \r, \t
    s = s.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
    
    // Fix common AI JSON errors: literal newlines inside values
    // This is the most common cause of "Unterminated string"
    // We look for content between double quotes and replace real newlines with \n
    s = s.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
      return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    });

    return s;
  }

  cleanedText = strictClean(cleanedText);

  let parsed: z.infer<typeof Article>;
  try {
    const rawJson = JSON.parse(cleanedText);
    parsed = Article.parse(rawJson);
  } catch (e) {
    console.error("Manual JSON Parse Error:", e, "Cleaned Text Sample:", cleanedText.slice(0, 500));
    // Fallback attempt: extract properties using regex if JSON parse fails
    try {
      const regexExtract = (key: string) => {
        const match = cleanedText.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
        return match ? match[1] : "";
      };
      
      const title = regexExtract("title");
      const content = regexExtract("content");
      
      if (title && content) {
        parsed = {
          title,
          kicker: regexExtract("kicker") || "খবর",
          excerpt: regexExtract("excerpt") || content.slice(0, 200),
          content: content.replace(/\\n/g, "\n"),
          seo_title: regexExtract("seo_title") || title,
          seo_description: regexExtract("seo_description") || content.slice(0, 150),
          image_prompt: regexExtract("image_prompt") || title,
        };
      } else {
        throw e;
      }
    } catch (fallbackError) {
      throw new Error(`AI সঠিক ফরম্যাটে উত্তর দেয়নি (JSON Parse Error)। আবার চেষ্টা করুন। বিস্তারিত: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  let imageUrl: string | null = null;
  if (data.withImage) {
    const { buildRelevantImagePrompt } = await import("./image-prompt.server");
    const scene = await buildRelevantImagePrompt({
      title: parsed.title,
      description: `${parsed.excerpt} ${parsed.content}`,
      hint: parsed.image_prompt,
    });
    const imagePrompt = referenceImage
      ? `${scene} Recreate this real news scene as an original press photograph (do not copy any existing photo).`
      : scene;

    imageUrl = await generateNewsImage(imagePrompt || parsed.title);
  }


  return { article: parsed, imageUrl, provider };
}
