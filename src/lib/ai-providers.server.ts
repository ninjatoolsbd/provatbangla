/**
 * Multi-provider text generation with automatic fallback.
 * Order: Spin Rewriter (if set) → Lovable AI → Groq → Cerebras → Gemini (direct).
 */

export type ProviderName = "lovable" | "groq" | "cerebras" | "gemini" | "spin-rewriter";

export type TextResult = { text: string; provider: ProviderName };

async function spinRewriterApi(opts: { key: string; prompt: string }) {
  // Spin Rewriter API v12
  // We use the 'text_with_spintax' or 'unique_variation' action.
  // For news rewriting, we usually want a unique variation.
  const params = new URLSearchParams({
    email: "bbh2270@gmail.com", // From context history
    api_key: opts.key,
    action: "unique_variation",
    text: opts.prompt,
    protected_terms: "",
    auto_protected_terms: "true",
    nested_spintax: "true",
    auto_sentences: "true",
    auto_paragraphs: "true",
    auto_new_lines: "false",
    reorder_paragraphs: "false",
    use_only_synonyms: "false",
    confidence_level: "medium",
    spintax_format: "{|}",
  });

  const res = await fetch("https://www.spinrewriter.com/action/api", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`${res.status} Spin Rewriter error`);
  const data = (await res.json()) as { status: string; response: string };
  if (data.status !== "OK") throw new Error(data.response || "Spin Rewriter API failed");
  return data.response;
}

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

async function geminiDirect(opts: { key: string; system: string; prompt: string; json: boolean }) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": opts.key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
        generationConfig: opts.json ? { responseMimeType: "application/json" } : {},
      }),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("empty response");
  return text;
}

export async function generateTextWithFallback(args: {
  system: string;
  prompt: string;
  json?: boolean;
  preferred?: ProviderName | undefined;
}): Promise<TextResult> {
  const spinKey = process.env["SPIN_REWRITER_API_KEY"];
  const preferred = args.preferred || (spinKey && !args.json ? "spin-rewriter" : undefined);


  const json = args.json ?? false;
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const groqKey = process.env["GROQ_API_KEY"];
  const cerebrasKey = process.env["CEREBRAS_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];


  const runners: { name: ProviderName; run: () => Promise<string> }[] = [];

  if (spinKey && !json)
    runners.push({
      name: "spin-rewriter",
      run: () => spinRewriterApi({ key: spinKey, prompt: args.prompt }),
    });

  if (lovableKey)
    runners.push({
      name: "lovable",
      run: () =>
        openAiCompatible({
          url: "https://ai.gateway.lovable.dev/v1/chat/completions",
          headers: { "Lovable-API-Key": lovableKey },
          model: "google/gemini-3.5-flash",
          system: args.system,
          prompt: args.prompt,
          json,
        }),
    });
  if (groqKey)
    runners.push({
      name: "groq",
      run: () =>
        openAiCompatible({
          url: "https://api.groq.com/openai/v1/chat/completions",
          headers: { Authorization: `Bearer ${groqKey}` },
          model: "llama-3.3-70b-versatile",
          system: args.system,
          prompt: args.prompt,
          json,
        }),
    });
  if (cerebrasKey)
    runners.push({
      name: "cerebras",
      run: () =>
        openAiCompatible({
          url: "https://api.cerebras.ai/v1/chat/completions",
          headers: { Authorization: `Bearer ${cerebrasKey}` },
          model: "gpt-oss-120b",
          system: args.system,
          prompt: args.prompt,
          json,
        }),
    });
  if (geminiKey)
    runners.push({
      name: "gemini",
      run: () => geminiDirect({ key: geminiKey, system: args.system, prompt: args.prompt, json }),
    });

  if (preferred) {
    runners.sort((a, b) => (a.name === preferred ? -1 : b.name === preferred ? 1 : 0));
  }

  if (runners.length === 0) throw new Error("কোনো AI প্রোভাইডার কনফিগার করা নেই।");

  const errors: string[] = [];
  for (const runner of runners) {
    try {
      const text = await runner.run();
      return { text: json ? extractJsonBlock(text) : text.trim(), provider: runner.name };
    } catch (e) {
      errors.push(`${runner.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`সব AI প্রোভাইডার ব্যর্থ হয়েছে — ${errors.join(" | ")}`);
}
