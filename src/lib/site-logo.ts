// Self-hosted logo: bundled by Vite so it works on any host (Cloudflare Workers,
// custom domains), unlike the Lovable-only /__l5e/ asset proxy URL.
import logoUrl from "@/assets/logo.png";

export const logoAsset = { url: logoUrl };
export default logoAsset;
