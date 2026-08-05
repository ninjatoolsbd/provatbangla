import { generateTextWithFallback } from "./src/lib/ai-providers.server";

async function test() {
  console.log("Starting Blackbox API test...");
  try {
    const result = await generateTextWithFallback({
      system: "You are a helpful assistant.",
      prompt: "Say 'Hello, API is working!' in Bengali.",
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

test();
