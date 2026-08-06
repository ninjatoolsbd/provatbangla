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
    "100% realistic photography, real Bangladeshi people with local features, Bangladeshi location background.",
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
    "You are a professional visual journalist and photo editor for a top news portal. " +
    "Your job is to translate complex Bangla news into a high-impact, realistic photo prompt for AI image generators (like Flux). " +
    "You must ensure the prompt describes a scene that is 100% relevant to the news facts, focusing on a single, powerful visual moment. " +
    "If the news is about a global celebrity or specific event, prioritize accurate representation of that subject over generic location details. " +
    "The output must be in English.";

  const prompt = [
    "Task: Create a detailed English photo brief from the following Bangla news.",
    "",
    "Mandatory Rules for High Relevance & Cultural Accuracy:",
    "1. FOCUS ON NEWS FACTS: If the news is about a specific person (e.g., Ronaldo, Messi, local politician), the photo MUST focus on that specific person in a relevant context. DO NOT replace them with generic people unless they are just part of a crowd.",
    "2. HUMAN REPRESENTATION: All people must look realistic. If the news is local to Bangladesh, use Bangladeshi features. If it is global news, use appropriate ethnic features for the subjects mentioned.",
    "3. CONTEXTUAL SETTING: Ground the image in the specific location mentioned in the news (e.g., a stadium for sports, a specific city street, a government building).",
    "4. NO GENERIC AI STYLE: Avoid 'fantasy' or 'dreamy' looks. Specify 'editorial news photography, candid, sharp focus, real lighting'.",
    "5. NO TEXT: Explicitly state 'no text, no letters, no signboards, no watermarks, no logos'.",
    "6. SINGLE SENTENCE: Output ONE descriptive paragraph in English (50-80 words). No JSON, no extra chatter.",
    "",
    `Headline (Bangla): ${title}`,
    description ? `Body (Bangla): ${description}` : "",
    hint ? `User/Editor Instruction: ${hint}` : "",
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
