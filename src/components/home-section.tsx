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
      <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
        <BarHeading title={title} slug={slug} className="mb-5" />
        <div className="grid gap-6 lg:grid-cols-12 lg:divide-x lg:divide-slate-200">
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
          <div className="min-w-0 lg:col-span-3 lg:pl-6">
             <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {mappedPosts.slice(4, 9).map((a: any) => (
                <li key={a.id}>
                  <Link
                    to="/post/$slug"
                    params={{ slug: a.slug ?? "" }}
                    className="group block py-2.5 transition-transform duration-300 hover:translate-x-1"
                  >
                    <span className="line-clamp-3 font-display text-[15px] leading-snug font-extrabold transition-colors group-hover:text-primary">
                      {a.kicker && <span className="text-primary">{a.kicker} / </span>}
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
        <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
          <BarHeading title={title} slug={slug} className="mb-5" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-4">
              <LeadCard article={mappedPosts[0] as any} />
            </div>
            <div className="grid min-w-0 gap-x-4 gap-y-5 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
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
    <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
      <BarHeading title={title} slug={slug} className="mb-5" />
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {mappedPosts.map((a: any, i: number) => (
          <Reveal key={a.id} delay={i * 60}>
            <GridCard article={a as any} compact />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
