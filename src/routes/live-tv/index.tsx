import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoStrip } from "@/components/home-widgets";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";

export const Route = createFileRoute("/live-tv/")({
  head: () => ({
    meta: [
      { title: "লাইভ টিভি ও ভিডিও — প্রভাতবাংলা" },
      { name: "description", content: "প্রভাতবাংলায় দেখুন বাংলাদেশের জনপ্রিয় টেলিভিশন চ্যানেলের সরাসরি সম্প্রচার ও নির্বাচিত ভিডিও সংবাদ।" },
      { property: "og:title", content: "লাইভ টিভি ও ভিডিও — প্রভাতবাংলা" },
      { property: "og:description", content: "বাংলাদেশের জনপ্রিয় টিভি চ্যানেলের সরাসরি সম্প্রচার ও ভিডিও সংবাদ এক জায়গায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveTVPage,
});


function LiveTVPage() {
  const { data: videoPosts = [] } = useSuspenseQuery({
    queryKey: ["live-tv-video-gallery"],
    queryFn: async () => {
      const posts = await getHomeSectionPosts({ data: { category: "video-gallery", limit: 24 } });
      if (posts.length === 0) {
        const { articles } = await import("@/lib/news-data");
        return articles.filter(a => a.category === "video-gallery").map(a => ({
          id: String(a.id),
          title: a.title,
          slug: `demo-${a.id}`,
          image_url: a.image,
          category: a.category,
          status: "published"
        }));
      }
      return posts;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      <main className="py-8">
        <div className="mx-auto max-w-[1360px] px-4">
          <h1 className="mb-6 font-display text-3xl font-bold border-b-2 border-primary pb-2 inline-block">
            লাইভ টিভি ও ভিডিও
          </h1>
        </div>
        
        {/* Render the VideoStrip which contains the Live TV players */}
        <VideoStrip items={videoPosts} />
        
        <div className="mx-auto max-w-[1360px] px-4 mt-12">
          <p className="text-muted-foreground text-sm">
            * প্রভাতবাংলা লাইভ টিভি সেকশনে আমরা জনপ্রিয় বাংলাদেশি টেলিভিশন চ্যানেলগুলোর সরাসরি সম্প্রচার প্রদর্শন করি।
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}