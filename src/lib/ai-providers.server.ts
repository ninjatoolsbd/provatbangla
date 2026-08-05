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



async function fraseApi(opts: { key: string; system: string; prompt: string }) {
  const url = "https://api.frase.io/api/v1/ai/generate";
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": opts.key,
  };
  const body = {
    query: opts.prompt,
    instruction: opts.system,
    max_tokens: 1500,
  };

  console.log(`[Frase Request] URL: ${url}`);
  console.log(`[Frase Request] Headers: Content-Type: application/json, x-api-key: ${opts.key.slice(0, 6)}...`);
  console.log(`[Frase Request] Body: ${JSON.stringify(body, null, 2)}`);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseBody = await res.text();
  console.log(`[Frase Response] Status: ${res.status}`);
  console.log(`[Frase Response] Body: ${responseBody}`);

  if (!res.ok) {
    throw new Error(`${res.status} Frase error: ${responseBody}`);
  }

  const data = JSON.parse(responseBody);
  return data.text || data.result || data.content || "";
}

async function nichesssApi(opts: { key: string; system: string; prompt: string }) {
  const url = "https://nichesss.com/api/v1/magic";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${opts.key}`,
  };
  const body = {
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.prompt }
    ],
    max_tokens: 1500
  };

  console.log(`[Nichesss Request] URL: ${url}`);
  console.log(`[Nichesss Request] Headers: Content-Type: application/json, Authorization: Bearer ${opts.key.slice(0, 6)}...`);
  console.log(`[Nichesss Request] Body: ${JSON.stringify(body, null, 2)}`);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const responseBody = await res.text();
  console.log(`[Nichesss Response] Status: ${res.status}`);
  console.log(`[Nichesss Response] Body: ${responseBody}`);

  if (!res.ok) {
    throw new Error(`${res.status} Nichesss error: ${responseBody}`);
  }
  
  const data = JSON.parse(responseBody);
  return data.text || data.result || data.data?.text || "";
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
