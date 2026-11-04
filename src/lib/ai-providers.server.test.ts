import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./cms", () => ({ fetchSettings: async () => ({}) }));

import { generateTextWithFallback, testImageAiKey } from "./ai-providers.server";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

function configureExternalKeys(groq = "") {
  for (const name of ["GEMINI_API_KEY", ...Array.from({ length: 5 }, (_, i) => `GEMINI_API_KEY_${i + 1}`), "OPENROUTER_API_KEY"]) {
    vi.stubEnv(name, "");
  }
  vi.stubEnv("GROQ_API_KEY", groq);
  vi.stubEnv("LOVABLE_API_KEY", "test-only-unused-key");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Lovable-credit AI is disabled", () => {
  it("does not fall back to Lovable when no external provider is configured", async () => {
    configureExternalKeys();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateTextWithFallback({ system: "test", prompt: "test", preferred: "lovable" })).rejects.toThrow("কোনো AI প্রোভাইডার");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops after external provider failure instead of spending Lovable credits", async () => {
    configureExternalKeys("test-groq-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateTextWithFallback({ system: "test", prompt: "test" })).rejects.toThrow("সব AI প্রোভাইডার ব্যর্থ");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.groq.com/openai/v1/chat/completions");
  });

  it("keeps external AI generation working", async () => {
    configureExternalKeys("test-groq-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ choices: [{ message: { content: "External result" } }] })));
    await expect(generateTextWithFallback({ system: "test", prompt: "test" })).resolves.toEqual({ provider: "groq", text: "External result" });
  });

  it("blocks the legacy gateway adapter before making any request", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(() => createLovableAiGatewayProvider("test-only-unused-key")).toThrow("Lovable AI বন্ধ");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("removed image providers", () => {
  it.each(["leonardo", "ideogram"])("rejects %s without making an API request", async (provider) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(testImageAiKey(provider, "test-unused-key")).resolves.toEqual({ success: false, message: "অজানা ইমেজ প্রোভাইডার" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});