/**
 * Multi-provider text generation with hierarchical fallback.
 * Priority: Gemini (Multiple Keys) -> OpenRouter -> Groq
 */

export type ProviderName = "gemini" | "openrouter" | "groq";

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
  // Try 1.5-flash first, then fallback to 1.5-pro or gemini-pro if needed
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
    throw new Error(`Gemini Error: ${res.status} ${errorText.slice(0, 100)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/**
 * OpenRouter API Implementation
 */
async function openrouterApi(opts: { key: string; system: string; prompt: string; json: boolean }) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  
  const body = {
    model: "meta-llama/llama-3.3-70b-instruct",
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
    throw new Error(`OpenRouter Error: ${res.status} ${errorText.slice(0, 100)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

/**
 * Groq API Implementation
 */
async function groqApi(opts: { key: string; system: string; prompt: string }) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.prompt }
    ],
    temperature: 0.7,
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
    throw new Error(`Groq Error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

export async function generateTextWithFallback(args: {
  system: string;
  prompt: string;
  json?: boolean;
  preferred?: ProviderName | "auto" | undefined;
}): Promise<TextResult> {
  // Load keys from both Env and DB Settings
  const { fetchSettings } = await import("./cms");
  const settings = (await fetchSettings().catch(() => ({}))) as Record<string, string>;

  const geminiKeys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const key = settings[`GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) geminiKeys.push(key.trim());
  }
  
  // Legacy support for comma separated key
  const legacyGemini = (settings["GEMINI_API_KEY"] || process.env["GEMINI_API_KEY"] || "") as string;
  if (legacyGemini) {
    geminiKeys.push(...legacyGemini.split(",").map(k => k.trim()).filter(Boolean));
  }
  
  const openrouterKey = settings["OPENROUTER_API_KEY"] || process.env["OPENROUTER_API_KEY"];
  const groqKey = settings["GROQ_API_KEY"] || process.env["GROQ_API_KEY"];

  const json = args.json ?? false;

  // Build the hierarchical queue: Gemini Keys -> OpenRouter -> Groq
  const queue: { name: ProviderName; run: (key: string) => Promise<string>; keys: string[] }[] = [];

  if (geminiKeys.length > 0) {
    queue.push({
      name: "gemini",
      keys: geminiKeys,
      run: (key) => geminiApi({ key, system: args.system, prompt: args.prompt }),
    });
  }

  if (openrouterKey) {
    queue.push({
      name: "openrouter",
      keys: [openrouterKey],
      run: (key) => openrouterApi({ key, system: args.system, prompt: args.prompt, json }),
    });
  }

  if (groqKey) {
    queue.push({
      name: "groq",
      keys: [groqKey],
      run: (key) => groqApi({ key, system: args.system, prompt: args.prompt }),
    });
  }

  if (queue.length === 0) {
    throw new Error("কোনো AI প্রোভাইডার কনফিগার করা নেই (Gemini, OpenRouter, বা Groq)।");
  }

  const errors: string[] = [];

  // Iterate through providers in hierarchy
  for (const provider of queue) {
    // For each provider, iterate through its available keys (especially useful for Gemini)
    for (const key of provider.keys) {
      try {
        const text = await provider.run(key);
        const processedText = json ? extractJsonBlock(text) : text.trim();
        
        if (json && !processedText.startsWith('{')) {
          throw new Error(`${provider.name} returned invalid JSON format`);
        }
        
        return { text: processedText, provider: provider.name };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${provider.name} (Key: ${key.slice(0, 6)}...): ${msg}`);
        // If it's a 429 or other error, try the next key or next provider
        continue;
      }
    }
  }

  throw new Error(`সব AI প্রোভাইডার ব্যর্থ হয়েছে — ${errors.join(" | ")}`);
}

export async function testAiKey(provider: ProviderName, key: string): Promise<{ success: boolean; message: string }> {
  const system = "You are a test assistant.";
  const prompt = "Say 'OK' if you can read this.";
  
  try {
    let result: string;
    if (provider === "gemini") {
      result = await geminiApi({ key, system, prompt });
    } else if (provider === "openrouter") {
      result = await openrouterApi({ key, system, prompt, json: false });
    } else if (provider === "groq") {
      result = await groqApi({ key, system, prompt });
    } else {
      throw new Error("Unknown provider");
    }
    
    return { success: true, message: `সংযুক্ত হয়েছে: ${result.slice(0, 50)}...` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `ব্যর্থ হয়েছে: ${msg}` };
  }
}
