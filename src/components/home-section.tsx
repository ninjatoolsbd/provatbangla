import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GridCard, LeadCard, ThumbRow } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";
import { Reveal } from "@/components/reveal";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";

interface HomeSectionProps {
  title: string;
  slug: string;
  layout?: "national" | "politics" | "economy" | "grid";
}

export function HomeSection({ title, slug, layout = "grid" }: HomeSectionProps) {
  const fetchPosts = useServerFn(getHomeSectionPosts);
  
  const { data: posts } = useSuspenseQuery({
    queryKey: ["home-section", slug],
    queryFn: () => fetchPosts({ data: { category: slug, limit: layout === "grid" ? 4 : 8 } }),
  });

  if (!posts || (posts as any[]).length === 0) return null;

  // Map DB post to Article-like shape for existing components
  const mappedPosts = (posts as any[]).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.image_url,
    kicker: p.kicker,
    excerpt: p.excerpt,
    category: p.category,
    time: new Date(p.published_at || p.created_at).toLocaleDateString('bn-BD'),
  }));

  if (layout === "national") {
    return (
      <section className="mt-5 border border-border bg-card p-4">
        <BarHeading title={title} slug={slug} />
        <div className="grid gap-5 lg:grid-cols-12 lg:divide-x lg:divide-border">
          {/* Big Hero - Top Left */}
          <div className="min-w-0 lg:col-span-6 lg:pr-5">
            <LeadCard article={mappedPosts[0] as any} />
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
              {mappedPosts.slice(1, 4).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 60}>
                  <GridCard article={a as any} compact />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right side - 2 columns of 3 items each */}
          <div className="min-w-0 lg:col-span-6 lg:pl-5">
             <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                {mappedPosts.slice(4, 10).map((a: any, i: number) => (
                  <Reveal key={a.id} delay={i * 60}>
                    <div className="border-b border-border pb-2 last:border-0">
                      <GridCard article={a as any} compact showImage={false} />
                    </div>
                  </Reveal>
                ))}
             </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "politics") {
    return (
      <section className="mt-5 border border-border bg-card p-4">
        <BarHeading title={title} slug={slug} />
        <div className="grid gap-5 lg:grid-cols-12 lg:divide-x lg:divide-border">
          {/* Main big story */}
          <div className="min-w-0 lg:col-span-4 lg:pr-5">
            <LeadCard article={mappedPosts[0] as any} />
          </div>
          
          {/* Middle column: 3 items with horizontal layout */}
          <div className="min-w-0 lg:col-span-5 lg:px-5">
            <div className="flex flex-col gap-1">
              {mappedPosts.slice(1, 4).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 60}>
                  <ThumbRow article={a as any} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right column: 3 items, small grid with images */}
          <div className="min-w-0 lg:col-span-3 lg:pl-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {mappedPosts.slice(4, 7).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 60}>
                  <GridCard article={a as any} compact showImage />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 border border-border bg-card p-4">
      <BarHeading title={title} slug={slug} />
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
        {mappedPosts.map((a: any, i: number) => (
          <Reveal key={a.id} delay={i * 60}>
            <GridCard article={a as any} compact />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
