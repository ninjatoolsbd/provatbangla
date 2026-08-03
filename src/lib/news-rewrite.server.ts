import { z } from "zod";

import { generateTextWithFallback } from "./ai-providers.server";

export const RewriteInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().default("bangladesh"),
  tone: z.enum(["news", "analysis", "short"]).default("news"),
  variants: z.number().int().min(1).max(3).default(1),
});

export const RewriteSchema = z.object({
  versions: z.array(
    z.object({
      label: z.string().default("ভার্সন"),
      title: z.string().min(1),
      excerpt: z.string().default(""),
      content: z.string().min(1),
      seo_title: z.string().default(""),
      seo_description: z.string().default(""),
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
  const system = [
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক।",
    "সবসময় শুধুমাত্র বৈধ JSON আউটপুট দেবে, কোনো ব্যাখ্যা বা মার্কডাউন ছাড়া।",
  ].join(" ");

  const prompt = [
    "নিচের খবরটি সম্পূর্ণ নতুন করে লিখো।",
    "নিয়ম:",
    "- ভাষা অবশ্যই বাংলা, সাবলীল ও পেশাদার সাংবাদিকতার মান অনুযায়ী।",
    "- মূল তথ্য, সংখ্যা, নাম ও উদ্ধৃতি অপরিবর্তিত রাখো; নতুন তথ্য বানিয়ো না।",
    `- ${toneHint[data.tone]}।`,
    "- SEO-বান্ধব করো: seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- excerpt হবে ২-৩ বাক্যের সারসংক্ষেপ।",
    "- content-এ অনুচ্ছেদগুলো ফাঁকা লাইন দিয়ে আলাদা করো, কোনো মার্কডাউন চিহ্ন নয়।",
    `- ঠিক ${data.variants}টি আলাদা ভার্সন দাও, প্রতিটির label আলাদা (যেমন "ভার্সন ১")।`,
    "",
    "শুধু এই JSON কাঠামোয় উত্তর দাও:",
    '{"versions":[{"label":"","title":"","excerpt":"","content":"","seo_title":"","seo_description":""}]}',
    "",
    `বিভাগ: ${data.category}`,
    `মূল শিরোনাম: ${data.title}`,
    "মূল কনটেন্ট:",
    data.content,
  ].join("\n");

  const { text } = await generateTextWithFallback({ system, prompt, json: true });

  let parsed: RewriteResult;
  try {
    const raw = JSON.parse(text) as unknown;
    const normalized =
      Array.isArray(raw) ? { versions: raw } : (raw as { versions?: unknown });
    parsed = RewriteSchema.parse(normalized);
  } catch {
    throw new Error("AI সঠিক ফরম্যাটে উত্তর দেয়নি, আবার চেষ্টা করুন।");
  }

  if (parsed.versions.length === 0) {
    throw new Error("AI রিরাইট সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।");
  }

  return { versions: parsed.versions.slice(0, data.variants) };
}
