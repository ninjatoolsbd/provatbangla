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

CORE PRIORITY:
1. SUBJECT MATCHING: If the news is about a SPECIFIC person (e.g., Cristiano Ronaldo, Joe Biden, Sheikh Hasina), the prompt MUST focus on them. Do NOT describe generic people if a specific celebrity or leader is mentioned.
2. CONTEXTUAL REALISM:
   - If the subject is Bangladeshi (politicians, local events): Describe Bangladeshi facial features, skin tones, local attire (Panjabi, Saree, Lungi), and authentic Bangladeshi backgrounds (Rickshaws, Dhaka streets, local offices).
   - If the subject is INTERNATIONAL (e.g., Ronaldo, Elon Musk): Describe them in their natural setting (football field, press conference, tech office) WITHOUT forced Bangladeshi elements.
3. LOGICAL RELEVANCE: Ensure the visual elements directly represent the news facts. If the news is about prices or objects, show those objects in a professional editorial setting.
4. STYLE: "Photorealistic editorial news photography". 
   - Use technical terms: "Captured on 35mm lens", "f/2.8 aperture", "natural lighting", "press photo style", "sharp focus", "high resolution".
   - NO TEXT, NO LOGOS, NO SIGNAGE.
   - NO ILLUSTRATIONS, NO CARTOONS. 100% REALISM.
   - AVOID generic "beautiful woman" or "glitchy" effects unless the news is specifically about those things.

Headline: ${args.title}
Details: ${args.description.slice(0, 500)}
${args.hint ? `User Hint: ${args.hint}` : ""}

Output ONLY the English visual prompt. No preamble.`;

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
