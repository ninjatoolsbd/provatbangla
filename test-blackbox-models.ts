import { config } from "dotenv";
config();

async function listModels() {
  const key = "sk-6tL5SDZEZHEmFtPzKp59ww";
  const url = "https://api.blackbox.ai/v1/models";
  
  console.log("Listing models from:", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${key}`
      }
    });

    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

listModels();
