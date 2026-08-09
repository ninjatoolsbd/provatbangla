import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { GridCard, LeadCard, ThumbRow, NewsImage } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";
import { Reveal } from "@/components/reveal";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";


interface HomeSectionProps {
  title: string;
  slug: string;
  layout?: "national" | "politics" | "economy" | "grid" | "two-col-with-side";
  sideCategory?: string;
  sideTitle?: string;
}


export function HomeSection({ title, slug, layout = "grid", sideCategory, sideTitle }: HomeSectionProps) {
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
                    <span className="line-clamp-2 font-display text-[15px] leading-snug font-bold transition-colors group-hover:text-primary">
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
        <section className="mt-5 border border-border bg-card p-4">
          <BarHeading title={title} slug={slug} />
          <div className="grid gap-5 lg:grid-cols-12">
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

  if (layout === "two-col-with-side") {
    return (
      <section className="mt-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Left content (e.g., Bangladesh) */}
          <div className="lg:col-span-8">
            <BarHeading title={title} slug={slug} />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <LeadCard article={mappedPosts[0] as any} />
              </div>
              {mappedPosts.slice(1, 5).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 60}>
                  <ThumbRow article={a as any} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right sidebar content (e.g., Islam/Sidebar widget) */}
          <div className="lg:col-span-4">
            {sideCategory && (
              <SidebarListSection category={sideCategory} title={sideTitle ?? "অন্যান্য"} />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 border border-border bg-card p-4">
      <BarHeading title={title} slug={slug} />
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {mappedPosts.map((a: any, i: number) => (
          <Reveal key={a.id} delay={i * 60}>
            <GridCard article={a as any} compact />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SidebarListSection({ category, title }: { category: string; title: string }) {
  const fetchPosts = useServerFn(getHomeSectionPosts);
  const { data: posts } = useQuery({
    queryKey: ["sidebar-list", category],
    queryFn: () => fetchPosts({ data: { category, limit: 6 } }),
  });

  if (!posts || (posts as any[]).length === 0) return null;

  const mapped = (posts as any[]).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.image_url,
  }));

  const main = mapped[0];

  return (
    <div className="bg-[#2a4d8c] text-white">
      <div className="bg-[#365ca3] px-4 py-3 font-display text-lg font-bold text-center">
        {title}
      </div>
      <div className="p-3">
        {main && (
          <Link to="/post/$slug" params={{ slug: main.slug ?? "" }} className="group block mb-4">
            <div className="relative overflow-hidden aspect-[16/10]">
              <NewsImage src={main.image} alt={main.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
            <h3 className="mt-2 line-clamp-2 font-display font-bold leading-tight group-hover:text-blue-200">
              {main.title}
            </h3>
          </Link>
        )}
        <div className="space-y-3">
          {mapped.slice(1).map((item) => (
            <Link key={item.id} to="/post/$slug" params={{ slug: item.slug ?? "" }} className="group flex gap-3 border-t border-white/20 pt-3">
              <NewsImage src={item.image} alt={item.title} className="size-16 shrink-0 object-cover rounded-sm" />
              <h4 className="line-clamp-2 text-sm font-bold group-hover:text-blue-200">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
      <Link to="/category/$slug" params={{ slug: category }} className="block bg-black/20 py-2 text-center text-xs font-bold transition-colors hover:bg-black/30">
        আরও পড়ুন <ChevronRight className="inline size-3" />
      </Link>
    </div>
  );
}

