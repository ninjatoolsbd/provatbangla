import { Link } from "@tanstack/react-router";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Article } from "@/lib/news-data";
import { NewsImage } from "./news-cards";

interface SidebarSectionProps {
  title: string;
  category: string;
  articles: Article[];
  variant?: 'list' | 'grid' | 'featured-grid';
}

export function SidebarSection({ title, category, articles, variant = 'list' }: SidebarSectionProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden bg-white last:mb-0">
      {/* Header style matching screenshot: Dark bar with square bullet and lines */}
      <div className="relative mb-4 flex h-[34px] items-center border-y-4 border-black px-3 bg-white">
        <div className="mr-2 h-3 w-4 bg-black" />
        <h3 className="font-display text-[17px] font-bold text-black">
          {title} {category ? `- ${category}` : ''}
        </h3>
        <div className="absolute right-0 top-0 h-full w-2 bg-black" />
      </div>
      
      <div>
        {variant === 'list' && (
          <div className="space-y-0 px-1">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                to="/news/$id" 
                params={{ id: String(article.id) }}
                className="group flex items-start gap-3 border-b border-dotted border-slate-300 py-3 first:pt-0 last:border-0"
              >
                <ChevronsRight className="mt-1 size-4 shrink-0 text-black" />
                <span className="font-display text-[16px] leading-[1.4] font-medium transition-colors group-hover:text-primary">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {variant === 'grid' && (
          <div className="px-1">
            {/* Top featured item in the grid section */}
            {articles.length > 0 && (
              <Link 
                to="/news/$id" 
                params={{ id: String(articles[0].id) }}
                className="group mb-4 block"
              >
                <div className="overflow-hidden">
                  <NewsImage 
                    src={articles[0].image} 
                    alt={articles[0].title} 
                    className="aspect-video w-full object-cover"
                  />
                </div>
                <h4 className="mt-2 font-display text-[18px] leading-[1.3] font-bold group-hover:text-primary">
                  {articles[0].title}
                </h4>
              </Link>
            )}
            
            {/* 2x2 grid for the rest */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {articles.slice(1, 5).map((article) => (
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
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <h4 className="mt-2 line-clamp-3 font-display text-[14px] leading-tight font-bold group-hover:text-primary">
                    {article.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {variant === 'featured-grid' && (
          <div className="px-1">
             <div className="mb-4 bg-[#b20000] py-2 px-3 text-white font-bold text-[18px]">
                {title}
              </div>
            <div className="grid grid-cols-2 gap-2">
              {articles.map((article) => (
                <Link 
                  key={article.id} 
                  to="/news/$id" 
                  params={{ id: String(article.id) }}
                  className="group relative block aspect-[4/3] overflow-hidden"
                >
                  <NewsImage 
                    src={article.image} 
                    alt={article.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2">
                    <h4 className="line-clamp-3 font-display text-[13px] leading-tight font-medium text-white group-hover:text-primary">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
