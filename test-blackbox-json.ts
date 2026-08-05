import { generateTextWithFallback } from "./src/lib/ai-providers.server";

async function test() {
  console.log("Starting Blackbox API test (JSON)...");
  try {
    const result = await generateTextWithFallback({
      system: "Return ONLY a valid JSON object. No other text.",
      prompt: "Generate a JSON object with a key 'greeting' and value 'Hello from Blackbox'.",
      json: true
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

test();
