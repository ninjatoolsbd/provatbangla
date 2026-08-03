/**
 * WordPress WXR (eXtended RSS) parser — runs in the browser with DOMParser.
 * Extracts posts, categories, featured images and dates from an exported XML file.
 */

export type WpPost = {
  wpId: string;
  title: string;
  slug: string;
  contentHtml: string;
  excerpt: string;
  categoryNames: string[];
  tagNames: string[];
  imageUrl: string | null;
  authorName: string;
  status: "published" | "draft";
  publishedAt: string | null;
};

const NS_CONTENT = "http://purl.org/rss/1.0/modules/content/";
const NS_EXCERPT = "http://wordpress.org/export/1.2/excerpt/";
const NS_WP = "http://wordpress.org/export/1.2/";
const NS_DC = "http://purl.org/dc/elements/1.1/";

function text(el: Element | null | undefined) {
  return (el?.textContent ?? "").trim();
}

function pick(item: Element, ns: string, name: string) {
  const list = item.getElementsByTagNameNS(ns, name);
  return list.length ? list[0]! : null;
}

/** All immediate wp:postmeta pairs of an item. */
function metaMap(item: Element) {
  const out: Record<string, string> = {};
  const metas = item.getElementsByTagNameNS(NS_WP, "postmeta");
  for (let i = 0; i < metas.length; i += 1) {
    const m = metas[i]!;
    const k = text(pick(m, NS_WP, "meta_key"));
    const v = text(pick(m, NS_WP, "meta_value"));
    if (k) out[k] = v;
  }
  return out;
}

export function htmlToPlainText(html: string) {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, "\n\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#\d+;/g, "");
  return s
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function firstImageInHtml(html: string) {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1]! : null;
}

function toIso(value: string) {
  if (!value || value.startsWith("0000")) return null;
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Parses a WordPress export file (WXR). Throws on invalid XML. */
export function parseWxr(xml: string): WpPost[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("XML ফাইলটি পড়া যায়নি — এটি কি WordPress export (WXR) ফাইল?");
  }

  const items = Array.from(doc.getElementsByTagName("item"));

  // attachment id -> url (for featured images)
  const attachments = new Map<string, string>();
  for (const item of items) {
    const type = text(pick(item, NS_WP, "post_type"));
    if (type !== "attachment") continue;
    const id = text(pick(item, NS_WP, "post_id"));
    const url = text(pick(item, NS_WP, "attachment_url"));
    if (id && url) attachments.set(id, url);
  }

  const posts: WpPost[] = [];
  for (const item of items) {
    const type = text(pick(item, NS_WP, "post_type"));
    if (type !== "post") continue;

    const status = text(pick(item, NS_WP, "status"));
    if (status === "trash" || status === "auto-draft") continue;

    const contentHtml = text(pick(item, NS_CONTENT, "encoded"));
    const excerptHtml = text(pick(item, NS_EXCERPT, "encoded"));
    const title = text(item.getElementsByTagName("title")[0]) || "শিরোনামহীন";

    const cats: string[] = [];
    const tags: string[] = [];
    const catEls = item.getElementsByTagName("category");
    for (let i = 0; i < catEls.length; i += 1) {
      const el = catEls[i]!;
      const domain = el.getAttribute("domain");
      const name = text(el);
      if (!name) continue;
      if (domain === "post_tag") tags.push(name);
      else cats.push(name);
    }

    const meta = metaMap(item);
    const thumbId = meta["_thumbnail_id"];
    const imageUrl =
      (thumbId && attachments.get(thumbId)) ||
      meta["_external_featured_image"] ||
      firstImageInHtml(contentHtml) ||
      null;

    const plain = htmlToPlainText(contentHtml);
    const excerpt =
      htmlToPlainText(excerptHtml) || plain.slice(0, 220).replace(/\s+\S*$/, "") || title;

    posts.push({
      wpId: text(pick(item, NS_WP, "post_id")),
      title,
      slug: decodeURIComponent(text(pick(item, NS_WP, "post_name"))),
      contentHtml: plain,
      excerpt,
      categoryNames: cats,
      tagNames: tags,
      imageUrl,
      authorName: text(pick(item, NS_DC, "creator")) || "প্রতিবেদক",
      status: status === "publish" ? "published" : "draft",
      publishedAt:
        toIso(text(pick(item, NS_WP, "post_date_gmt"))) ||
        toIso(text(item.getElementsByTagName("pubDate")[0])) ||
        toIso(text(pick(item, NS_WP, "post_date"))),
    });
  }

  return posts;
}

/** Unique WordPress category names across all parsed posts. */
export function collectCategories(posts: WpPost[]) {
  const set = new Set<string>();
  for (const p of posts) for (const c of p.categoryNames) set.add(c);
  return Array.from(set).sort();
}

/** Best-effort automatic mapping from a WP category name to a site category slug. */
export function guessCategory(name: string): string {
  const n = name.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/অপরাধ|crime|আইন/i, "apradh"],
    [/আন্তর্জাতিক|বিশ্ব|international|world/i, "antorjatik"],
    [/শিক্ষা|education|ক্যাম্পাস/i, "shikkha"],
    [/চাকরি|নিয়োগ|job|career/i, "chakri"],
    [/প্রযুক্তি|tech|বিজ্ঞান/i, "prajukti"],
    [/খেলা|ক্রীড়া|sports|ক্রিকেট|ফুটবল/i, "khela"],
    [/বিনোদন|entertainment|সিনেমা|নাটক/i, "binodon"],
    [/শিল্প|সাহিত্য|কবিতা|art|literature/i, "shilpo-sahitto"],
    [/জীবন|লাইফ|life|স্বাস্থ্য|health/i, "jibonjapon"],
    [/চলনবিল/i, "cholonbil"],
    [/ভিডিও|video/i, "video"],
    [/বাংলাদেশ|জাতীয়|দেশ|national|bangladesh|রাজনীতি|অর্থনীতি/i, "bangladesh"],
  ];
  for (const [re, slug] of rules) if (re.test(name) || re.test(n)) return slug;
  return "onnanno";
}
