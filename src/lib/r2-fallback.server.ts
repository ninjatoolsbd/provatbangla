// Auto-generated build-time fallback so the deployed Worker can reach R2
// without setting variables in the Cloudflare dashboard.
// Server-only module: never import from client code.
export const R2_FALLBACK = {
  "R2_ACCOUNT_ID": "62f468f70e7ed5e4fa6c42562090a4a4",
  "R2_ACCESS_KEY_ID": "345967008234739c8a2d5218f5ab579e",
  "R2_SECRET_ACCESS_KEY": "f5c34fd526966677728dc042c5b58c43af4315dbcac25fba748312e892c9c989",
  "R2_BUCKET": "news",
  "R2_PUBLIC_BASE_URL": "https://62f468f70e7ed5e4fa6c42562090a4a4.r2.cloudflarestorage.com"
} as const;
