
import { runGenerate } from "./src/lib/news-generate.server";

async function test() {
  console.log("Starting final validation test...");
  try {
    const result = await runGenerate({
      prompt: "পরীক্ষামূলক সংবাদ: বাংলাদেশের ডিজিটাল অর্থনীতি",
      details: "ডিজিটাল পেমেন্ট এবং ই-কমার্সের দ্রুত বৃদ্ধি।",
      category: "national",
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
