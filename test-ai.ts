import { generateTextWithFallback } from './src/lib/ai-providers.server';

async function test() {
  console.log("Testing News Generation...");
  try {
    const result = await generateTextWithFallback({
      prompt: "Write a short news report about a cricket match in Bengali.",
      systemPrompt: "You are a professional news reporter.",
      minWords: 50
    });
    console.log("SUCCESS:", result.substring(0, 100) + "...");
  } catch (error) {
    console.error("FAILED:", error);
  }
}

test();
