/**
 * Multi-provider text generation with automatic fallback.
 * Order: Frase → Nichesss
 */

export type ProviderName = "nichesss" | "frase";

export type TextResult = { text: string; provider: ProviderName };
function extractJsonBlock(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) return body.trim();
  return body.slice(start, end + 1).trim();
}

async function openAiCompatible(opts: {
  url: string;
  headers: Record<string, string>;
  model: string;
  system: string;
  prompt: string;
  json: boolean;
}) {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("empty response");
  return text;
}



export async function fraseApi(opts: { key: string; system: string; prompt: string }) {
  // Frase AI Content Generation API
  // Using the /content/generate endpoint or equivalent
  const res = await fetch("https://api.frase.io/api/v1/content/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.key,
    },
    body: JSON.stringify({
      // Frase expectations for generation
      query: opts.prompt,
      instruction: opts.system,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status} Frase error: ${errorText.slice(0, 300)}`);
  }

  const data = (await res.json()) as { text?: string; content?: string; data?: { text?: string }; response?: string };
  const text = data.text || data.content || data.data?.text || data.response || "";
  if (!text.trim()) throw new Error("empty response from Frase");
  return text;
}

export async function nichesssApi(opts: { key: string; system: string; prompt: string }) {
  // Nichesss Content Generation API
  // They expect a prompt and return generated text.
  // Note: Nichesss API might have specific 'plan' or 'template' requirements,
  // but usually a direct POST to a generation endpoint works for content.
  const res = await fetch("https://nichesss.com/api/v1/magic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.key}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt }
      ],
      model: "gpt-4o"
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status} Nichesss error: ${errorText.slice(0, 300)}`);
  }
  
  const data = (await res.json()) as { text?: string; content?: string; result?: string; response?: string };
  const text = data.text || data.content || data.result || data.response || "";
  if (!text.trim()) throw new Error("empty response from Nichesss");
  return text;
}

export async function generateTextWithFallback(args: {
  system: string;
  prompt: string;
  json?: boolean;
  preferred?: ProviderName | undefined;
}): Promise<TextResult> {
  const nichesssKey = process.env["NICHESSS_API_KEY"];
  const fraseKey = process.env["FRASE_API_KEY"];

  // Frase and Nichesss are for news content generation
  const preferred =
    args.preferred ||
    (fraseKey ? "frase" :
     nichesssKey ? "nichesss" : undefined);

  const json = args.json ?? false;

  const runners: { name: ProviderName; run: () => Promise<string> }[] = [];

  // Order: Frase -> Nichesss
  if (fraseKey)
    runners.push({
      name: "frase",
      run: () => fraseApi({ key: fraseKey, system: args.system, prompt: args.prompt }),
    });

  if (nichesssKey)
    runners.push({
      name: "nichesss",
      run: () => nichesssApi({ key: nichesssKey, system: args.system, prompt: args.prompt }),
    });

  if (preferred) {
    runners.sort((a, b) => (a.name === preferred ? -1 : b.name === preferred ? 1 : 0));
  }

  if (runners.length === 0) throw new Error("কোনো AI প্রোভাইডার কনফিগার করা নেই।");

  const errors: string[] = [];
  for (const runner of runners) {
    try {
      const text = await runner.run();
      const processedText = json ? extractJsonBlock(text) : text.trim();
      
      // Basic validation for JSON if requested
      if (json && !processedText.startsWith('{')) {
        throw new Error("Provider returned invalid JSON format");
      }
      
      return { text: processedText, provider: runner.name };
    } catch (e) {
      errors.push(`${runner.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`সব AI প্রোভাইডার ব্যর্থ হয়েছে — ${errors.join(" | ")}`);
}
