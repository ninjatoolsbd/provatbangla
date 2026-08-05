/**
 * Multi-provider text generation with automatic fallback.
 * System cleaned and waiting for new integrations.
 */

export type ProviderName = "auto";

export type TextResult = { text: string; provider: ProviderName };

function extractJsonBlock(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) return body.trim();
  return body.slice(start, end + 1).trim();
}

/**
 * Empty placeholder for new providers.
 */
export async function generateTextWithFallback(args: {
  system: string;
  prompt: string;
  json?: boolean;
  preferred?: ProviderName | undefined;
}): Promise<TextResult> {
  // All previous providers (Blackbox, Gemini, OpenRouter) removed per user request.
  // Waiting for 3 new tool details to integrate.
  
  throw new Error("সব AI প্রোভাইডার মুছে ফেলা হয়েছে। অনুগ্রহ করে নতুন ৩টি টুলের বিস্তারিত দিন।");
}
