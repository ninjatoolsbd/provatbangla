/**
 * অটো নিউজ পাইপলাইন: সোর্স ক্রল → ডুপ্লিকেট চেক → AI রিরাইট → ইমেজ প্রসেস → পোস্ট।
 */

import { supabaseAdmin } from "@/integrations/my-supabase/client.server";
import { generateTextWithFallback } from "@/lib/ai-providers.server";
import { processSourceImage } from "@/lib/news-media.server";
import { slugify } from "@/lib/post-utils";
import { discoverLatest, fetchArticle, sourceHost } from "@/lib/source-fetch.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = supabaseAdmin as any;

export type AutoRunResult = {
  created: number;
  skipped: number;
  failed: number;
  details: { title: string; status: string; message?: string }[];
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
  kicker: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  category: string;
};

async function rewrite(article: { title: string; body: string }, fallbackCategory: string) {
  const system =
    "তুমি একজন অভিজ্ঞ বাংলা সংবাদ সম্পাদক। সবসময় শুধুমাত্র বৈধ JSON আউটপুট দেবে, কোনো ব্যাখ্যা ছাড়া।";
  const prompt = [
    "নিচের সংবাদটি সম্পূর্ণ নতুন ভাষায় বাংলায় পুনর্লিখন করো।",
    "নিয়ম:",
    "- তথ্য অপরিবর্তিত রাখবে, নতুন কোনো তথ্য বা উদ্ধৃতি বানাবে না।",
    "- বাক্য গঠন সম্পূর্ণ ভিন্ন হবে, হুবহু কপি নয়।",
    "- content-এ কমপক্ষে ৪টি অনুচ্ছেদ, ফাঁকা লাইন দিয়ে আলাদা, মার্কডাউন নয়।",
    "- seo_title সর্বোচ্চ ৬০ অক্ষর, seo_description সর্বোচ্চ ১৫৫ অক্ষর।",
    "- category হবে এর একটি: opradh, antorjatik, bangladesh, shikkha, chakri, projukti, khela, binodon, shilpo-sahitto, jibonjapon, cholonbil, onnanno",
    "",
    'শুধু এই JSON: {"title":"","kicker":"","excerpt":"","content":"","seo_title":"","seo_description":"","category":""}',
    "",
    `মূল শিরোনাম: ${article.title}`,
    `মূল সংবাদ:\n${article.body.slice(0, 6000)}`,
  ].join("\n");

  const { text } = await generateTextWithFallback({ system, prompt, json: true });
  const parsed = JSON.parse(text) as Partial<Rewritten>;
  if (!parsed.title || !parsed.content) throw new Error("AI সঠিক ফরম্যাটে উত্তর দেয়নি");
  return {
    title: parsed.title,
    kicker: parsed.kicker ?? "",
    excerpt: parsed.excerpt ?? parsed.content.slice(0, 160),
    content: parsed.content,
    seo_title: parsed.seo_title ?? "",
    seo_description: parsed.seo_description ?? "",
    category: parsed.category || fallbackCategory,
  } satisfies Rewritten;
}

/** এক রাউন্ড অটো-সিঙ্ক চালায়। */
export async function runAutoSync(options: { sourceId?: string; limit?: number } = {}) {
  const cfg = await settings();
  const result: AutoRunResult = { created: 0, skipped: 0, failed: 0, details: [] };

  if (cfg["auto_enabled"] === "false" && !options.sourceId) {
    return { ...result, details: [{ title: "অটোমেশন", status: "disabled" }] };
  }

  let query = admin.from("auto_sources").select("*").eq("enabled", true);
  if (options.sourceId) query = admin.from("auto_sources").select("*").eq("id", options.sourceId);
  const { data: sources } = await query;

  const publishStatus = cfg["auto_mode"] === "publish" ? "published" : "draft";
  const withCredit = cfg["auto_credit"] !== "false";
  const aiImage = cfg["auto_image_ai"] !== "false";
  const logoUrl = cfg["watermark_logo_url"] || undefined;

  for (const source of (sources ?? []) as {
    id: string;
    name: string;
    site_url: string;
    category: string;
    per_run: number;
  }[]) {
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
        .select("id")
        .eq("source_url", item.url)
        .maybeSingle();
      if (existing) {
        result.skipped += 1;
        continue;
      }

      processed += 1;
      try {
        const article = await fetchArticle(item.url);
        const title = article.title || item.title;
        const body = article.body;
        if (!title || body.length < 120) throw new Error("যথেষ্ট কনটেন্ট পাওয়া যায়নি");

        const news = await rewrite({ title, body }, source.category === "auto" ? "bangladesh" : source.category);

        const sourceImage = article.image ?? item.image;
        const imageUrl = sourceImage
          ? await processSourceImage({ imageUrl: sourceImage, logoUrl, aiModify: aiImage })
          : null;

        const credit = withCredit
          ? `\n\nসূত্র: ${source.name} (${sourceHost(source.site_url)})`
          : "";

        const { data: inserted, error } = await admin
          .from("posts")
          .insert({
            title: news.title,
            slug: slugify(news.title),
            kicker: news.kicker || null,
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
        await admin.from("auto_items").insert({
          source_id: source.id,
          source_url: item.url,
          source_title: item.title,
          status: "failed",
          message: message.slice(0, 400),
        });
        result.details.push({ title: item.title || item.url, status: "failed", message });
      }
    }

    await admin
      .from("auto_sources")
      .update({
        last_run_at: new Date().toISOString(),
        last_status: `${result.created} নতুন, ${result.failed} ব্যর্থ`,
      })
      .eq("id", source.id);
  }

  return result;
}
