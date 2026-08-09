import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { GridCard, LeadCard, ThumbRow, NewsImage } from "@/components/news-cards";
import { BarHeading } from "@/components/home-widgets";
import { Reveal } from "@/components/reveal";
import { getHomeSectionPosts } from "@/lib/public-posts.functions";
import { OpinionColumn } from "@/components/home-widgets";


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
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Left content */}
          <div className="lg:col-span-8">
            <BarHeading title={title} slug={slug} />
            <div className="grid gap-6 md:grid-cols-2">
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

          {/* Right sidebar content */}
          <div className="lg:col-span-4 space-y-8">
            {sideCategory && (
              <SidebarListSection category={sideCategory} title={sideTitle ?? "অন্যান্য"} />
            )}
            <div className="hidden lg:block">
              <OpinionColumn items={[]} />
            </div>
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
    <div className="border border-border bg-white shadow-sm overflow-hidden">
      <div className="bg-primary px-4 py-2 font-display text-[17px] font-bold text-white flex items-center justify-between">
        {title}
        <Link to="/category/$slug" params={{ slug: category }} className="text-[11px] font-normal hover:underline opacity-80">আরও খবর →</Link>
      </div>
      <div className="p-4 bg-[#f9f9f9]">
        {main && (
          <Link to="/post/$slug" params={{ slug: main.slug ?? "" }} className="group block mb-4 border-b border-border pb-4">
            <div className="relative overflow-hidden aspect-video">
              <NewsImage src={main.image} alt={main.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
            <h3 className="mt-3 line-clamp-2 font-display text-[16px] font-bold leading-snug group-hover:text-primary">
              {main.title}
            </h3>
          </Link>
        )}
        <div className="space-y-4">
          {mapped.slice(1).map((item) => (
            <Link key={item.id} to="/post/$slug" params={{ slug: item.slug ?? "" }} className="group flex gap-3 transition-all hover:translate-x-1">
              <NewsImage src={item.image} alt={item.title} className="size-14 shrink-0 object-cover rounded-sm border border-border" />
              <h4 className="line-clamp-2 text-[14px] font-bold leading-tight group-hover:text-primary">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

