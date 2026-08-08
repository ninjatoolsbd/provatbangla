/**
 * সোর্স নিউজ সাইট থেকে সর্বশেষ আর্টিকেল ডিসকভারি ও কনটেন্ট এক্সট্রাকশন।
 * সাধারণ RSS/সাইটম্যাপ সাপোর্ট + দুটি নির্দিষ্ট সাইটের অ্যাডাপ্টার।
 */

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type SourceItem = {
  url: string;
  title: string;
  image?: string | undefined;
};

export type SourceArticle = {
  url: string;
  title: string;
  body: string;
  image?: string | undefined;
};

async function getText(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function meta(html: string, prop: string) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? "";
}

function stripTags(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* ---------------- discovery ---------------- */

async function fromRss(siteUrl: string, limit: number): Promise<SourceItem[]> {
  const base = siteUrl.replace(/\/+$/, "");
  for (const path of ["/feed", "/rss.xml", "/feed/", "/rss"]) {
    try {
      const xml = await getText(base + path);
      if (!/<(item|entry)[\s>]/i.test(xml)) continue;
      const items: SourceItem[] = [];
      for (const block of xml.split(/<item[\s>]/i).slice(1)) {
        const link = block.match(/<link>([^<]+)<\/link>/i)?.[1]?.trim();
        const title = stripTags(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
        if (link && title) items.push({ url: link, title });
        if (items.length >= limit) break;
      }
      if (items.length) return items;
    } catch {
      /* try next */
    }
  }
  return [];
}

async function fromNewsSitemap(siteUrl: string, limit: number): Promise<SourceItem[]> {
  const base = siteUrl.replace(/\/+$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const candidates = [
    `${base}/sitemaps/sitemap-news-${today}.xml`,
    `${base}/sitemap-news.xml`,
    `${base}/news-sitemap.xml`,
    `${base}/sitemap.xml`,
  ];
  for (const candidate of candidates) {
    try {
      const xml = await getText(candidate);
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1] ?? "");
      const articles = locs.filter((u) => /\/[a-zA-Z0-9_-]{6,}$/.test(u) && !u.endsWith(".xml"));
      if (articles.length) {
        return articles.slice(-limit).reverse().map((url) => ({ url, title: "" }));
      }
    } catch {
      /* try next */
    }
  }
  return [];
}

/** দৈনিক আমাদের সময় — Nuxt সাইট, ইন্টারনাল JSON API ব্যবহার করে। */
async function fromAmaderShomoy(siteUrl: string, limit: number): Promise<SourceItem[]> {
  const base = siteUrl.replace(/\/+$/, "");
  const raw = await getText(`${base}/api/latest`);
  const parsed = JSON.parse(raw) as {
    data?: { slug?: string; headline?: string; thumb?: string }[];
  };
  return (parsed.data ?? [])
    .filter((row) => row.slug && row.headline)
    .slice(0, limit)
    .map((row) => ({
      url: `${base}/details/${row.slug}`,
      title: row.headline ?? "",
      image: row.thumb ?? undefined,
    }));
}

export async function discoverLatest(siteUrl: string, limit: number): Promise<SourceItem[]> {
  const h = host(siteUrl);
  
  // Specific handling for common Bengali news sites if RSS/Sitemap fails
  if (h.includes("dainikamadershomoy")) {
    const items = await fromAmaderShomoy(siteUrl, limit).catch(() => []);
    if (items.length) return items;
  }
  
  // Generic RSS discovery
  const rss = await fromRss(siteUrl, limit);
  if (rss.length) return rss;
  
  // News Sitemap discovery
  const sitemap = await fromNewsSitemap(siteUrl, limit);
  if (sitemap.length) return sitemap;

  // Final fallback: try to scrape the homepage for links if it's a known news portal
  try {
    const html = await getText(siteUrl);
    const links = [...html.matchAll(/href=["']([^"']+\/(?:bangladesh|international|politics|education|video|technology|jobs|sports|entertainment|lifestyle|economics|law|opinion|special-reports|photo-gallery|chakri|probash|orthoniti|shikkha|antorjatik|binodon|khela|prajukti|apradh)\/[^"']+)["']/gi)];
    const uniqueLinks = [...new Set(links.map(m => m[1]))];
    
    const items: SourceItem[] = [];
    for (const link of uniqueLinks) {
      const fullUrl = link.startsWith('http') ? link : new URL(link, siteUrl).href;
      // Skip common static assets or irrelevant pages
      if (/\.(jpg|jpeg|png|gif|css|js|xml)$/i.test(fullUrl)) continue;
      
      items.push({ url: fullUrl, title: "" });
      if (items.length >= limit) break;
    }
    return items;
  } catch (e) {
    console.error("Scraping fallback failed:", e);
  }

  return [];
}

/* ---------------- extraction ---------------- */

export async function fetchArticle(url: string): Promise<SourceArticle> {
  const html = await getText(url);
  const title = meta(html, "og:title") || stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const image = meta(html, "og:image") || undefined;

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1] ?? ""))
    .filter((p) => p.length > 60 && !/cookie|javascript|©/i.test(p));

  // দীর্ঘতম ধারাবাহিক অংশটুকুই মূল বডি ধরা হয়
  let body = paragraphs.join("\n\n");
  if (body.length < 200) body = meta(html, "og:description") || meta(html, "description");

  return { url, title: title.trim(), body: body.trim(), image };
}

export { host as sourceHost };
