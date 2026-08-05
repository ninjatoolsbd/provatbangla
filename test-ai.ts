
import { fraseApi, nichesssApi } from './src/lib/ai-providers.server';

async function testProviders() {
  const fraseKey = process.env.FRASE_API_KEY;
  const nichesssKey = process.env.NICHESSS_API_KEY;
  
  console.log("Testing Frase...");
  if (fraseKey) {
    try {
      const result = await fraseApi({ 
        key: fraseKey, 
        system: "You are a helpful assistant.", 
        prompt: "Say hello in Bengali." 
      });
      console.log("Frase success:", result);
    } catch (e) {
      console.error("Frase failed:", e.message);
    }
  } else {
    console.log("Frase key missing.");
  }

  console.log("\nTesting Nichesss...");
  if (nichesssKey) {
    try {
      const result = await nichesssApi({ 
        key: nichesssKey, 
        system: "You are a helpful assistant.", 
        prompt: "Say hello in Bengali." 
      });
      console.log("Nichesss success:", result);
    } catch (e) {
      console.error("Nichesss failed:", e.message);
    }
  } else {
    console.log("Nichesss key missing.");
  }
}

testProviders();
