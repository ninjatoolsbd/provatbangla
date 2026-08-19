import { z } from "zod";
import { generateTextWithFallback } from "./ai-providers.server";
import { categories } from "./news-data";

export const MetadataSchema = z.object({
  excerpt: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  category: z.string(),
});

export type MetadataResult = z.infer<typeof MetadataSchema>;

export async function runGenerateMetadata(data: { title: string; content: string }): Promise<MetadataResult> {
  const cleanContent = data.content.replace(/<[^>]*>?/gm, '').trim();

  const system = [
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক ও SEO বিশেষজ্ঞ।",
    "সবসময় শুধুমাত্র একটি বৈধ JSON অবজেক্ট আউটপুট দেবে।",
    "অত্যন্ত গুরুত্বপূর্ণ: টেক্সটের ভেতর কোনো বাস্তব নতুন লাইন (actual newline character) ব্যবহার করবে না। প্রতিটি ফিল্ডের ভ্যালু অবশ্যই এক লাইনে হতে হবে। নতুন লাইনের প্রয়োজন হলে '\\n' (ব্যাকস্ল্যাশ এন) ব্যবহার করো।",
    "কোটেশন চিহ্নের ভেতরে ডাবল কোট (\") ব্যবহারের বদলে সিঙ্গেল কোট (') ব্যবহার করো।",
    "আউটপুটটি অবশ্যই এমনভাবে দেবে যাতে JSON.parse সরাসরি কাজ করে। কোনো অতিরিক্ত টেক্সট বা মার্কডাউন ছাড়াই শুধু JSON ব্লকটি দাও।",
  ].join(" ");

  const prompt = [
    "নিচের সংবাদের শিরোনাম ও মূল বিষয়বস্তু বিশ্লেষণ করে একটি আকর্ষণীয় সারসংক্ষেপ (excerpt), SEO টাইটেল, SEO ডেসক্রিপশন এবং সবচেয়ে উপযুক্ত ক্যাটাগরি প্রদান করো।",
    "",
    "JSON Structure:",
    "{",
    '  "excerpt": "খবরের ২-৩ বাক্যের একটি ছোট সারাংশ",',
    '  "seo_title": "SEO বান্ধব টাইটেল (৬০ অক্ষরের মধ্যে)",',
    '  "seo_description": "SEO বান্ধব ডেসক্রিপশন (১৫০ অক্ষরের মধ্যে)",',
    '  "category": "প্রদত্ত ক্যাটাগরি তালিকা থেকে সবচেয়ে সঠিক slug টি দাও"',
    "}",
    "",
    "ক্যাটাগরি তালিকা (নাম - slug):",
    categories.map(c => `${c.name} - ${c.slug}`).join('\n'),
    "",
    `শিরোনাম: ${data.title}`,
    `মূল বিষয়বস্তু: ${cleanContent.slice(0, 3000)}`,
  ].join("\n");

  let result: MetadataResult | null = null;
  let lastError: any = null;

  // Retry logic (2 attempts)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await generateTextWithFallback({
        system,
        prompt,
        json: true,
        preferred: "gemini"
      });

      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
      const firstBrace = cleanedText.indexOf("{");
      const lastBrace = cleanedText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanedText);
      const validCategory = categories.find(c => c.slug === parsed.category);
      
      result = {
        excerpt: parsed.excerpt || "",
        seo_title: parsed.seo_title || data.title.slice(0, 60),
        seo_description: parsed.seo_description || cleanContent.slice(0, 150),
        category: validCategory ? validCategory.slug : 'bangladesh',
      };
      
      if (result.excerpt && result.seo_title) break;
    } catch (e) {
      lastError = e;
      console.error(`Metadata Generation Attempt ${attempt + 1} failed:`, e);
    }
  }

  if (result) return result;

  // Final fallback (Local derivation)
  console.warn("AI metadata generation failed completely, using local fallback.");
  return {
    excerpt: cleanContent.slice(0, 200).replace(/\n/g, ' ') + '...',
    seo_title: data.title.slice(0, 60),
    seo_description: cleanContent.slice(0, 150).replace(/\n/g, ' '),
    category: 'bangladesh',
  };
}
