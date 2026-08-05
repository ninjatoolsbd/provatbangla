
import { generateTextWithFallback } from "./src/lib/ai-providers.server";

async function test() {
  process.env["BLACKBOX_API_KEY"] = "sk-6tL5SDZEZHEmFtPzKp59ww";
  
  try {
    console.log("Testing Blackbox AI with the new key...");
    const result = await generateTextWithFallback({
      system: "You are a helpful assistant.",
      prompt: "Hello, how are you?",
      preferred: "blackbox"
    });
    console.log("Success:", result);
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
