/**
 * Multi-provider text generation with automatic fallback.
 * Preferred: Blackbox AI (New), Google Gemini (Primary), or OpenRouter (Fallback).
 */

export type ProviderName = "blackbox";

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
 * Google Gemini API Implementation
 */
async function geminiApi(opts: { key: string; system: string; prompt: string }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${opts.key}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${opts.system}\n\n${opts.prompt}` }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini Error: ${res.status} ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/**
 * OpenRouter API Implementation (OpenAI compatible)
 */
async function openrouterApi(opts: { key: string; system: string; prompt: string; json: boolean }) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  
  const body = {
    model: "meta-llama/llama-3.1-8b-instruct:free",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.prompt }
    ],
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${opts.key}`,
      "HTTP-Referer": "https://lovable.dev",
      "X-Title": "ProbhatBangla News Editor",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter Error: ${res.status} ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

/**
 * Blackbox AI API Implementation
 */
async function blackboxApi(opts: { key: string; system: string; prompt: string }) {
  const url = "https://api.blackbox.ai/api/chat";
  
  const body = {
    messages: [
      { role: "user", content: `${opts.system}\n\n${opts.prompt}` }
    ],
    model: "deepseek-v3",
    max_tokens: 1024,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${opts.key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    // Return the specific error message for debugging
    throw new Error(`Blackbox Error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Blackbox returned empty response");
  return text;
}

export async function generateTextWithFallback(args: {
  system: string;
  prompt: string;
  json?: boolean;
  preferred?: ProviderName | undefined;
}): Promise<TextResult> {
  const blackboxKey = process.env["BLACKBOX_API_KEY"];
  // Gemini and OpenRouter disabled per user request
  const geminiKey = undefined;
  const openrouterKey = undefined;

  const json = args.json ?? false;
  const runners: { name: ProviderName; run: () => Promise<string> }[] = [];

  if (blackboxKey) {
    runners.push({
      name: "blackbox",
      run: () => blackboxApi({ key: blackboxKey, system: args.system, prompt: args.prompt }),
    });
  }

  /* Disabled per user request
  if (geminiKey) {
    runners.push({
      name: "gemini" as any,
      run: () => geminiApi({ key: geminiKey, system: args.system, prompt: args.prompt }),
    });
  }

  if (openrouterKey) {
    runners.push({
      name: "openrouter" as any,
      run: () => openrouterApi({ key: openrouterKey, system: args.system, prompt: args.prompt, json }),
    });
  }
  */

  const preferred = args.preferred || "blackbox";
  runners.sort((a, b) => (a.name === preferred ? -1 : b.name === preferred ? 1 : 0));

  if (runners.length === 0) {
    throw new Error("কোনো AI প্রোভাইডার কনফিগার করা নেই।");
  }

  const errors: string[] = [];
  for (const runner of runners) {
    try {
      const text = await runner.run();
      const processedText = json ? extractJsonBlock(text) : text.trim();
      
      if (json && !processedText.startsWith('{')) {
        throw new Error(`${runner.name} returned invalid JSON format`);
      }
      
      return { text: processedText, provider: runner.name };
    } catch (e) {
      errors.push(`${runner.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(`সব AI প্রোভাইডার ব্যর্থ হয়েছে — ${errors.join(" | ")}`);
}
