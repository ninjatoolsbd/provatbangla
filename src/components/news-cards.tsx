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
    <Link to="/news/$id" params={{ id: String(article.id) }} className={className}>
      {children}
    </Link>
  );
}

export function LeadCard({ article }: { article: Article }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden rounded-md">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h2 className="mt-3 font-display text-2xl leading-snug font-bold text-foreground group-hover:text-primary sm:text-3xl">
          {article.kicker && <span className="text-primary">{article.kicker} / </span>}
          {article.title}
        </h2>
      </ArticleLink>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
      <Meta article={article} />
    </article>
  );
}

export function GridCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <article className="group">
      <ArticleLink article={article} className="block overflow-hidden rounded-md">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </ArticleLink>
      <ArticleLink article={article}>
        <h3
          className={cn(
            "mt-2 font-display leading-snug font-semibold text-foreground group-hover:text-primary",
            compact ? "text-base" : "text-lg",
          )}
        >
          {article.kicker && <span className="text-primary">{article.kicker} / </span>}
          {article.title}
        </h3>
      </ArticleLink>
      {!compact && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
      )}
    </article>
  );
}

export function ListRow({ article, index }: { article: Article; index?: number }) {
  return (
    <article className="group flex gap-3 border-b border-border py-3 last:border-0">
      {typeof index === "number" && (
        <span className="font-display text-2xl leading-none font-bold text-primary/40">
          {index + 1}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <ArticleLink article={article}>
          <h3 className="font-display text-[15px] leading-snug font-semibold group-hover:text-primary">
            {article.title}
          </h3>
        </ArticleLink>
        <span className="mt-1 block text-xs text-muted-foreground">{article.time}</span>
      </div>
      <ArticleLink article={article} className="shrink-0">
        <img
          src={article.image}
          alt={article.title}
          className="h-16 w-24 rounded-md object-cover"
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
    <div className="mb-4 flex items-end justify-between border-b-2 border-primary pb-1.5">
      <h2 className="font-display text-xl font-bold text-foreground">
        <span className="mr-2 inline-block h-4 w-1.5 translate-y-0.5 bg-primary" />
        {title}
      </h2>
      {slug && (
        <Link
          to="/category/$slug"
          params={{ slug }}
          className="text-xs font-semibold text-primary hover:underline"
        >
          সব খবর →
        </Link>
      )}
    </div>
  );
}
