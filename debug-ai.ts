
import { runGenerate } from "./src/lib/news-generate.server";

async function test() {
  console.log("Starting debug test for Gemini and Blackbox...");
  try {
    const result = await runGenerate({
      prompt: "পরীক্ষামূলক সংবাদ: প্রযুক্তি ও বাংলাদেশ",
      details: "বাংলাদেশের প্রযুক্তি খাতের নতুন দিগন্ত।",
      category: "bangladesh",
      tone: "news",
      withImage: false,
      autoPublish: false,
      provider: "auto"
    });
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("FAILURE:", error);
    process.exit(1);
  }
}

test();
