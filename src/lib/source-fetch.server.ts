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
  publishedAt?: string | undefined;
};

async function getText(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "bn,en;q=0.9",
      "Cache-Control": "no-cache",
      Referer: new URL(url).origin + "/",
    },
  });
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
      // Split by item or entry tag
      const blocks = xml.split(/<(item|entry)[\s>]/i).slice(1);
      for (const block of blocks) {
        const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() || 
                     block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]?.trim();
        const title = stripTags(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
        
        if (link && title) {
          items.push({ url: link, title });
        }
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
      // We want the most recent URLs first. Sitemap order varies, so we try to find <lastmod> or just reverse if needed.
      const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)];
      
      const items: {url: string, date: string}[] = [];
      for (const block of urlBlocks) {
        const content = block[1] || "";
        const loc = content.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i)?.[1];
        const lastmod = content.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/i)?.[1] || "";
        if (loc && /\/[a-zA-Z0-9_-]{6,}$/.test(loc) && !loc.endsWith(".xml")) {
          items.push({ url: loc, date: lastmod });
        }
      }
      
      // Sort by date descending if available
      items.sort((a, b) => b.date.localeCompare(a.date));
      
      if (items.length) {
        return items.slice(0, limit).map(i => ({ url: i.url, title: "" }));
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
  
  // Specific handling for common news sites to ensure we get the absolute latest from their homepage/API
  if (h.includes("dainikamadershomoy")) {
    const items = await fromAmaderShomoy(siteUrl, limit).catch(() => []);
    if (items.length) return items;
  }
  
  // Generic RSS discovery (usually carries latest news)
  const rss = await fromRss(siteUrl, limit);
  if (rss.length) return rss;
  
  // News Sitemap discovery
  const sitemap = await fromNewsSitemap(siteUrl, limit);
  if (sitemap.length) return sitemap;

  // Final fallback: Scrape the homepage directly to find the absolute latest headlines.
  try {
    const html = await getText(siteUrl);
    const linkMatches = [...html.matchAll(/href=["']([^"']+)["']/gi)];
    const uniqueLinks = [...new Set(linkMatches.map(m => m[1] as string))];
    
    const items: SourceItem[] = [];
    // Prioritize links found earlier in the HTML (usually top news/headlines)
    for (const link of uniqueLinks) {
      if (!link || link === '#' || link.length < 15) continue;
      
      const fullUrl = link.startsWith('http') ? link : new URL(link, siteUrl).href;
      
      if (/\.(jpg|jpeg|png|gif|webp|avif|css|js|mjs|json|xml|ico|svg|woff|woff2|ttf|otf|eot|pdf|mp3|mp4|m3u8|zip)(\?|$)/i.test(fullUrl)) continue;
      if (/\/(tag|tags|author|authors|search|topic|topics|category|categories|section|page|subscribe|newsletter|login|account|privacy|terms|about|contact|archive|videos?|podcasts?|live)(\/|$)/i.test(fullUrl)) continue;
      if (fullUrl === siteUrl || fullUrl === siteUrl + '/') continue;

      // সেকশন/ক্যাটাগরি পেজ বাদ: শেষ অংশে স্লাগ-সদৃশ কিছু থাকতেই হবে
      let lastSegment = "";
      try {
        const path = new URL(fullUrl).pathname.replace(/\/+$/, "");
        lastSegment = path.split('/').pop() ?? "";
      } catch { continue; }
      const slugLike = lastSegment.length >= 10 && (/-/.test(lastSegment) || /\d{4,}/.test(lastSegment));
      if (!slugLike) continue;
      
      
      // Prothom Alo specific pattern: /bangladesh/politics/v1a2b3c
      // Daily Star specific pattern: /news/bangladesh/politics/slug-12345
      const isArticle = /\/(bangladesh|international|politics|education|video|technology|jobs|sports|entertainment|lifestyle|economics|law|opinion|special-reports|photo-gallery|chakri|probash|orthoniti|shikkha|antorjatik|binodon|khela|prajukti|apradh|durprobas|video-gallery|details|news|article|world|views)\//.test(fullUrl) || 
                        /\/\d{4}\/\d{2}\/\d{2}\//.test(fullUrl) ||
                        (fullUrl.split('/').length > 4 && fullUrl.length > 35);

      if (isArticle) {
        items.push({ url: fullUrl, title: "" });
        if (items.length >= limit) break;
      }
    }
    
    return items;
  } catch (e) {
    console.error("Scraping fallback failed:", e);
  }

  return [];
}

