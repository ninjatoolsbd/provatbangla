import { generateTextWithFallback } from "./ai-providers.server";

/**
 * Builds a visual description for AI image generation based on news context.
 * Focuses on accuracy and specific Bangladeshi elements.
 */
export async function buildRelevantImagePrompt(args: { 
  title: string; 
  description: string;
  hint?: string;
}): Promise<string> {
  const system = `You are a professional photojournalist. 
Your task is to describe a single, high-impact photograph that perfectly represents the provided news headline and details.
The description MUST focus on the actual subject (person, event, or object) mentioned in the headline.

Rules:
1. Subject Accuracy: If the news is about a specific person (e.g. Ronaldo, a politician), describe that person or a clear symbol of them.
2. Bangladeshi Context: Unless the story is international, assume the setting is Bangladesh. Describe authentic clothing (Saree, Lungi, Panjabi), rickshaws, local architecture, and Bangladeshi facial features.
3. No Text: Do not include any words, signs, or logos in the description.
4. Professional Style: Use terms like "35mm lens", "f/2.8", "editorial photography", "natural lighting", "press photo".
5. Concise: Write the description in English, max 60 words.

Headline: ${args.title}
Details: ${args.description.slice(0, 500)}
${args.hint ? `Image Idea: ${args.hint}` : ""}

Describe the photo:`;

  try {
    const result = await generateTextWithFallback({
      system: "You generate English image prompts for AI image generators.",
      prompt: system,
      json: false,
      preferred: "gemini"
    });
    return result.text;
  } catch (e) {
    console.error("Failed to generate image prompt:", e);
    return args.title; // Fallback to title if AI fails
  }
}
