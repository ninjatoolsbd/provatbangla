import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateTextWithFallback } from "./ai-providers.server";
import { categories } from "./news-data";

export const suggestCategory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => 
    z.object({ 
      title: z.string(), 
      content: z.string() 
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const system = "তুমি একজন অভিজ্ঞ সংবাদ সম্পাদক। প্রদত্ত সংবাদের শিরোনাম ও বিষয়বস্তু বিশ্লেষণ করে সবচেয়ে উপযুক্ত ক্যাটাগরি নির্বাচন করো।";
    const prompt = `নিচের সংবাদটি পড়ো এবং প্রদত্ত ক্যাটাগরি তালিকা থেকে সবচেয়ে সঠিক ক্যাটাগরিটির 'slug' প্রদান করো। শুধুমাত্র slug টি উত্তর হিসেবে দাও, অন্য কিছু নয়।

শিরোনাম: ${data.title}
বিষয়বস্তু: ${data.content.slice(0, 1000)}

ক্যাটাগরি তালিকা (নাম - slug):
${categories.map(c => `${c.name} - ${c.slug}`).join('\n')}

সঠিক ক্যাটাগরি slug:`;

    const { text } = await generateTextWithFallback({
      system,
      prompt,
      preferred: "gemini"
    });

    const suggestion = text.trim().toLowerCase();
    // Validate that the suggested slug exists
    const validCategory = categories.find(c => c.slug === suggestion);
    
    return { 
      suggestedSlug: validCategory ? validCategory.slug : 'bangladesh',
      suggestedName: validCategory ? validCategory.name : 'বাংলাদেশ'
    };
  });
