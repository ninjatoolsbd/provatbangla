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

  // Final fallback: try to scrape the page for links.
  // We use a broader regex to capture articles even from homepages.
  try {
    const html = await getText(siteUrl);
    
    // Improved regex to find links that look like news articles.
    // We look for patterns common in Bengali news sites.
    const linkMatches = [...html.matchAll(/href=["']([^"']+)["']/gi)];
    const uniqueLinks = [...new Set(linkMatches.map(m => m[1] as string))];
    
    const items: SourceItem[] = [];
    for (const link of uniqueLinks) {
      if (!link || link === '#' || link.length < 10) continue;
      
      const fullUrl = link.startsWith('http') ? link : new URL(link, siteUrl).href;
      
      // Skip common static assets, scripts, or obvious non-article pages
      if (/\.(jpg|jpeg|png|gif|css|js|xml|ico|svg|woff|ttf)$/i.test(fullUrl)) continue;
      if (fullUrl.includes('/tag/') || fullUrl.includes('/author/') || fullUrl.includes('/search')) continue;
      
      // Heuristic: Article URLs usually have categories or date patterns or long slugs
      const isArticle = /\/(bangladesh|international|politics|education|video|technology|jobs|sports|entertainment|lifestyle|economics|law|opinion|special-reports|photo-gallery|chakri|probash|orthoniti|shikkha|antorjatik|binodon|khela|prajukti|apradh|durprobas|video-gallery|details|news|article)\//.test(fullUrl) || 
                        /\/\d{4}\/\d{2}\/\d{2}\//.test(fullUrl) || 
                        (fullUrl.split('/').length > 4 && fullUrl.length > 40);

      if (isArticle) {
        // Try to find image near this link in the HTML
        const contextRe = new RegExp(`<[^>]+href=["']${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>[\\s\\S]*?<img[^>]+src=["']([^"']+)["']`, 'i');
        const imgMatch = html.match(contextRe);
        let itemImage = imgMatch?.[1];
        
        if (itemImage && !itemImage.startsWith("http")) {
          itemImage = new URL(itemImage, siteUrl).href;
        }

        items.push({ url: fullUrl, title: "", image: itemImage });
        if (items.length >= limit) break;
      }
    }
    
    // If we still found nothing specific, just take any long links that aren't the site root
    if (items.length === 0) {
      for (const link of uniqueLinks) {
        const fullUrl = link.startsWith('http') ? link : new URL(link, siteUrl).href;
        if (fullUrl.length > 40 && !fullUrl.endsWith(h) && !fullUrl.endsWith(h + '/')) {
          items.push({ url: fullUrl, title: "" });
          if (items.length >= limit) break;
        }
      }
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
  
  // Scrape images more aggressively
  let image = meta(html, "og:image") || meta(html, "twitter:image") || "";
  
  if (!image) {
    // Look for article main image pattern
    const imgMatch = html.match(/<article[\s\S]*?<img[^>]+src=["']([^"']+)["']/i) || 
                   html.match(/<div[^>]+class=["'][^"']*featured[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i) ||
                   html.match(/<img[^>]+class=["'][^"']*main-image[^"']*["'][^>]*src=["']([^"']+)["']/i);
    image = imgMatch?.[1] || "";
  }

  // Handle relative image URLs
  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, url).href;
    } catch {
      image = "";
    }
  }

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1] ?? ""))
    .filter((p) => p.length > 50 && !/cookie|javascript|©|comment|copyright|advertisement/i.test(p));

  // If no <p> tags found, look for div patterns or main content areas
  if (paragraphs.length < 2) {
    const mainContent = html.match(/<div[^>]+(?:class|id)=["'][^"']*(?:article-body|entry-content|post-content|main-content|article-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    if (mainContent?.[1]) {
      const parts = mainContent[1].split(/<br\s*\/?>/i)
        .map(p => stripTags(p))
        .filter(p => p.length > 40);
      paragraphs.push(...parts);
    }
  }

  let body = paragraphs.join("\n\n");
  if (body.length < 300) {
    const desc = meta(html, "og:description") || meta(html, "description");
    if (desc && desc.length > body.length) body = desc;
  }

  return { url, title: title.trim(), body: body.trim(), image: image || undefined };
}

export { host as sourceHost };
