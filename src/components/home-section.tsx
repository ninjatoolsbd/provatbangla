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
    
    excerpt: p.excerpt,
    category: p.category,
    time: new Date(p.published_at || p.created_at).toLocaleDateString('bn-BD'),
  }));

  if (layout === "national") {
    return (
      <section className="mt-5 border border-border bg-card p-4">
        <BarHeading title={title} slug={slug} />
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-border">
          <div className="min-w-0 lg:col-span-5 lg:pr-5">
            <LeadCard article={mappedPosts[0] as any} />
          </div>
          <div className="min-w-0 lg:col-span-4 lg:px-5">
            {mappedPosts.slice(1, 4).map((a: any, i: number) => (
              <Reveal key={a.id} delay={i * 60}>
                <ThumbRow article={a as any} />
              </Reveal>
            ))}
          </div>
          <div className="min-w-0 lg:col-span-3 lg:pl-5">
             <ul className="divide-y divide-border border-t border-border">
              {mappedPosts.slice(4, 9).map((a: any) => (
                <li key={a.id}>
                  <Link
                    to="/post/$slug"
                    params={{ slug: a.slug ?? "" }}
                    className="group block py-2.5 transition-transform duration-300 hover:translate-x-1"
                  >
                    <span className="line-clamp-3 font-display text-[14px] leading-[1.4] font-bold transition-colors group-hover:text-primary sm:text-[15px] sm:leading-snug">
                      
                      {a.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "politics") {
      return (
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title={title} slug={slug} />
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-4">
              <LeadCard article={mappedPosts[0] as any} />
            </div>
            <div className="grid min-w-0 gap-x-4 gap-y-5 grid-cols-1 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
              {mappedPosts.slice(1, 7).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 60}>
                  <GridCard article={a as any} compact />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      );
  }

  return (
    <section className="mt-5 border border-border bg-card p-4">
      <BarHeading title={title} slug={slug} />
      <div className="grid gap-x-6 gap-y-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
        {mappedPosts.map((a: any, i: number) => (
          <Reveal key={a.id} delay={i * 60}>
            <GridCard article={a as any} compact />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
