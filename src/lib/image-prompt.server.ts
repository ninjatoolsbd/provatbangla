/**
 * নিউজের টাইটেল ও বিবরণ থেকে AI দিয়ে একটি নির্ভুল, প্রাসঙ্গিক ইংরেজি ইমেজ প্রম্পট বানায়।
 * Flux/Pollinations বাংলা বোঝে না, তাই প্রথমে বিষয়বস্তু ইংরেজিতে ভিজ্যুয়াল বর্ণনায় রূপান্তর করা হয়।
 */

import { generateTextWithFallback } from "./ai-providers.server";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** AI ছাড়া (fallback) সহজ প্রম্পট। */
function basicPrompt(title: string, description: string) {
  return [
    `News scene depicting: ${stripHtml(title)}.`,
    stripHtml(description).slice(0, 400),
    "Bangladesh context, real people and real location matching the story.",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * শিরোনাম + বিবরণ বিশ্লেষণ করে ছবির জন্য বিস্তারিত ইংরেজি দৃশ্য-বর্ণনা তৈরি করে।
 * hint দেওয়া থাকলে (যেমন AI-এর দেওয়া image_prompt) সেটিও প্রসঙ্গ হিসেবে ব্যবহার হয়।
 */
export async function buildRelevantImagePrompt(input: {
  title: string;
  description?: string;
  hint?: string;
}): Promise<string> {
  const title = stripHtml(input.title || "");
  const description = stripHtml(input.description || "").slice(0, 1500);
  const hint = stripHtml(input.hint || "").slice(0, 300);

  const system =
    "You are a photo editor for a Bangladeshi newspaper. You convert Bangla news text into a single, " +
    "concrete English photo brief. Reply with ONE plain sentence-group only, no JSON, no quotes, no lists, " +
    "no explanation. Never invent a different topic than the news given.";

  const prompt = [
    "Read this Bangla news and describe the single most representative real-life photograph for it.",
    "Rules:",
    "- Name the concrete subject, action, place and time of day implied by the news.",
    "- Mention people's appearance/clothing and the environment as they would truly look in Bangladesh.",
    "- Stay strictly on-topic: the photo must match the headline and body, not a generic newsroom scene.",
    "- Output English only, 40-70 words, one paragraph.",
    "- Do not include any text, letters, signboards, logos or watermarks in the described scene.",
    "",
    `Headline (Bangla): ${title}`,
    description ? `Body (Bangla): ${description}` : "",
    hint ? `Editor hint: ${hint}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { text } = await generateTextWithFallback({ system, prompt });
    const scene = stripHtml(text)
      .replace(/^```[a-z]*|```$/gi, "")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .slice(0, 900);
    if (scene.length > 40) return scene;
  } catch (e) {
    console.error("image prompt build failed:", e);
  }

  return hint && hint.length > 40 ? hint : basicPrompt(title, description);
}
