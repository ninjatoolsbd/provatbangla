import { createFileRoute } from "@tanstack/react-router";
import { createPublicServerClient } from "@/lib/supabase-public";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const supabase = createPublicServerClient();
        const { data: posts, error } = await supabase
          .from("posts")
          .select("id, title, slug, image_url, category, content, excerpt, author_name, published_at, created_at")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(50);

        if (error) {
          return new Response("Feed unavailable", { status: 500 });
        }

        const siteUrl = origin;
        const items = (posts ?? [])
          .map((p) => {
            const link = `${siteUrl}/post/${p.slug}`;
            const pubDate = new Date(p.published_at ?? p.created_at).toUTCString();
            const description = escapeXml(
              (p.excerpt || stripHtml(p.content ?? "").slice(0, 300)).trim(),
            );
            const imageTag = p.image_url
              ? `\n        <enclosure url="${escapeXml(p.image_url)}" type="image/jpeg" />\n        <media:content url="${escapeXml(p.image_url)}" medium="image" />`
              : "";
            return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(p.category ?? "")}</category>
      ${p.author_name ? `<dc:creator>${escapeXml(p.author_name)}</dc:creator>` : ""}
      <description>${description}</description>${imageTag}
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>প্রভাত বাংলা</title>
    <link>${siteUrl}</link>
    <description>প্রভাত বাংলা — সর্বশেষ সংবাদ</description>
    <language>bn</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
