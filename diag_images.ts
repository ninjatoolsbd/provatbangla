
import dotenv from 'dotenv';
dotenv.config();

// Mock import.meta.env for the diagnostic script
(globalThis as any).import = { meta: { env: process.env } };

async function pickImageData(payload: any) {
  const direct = payload.data?.[0];
  if (direct?.b64_json) return "b64_json found";
  if (direct?.url?.startsWith("data:")) return "data url found";
  const fromChat = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (fromChat) return "chat image found";
  return null;
}

async function testImageApis() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];

  if (lovableKey) {
    console.log("Testing Lovable Image API...");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { "Lovable-API-Key": lovableKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/imagen-3",
        prompt: "Photorealistic sunset",
      }),
    });
    console.log(`Lovable Status: ${res.status}`);
    const body = await res.text();
    console.log(`Lovable Body: ${body.slice(0, 500)}`);
  }

  if (geminiKey) {
    console.log("\nTesting Gemini Image API...");
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "A sunset" }] }],
        }),
      },
    );
    console.log(`Gemini Status: ${res.status}`);
    const body = await res.text();
    console.log(`Gemini Body: ${body.slice(0, 500)}`);
  }
}

testImageApis().catch(console.error);
