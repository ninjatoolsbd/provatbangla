import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Article } from "@/lib/news-data";
import { NewsImage } from "./news-cards";

interface SidebarSectionProps {
  title: string;
  category: string;
  articles: Article[];
  variant?: 'list' | 'grid';
}

export function SidebarSection({ title, category, articles, variant = 'list' }: SidebarSectionProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden border border-border bg-white last:mb-0">
      {/* Header style matching screenshot: Dark bar with square bullet */}
      <div className="flex h-9 items-center bg-black px-3 text-white">
        <div className="mr-2 size-2 bg-white" />
        <h3 className="font-display text-[15px] font-bold">
          {title} {category ? `- ${category}` : ''}
        </h3>
      </div>
      
      <div className="p-3">
        {variant === 'list' ? (
          <div className="space-y-3">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                to="/news/$id" 
                params={{ id: String(article.id) }}
                className="group flex items-start gap-2 border-b border-dotted border-border pb-3 last:border-0 last:pb-0"
              >
                <ChevronRight className="mt-1 size-3 shrink-0 text-slate-900" />
                <span className="font-display text-[15px] leading-[1.4] font-medium transition-colors group-hover:text-primary">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                to="/news/$id" 
                params={{ id: String(article.id) }}
                className="group block"
              >
                <div className="overflow-hidden">
                  <NewsImage 
                    src={article.image} 
                    alt={article.title} 
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="mt-1.5 line-clamp-2 font-display text-[13px] leading-tight font-bold group-hover:text-primary">
                  {article.title}
                </h4>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
