/**
 * Multi-provider text generation with hierarchical fallback.
 * Priority: Gemini (Multiple Keys) -> OpenRouter -> Groq
 */

export type ProviderName = "gemini" | "openrouter" | "groq";

export type TextResult = { text: string; provider: ProviderName };

function extractJsonBlock(raw: string) {
  // Try to find anything between { and } including nested braces
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return raw.trim();
  
  let jsonCandidate = raw.slice(start, end + 1).trim();
  
  // Clean up potential markdown code fences if they were captured inside
  jsonCandidate = jsonCandidate.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "");
  
  // Final safeguard: remove any non-printable control characters that break JSON
  jsonCandidate = jsonCandidate.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  
  return jsonCandidate;
}

/**
 * Google Gemini API Implementation
 */
async function geminiApi(opts: { key: string; system: string; prompt: string }) {
  // Ordered by preference: flash-latest is often best for standard tasks
  const models = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-1.5-pro", "gemini-pro"];
  const versions = ["v1beta", "v1"];
  
  let lastError: Error | null = null;

  for (const model of models) {
    for (const version of versions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${opts.key}`;
        
        const body = {
          contents: [{
            role: "user",
            parts: [{ text: `${opts.system}\n\n${opts.prompt}` }]
          }],
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

        if (res.status === 404) {
          // If 404, the model or version might be wrong, try next
          continue;
        }

        if (!res.ok) {
    const errorText = await res.text();
    // Log the actual error code and response for debugging
    let detail = "";
    try {
      const parsed = JSON.parse(errorText);
      detail = parsed.error?.message || errorText;
    } catch {
      detail = errorText;
    }
    throw new Error(`Gemini Error: ${res.status} ${detail.slice(0, 200)}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) throw new Error("Gemini returned empty response");
        return text;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        // If it's a 404 we already 'continue', but for other errors (like 401, 429) we might want to propagate or log
        if (!String(e).includes("404")) {
          throw e; 
        }
      }
    }
  }

  throw lastError || new Error("Gemini model not found (Tried flash, pro, and legacy)");
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
    if (key && key.trim().length > 10) { // Only use non-empty, valid-looking keys
      geminiKeys.push(key.trim());
    }
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

  // If a preferred provider is specified, put it first
  const preferred = args.preferred || "auto";

  const availableProviders = [
    {
      name: "gemini" as ProviderName,
      keys: geminiKeys,
      run: (key: string) => geminiApi({ key, system: args.system, prompt: args.prompt }),
    },
    {
      name: "openrouter" as ProviderName,
      keys: openrouterKey ? [openrouterKey] : [],
      run: (key: string) => openrouterApi({ key, system: args.system, prompt: args.prompt, json }),
    },
    {
      name: "groq" as ProviderName,
      keys: groqKey ? [groqKey] : [],
      run: (key: string) => groqApi({ key, system: args.system, prompt: args.prompt }),
    },
  ];

  if (preferred !== "auto") {
    const pref = availableProviders.find(p => p.name === preferred);
    if (pref && pref.keys.length > 0) queue.push(pref);
    availableProviders.filter(p => p.name !== preferred && p.keys.length > 0).forEach(p => queue.push(p));
  } else {
    availableProviders.filter(p => p.keys.length > 0).forEach(p => queue.push(p));
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
        const rawText = await provider.run(key);
        let processedText = extractJsonBlock(rawText);
        
        // Always try to parse and fix if it's supposed to be JSON
        if (json) {
          try {
            JSON.parse(processedText);
          } catch (e) {
            // Attempt to fix common JSON issues
            let fixedText = processedText
              // Remove literal newlines inside strings - replace with \n
              .replace(/([^\\])\n/g, "$1\\n")
              // Remove trailing commas
              .replace(/,\s*([}\]])/g, "$1")
              // Remove potential text before or after the JSON block
              .trim();

            // Try to handle unescaped quotes inside values using a safer heuristic
            // Find patterns like "key": "value" and ensure double quotes inside are handled
            fixedText = fixedText.replace(/"([^"]+)":\s*"([\s\S]*?)"(?=\s*[,}])|([^{}\[\]",\s]+)/g, (match, key, val) => {
              if (key && val) {
                // If it's a key-value pair, escape any " inside the val that aren't already escaped
                const escapedVal = val.replace(/(?<!\\)"/g, '\\"');
                return `"${key}": "${escapedVal}"`;
              }
              return match;
            });
            
            try {
              JSON.parse(fixedText);
              processedText = fixedText;
            } catch (innerE) {
               console.warn("JSON fix failed, returning raw processed text", innerE);
            }
          }
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

export async function testImageAiKey(provider: string, key: string, extra?: string): Promise<{ success: boolean; message: string }> {
  const testPrompt = "A small red apple on a white background, minimalist style.";
  try {
    if (provider === "cloudflare") {
      const accountId = extra || "0d889fc022ab5086c334140058a43637";
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: JSON.stringify({ prompt: testPrompt }),
      });
      if (!res.ok) throw new Error(`Cloudflare Error: ${res.status}`);
      return { success: true, message: "সংযুক্ত হয়েছে: Cloudflare Flux OK" };
    }
    
    if (provider === "pollinations") {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(testPrompt)}?nologo=true&private=true&model=flux`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
      if (!res.ok) throw new Error(`Pollinations Error: ${res.status}`);
      return { success: true, message: "সংযুক্ত হয়েছে: Pollinations Flux OK" };
    }

    if (provider === "leonardo") {
      const res = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
        method: "POST",
        headers: { 
          "accept": "application/json",
          "content-type": "application/json",
          "authorization": `Bearer ${key}`
        },
        body: JSON.stringify({ 
          prompt: testPrompt, 
          modelId: "7b592283-e8a7-4c5a-9ba6-d18c31f258b9", 
          width: 512, 
          height: 512, 
          num_images: 1,
          alchemy: false,
          ultra: false
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let detail = "";
        try {
          const parsed = JSON.parse(errorText);
          detail = parsed.error || parsed.message || errorText;
        } catch {
          detail = errorText;
        }
        throw new Error(`Leonardo Error: ${res.status} ${detail.slice(0, 200)}`);
      }
      return { success: true, message: "সংযুক্ত হয়েছে: Leonardo API OK" };
    }

    if (provider === "ideogram") {
      const res = await fetch("https://api.ideogram.ai/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Api-Key": key 
        },
        body: JSON.stringify({ 
          image_request: { 
            prompt: testPrompt, 
            aspect_ratio: "ASPECT_1_1", 
            model: "V_2",
            magic_prompt_option: "OFF"
          } 
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let detail = "";
        try {
          const parsed = JSON.parse(errorText);
          detail = parsed.error || parsed.message || errorText;
          if (typeof detail === 'object') detail = JSON.stringify(detail);
        } catch {
          detail = errorText;
        }
        throw new Error(`Ideogram Error: ${res.status} ${detail.slice(0, 200)}`);
      }
      return { success: true, message: "সংযুক্ত হয়েছে: Ideogram API OK" };
    }

    return { success: false, message: "অজানা ইমেজ প্রোভাইডার" };
  } catch (e) {
    return { success: false, message: `ব্যর্থ হয়েছে: ${e instanceof Error ? e.message : String(e)}` };
  }
}
