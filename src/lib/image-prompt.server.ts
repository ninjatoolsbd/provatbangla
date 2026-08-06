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
  const system = `You are an expert Visual Prompt Engineer for AI image generators (like Flux and Midjourney).
Your goal is to translate a Bengali news headline and its details into a highly specific, photorealistic English visual prompt.

STRICT ACCURACY RULES:
1. SUBJECT MATCHING: If the news is about a SPECIFIC person (e.g., Cristiano Ronaldo, Messi, Sheikh Hasina), the prompt MUST focus on them. 
2. OBJECT MATCHING: If the news is about a product (e.g., Sulfur, Gold, Rice, Petrol), the prompt MUST focus on that commodity. For example, if sulfur prices increase, show yellow sulfur powder/crystals in a professional industrial/market setting. 
3. NO GENERIC FACES: Do NOT generate images of random people (especially random women) unless the news is specifically about a woman. For market news, show the market or products.
4. CONTEXTUAL REALISM:
   - BANGLADESHI SUBJECTS: Use Bangladeshi features, local attire (Saree, Lungi, Panjabi), and Dhaka-style backgrounds.
   - INTERNATIONAL SUBJECTS: Use their natural professional setting (press conferences, tech offices, sports fields) WITHOUT Bangladeshi elements.
5. STYLE: "Photorealistic editorial news photography". 
   - 35mm lens, f/2.8, sharp focus, natural lighting.
   - NO TEXT, NO LOGOS, NO SIGNAGE, NO WATERMARKS.
   - NO GLITCHES or digital artifacts.

Headline: ${args.title}
Details: ${args.description.slice(0, 500)}
${args.hint ? `User Hint: ${args.hint}` : ""}

Output ONLY the English visual prompt. No preamble. No quotes.`;

  try {
    const result = await generateTextWithFallback({
      system: "You generate precise, photorealistic image prompts for AI based on news context.",
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
