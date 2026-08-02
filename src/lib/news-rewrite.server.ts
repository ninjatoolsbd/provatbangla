import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const RewriteInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().default("jatiyo"),
  tone: z.enum(["news", "analysis", "short"]).default("news"),
  variants: z.number().int().min(1).max(3).default(1),
});

export const RewriteSchema = z.object({
  versions: z.array(
    z.object({
      label: z.string(),
      title: z.string(),
      excerpt: z.string(),
      content: z.string(),
      seo_title: z.string(),
      seo_description: z.string(),
    }),
  ),
});

export type RewriteResult = z.infer<typeof RewriteSchema>;

const toneHint: Record<string, string> = {
  news: "সংবাদভিত্তিক, নিরপেক্ষ ও পেশাদার রিপোর্টিং ভঙ্গি",
  analysis: "বিশ্লেষণধর্মী ও প্রেক্ষাপট ব্যাখ্যাসহ ভঙ্গি",
  short: "সংক্ষিপ্ত ও দ্রুত পাঠযোগ্য ভঙ্গি",
};

export async function runRewrite(data: z.infer<typeof RewriteInput>): Promise<RewriteResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI কনফিগারেশন পাওয়া যায়নি।");

  const gateway = createLovableAiGatewayProvider(key);

  const prompt = [
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক। নিচের খবরটি সম্পূর্ণ নতুন করে লিখো।",
    "নিয়ম:",
    "- ভাষা অবশ্যই বাংলা, সাবলীল ও পেশাদার সাংবাদিকতার মান অনুযায়ী।",
    "- মূল তথ্য, সংখ্যা, নাম ও উদ্ধৃতি অপরিবর্তিত রাখো; নতুন তথ্য বানিয়ো না।",
    `- ${toneHint[data.tone]}।`,
    "- SEO-বান্ধব করো: শিরোনামে মূল কীওয়ার্ড থাকবে, seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- excerpt হবে ২-৩ বাক্যের সারসংক্ষেপ।",
    "- content-এ অনুচ্ছেদগুলো ফাঁকা লাইন দিয়ে আলাদা করো, কোনো মার্কডাউন চিহ্ন ব্যবহার করো না।",
    `- ঠিক ${data.variants}টি আলাদা ভার্সন দাও, প্রতিটির label আলাদা (যেমন "ভার্সন ১")।`,
    "",
    `বিভাগ: ${data.category}`,
    `মূল শিরোনাম: ${data.title}`,
    "মূল কনটেন্ট:",
    data.content,
  ].join("\n");

  try {
    const { output } = await generateText({
      model: gateway("google/gemini-3.5-flash"),
      output: Output.object({ schema: RewriteSchema }),
      prompt,
    });
    return { versions: output.versions.slice(0, data.variants) };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("AI রিরাইট সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।");
    }
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429")) throw new Error("অনেক বেশি অনুরোধ — একটু পরে চেষ্টা করুন।");
    if (message.includes("402"))
      throw new Error("AI ক্রেডিট শেষ — Cloud সেটিংসে ক্রেডিট যোগ করুন।");
    throw new Error(message);
  }
}
