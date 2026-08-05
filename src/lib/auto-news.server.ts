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
  kicker: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  category: string;
  imageUrl: string | null;
  sourceImage: string | null;
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

async function rewrite(
  article: { title: string; body: string },
  fallbackCategory: string,
  useSpinRewriter = false,
) {
  if (useSpinRewriter) {
    try {
      // Direct call to spin-rewriter (manual step since spin-rewriter doesn't support JSON naturally)
      // For automation, we often want the full AI context, but user specifically asked for Spin Rewriter.
      // We'll use the fallback chain but preferred spin-rewriter.
      const spinRes = await generateTextWithFallback({
        system: "Rewrite this news article in Bengali professionally.",
        prompt: `নিচের সংবাদটি সম্পূর্ণ নতুন ভাষায় বাংলায় পুনর্লিখন করো:\n\n${article.body.slice(0, 4000)}`,
        preferred: "spin-rewriter",
      });
      
      // Since Spin Rewriter just returns text, we still need an LLM to structure it into our JSON format
      const structurePrompt = `
        নিচের রিরাইট করা বাংলা টেক্সট থেকে টাইটেল, কিকার, এক্সার্প্ট এবং এসইও ডেটা বের করে নিচের JSON ফরম্যাটে দাও। 
        ক্যাটাগরি হবে এর একটি: opradh, antorjatik, bangladesh, shikkha, chakri, projukti, khela, binodon, shilpo-sahitto, jibonjapon, cholonbil, onnanno
        
        টেক্সট: ${spinRes.text}
        
        JSON ফরম্যাট: {"title":"","kicker":"","excerpt":"","content":"","seo_title":"","seo_description":"","category":""}
      `;
      
      const { text } = await generateTextWithFallback({ 
        system: "You are a professional news editor. Output ONLY valid JSON.", 
        prompt: structurePrompt, 
        json: true 
      });
      
      const parsed = JSON.parse(text) as Partial<Rewritten>;
      return {
        title: parsed.title || article.title,
        kicker: parsed.kicker ?? "",
        excerpt: parsed.excerpt ?? parsed.content?.slice(0, 160) ?? "",
        content: parsed.content || spinRes.text,
        seo_title: parsed.seo_title ?? "",
        seo_description: parsed.seo_description ?? "",
        category: parsed.category || fallbackCategory,
      } satisfies Rewritten;
    } catch (e) {
      console.error("Spin Rewriter failed, falling back to LLM rewrite", e);
    }
  }

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
  const withCredit = cfg["auto_credit"] !== "false";
  const aiImage = cfg["auto_image_ai"] !== "false";
  const logoUrl = cfg["watermark_logo_url"] || undefined;
  const useSpin = cfg["auto_spin_rewriter"] === "true";

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

        const news = await rewrite(
          { title, body },
          source.category === "auto" ? "bangladesh" : source.category,
          useSpin
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
            kicker: news.kicker,
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
      kicker: preview.kicker || null,
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
