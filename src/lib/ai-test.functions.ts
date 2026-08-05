import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { testAiKey, ProviderName } from "./ai-providers.server";

export const testAiKeyFn = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({ 
      provider: z.enum(["gemini", "openrouter", "groq"]),
      key: z.string().min(1)
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return await testAiKey(data.provider as ProviderName, data.key);
  });
