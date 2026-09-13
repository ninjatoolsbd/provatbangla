/**
 * অটো নিউজ পাইপলাইন: সোর্স ক্রল → ডুপ্লিকেট চেক → AI রিরাইট → ইমেজ প্রসেস → পোস্ট।
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateTextWithFallback } from "@/lib/ai-providers.server";
import { SITE_NAME, sanitizeBrand, similarityRatio } from "@/lib/brand-sanitize";
import { processSourceImageDetailed } from "@/lib/news-media.server";
import { slugify } from "@/lib/post-utils";
import { discoverLatest, fetchArticle, sourceHost } from "@/lib/source-fetch.server";

/** সাইটে ব্যবহৃত বৈধ ক্যাটাগরি স্লাগ। */
const CATEGORIES = [
  "opradh", "antorjatik", "bangladesh", "shikkha", "chakri", "projukti", "khela", "binodon",
  "shilpo-sahitto", "jibonjapon", "cholonbil", "video", "health", "probas", "orthoniti",
  "ain-adalat", "motamot", "bishesh-protibedon", "photo-gallery", "onnanno",
] as const;

/** ইংরেজি সোর্স কিনা লেখা দেখে বুঝে নেয় (auto_sources-এ lang কলাম নেই)। */
function detectLang(text: string): "bn" | "en" {
  const bangla = (text.match(/[\u0980-\u09FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return bangla > latin * 0.2 ? "bn" : "en";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = supabaseAdmin as any;

export type AutoRunResult = {
  created: number;
  skipped: number;
  failed: number;
  dryRun?: boolean;
  details: { title: string; status: string; message?: string }[];
  previews?: AutoPreview[];
};

/** ড্রাই-রানে তৈরি হওয়া (কিন্তু সেভ না করা) নিউজের পূর্বরূপ। */
export type AutoPreview = {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceTitle: string;
  title: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  category: string;
  imageUrl: string | null;
  sourceImage: string | null;
  lang?: string;
};

async function settings(): Promise<Record<string, string>> {
  const { data } = await admin.from("site_settings").select("key,value");
  const out: Record<string, string> = {};
  for (const row of (data ?? []) as { key: string; value: string | null }[]) {
    out[row.key] = row.value ?? "";
  }
  return out;
}

type Rewritten = {
  title: string;
  
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  category: string;
};

async function rewriteOnce(
  article: { title: string; body: string },
  fallbackCategory: string,
  sourceLang = "bn",
  strict = false,
  extraNames: string[] = [],
) {
  const isEnglish = sourceLang === "en";
  const system =
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক। নির্দেশিত মার্কারগুলো ঠিক রেখে শুধু সম্পাদিত সংবাদটি দেবে।";
  const prompt = [
    isEnglish 
      ? "নিচের ইংরেজি সংবাদটি সম্পূর্ণ বাংলায় অনুবাদ ও পুনর্লিখন করো।"
      : "নিচের সংবাদটি সম্পূর্ণ নতুন ভাষায় বিস্তারিতভাবে বাংলায় পুনর্লিখন করো।",
    "নিয়ম:",
    isEnglish ? "- ইংরেজি থেকে সরাসরি অনুবাদ না করে সাংবাদিকতার বাংলা ভাষায় ভাবানুবাদ করো।" : "",
    "- তথ্য অপরিবর্তিত রাখবে, কোনো তথ্য বাদ দেবে না এবং নতুন কোনো তথ্য বা উদ্ধৃতি বানাবে না।",
    "- নিউজটি যথেষ্ট দীর্ঘ (কমপক্ষে ৩০০-৪০০ শব্দ) এবং সাবলীল হতে হবে।",
    "- বাক্য গঠন সম্পূর্ণ ভিন্ন হবে, হুবহু কপি নয়। পেশাদার সাংবাদিকতার ভাষা ব্যবহার করো।",
    strict
      ? "- আগের চেষ্টাটি মূল লেখার খুব কাছাকাছি হয়েছে। এবার প্রতিটি বাক্য নতুন করে সাজাও, অনুচ্ছেদের ক্রমও বদলাও; একটি বাক্যও হুবহু রাখা যাবে না।"
      : "",
    `- অন্য কোনো সংবাদমাধ্যম, ওয়েবসাইট, প্রতিবেদক বা সংবাদদাতার নাম লিখবে না। প্রয়োজনে শুধু "${SITE_NAME}" লিখবে।`,
    "- 'সূত্র:', 'নিজস্ব প্রতিবেদক', 'স্টাফ রিপোর্টার' জাতীয় কোনো বাইলাইন বা ক্রেডিট লাইন থাকবে না।",
    "- অনুচ্ছেদগুলো আসল ফাঁকা লাইন দিয়ে আলাদা করো। কমপক্ষে ৪-৫টি অনুচ্ছেদ থাকবে।",
    "- seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- category হবে এর একটি: opradh, antorjatik, bangladesh, shikkha, chakri, projukti, khela, binodon, shilpo-sahitto, jibonjapon, cholonbil, video, health, probas, orthoniti, ain-adalat, motamot, bishesh-protibedon, photo-gallery, onnanno।",
    "",
    "নিচের মার্কারগুলো হুবহু রেখে উত্তর দাও। JSON বা Markdown ব্যবহার করবে না:",
    "[TITLE]শিরোনাম[/TITLE]",
    
    "[EXCERPT]সংক্ষিপ্ত সারাংশ[/EXCERPT]",
    "[CONTENT]পূর্ণ সংবাদ, একাধিক অনুচ্ছেদসহ[/CONTENT]",
    "[SEO_TITLE]SEO শিরোনাম[/SEO_TITLE]",
    "[SEO_DESCRIPTION]SEO বর্ণনা[/SEO_DESCRIPTION]",
    "[CATEGORY]category-slug[/CATEGORY]",
    "",
    `মূল শিরোনাম: ${article.title}`,
    `মূল সংবাদ (বিস্তারিত লিখুন):\n${article.body.slice(0, 8000)}`,
  ].join("\n");

  const { text } = await generateTextWithFallback({ system, prompt, json: false });
  const field = (name: string) => {
    const match = text.match(new RegExp(`\\[${name}\\]([\\s\\S]*?)\\[\\/${name}\\]`, "i"));
    return match?.[1]?.trim() ?? "";
  };
  const parsed: Partial<Rewritten> = {
    title: field("TITLE"),
    
    excerpt: field("EXCERPT"),
    content: field("CONTENT"),
    seo_title: field("SEO_TITLE"),
    seo_description: field("SEO_DESCRIPTION"),
    category: field("CATEGORY"),
  };

  if (!parsed.content) {
    const plain = text
      .replace(/```[a-z]*|```/gi, "")
      .replace(/\[(?:\/?)(?:TITLE|EXCERPT|CONTENT|SEO_TITLE|SEO_DESCRIPTION|CATEGORY)\]/gi, "")
      .trim();
    if (plain.length < 200) throw new Error("AI থেকে পূর্ণ সংবাদ পাওয়া যায়নি");
    parsed.content = plain;
  }
  if (!parsed.title) parsed.title = article.title;

  const allowed = CATEGORIES as readonly string[];
  const aiCategory = allowed.includes(parsed.category ?? "") ? (parsed.category as string) : "";
  const forced =
    fallbackCategory && fallbackCategory !== "auto" && allowed.includes(fallbackCategory)
      ? fallbackCategory
      : "";
  const clean = (value: string) => sanitizeBrand(value, extraNames);

  return {
    title: clean(parsed.title),
    excerpt: clean(parsed.excerpt || parsed.content.slice(0, 160)),
    content: clean(parsed.content),
    seo_title: clean(parsed.seo_title ?? ""),
    seo_description: clean(parsed.seo_description ?? ""),
    // সোর্সে নির্দিষ্ট ক্যাটাগরি না থাকলে AI-ই ক্যাটাগরি বেছে নেয়
    category: forced || aiCategory || "bangladesh",
  } satisfies Rewritten;
}

/** রিরাইট করে, মূল লেখার সঙ্গে বেশি মিল থাকলে আরেকবার কঠোরভাবে রিরাইট করে। */
async function rewrite(
  article: { title: string; body: string },
  fallbackCategory: string,
  sourceLang = "bn",
  extraNames: string[] = [],
) {
  let news = await rewriteOnce(article, fallbackCategory, sourceLang, false, extraNames);
  if (sourceLang === "bn" && similarityRatio(article.body, news.content) > 0.2) {
    const retry = await rewriteOnce(article, fallbackCategory, sourceLang, true, extraNames).catch(
      () => null,
    );
    if (retry) news = retry;
  }
  if (sourceLang === "bn" && similarityRatio(article.body, news.content) > 0.45) {
    throw new Error("রিরাইট মূল লেখার সঙ্গে প্রায় হুবহু মিলে যাচ্ছে");
  }
  return news;
}

/** এক রাউন্ড অটো-সিঙ্ক চালায়। dryRun হলে কিছুই সেভ হয় না, শুধু প্রিভিউ ফেরত আসে। */
export async function runAutoSync(
  options: { sourceId?: string; limit?: number; dryRun?: boolean } = {},
) {
  const cfg = await settings();
  const dryRun = options.dryRun === true;
  const result: AutoRunResult = {
    created: 0,
    skipped: 0,
    failed: 0,
    details: [],
    ...(dryRun ? { dryRun: true, previews: [] as AutoPreview[] } : {}),
  };

  if (cfg["auto_enabled"] === "false" && !options.sourceId) {
    return { ...result, details: [{ title: "অটোমেশন", status: "disabled" }] };
  }

  let query = admin.from("auto_sources").select("*").eq("enabled", true);
  if (options.sourceId) query = admin.from("auto_sources").select("*").eq("id", options.sourceId);
  const { data: sources } = await query;

  const publishStatus = cfg["auto_mode"] === "publish" ? "published" : "draft";
  const aiImage = cfg["auto_image_ai"] !== "false";
  const logoUrl = cfg["watermark_logo_url"] || "/logo.jpg";
  const allSourceNames = ((sources ?? []) as { name: string; site_url: string }[]).flatMap((s) => [
    s.name,
    sourceHost(s.site_url),
  ]);

  for (const source of (sources ?? []) as {
    id: string;
    name: string;
    site_url: string;
    category: string;
    per_run: number;
  }[]) {
    const brandNames = [...allSourceNames, source.name, sourceHost(source.site_url)];
    const limit = options.limit ?? source.per_run ?? 5;
    let items: { url: string; title: string; image?: string | undefined }[] = [];
    try {
      items = await discoverLatest(source.site_url, limit * 2);
    } catch (e) {
      result.failed += 1;
      result.details.push({
        title: source.name,
        status: "source-error",
        message: e instanceof Error ? e.message : String(e),
      });
      continue;
    }

    let processed = 0;
    for (const item of items) {
      if (processed >= limit) break;

      const { data: existing } = await admin
        .from("auto_items")
        .select("id,status")
        .eq("source_url", item.url)
        .maybeSingle();
      if (existing && existing.status !== "failed") {
        result.skipped += 1;
        continue;
      }
      if (existing?.status === "failed") {
        await admin.from("auto_items").delete().eq("id", existing.id);
      }

      processed += 1;
      try {
        const article = await fetchArticle(item.url);
        const title = article.title || item.title;
        const body = article.body;
        if (!title || body.length < 120) throw new Error("যথেষ্ট কনটেন্ট পাওয়া যায়নি");

        const news = await rewrite(
          { title, body },
          source.category && source.category !== "auto" ? source.category : "bangladesh",
          sourceLang,
        );

        const sourceImage = article.image ?? item.image ?? null;
        const imageUrl = sourceImage
          ? await processSourceImage({ imageUrl: sourceImage, logoUrl, aiModify: aiImage })
          : null;

        const credit = withCredit
          ? `\n\nসূত্র: ${source.name} (${sourceHost(source.site_url)})`
          : "";

        if (dryRun) {
          result.previews?.push({
            sourceId: source.id,
            sourceName: source.name,
            sourceUrl: item.url,
            sourceTitle: title,
            title: news.title,
            
            excerpt: news.excerpt,
            content: news.content + credit,
            seo_title: news.seo_title,
            seo_description: news.seo_description,
            category: news.category,
            imageUrl,
            sourceImage,
          });
          result.created += 1;
          result.details.push({ title: news.title, status: "preview" });
          continue;
        }

        const { data: inserted, error } = await admin
          .from("posts")
          .insert({
            title: news.title,
            slug: slugify(news.title),
            
            category: news.category,
            image_url: imageUrl,
            excerpt: news.excerpt,
            content: news.content + credit,
            seo_title: news.seo_title || null,
            seo_description: news.seo_description || null,
            status: publishStatus,
            published_at: publishStatus === "published" ? new Date().toISOString() : null,
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);

        await admin.from("auto_items").insert({
          source_id: source.id,
          source_url: item.url,
          source_title: title,
          post_id: inserted.id,
          status: publishStatus,
        });
        result.created += 1;
        result.details.push({ title: news.title, status: publishStatus });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        result.failed += 1;
        if (!dryRun) {
          await admin.from("auto_items").insert({
            source_id: source.id,
            source_url: item.url,
            source_title: item.title,
            status: "failed",
            message: message.slice(0, 400),
          });
        }
        result.details.push({ title: item.title || item.url, status: "failed", message });
      }
    }

    if (!dryRun) {
      await admin
        .from("auto_sources")
        .update({
          last_run_at: new Date().toISOString(),
          last_status: `${result.created} নতুন, ${result.failed} ব্যর্থ`,
        })
        .eq("id", source.id);
    }
  }

  return result;
}

/** ড্রাই-রানে দেখা একটি প্রিভিউ (সম্পাদনা শেষে) সাইটে সেভ করে। */
export async function publishPreview(
  preview: AutoPreview & { status?: "draft" | "published" | undefined },
) {
  const cfg = await settings();
  const status =
    preview.status ?? (cfg["auto_mode"] === "publish" ? "published" : "draft");

  const { data: existing } = await admin
    .from("auto_items")
    .select("id")
    .eq("source_url", preview.sourceUrl)
    .maybeSingle();
  if (existing) return { status: "skipped" as const };

  const { data: inserted, error } = await admin
    .from("posts")
    .insert({
      title: preview.title,
      slug: slugify(preview.title),
      
      category: preview.category,
      image_url: preview.imageUrl,
      excerpt: preview.excerpt,
      content: preview.content,
      seo_title: preview.seo_title || null,
      seo_description: preview.seo_description || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await admin.from("auto_items").insert({
    source_id: preview.sourceId,
    source_url: preview.sourceUrl,
    source_title: preview.sourceTitle,
    post_id: inserted.id,
    status,
  });

  return { status };
}
