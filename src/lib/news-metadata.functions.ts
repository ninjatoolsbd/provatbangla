import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireCloudAuth } from "@/lib/cloud-auth.middleware";

export const generateMetadata = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((data: unknown) => 
    z.object({ 
      title: z.string().default(""), 
      content: z.string().min(50) 
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { runGenerateMetadata } = await import("./news-metadata.server");
    return runGenerateMetadata(data);
  });
