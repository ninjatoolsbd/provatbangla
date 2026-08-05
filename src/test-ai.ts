import { testAiKey } from './lib/ai-providers.server';
import { fetchSettings } from './lib/cms';

async function runTests() {
  console.log("Starting AI API key verification...");
  
  try {
    const settings = await fetchSettings();
    
    const providers = [
      { name: "gemini" as const, key: settings["GEMINI_API_KEY"] },
      { name: "openrouter" as const, key: settings["OPENROUTER_API_KEY"] },
      { name: "groq" as const, key: settings["GROQ_API_KEY"] }
    ];

    for (const p of providers) {
      if (!p.key) {
        console.log(`[${p.name}]: No key found in settings.`);
        continue;
      }

      if (p.name === "gemini") {
        const keys = p.key.split(",").map(k => k.trim()).filter(Boolean);
        console.log(`[gemini]: Testing ${keys.length} keys...`);
        for (let i = 0; i < keys.length; i++) {
          const res = await testAiKey("gemini", keys[i]);
          console.log(`  Key ${i + 1} (${keys[i].slice(0, 6)}...): ${res.success ? "SUCCESS" : "FAILED"} - ${res.message}`);
        }
      } else {
        console.log(`[${p.name}]: Testing key...`);
        const res = await testAiKey(p.name, p.key);
        console.log(`  Result: ${res.success ? "SUCCESS" : "FAILED"} - ${res.message}`);
      }
    }
  } catch (err) {
    console.error("Critical error during tests:", err);
  }
}

runTests();
