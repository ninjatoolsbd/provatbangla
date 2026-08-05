
import { runGenerate } from "./src/lib/news-generate.server";

async function test() {
  console.log("Starting Blackbox AI test...");
  try {
    const result = await runGenerate({
      prompt: "পরীক্ষামূলক সংবাদ: বাংলাদেশে আইটি খাতের ভবিষ্যৎ",
      details: "আইটি খাতের প্রবৃদ্ধি এবং ফ্রিল্যান্সিং এর প্রভাব।",
      category: "bangladesh",
      tone: "news",
      withImage: false,
      autoPublish: false,
      provider: "blackbox"
    });
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("FAILURE:", error);
    process.exit(1);
  }
}

test();
