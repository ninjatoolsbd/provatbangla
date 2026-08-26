import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireCloudAuth } from "@/lib/cloud-auth.middleware";

export const generateMetadata = createServerFn({ method: "POST" })
  .middleware([requireCloudAuth])
  .inputValidator((data: unknown) => 
    z.object({ 
      title: z.string().min(1), 
      content: z.string().min(100) 
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { runGenerateMetadata } = await import("./news-metadata.server");
    return runGenerateMetadata(data);
  });
