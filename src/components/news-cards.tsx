import * as React from "react";
import { Link } from "@tanstack/react-router";

import type { Article } from "@/lib/news-data";
import type { Post } from "@/lib/posts";
import { categoryName } from "@/lib/news-data";
import { cn } from "@/lib/utils";

export const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1585829365234-781fcd04c838?auto=format&fit=crop&w=800&q=80";

export function NewsImage({ 
  src, 
  alt, 
  className, 
  loading = "lazy",
  width,
  height
}: { 
  src?: string | null; 
  alt: string; 
  className?: string;
  loading?: "lazy" | "eager";
  width?: string | number;
  height?: string | number;
}) {
  const [error, setError] = React.useState(false);
  
  // Reset error if src changes
  React.useEffect(() => {
    setError(false);
  }, [src]);

  const imageSrc = !src || error ? PLACEHOLDER_IMAGE : src;

  // Add a special check for empty or broken URLs
  const effectiveSrc = (imageSrc && imageSrc !== 'null' && imageSrc !== 'undefined') ? imageSrc : PLACEHOLDER_IMAGE;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={cn("bg-muted", className)}
      loading={loading}
      onError={() => {
        console.warn(`Image failed to load: ${effectiveSrc}`);
        setError(true);
      }}
      width={width}
      height={height}
    />
  );
}

function ArticleLink({
  article,
  className,
  children,
}: {
  article: Article | Post;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to="/post/$slug" params={{ slug: (article as any).slug ?? String(article.id) }} className={className}>
      {children}
    </Link>
  );
}

function Kicker({ article }: { article: Article | Post }) {
  if (!article.kicker) return null;
  return <span className="text-primary">{article.kicker} / </span>;
}

/** Big story: image on the left, headline + excerpt on the right (kalbela hero). */
export function SplitLead({ article }: { article: Article | Post }) {
  return (
    <article className="group grid gap-4 sm:grid-cols-[1.15fr_1fr]">
      <ArticleLink article={article} className="block overflow-hidden">
        <NewsImage
          src={(article as any).image ?? (article as any).image_url}
          alt={article.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="eager"
          width="600"
          height="450"
        />
      </ArticleLink>
      <div className="min-w-0">
        <ArticleLink article={article}>
          <h2 className="font-display text-[28px] leading-[1.2] font-extrabold transition-colors group-hover:text-primary sm:text-[42px]">
            <Kicker article={article} />
            {article.title}
          </h2>
        </ArticleLink>
        <p className="mt-3 line-clamp-4 text-[16px] leading-relaxed text-slate-600">
          {article.excerpt}
        </p>
      </div>
    </article>
  );
}


export function LeadCard({ article }: { article: Article | Post }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden">
        <NewsImage
          src={(article as any).image ?? (article as any).image_url}
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
          width="400"
          height="225"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h2 className="mt-3 font-display text-[22px] leading-snug font-extrabold transition-colors group-hover:text-primary">
          <Kicker article={article} />
          {article.title}
        </h2>
      </ArticleLink>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
    </article>
  );
}

export function GridCard({ article, compact = false }: { article: Article | Post; compact?: boolean }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden">
        <NewsImage
          src={(article as any).image ?? (article as any).image_url}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
          width="300"
          height="188"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h3
          className={cn(
            "mt-2.5 font-display leading-[1.4] font-extrabold transition-colors group-hover:text-primary",
            compact ? "text-[18px]" : "text-[22px]",
          )}
        >
          <Kicker article={article} />
          {article.title}
        </h3>
      </ArticleLink>
    </article>
  );
}

/** Compact row: small square thumb left, bold headline right. */
export function ThumbRow({ article }: { article: Article | Post }) {
  return (
    <article className="group flex gap-3 border-b border-border py-3 transition-all duration-300 last:border-0 hover:translate-x-1">
      <ArticleLink article={article} className="shrink-0 overflow-hidden">
        <NewsImage
          src={(article as any).image ?? (article as any).image_url}
          alt={article.title}
          className="size-[72px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
          width="72"
          height="72"
        />
      </ArticleLink>
      <ArticleLink article={article} className="min-w-0 flex-1">
        <h3 className="font-display text-[17px] leading-[1.45] font-extrabold transition-colors group-hover:text-primary">
          <Kicker article={article} />
          {article.title}
        </h3>
      </ArticleLink>
    </article>
  );
}

export function ListRow({ article, index }: { article: Article | Post; index?: number }) {
  return (
    <article className="group flex gap-3 border-b border-border py-3 transition-all duration-300 last:border-0 hover:translate-x-1">
      {typeof index === "number" && (
        <span className="font-display text-2xl leading-none font-bold text-primary/40 transition-colors group-hover:text-primary">
          {index + 1}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <ArticleLink article={article}>
          <h3 className="font-display text-[15px] leading-snug font-bold transition-colors group-hover:text-primary">
            {article.title}
          </h3>
        </ArticleLink>
        <span className="mt-1 block text-xs text-muted-foreground">{(article as any).time ?? (article as any).published_at}</span>
      </div>
      <ArticleLink article={article} className="shrink-0 overflow-hidden">
        <NewsImage
          src={(article as any).image ?? (article as any).image_url}
          alt={article.title}
          className="h-16 w-24 object-cover"
          loading="lazy"
          width="96"
          height="64"
        />
      </ArticleLink>
    </article>
  );
}

export function Meta({ article }: { article: Article | Post }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="font-semibold text-primary">{categoryName(article.category)}</span>
      <span>•</span>
      <span>{(article as any).author ?? (article as any).author_name}</span>
      <span>•</span>
      <span>{(article as any).location ?? "ঢাকা"}</span>
      <span>•</span>
      <span>{(article as any).time ?? (article as any).published_at}</span>
    </div>
  );
}

export function SectionHeading({ title, slug }: { title: string; slug?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-primary pb-1">
      <h2 className="font-display text-[22px] font-bold text-primary">{title}</h2>
      {slug && (
        <Link
          to="/category/$slug"
          params={{ slug }}
          className="kb-underline text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          সব খবর →
        </Link>
      )}
    </div>
  );
}
