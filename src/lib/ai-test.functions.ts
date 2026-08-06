import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { testAiKey, ProviderName } from "./ai-providers.server";

export const testAiKeyFn = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({ 
      provider: z.enum(["gemini", "openrouter", "groq", "cloudflare", "pollinations", "leonardo", "ideogram"]),
      key: z.string().min(1),
      extra: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    if (data.provider === "cloudflare" || data.provider === "pollinations" || data.provider === "leonardo" || data.provider === "ideogram") {
      const { testImageAiKey } = await import("./ai-providers.server");
      return await testImageAiKey(data.provider, data.key, data.extra);
    }
    return await testAiKey(data.provider as any, data.key);
  });