/* ---------------- extraction ---------------- */

/** ছবিটি আসল নিউজ ছবি কিনা (লোগো/আইকন/প্লেসহোল্ডার নয়)। */
function usableImage(src: string) {
  if (!src || src.startsWith("data:")) return false;
  if (/\.svg(\?|$)/i.test(src)) return false;
  return !/(logo|icon|favicon|sprite|placeholder|avatar|default[-_]?img|blank|1x1|spacer|pixel)/i.test(
    src,
  );
}

/** পেজ থেকে সম্ভাব্য সব জায়গা দেখে মূল ছবিটি বের করে। */
function extractImage(html: string, pageUrl: string): string {
  const candidates: string[] = [];
  const push = (value?: string | null) => {
    if (value) candidates.push(value.trim().replace(/&amp;/g, "&"));
  };

  push(meta(html, "og:image"));
  push(meta(html, "og:image:secure_url"));
  push(meta(html, "twitter:image"));
  push(meta(html, "twitter:image:src"));
  push(meta(html, "image"));

  // JSON-LD (NewsArticle) থেকে ছবি
  for (const block of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = block[1] ?? "";
    for (const m of raw.matchAll(/"(?:url|contentUrl)"\s*:\s*"([^"]+\.(?:jpe?g|png|webp)[^"]*)"/gi)) {
      push(m[1]);
    }
  }

  // <picture>/<img> — lazy-load অ্যাট্রিবিউটসহ
  const imgTags = [...html.matchAll(/<(?:img|source)\b[^>]*>/gi)].map((m) => m[0]);
  for (const tag of imgTags) {
    for (const attr of ["data-src", "data-original", "data-lazy-src", "data-srcset", "srcset", "src"]) {
      const value = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"))?.[1];
      if (!value) continue;
      const first = value.split(",").pop()?.trim().split(/\s+/)[0];
      push(first ?? value);
    }
  }

  for (const candidate of candidates) {
    let full = candidate;
    if (!/^https?:\/\//i.test(full)) {
      if (full.startsWith("//")) full = `https:${full}`;
      else {
        try {
          full = new URL(full, pageUrl).href;
        } catch {
          continue;
        }
      }
    }
    if (usableImage(full)) return full;
  }
  return "";
}

/** প্রকাশের সময় (ISO) বের করে, না পেলে খালি। */
function extractPublishedAt(html: string): string {
  const raw =
    meta(html, "article:published_time") ||
    meta(html, "article:modified_time") ||
    meta(html, "publish-date") ||
    meta(html, "pubdate") ||
    html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1] ||
    html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1] ||
    "";
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : "";
}

export async function fetchArticle(url: string): Promise<SourceArticle> {
  const html = await getText(url);
  const title = meta(html, "og:title") || stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");

  const image = extractImage(html, url);
  const publishedAt = extractPublishedAt(html);


  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1] ?? ""))
    .filter((p) => p.length > 50 && !/cookie|javascript|©|comment|copyright|advertisement|বিজ্ঞাপন|আমাদের সাথে থাকুন|সাবস্ক্রাইব করুন/i.test(p));

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

  return {
    url,
    title: title.trim(),
    body: body.trim(),
    image: image || undefined,
    publishedAt: publishedAt || undefined,
  };
}

export { host as sourceHost };
