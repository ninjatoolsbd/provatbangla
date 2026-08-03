import { AwsClient } from "aws4fetch";

/** Cloudflare R2 config from project secrets. Returns null when not fully configured. */
function r2Config() {
  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = process.env["R2_BUCKET"];
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  let publicBase = (process.env["R2_PUBLIC_BASE_URL"] ?? "").replace(/\/+$/, "");
  // The S3 API endpoint is NOT publicly readable — ignore it and use the app proxy instead.
  if (publicBase.includes("r2.cloudflarestorage.com")) publicBase = "";
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBase };
}

export function isR2Configured() {
  return r2Config() !== null;
}

/**
 * Uploads bytes to R2 and returns the URL to use in the app.
 * Uses R2_PUBLIC_BASE_URL when set, otherwise the app proxy route.
 * Returns null when R2 is not configured or the upload fails.
 */
export async function uploadToR2(
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string | null> {
  const cfg = r2Config();
  if (!cfg) return null;
  try {
    const client = new AwsClient({
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    const url = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;
    const res = await client.fetch(url, {
      method: "PUT",
      body: bytes as unknown as BodyInit,
      headers: { "Content-Type": contentType },
    });
    if (!res.ok) return null;
    return cfg.publicBase ? `${cfg.publicBase}/${key}` : `/api/public/r2/${key}`;
  } catch {
    return null;
  }
}

/** Streams an object back from R2 (used by the proxy route when no public base URL is set). */
export async function getFromR2(key: string): Promise<Response | null> {
  const cfg = r2Config();
  if (!cfg) return null;
  try {
    const client = new AwsClient({
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    const url = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;
    const res = await client.fetch(url, { method: "GET" });
    if (!res.ok) return null;
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}
