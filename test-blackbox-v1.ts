import { config } from "dotenv";
config();

async function testV1() {
  const key = "sk-6tL5SDZEZHEmFtPzKp59ww";
  const url = "https://api.blackbox.ai/v1/chat/completions";
  
  const body = {
    model: "gpt-4o", // Try a standard model first
    messages: [
      { role: "user", content: "Hello, respond with 'OK' if you see this." }
    ]
  };

  console.log("Testing endpoint:", url);
  console.log("Model:", body.model);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

testV1();
