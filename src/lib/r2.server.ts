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

    // Never persist a URL unless the object can actually be read back.
    // This prevents broken editor previews when R2 accepts a request but the
    // object is unavailable because of credentials, bucket, or key issues.
    const verification = await client.fetch(url, { method: "GET" });
    if (!verification.ok) return null;

    return cfg.publicBase ? `${cfg.publicBase}/${key}` : `/api/public/r2/${key}`;
  } catch {
    return null;
  }
}

/** Streams an object back from R2 (used by the proxy route when no public base URL is set). */
export async function getFromR2(key: string): Promise<Response | null> {
  const cfg = r2Config();
  if (!cfg) {
    console.error("[R2 Server] Config missing");
    return null;
  }
  try {
    const client = new AwsClient({
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
      service: "s3",
      region: "auto",
    });
    
    // R2 expects the key to be encoded. aws4fetch handles the signature encoding.
    // We try to fetch the key as-is first.
    const url = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;
    
    let res = await client.fetch(url, { method: "GET" });

    // If it fails, it might be due to encoding issues with specific characters like '-' or Bengali
    if (!res.ok) {
      const encodedUrl = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
      const retryRes = await client.fetch(encodedUrl, { method: "GET" });
      if (retryRes.ok) res = retryRes;
    }
    
    if (!res.ok) {
      console.error(`[R2 Server] Fetch failed (${res.status}): ${url}`);
      return null;
    }
    
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error(`[R2 Server] Exception for key ${key}:`, err);
    return null;
  }
}
