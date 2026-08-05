
import { generateTextWithFallback } from "./src/lib/ai-providers.server";
import { generateNewsImage } from "./src/lib/news-image.server";

async function diag() {
  console.log("--- Starting AI API Diagnostics ---");
  
  const providers = ["lovable", "groq", "cerebras", "gemini"];
  for (const p of providers) {
    console.log(`\nTesting Text Provider: ${p}`);
    try {
      const res = await generateTextWithFallback({
        system: "You are a tester.",
        prompt: "Say 'Hello'",
        preferred: p as any
      });
      console.log(`✅ ${p} success: "${res.text}"`);
    } catch (e) {
      console.error(`❌ ${p} failed:`, (e as Error).message);
    }
  }

  console.log("\nTesting Image Generation (Lovable)...");
  try {
    const img = await generateNewsImage("A simple red circle on white background");
    if (img) {
      console.log(`✅ Image success: ${img}`);
    } else {
      console.log(`❌ Image failed (returned null)`);
    }
  } catch (e) {
    console.error(`❌ Image error:`, (e as Error).message);
  }
  
  console.log("\n--- Diagnostics Complete ---");
}

diag().catch(console.error);
