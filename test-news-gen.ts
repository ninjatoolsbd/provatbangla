import { generateTextWithFallback } from './src/lib/ai-providers.server';

async function test() {
  console.log("--- AI নিউজ জেনারেশন টেস্ট শুরু হচ্ছে ---");
  try {
    const result = await generateTextWithFallback({
      prompt: "বাংলাদেশে ক্রিকেট বিশ্বকাপের উন্মাদনা নিয়ে একটি ছোট সংবাদ লিখুন (বাংলায়)।",
      system: "আপনি একজন পেশাদার সংবাদিক। সাবলীল এবং মার্জিত বাংলায় নিউজ লিখুন।",
      json: false
    });
    console.log("সফল রেসপন্স পাওয়া গেছে!");
    console.log("প্রোভাইডার:", result.provider);
    console.log("নিউজ হাইলাইট:", result.text.substring(0, 200) + "...");
    console.log("--- টেস্ট সম্পন্ন ---");
  } catch (error) {
    console.error("টেস্ট ব্যর্থ হয়েছে!");
    console.error("ত্রুটি:", error instanceof Error ? error.message : String(error));
  }
}

test();
