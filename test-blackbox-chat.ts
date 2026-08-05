import { config } from "dotenv";
config();

async function testChat() {
  const key = "sk-6tL5SDZEZHEmFtPzKp59ww";
  const url = "https://api.blackbox.ai/api/chat";
  
  const body = {
    messages: [
      { role: "user", content: "Hello, respond with 'OK' if you see this." }
    ],
    model: "blackboxai",
    max_tokens: 1024
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

testChat();
