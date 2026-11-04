// Fail closed even if a future caller tries to reuse this legacy adapter.
export function createLovableAiGatewayProvider(
  _lovableApiKey: string,
  _options?: { structuredOutputs?: boolean },
): never {
  throw new Error("Lovable AI বন্ধ আছে; অন্য AI প্রোভাইডার ব্যবহার করুন।");
}
