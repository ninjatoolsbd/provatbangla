import { Link } from "@tanstack/react-router";

import type { Article } from "@/lib/news-data";
import { categoryName } from "@/lib/news-data";
import { cn } from "@/lib/utils";

function ArticleLink({
  article,
  className,
  children,
}: {
  article: Article;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to="/post/$slug" params={{ slug: article.slug ?? String(article.id) }} className={className}>
      {children}
    </Link>
  );
}

function Kicker({ article }: { article: Article }) {
  if (!article.kicker) return null;
  return <span className="text-primary">{article.kicker} / </span>;
}

/** Big story: image on the left, headline + excerpt on the right (kalbela hero). */
export function SplitLead({ article }: { article: Article }) {
  return (
    <article className="group grid gap-4 sm:grid-cols-[1.15fr_1fr]">
      <ArticleLink article={article} className="block overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="eager"
        />
      </ArticleLink>
      <div className="min-w-0">
        <ArticleLink article={article}>
          <h2 className="font-display text-[26px] leading-[1.35] font-bold transition-colors group-hover:text-primary sm:text-[30px]">
            <Kicker article={article} />
            {article.title}
          </h2>
        </ArticleLink>
        <p className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
    </article>
  );
}


export function LeadCard({ article }: { article: Article }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h2 className="mt-3 font-display text-2xl leading-snug font-bold transition-colors group-hover:text-primary">
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

export function GridCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h3
          className={cn(
            "mt-2.5 font-display leading-[1.4] font-bold transition-colors group-hover:text-primary",
            compact ? "text-[17px]" : "text-[19px]",
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
export function ThumbRow({ article }: { article: Article }) {
  return (
    <article className="group flex gap-3 border-b border-border py-3 transition-all duration-300 last:border-0 hover:translate-x-1">
      <ArticleLink article={article} className="shrink-0 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="size-[72px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
      </ArticleLink>
      <ArticleLink article={article} className="min-w-0 flex-1">
        <h3 className="font-display text-[16px] leading-[1.45] font-bold transition-colors group-hover:text-primary">
          <Kicker article={article} />
          {article.title}
        </h3>
      </ArticleLink>
    </article>
  );
}

export function ListRow({ article, index }: { article: Article; index?: number }) {
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
        <span className="mt-1 block text-xs text-muted-foreground">{article.time}</span>
      </div>
      <ArticleLink article={article} className="shrink-0 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-16 w-24 object-cover"
          loading="lazy"
        />
      </ArticleLink>
    </article>
  );
}

export function Meta({ article }: { article: Article }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="font-semibold text-primary">{categoryName(article.category)}</span>
      <span>•</span>
      <span>{article.author}</span>
      <span>•</span>
      <span>{article.location}</span>
      <span>•</span>
      <span>{article.time}</span>
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
