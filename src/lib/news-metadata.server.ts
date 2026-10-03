import { z } from "zod";
import { generateTextWithFallback } from "./ai-providers.server";
import { categories } from "./news-data";

export const MetadataSchema = z.object({
  excerpt: z.string(),
  title: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  category: z.string(),
});

export type MetadataResult = z.infer<typeof MetadataSchema>;

function plain(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function runGenerateMetadata(input: { title: string; content: string }): Promise<MetadataResult> {
  const data = { title: input.title.trim(), content: plain(input.content) };
  const fallbackTitle = data.title || data.content.split(/[।.!?]/)[0]!.slice(0, 80);
  const system = [
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক ও SEO বিশেষজ্ঞ।",
    "সবসময় শুধুমাত্র একটি বৈধ JSON অবজেক্ট আউটপুট দেবে।",
    "কোনো অতিরিক্ত কথা বা মার্কডাউন ছাড়াই শুধু JSON ব্লকটি দাও।",
  ].join(" ");

  const prompt = [
    "নিচের সংবাদের শিরোনাম ও মূল বিষয়বস্তু বিশ্লেষণ করে একটি আকর্ষণীয় সারসংক্ষেপ (excerpt), SEO টাইটেল, SEO ডেসক্রিপশন এবং সবচেয়ে উপযুক্ত ক্যাটাগরি প্রদান করো।",
    "",
    "JSON Structure:",
    "{",
    '  "title": "খবরের আকর্ষণীয় বাংলা শিরোনাম (শিরোনাম দেওয়া থাকলে সেটাই রাখো)",',
    '  "excerpt": "খবরের ২-৩ বাক্যের একটি ছোট সারাংশ",',
    '  "seo_title": "SEO বান্ধব টাইটেল (৬০ অক্ষরের মধ্যে)",',
    '  "seo_description": "SEO বান্ধব ডেসক্রিপশন (১৫০ অক্ষরের মধ্যে)",',
    '  "category": "প্রদত্ত ক্যাটাগরি তালিকা থেকে সবচেয়ে সঠিক slug টি দাও"',
    "}",
    "",
    "ক্যাটাগরি তালিকা (নাম - slug):",
    categories.map(c => `${c.name} - ${c.slug}`).join('\n'),
    "",
    `শিরোনাম: ${data.title || "(দেওয়া নেই — তুমি তৈরি করো)"}`,
    `মূল বিষয়বস্তু: ${data.content.slice(0, 2000)}`,
  ].join("\n");

  let text = "";
  try {
    ({ text } = await generateTextWithFallback({ system, prompt, json: true, preferred: "gemini" }));
  } catch (e) {
    console.error("Metadata AI error:", e);
  }

  try {
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanedText);
    
    // Ensure the category slug is valid
    const validCategory = categories.find(c => c.slug === parsed.category);
    
    return {
      excerpt: parsed.excerpt || "",
      title: data.title || parsed.title || fallbackTitle,
      seo_title: parsed.seo_title || (data.title || parsed.title || fallbackTitle).slice(0, 60),
      seo_description: parsed.seo_description || data.content.slice(0, 150),
      category: validCategory ? validCategory.slug : 'bangladesh',
    };
  } catch (e) {
    console.error("Metadata Generation JSON Parse Error:", e);
    return {
      excerpt: data.content.slice(0, 150),
      title: fallbackTitle,
      seo_title: fallbackTitle.slice(0, 60),
      seo_description: data.content.slice(0, 150),
      category: 'bangladesh',
    };
  }
}
