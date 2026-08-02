import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SectionHeading } from "@/components/news-cards";
import { Reveal } from "@/components/reveal";
import { categoryName } from "@/lib/news-data";
import { banglaDateTime, fetchPublishedPosts } from "@/lib/posts";

export function LatestPosts({ category, limit = 8 }: { category?: string; limit?: number }) {
  const { data } = useQuery({
    queryKey: ["published-posts", category ?? "all", limit],
    queryFn: () => fetchPublishedPosts(limit, category),
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeading title="সর্বশেষ প্রকাশিত" />
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((p, i) => (
          <Reveal
            key={p.id}
            delay={i * 60}
            className={i === 0 && data.length < 4 ? "sm:col-span-2" : undefined}
          >
            <article
              className={
                i === 0 && data.length < 4
                  ? "group grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                  : "group"
              }
            >

              {p.image_url && (
                <Link
                  to="/post/$slug"
                  params={{ slug: p.slug ?? "" }}
                  className="block overflow-hidden"
                >
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    loading="lazy"
                  />
                </Link>
              )}
              <div>
                <Link to="/post/$slug" params={{ slug: p.slug ?? "" }}>
                  <h3 className="font-display text-[17px] leading-[1.4] font-bold transition-colors group-hover:text-primary sm:mt-0">
                    {p.kicker && <span className="text-primary">{p.kicker} / </span>}
                    {p.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {categoryName(p.category)} · {banglaDateTime(p.published_at ?? p.created_at)}
                </p>
                {p.excerpt && i === 0 && data.length < 4 && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
