// Served from /public so it works on any host (Lovable preview, Cloudflare Worker, etc.)
// Version query busts browser cache when the logo is replaced.
const logoAsset = { url: "/logo.png?v=3" };
export default logoAsset;
