import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: z.string().min(1),
});

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { uploadToR2 } = await import("@/lib/r2.server");
    const binary = atob(data.dataBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const safe = data.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `media/${Date.now()}-${safe}`;
    const url = await uploadToR2(key, bytes, data.contentType);
    if (!url) throw new Error("R2 আপলোড ব্যর্থ হয়েছে");
    return { url, key, size: bytes.length };
  });
